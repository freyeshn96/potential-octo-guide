using AuthGateway.Provider.Keycloak.Authentication;
using AuthGateway.Server.Application.Providers;

namespace AuthGateway.Provider.Keycloak;

internal sealed class ProviderDiagnostics(
    IOidcConfigurationInspector discovery, ServiceTokenStore tokens, IIdentitySpaceDiscovery spaces) : IProviderDiagnostics
{
    public async Task<ProviderDiagnosticReport> DiagnoseAsync(CancellationToken cancellationToken)
    {
        List<ProviderDiagnosticCheck> checks = [];
        ProviderError? discoveryError = await CheckAsync(async () => { await discovery.InspectAsync(cancellationToken); });
        checks.Add(new ProviderDiagnosticCheck(ProviderDiagnosticStage.Reachability,
            discoveryError is ProviderError.Unavailable or ProviderError.Timeout or ProviderError.InvalidConfiguration ? discoveryError : null));
        checks.Add(new ProviderDiagnosticCheck(ProviderDiagnosticStage.Discovery, discoveryError));
        ProviderError? tokenError = await CheckAsync(async () => { await tokens.GetAsync(cancellationToken); });
        checks.Add(new ProviderDiagnosticCheck(ProviderDiagnosticStage.TechnicalAuthentication, tokenError));
        if (tokenError is null)
        {
            ProviderError? adminError = await CheckAsync(async () => { await spaces.DiscoverAsync(cancellationToken); });
            checks.Add(new ProviderDiagnosticCheck(ProviderDiagnosticStage.AdministrativeAuthorization, adminError));
        }
        return new ProviderDiagnosticReport(checks);
    }

    private static async Task<ProviderError?> CheckAsync(Func<Task> operation)
    {
        try { await operation(); return null; }
        catch (ProviderOperationException exception) { return exception.Error; }
    }
}
