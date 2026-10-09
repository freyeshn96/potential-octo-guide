using System.Net;
using System.Text;
using System.Text.Json;
using AuthGateway.Provider.Keycloak.Authentication;
using AuthGateway.Provider.Keycloak.Configuration;
using AuthGateway.Provider.Keycloak.Http;
using AuthGateway.Server.Application.Providers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace AuthGateway.Provider.Keycloak.UnitTests;

public sealed class ProviderTests
{
    private const string Issuer = "https://identity.example/proxy/realms/demo";
    private const string TokenJson = "{\"access_token\":\"test-token\",\"token_type\":\"Bearer\",\"expires_in\":120}";

    [Fact]
    public void ConfigurationValidationIsSafeAndAcceptsProxyPaths()
    {
        KeycloakOptions settings = Settings();
        KeycloakOptionsValidator validator = new();
        Assert.True(validator.Validate(null, settings).Succeeded);
        settings.ClientSecret = "";
        settings.BaseUrl = "https://user:private@example.test/path?secret=private";
        Assert.True(validator.Validate(null, settings).Failed);
        Assert.DoesNotContain("private", validator.Validate(null, settings).FailureMessage);
    }

    [Theory]
    [InlineData("http://identity.example")]
    [InlineData("file:///etc/passwd")]
    [InlineData("https://identity.example/#fragment")]
    public void UnsafeConfigurationUrlsAreRejected(string url)
    {
        KeycloakOptions settings = Settings();
        settings.BaseUrl = url;
        Assert.True(new KeycloakOptionsValidator().Validate(null, settings).Failed);
    }

    [Fact]
    public async Task MissingConfigurationDoesNotPreventRegistrationAndIsNormalizedOnUse()
    {
        ServiceCollection registrations = new();
        registrations.AddKeycloakProvider(new ConfigurationBuilder().Build());
        await using ServiceProvider services = registrations.BuildServiceProvider();
        ProviderDiagnosticReport report = await services.GetRequiredService<IProviderDiagnostics>().DiagnoseAsync(CancellationToken.None);
        Assert.All(report.Checks, check => Assert.Equal(ProviderError.InvalidConfiguration, check.Error));
    }

    [Fact]
    public void InvalidDurationsAndRealmNamesAreRejected()
    {
        KeycloakOptions settings = Settings();
        settings.Timeout = TimeSpan.Zero;
        settings.TokenRenewalMargin = TimeSpan.FromSeconds(-1);
        settings.AuthenticationRealm = "../master";
        ValidateOptionsResult result = new KeycloakOptionsValidator().Validate(null, settings);
        Assert.True(result.Failed);
        Assert.Equal(3, result.Failures!.Count());
    }

