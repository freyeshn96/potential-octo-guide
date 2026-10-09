using AuthGateway.Admin.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace AuthGateway.Admin.IntegrationTests;

[Trait("Category", "PostgreSQL")]
public sealed class PostgreSqlTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer database = new PostgreSqlBuilder("postgres:17-alpine")
        .WithDatabase("admin_foundation_tests")
        .WithUsername("foundation_tests")
        .WithPassword(Guid.NewGuid().ToString("N"))
        .Build();

    public Task InitializeAsync() => database.StartAsync();
    public Task DisposeAsync() => database.DisposeAsync().AsTask();

    [Fact]
    public async Task ServiceConnectsToPostgreSqlThroughEfCoreAndIsReady()
    {
        await using var factory = new FoundationFactory(database.GetConnectionString());
        using var client = factory.CreateClient();
        Assert.Equal(System.Net.HttpStatusCode.OK, (await client.GetAsync("/health/ready")).StatusCode);
        await using var scope = factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
        using var cancellation = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        Assert.True(await context.Database.CanConnectAsync(cancellation.Token));
        await context.Database.OpenConnectionAsync(cancellation.Token);
        await using var command = context.Database.GetDbConnection().CreateCommand();
        command.CommandText = "SELECT current_database()";
        Assert.Equal("admin_foundation_tests", await command.ExecuteScalarAsync(cancellation.Token));
        await context.Database.CloseConnectionAsync();
        Assert.Empty(context.Model.GetEntityTypes());
    }
}
