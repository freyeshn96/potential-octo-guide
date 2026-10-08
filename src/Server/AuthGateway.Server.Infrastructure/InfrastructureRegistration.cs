using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace AuthGateway.Server.Infrastructure;

public static class InfrastructureRegistration
{
    public static IServiceCollection AddServerInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<DatabaseOptions>()
            .Bind(configuration.GetSection(DatabaseOptions.SectionName))
            .Validate(options => options.IsValid(),
                "Database configuration requires a valid PostgreSQL connection string and bounded timeouts (1-30 seconds).")
            .ValidateOnStart();

        services.AddDbContext<ServerDbContext>((provider, options) =>
            options.UseNpgsql(provider.GetRequiredService<IOptions<DatabaseOptions>>().Value.ConnectionString,
                postgres => postgres.EnableRetryOnFailure(3)
                    .MigrationsHistoryTable("__EFMigrationsHistory", "public"))
                .EnableSensitiveDataLogging(false)
                .EnableDetailedErrors(false));

        services.AddHealthChecks().AddCheck<DatabaseHealthCheck>(
            "server-postgresql", tags: ["ready"], timeout: TimeSpan.FromSeconds(5));
        return services;
    }
}
