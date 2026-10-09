using AuthGateway.Provider.Keycloak.Authentication;
using AuthGateway.Provider.Keycloak.Configuration;
using AuthGateway.Provider.Keycloak.Http;
using AuthGateway.Server.Application.Providers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace AuthGateway.Provider.Keycloak;

public static class DependencyInjection
{
    public static IServiceCollection AddKeycloakProvider(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<KeycloakOptions>().Bind(configuration.GetSection(KeycloakOptions.SectionName));
        services.AddSingleton<IValidateOptions<KeycloakOptions>, KeycloakOptionsValidator>();
        services.TryAddSingleton(TimeProvider.System);
        services.AddHttpClient(KeycloakHttp.ClientName)
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false })
            .RemoveAllLoggers();
        services.AddSingleton<KeycloakHttp>();
        services.AddSingleton<ServiceTokenStore>();
        services.AddSingleton<IOidcConfigurationInspector, OidcConfigurationInspector>();
        services.AddSingleton<IIdentitySpaceDiscovery, IdentitySpaceDiscovery>();
        services.AddSingleton<IProviderDiagnostics, ProviderDiagnostics>();
        return services;
    }
}
