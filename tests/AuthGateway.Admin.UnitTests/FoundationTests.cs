using AuthGateway.Admin.Host;
using AuthGateway.Admin.Infrastructure;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace AuthGateway.Admin.UnitTests;

public sealed class FoundationTests
{
    [Theory]
    [InlineData("")]
    [InlineData("not-a-connection-string")]
    [InlineData("Host=localhost;Username=test")]
    [InlineData("Host=localhost;Database=test;Username=test;Timeout=0")]
    [InlineData("Host=localhost;Database=test;Username=test;Command Timeout=0")]
    public void InvalidDatabaseSettingsAreRejected(string connectionString)
        => Assert.False(new DatabaseOptions { ConnectionString = connectionString }.IsValid());

    [Fact]
    public void ModuleRegistersItsOwnPersistenceAndApplicationServices()
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Database:ConnectionString"] = "Host=localhost;Database=admin_test;Username=test;Timeout=5;Command Timeout=5"
        }).Build();
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddAuthGatewayAdminModule(configuration);
        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<IMediator>());
        var database = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
        Assert.Equal("Npgsql.EntityFrameworkCore.PostgreSQL", database.Database.ProviderName);
        Assert.Empty(database.Model.GetEntityTypes());
        Assert.True(provider.GetRequiredService<IOptions<DatabaseOptions>>().Value.IsValid());
    }

    [Fact]
    public void ModuleDoesNotReferenceTheOtherService()
    {
        var references = typeof(AdminModule).Assembly.GetReferencedAssemblies();
        Assert.DoesNotContain(references, assembly => assembly.Name!.StartsWith("AuthGateway.Server", StringComparison.Ordinal));
    }
}
