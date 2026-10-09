using System.Net;
using AuthGateway.Server.Application.Providers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace AuthGateway.Provider.Keycloak.IntegrationTests;

public sealed class ProviderExposureTests
{
    [Theory]
    [InlineData("Production")]
    [InlineData("Development")]
    public async Task HostStartsWithoutProviderAndDoesNotExposeAdministrativeCapabilities(string environment)
    {
        await using ProviderHostFactory factory = new(environment);
        using HttpClient client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/live")).StatusCode);
        Assert.NotNull(factory.Services.GetRequiredService<IProviderDiagnostics>());
        foreach (string path in new[] { "/api/v1/providers/diagnostics", "/api/v1/providers/identity-spaces", "/admin/realms" })
        {
            using HttpResponseMessage response = await client.GetAsync(path);
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.Equal("application/problem+json", response.Content.Headers.ContentType!.MediaType);
        }
    }
}

internal sealed class ProviderHostFactory(string environment) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment(environment);
        builder.UseSetting("Database:ConnectionString",
            "Host=127.0.0.1;Port=1;Database=unavailable;Username=test;Timeout=1;Command Timeout=1");
    }
}
