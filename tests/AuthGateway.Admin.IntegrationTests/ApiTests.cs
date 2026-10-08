using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AuthGateway.Contracts;

namespace AuthGateway.Admin.IntegrationTests;

[Trait("Category", "Api")]
public sealed class ApiTests
{
    [Fact]
    public async Task MissingDatabaseConfigurationFailsHostStartup()
    {
        await using var factory = new FoundationFactory(connectionString: "");
        var failure = Assert.Throws<Microsoft.Extensions.Options.OptionsValidationException>(() => factory.CreateClient());
        Assert.Contains("Database configuration requires", failure.Message);
        Assert.DoesNotContain("Password=", failure.Message);
    }

    [Fact]
    public async Task HostStartsIndependentlyAndReportsItsIdentity()
    {
        await using var factory = new FoundationFactory();
        using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/live")).StatusCode);
        var info = await client.GetFromJsonAsync<SystemInformation>("/api/v1/system/info");
        Assert.Equal("AuthGateway.Admin", info!.Service);
        Assert.Equal("running", info.Status);
        Assert.Equal("1.0.0", info.Version);
    }

    [Fact]
    public async Task ReadinessFailsSafelyWhenDatabaseIsUnavailable()
    {
        await using var factory = new FoundationFactory();
        using var client = factory.CreateClient();
        using var response = await client.GetAsync("/health/ready");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Equal("Unhealthy", body);
        Assert.DoesNotContain("Username", body);
    }

    [Theory]
    [InlineData("/test/failure", HttpStatusCode.InternalServerError)]
    [InlineData("/test/validation", HttpStatusCode.BadRequest)]
    [InlineData("/does-not-exist", HttpStatusCode.NotFound)]
    public async Task FailuresReturnSafeProblemDetails(string path, HttpStatusCode expected)
    {
        await using var factory = new FoundationFactory();
        using var client = factory.CreateClient();
        using var response = await client.GetAsync(path);
        Assert.Equal(expected, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType!.MediaType);
        var body = await response.Content.ReadAsStringAsync();
        using var problem = JsonDocument.Parse(body);
        Assert.Equal((int)expected, problem.RootElement.GetProperty("status").GetInt32());
        Assert.True(problem.RootElement.TryGetProperty("traceId", out var trace));
        Assert.False(string.IsNullOrWhiteSpace(trace.GetString()));
        Assert.DoesNotContain("Private failure", body);
        Assert.DoesNotContain("stackTrace", body);
        if (expected == HttpStatusCode.BadRequest)
            Assert.Equal("Name is required.", problem.RootElement.GetProperty("errors").GetProperty("Name")[0].GetString());
    }

    [Fact]
    public async Task OpenApiIsAvailableInDevelopmentAndDescribesTheSystemEndpoint()
    {
        await using var factory = new FoundationFactory(environment: "Development");
        using var client = factory.CreateClient();
        using var response = await client.GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.True(document.RootElement.GetProperty("paths").TryGetProperty("/api/v1/system/info", out _));
    }

    [Fact]
    public async Task OpenApiIsNotPubliclyExposedInProduction()
    {
        await using var factory = new FoundationFactory();
        using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/openapi/v1.json")).StatusCode);
    }

    [Fact]
    public async Task CorsDoesNotAllowAnUntrustedOrigin()
    {
        await using var factory = new FoundationFactory(environment: "Development");
        using var client = factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/system/info");
        request.Headers.Add("Origin", "https://untrusted.example");
        using var response = await client.SendAsync(request);
        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }
}
