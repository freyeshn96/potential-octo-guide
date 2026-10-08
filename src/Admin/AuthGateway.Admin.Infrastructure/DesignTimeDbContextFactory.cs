using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AuthGateway.Admin.Infrastructure;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AdminDbContext>
{
    public AdminDbContext CreateDbContext(string[] args)
    {
        var settings = new DatabaseOptions
        {
            ConnectionString = Environment.GetEnvironmentVariable("Database__ConnectionString") ?? string.Empty
        };
        if (!settings.IsValid())
        {
            throw new InvalidOperationException(
                "Set Database__ConnectionString to a valid PostgreSQL connection string before running migration commands.");
        }

        var options = new DbContextOptionsBuilder<AdminDbContext>()
            .UseNpgsql(settings.ConnectionString,
                postgres => postgres.MigrationsHistoryTable("__EFMigrationsHistory", "public")).Options;
        return new AdminDbContext(options);
    }
}
