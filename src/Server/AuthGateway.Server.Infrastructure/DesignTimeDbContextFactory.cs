using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AuthGateway.Server.Infrastructure;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ServerDbContext>
{
    public ServerDbContext CreateDbContext(string[] args)
    {
        DatabaseOptions settings = new DatabaseOptions
        {
            ConnectionString = Environment.GetEnvironmentVariable("Database__ConnectionString") ?? string.Empty
        };
        if (!settings.IsValid())
        {
            throw new InvalidOperationException(
                "Set Database__ConnectionString to a valid PostgreSQL connection string before running migration commands.");
        }

        DbContextOptions<ServerDbContext> options = new DbContextOptionsBuilder<ServerDbContext>()
            .UseNpgsql(settings.ConnectionString,
                postgres => postgres.MigrationsHistoryTable("__EFMigrationsHistory", "public")).Options;
        return new ServerDbContext(options);
    }
}
