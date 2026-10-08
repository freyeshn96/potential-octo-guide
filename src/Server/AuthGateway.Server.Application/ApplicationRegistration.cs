using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace AuthGateway.Server.Application;

public static class ApplicationRegistration
{
    public static IServiceCollection AddServerApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(typeof(ApplicationRegistration).Assembly));
        services.AddValidatorsFromAssembly(typeof(ApplicationRegistration).Assembly);
        return services;
    }
}
