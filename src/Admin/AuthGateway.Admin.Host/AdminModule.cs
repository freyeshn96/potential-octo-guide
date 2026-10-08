using AuthGateway.Admin.Application;
using AuthGateway.Admin.Infrastructure;
using AuthGateway.Admin.Presentation;

namespace AuthGateway.Admin.Host;

public static class AdminModule
{
    public static IServiceCollection AddAuthGatewayAdminModule(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAdminApplication();
        services.AddAdminInfrastructure(configuration);
        services.AddAdminPresentation();
        return services;
    }

    public static IEndpointRouteBuilder MapAuthGatewayAdminModule(this IEndpointRouteBuilder endpoints)
        => endpoints.MapAdminEndpoints();
}