    [Fact]
    public async Task CancelledTokenWaiterDoesNotBlockLaterAcquisition()
    {
        TaskCompletionSource started = new(TaskCreationOptions.RunContinuationsAsynchronously);
        TaskCompletionSource release = new(TaskCreationOptions.RunContinuationsAsynchronously);
        StubHandler handler = new(async (_, cancellation) =>
        {
            started.SetResult();
            await release.Task.WaitAsync(cancellation);
            return Json(TokenJson);
        });
        using ServiceTokenStore tokens = new(Http(handler), TimeProvider.System);
        Task<string> acquisition = tokens.GetAsync(CancellationToken.None);
        await started.Task;
        using CancellationTokenSource cancellation = new();
        Task<string> waiter = tokens.GetAsync(cancellation.Token);
        cancellation.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => waiter);
        release.SetResult();
        Assert.Equal("test-token", await acquisition);
        Assert.Equal("test-token", await tokens.GetAsync(CancellationToken.None));
    }

    [Fact]
    public async Task RejectedTokenIsInvalidatedWithoutAnAutomaticRetry()
    {
        int tokenRequests = 0;
        KeycloakHttp http = Http(new StubHandler((request, _) =>
        {
            if (request.Method != HttpMethod.Post) return Task.FromResult(new HttpResponseMessage(HttpStatusCode.Unauthorized));
            tokenRequests++;
            return Task.FromResult(Json(TokenJson));
        }));
        using ServiceTokenStore tokens = new(http, TimeProvider.System);
        IdentitySpaceDiscovery spaces = new(http, tokens);
        await Assert.ThrowsAsync<ProviderOperationException>(() => spaces.DiscoverAsync(CancellationToken.None));
        Assert.Equal(1, tokenRequests);
        await Assert.ThrowsAsync<ProviderOperationException>(() => spaces.DiscoverAsync(CancellationToken.None));
        Assert.Equal(2, tokenRequests);
    }

    [Fact]
    public async Task TokensAreAcquiredOnceForConcurrentRequestsAndRenewedBeforeExpiry()
    {
        int requests = 0;
        StubHandler handler = new(async (request, cancellation) =>
        {
            Assert.Equal("/proxy/realms/master/protocol/openid-connect/token", request.RequestUri!.AbsolutePath);
            string form = await request.Content!.ReadAsStringAsync(cancellation);
            Assert.Contains("grant_type=client_credentials", form);
            Assert.Contains("client_secret=unit-secret", form);
            Interlocked.Increment(ref requests);
            await Task.Delay(10, cancellation);
            return Json(TokenJson);
        });
        MutableClock clock = new();
        using ServiceTokenStore tokens = new(Http(handler), clock);
        string[] results = await Task.WhenAll(Enumerable.Range(0, 20).Select(_ => tokens.GetAsync(CancellationToken.None)));
        Assert.All(results, result => Assert.Equal("test-token", result));
        Assert.Equal(1, requests);
        clock.Advance(TimeSpan.FromSeconds(91));
        await tokens.GetAsync(CancellationToken.None);
        Assert.Equal(2, requests);
        clock.Advance(TimeSpan.FromSeconds(121));
        await tokens.GetAsync(CancellationToken.None);
        Assert.Equal(3, requests);
    }

    [Fact]
    public async Task FailedRenewalDoesNotReuseStaleTokenAndCanRecover()
    {
        int requests = 0;
        StubHandler handler = new((_, _) => Task.FromResult(++requests == 2
            ? new HttpResponseMessage(HttpStatusCode.Unauthorized) : Json(TokenJson)));
        MutableClock clock = new();
        using ServiceTokenStore tokens = new(Http(handler), clock);
        await tokens.GetAsync(CancellationToken.None);
        clock.Advance(TimeSpan.FromSeconds(91));
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() => tokens.GetAsync(CancellationToken.None));
        Assert.Equal(ProviderError.InvalidCredentials, failure.Error);
        Assert.Equal("test-token", await tokens.GetAsync(CancellationToken.None));
        Assert.Equal(3, requests);
    }

    [Theory]
    [InlineData("{}")]
    [InlineData("{\"access_token\":\"x\",\"token_type\":\"Basic\",\"expires_in\":120}")]
    [InlineData("{\"access_token\":\"x\",\"token_type\":\"Bearer\",\"expires_in\":0}")]
    public async Task InvalidTokensAreRejected(string json)
    {
        using ServiceTokenStore tokens = new(Http(new StubHandler((_, _) => Task.FromResult(Json(json)))), TimeProvider.System);
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() => tokens.GetAsync(CancellationToken.None));
        Assert.Equal(ProviderError.UnexpectedResponse, failure.Error);
    }

    [Theory]
    [InlineData(401, ProviderError.InvalidCredentials)]
    [InlineData(403, ProviderError.InsufficientPermissions)]
    [InlineData(500, ProviderError.Unavailable)]
    [InlineData(504, ProviderError.Timeout)]
    [InlineData(302, ProviderError.UnexpectedResponse)]
    [InlineData(404, ProviderError.UnexpectedResponse)]
    public async Task HttpFailuresAreNormalizedWithoutProviderBodies(int status, ProviderError expected)
    {
        KeycloakHttp http = Http(new StubHandler((_, _) => Task.FromResult(new HttpResponseMessage((HttpStatusCode)status)
        { Content = new StringContent("private provider response") })));
        using HttpRequestMessage request = new(HttpMethod.Get, Issuer);
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() => http.SendAsync<JsonElement>(request, CancellationToken.None));
        Assert.Equal(expected, failure.Error);
        Assert.DoesNotContain("private", failure.ToString());
    }

    [Fact]
    public async Task TimeoutIsDistinctFromCallerCancellation()
    {
        StubHandler handler = new(async (_, cancellation) =>
        {
            await Task.Delay(Timeout.InfiniteTimeSpan, cancellation);
            return Json("{}");
        });
        KeycloakOptions settings = Settings();
        settings.Timeout = TimeSpan.FromMilliseconds(100);
        KeycloakHttp http = new(new StubFactory(handler), Options.Create(settings));
        using HttpRequestMessage request = new(HttpMethod.Get, Issuer);
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() => http.SendAsync<JsonElement>(request, CancellationToken.None));
        Assert.Equal(ProviderError.Timeout, failure.Error);
        using CancellationTokenSource cancellation = new();
        cancellation.Cancel();
        using HttpRequestMessage cancelledRequest = new(HttpMethod.Get, Issuer);
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => http.SendAsync<JsonElement>(cancelledRequest, cancellation.Token));
    }

    [Fact]
    public async Task TransportFailuresAreUnavailable()
    {
        KeycloakHttp http = Http(new StubHandler((_, _) => throw new HttpRequestException("private transport data")));
        using HttpRequestMessage request = new(HttpMethod.Get, Issuer);
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() => http.SendAsync<JsonElement>(request, CancellationToken.None));
        Assert.Equal(ProviderError.Unavailable, failure.Error);
    }

    [Fact]
    public async Task DiscoveryAcceptsValidMetadataAndOptionalCapabilities()
    {
        OidcConfigurationInspector inspector = Inspector(Discovery());
        OidcConfiguration result = await inspector.InspectAsync(CancellationToken.None);
        Assert.Equal(Issuer, result.Issuer.AbsoluteUri);
        Assert.Contains("code", result.ResponseTypes);
        Assert.Null(result.GrantTypes);
    }

    [Theory]
    [InlineData("issuer", "https://other.example", ProviderError.IssuerMismatch)]
    [InlineData("token_endpoint", "https://evil.example/token", ProviderError.InvalidDiscovery)]
    [InlineData("jwks_uri", "http://identity.example/proxy/realms/demo/keys", ProviderError.InvalidDiscovery)]
    [InlineData("authorization_endpoint", "https://identity.example/untrusted", ProviderError.InvalidDiscovery)]
    public async Task DiscoveryRejectsIssuerMismatchAndUnsafeEndpoints(string field, string value, ProviderError expected)
    {
        Dictionary<string, JsonElement> document = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(Discovery())!;
        document[field] = JsonSerializer.SerializeToElement(value);
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() => Inspector(JsonSerializer.Serialize(document)).InspectAsync(CancellationToken.None));
        Assert.Equal(expected, failure.Error);
    }

    [Theory]
    [InlineData("response_types_supported")]
    [InlineData("grant_types_supported")]
    [InlineData("code_challenge_methods_supported")]
    public async Task DiscoveryRejectsEmptyCapabilityLists(string field)
    {
        Dictionary<string, JsonElement> document = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(Discovery())!;
        document[field] = JsonSerializer.SerializeToElement(Array.Empty<string>());
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() => Inspector(JsonSerializer.Serialize(document)).InspectAsync(CancellationToken.None));
        Assert.Equal(ProviderError.InvalidDiscovery, failure.Error);
    }

    [Fact]
    public async Task RealmDiscoveryMapsOnlyNeutralFieldsAndProtectsMaster()
    {
        KeycloakHttp http = Http(new StubHandler((request, _) =>
        {
            if (request.Method == HttpMethod.Post) return Task.FromResult(Json(TokenJson));
            Assert.Equal("Bearer", request.Headers.Authorization!.Scheme);
            Assert.Equal("?briefRepresentation=true", request.RequestUri!.Query);
            return Task.FromResult(Json("[{\"realm\":\"master\",\"enabled\":true,\"private\":\"ignored\"},{\"realm\":\"demo\"}]"));
        }));
        using ServiceTokenStore tokens = new(http, TimeProvider.System);
        IReadOnlyList<IdentitySpaceDescriptor> spaces = await new IdentitySpaceDiscovery(http, tokens).DiscoverAsync(CancellationToken.None);
        Assert.True(spaces[0].IsProtected);
        Assert.False(spaces[1].IsProtected);
        Assert.Null(spaces[1].Enabled);
        Assert.DoesNotContain("private", JsonSerializer.Serialize(spaces));
    }

    [Theory]
    [InlineData("[{}]")]
    [InlineData("[null]")]
    [InlineData("[{\"realm\":\"a\"},{\"realm\":\"a\"}]")]
    public async Task MalformedRealmsAreRejected(string json)
    {
        KeycloakHttp http = Http(new StubHandler((request, _) => Task.FromResult(Json(request.Method == HttpMethod.Post ? TokenJson : json))));
        using ServiceTokenStore tokens = new(http, TimeProvider.System);
        ProviderOperationException failure = await Assert.ThrowsAsync<ProviderOperationException>(() => new IdentitySpaceDiscovery(http, tokens).DiscoverAsync(CancellationToken.None));
        Assert.Equal(ProviderError.UnexpectedResponse, failure.Error);
    }

    [Fact]
    public async Task DiagnosticsSeparateDiscoveryAuthenticationAndPermissions()
    {
        KeycloakHttp http = Http(new StubHandler((request, _) => Task.FromResult(
            request.Method == HttpMethod.Post ? Json(TokenJson) :
            request.RequestUri!.AbsolutePath.Contains(".well-known", StringComparison.Ordinal) ? Json(Discovery()) :
            new HttpResponseMessage(HttpStatusCode.Forbidden))));
        using ServiceTokenStore tokens = new(http, TimeProvider.System);
        ProviderDiagnosticReport result = await new ProviderDiagnostics(new OidcConfigurationInspector(http), tokens,
            new IdentitySpaceDiscovery(http, tokens)).DiagnoseAsync(CancellationToken.None);
        Assert.All(result.Checks.Take(3), check => Assert.True(check.Succeeded));
        Assert.Equal(ProviderError.InsufficientPermissions, result.Checks[3].Error);
        Assert.False(result.Succeeded);
    }

    private static KeycloakOptions Settings() => new()
    {
        BaseUrl = "https://identity.example/proxy", PublicIssuerUrl = Issuer,
        AdministrativeApiUrl = "https://admin.example/proxy/admin", ClientId = "unit-client", ClientSecret = "unit-secret"
    };

    private static KeycloakHttp Http(StubHandler handler) => new(new StubFactory(handler), Options.Create(Settings()));
    private static HttpResponseMessage Json(string value) => new(HttpStatusCode.OK)
    { Content = new StringContent(value, Encoding.UTF8, "application/json") };
    private static OidcConfigurationInspector Inspector(string json) => new(Http(new StubHandler((_, _) => Task.FromResult(Json(json)))));
    private static string Discovery() => JsonSerializer.Serialize(new Dictionary<string, JsonElement>
    {
        ["issuer"] = JsonSerializer.SerializeToElement(Issuer),
        ["authorization_endpoint"] = JsonSerializer.SerializeToElement(Issuer + "/protocol/openid-connect/auth"),
        ["token_endpoint"] = JsonSerializer.SerializeToElement(Issuer + "/protocol/openid-connect/token"),
        ["jwks_uri"] = JsonSerializer.SerializeToElement(Issuer + "/protocol/openid-connect/certs"),
        ["response_types_supported"] = JsonSerializer.SerializeToElement(new[] { "code" })
    });

    private sealed class StubHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> send) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => send(request, cancellationToken);
    }
    private sealed class StubFactory(StubHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, false);
    }
    private sealed class MutableClock : TimeProvider
    {
        private DateTimeOffset current = DateTimeOffset.UtcNow;
        public override DateTimeOffset GetUtcNow() => current;
        public void Advance(TimeSpan duration) => current += duration;
    }
}
