using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace AuthGateway.Server.IntegrationTests;

public sealed class FoundationFactory(string? connectionString = null, string environment = "Production")
    : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment(environment);
        builder.UseSetting("Database:ConnectionString", connectionString
            ?? "Host=127.0.0.1;Port=1;Database=unavailable;Username=test;Timeout=1;Command Timeout=1");
        builder.ConfigureServices(services => services.AddTransient<IStartupFilter, TestFailureFilter>());
    }
}

internal sealed class TestFailureFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) => app =>
    {
        next(app);
        app.Use(async (context, following) =>
        {
            if (context.Request.Path == "/test/failure")
                throw new InvalidOperationException("Private failure details must never reach the client.");
            if (context.Request.Path == "/test/validation")
                throw new ValidationException([new ValidationFailure("Name", "Name is required.")]);
            await following(context);
        });
    };
}
