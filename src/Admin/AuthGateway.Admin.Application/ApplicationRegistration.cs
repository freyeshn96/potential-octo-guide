using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace AuthGateway.Admin.Application;

public static class ApplicationRegistration
{
    public static IServiceCollection AddAdminApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(typeof(ApplicationRegistration).Assembly));
        services.AddValidatorsFromAssembly(typeof(ApplicationRegistration).Assembly);
        return services;
    }
}
