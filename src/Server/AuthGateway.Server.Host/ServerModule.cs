using AuthGateway.Provider.Keycloak;
using AuthGateway.Server.Application;
using AuthGateway.Server.Infrastructure;
using AuthGateway.Server.Presentation;

namespace AuthGateway.Server.Host;

public static class ServerModule
{
    public static IServiceCollection AddAuthGatewayServerModule(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddServerApplication();
        services.AddServerInfrastructure(configuration);
        services.AddServerPresentation();
        services.AddKeycloakProvider(configuration);
        return services;
    }

    public static IEndpointRouteBuilder MapAuthGatewayServerModule(this IEndpointRouteBuilder endpoints)
        => endpoints.MapServerEndpoints();
}
