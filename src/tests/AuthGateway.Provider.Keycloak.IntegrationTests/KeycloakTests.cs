using System.Text;
using System.Text.Json;
using AuthGateway.Server.Application.Providers;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AuthGateway.Provider.Keycloak.IntegrationTests;

[Trait("Category", "Keycloak")]
public sealed class KeycloakTests : IAsyncLifetime
{
    private readonly string secret = Guid.NewGuid().ToString("N");
    private readonly IContainer container;

    public KeycloakTests()
    {
        string import = JsonSerializer.Serialize(new
        {
            realm = "integration", enabled = true,
            clients = new[]
            {
                new { clientId = "reader", secret, enabled = true, serviceAccountsEnabled = true,
                    publicClient = false, fullScopeAllowed = false, standardFlowEnabled = false, directAccessGrantsEnabled = false },
                new { clientId = "unprivileged", secret, enabled = true, serviceAccountsEnabled = true,
                    publicClient = false, fullScopeAllowed = false, standardFlowEnabled = false, directAccessGrantsEnabled = false }
            },
            clientScopeMappings = new Dictionary<string, ScopeMapping[]>
            { ["realm-management"] = [new ScopeMapping("reader", ["view-realm"])] },
            users = new[] { new { username = "service-account-reader", enabled = true,
                serviceAccountClientId = "reader", clientRoles = new Dictionary<string, string[]>
                { ["realm-management"] = ["view-realm"] } } }
        });
        container = new ContainerBuilder("quay.io/keycloak/keycloak:26.8.0")
            .WithPortBinding(8080, true)
            .WithEnvironment("KC_HEALTH_ENABLED", "true")
            .WithResourceMapping(Encoding.UTF8.GetBytes(import), "/opt/keycloak/data/import/integration-realm.json")
            .WithCommand("start-dev", "--import-realm")
            .WithWaitStrategy(Wait.ForUnixContainer().UntilHttpRequestIsSucceeded(request => request.ForPort(8080)
                .ForPath("/realms/integration/.well-known/openid-configuration")))
            .Build();
    }

    public Task InitializeAsync() => container.StartAsync();
    public Task DisposeAsync() => container.DisposeAsync().AsTask();

    [Fact]
    public async Task RealDiscoveryAuthenticationAndReadOnlyDiscoverySucceed()
    {
        await using ServiceProvider services = Services("reader", secret);
        OidcConfiguration configuration = await services.GetRequiredService<IOidcConfigurationInspector>().InspectAsync(CancellationToken.None);
        Assert.Equal(Url + "/realms/integration", configuration.Issuer.AbsoluteUri);
        ProviderDiagnosticReport diagnostics = await services.GetRequiredService<IProviderDiagnostics>().DiagnoseAsync(CancellationToken.None);
        Assert.True(diagnostics.Succeeded);
        IReadOnlyList<IdentitySpaceDescriptor> spaces = await services.GetRequiredService<IIdentitySpaceDiscovery>().DiscoverAsync(CancellationToken.None);
        Assert.Contains(spaces, space => space.Name == "integration" && !space.IsProtected);
        Assert.DoesNotContain(spaces, space => space.Name == "master");
    }

    [Fact]
    public async Task InvalidCredentialsAreDistinctFromMissingAdministrativePrivileges()
    {
        await using ServiceProvider invalid = Services("reader", Guid.NewGuid().ToString("N"));
        ProviderDiagnosticReport invalidReport = await invalid.GetRequiredService<IProviderDiagnostics>().DiagnoseAsync(CancellationToken.None);
        Assert.Contains(invalidReport.Checks, check => check.Stage == ProviderDiagnosticStage.TechnicalAuthentication && check.Error == ProviderError.InvalidCredentials);
        await using ServiceProvider unprivileged = Services("unprivileged", secret);
        ProviderDiagnosticReport report = await unprivileged.GetRequiredService<IProviderDiagnostics>().DiagnoseAsync(CancellationToken.None);
        Assert.Contains(report.Checks, check => check.Stage == ProviderDiagnosticStage.TechnicalAuthentication && check.Succeeded);
        Assert.Contains(report.Checks, check => check.Stage == ProviderDiagnosticStage.AdministrativeAuthorization && check.Error == ProviderError.InsufficientPermissions);
    }

    [Fact]
    public async Task ConfiguredPublicIssuerMustMatchEvenWhenDocumentIsReachable()
    {
        await using ServiceProvider services = Services("reader", secret, Url + "/realms/integration/");
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() =>
            services.GetRequiredService<IOidcConfigurationInspector>().InspectAsync(CancellationToken.None));
        Assert.Equal(ProviderError.IssuerMismatch, failure.Error);
    }

    [Fact]
    public async Task UnavailableProviderIsReported()
    {
        Dictionary<string, string?> settings = Settings("reader", secret);
        settings["Keycloak:PublicIssuerUrl"] = "http://127.0.0.1:1/realms/integration";
        await using ServiceProvider services = Build(settings);
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() =>
            services.GetRequiredService<IOidcConfigurationInspector>().InspectAsync(CancellationToken.None));
        Assert.Equal(ProviderError.Unavailable, failure.Error);
    }

    private string Url => $"http://{container.Hostname}:{container.GetMappedPublicPort(8080)}";
    private ServiceProvider Services(string client, string credential, string? issuer = null)
    {
        Dictionary<string, string?> settings = Settings(client, credential);
        if (issuer is not null) settings["Keycloak:PublicIssuerUrl"] = issuer;
        return Build(settings);
    }
    private Dictionary<string, string?> Settings(string client, string credential) => new()
    {
        ["Keycloak:BaseUrl"] = Url, ["Keycloak:PublicIssuerUrl"] = Url + "/realms/integration",
        ["Keycloak:AdministrativeApiUrl"] = Url + "/admin", ["Keycloak:AuthenticationRealm"] = "integration",
        ["Keycloak:ClientId"] = client, ["Keycloak:ClientSecret"] = credential, ["Keycloak:AllowInsecureHttp"] = "true"
    };
    private static ServiceProvider Build(Dictionary<string, string?> settings)
    {
        IConfiguration configuration = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
        ServiceCollection services = new();
        services.AddKeycloakProvider(configuration);
        return services.BuildServiceProvider();
    }

    private sealed record ScopeMapping(string client, string[] roles);
}
