namespace AuthGateway.Server.Application.Providers;

public enum ProviderError
{
    InvalidConfiguration,
    Unavailable,
    Timeout,
    InvalidCredentials,
    InsufficientPermissions,
    UnexpectedResponse,
    InvalidDiscovery,
    IssuerMismatch
}

public sealed class ProviderOperationException(ProviderError error) : Exception("The provider operation failed.")
{
    public ProviderError Error { get; } = error;
}

public sealed record OidcConfiguration
{
    public required Uri Issuer { get; init; }
    public required Uri AuthorizationEndpoint { get; init; }
    public required Uri TokenEndpoint { get; init; }
    public required Uri JwksUri { get; init; }
    public required IReadOnlyList<string> ResponseTypes { get; init; }
    public IReadOnlyList<string>? GrantTypes { get; init; }
    public IReadOnlyList<string>? CodeChallengeMethods { get; init; }
}

// An observed provider resource, not a canonical Gateway environment or lifecycle promise.
public sealed record IdentitySpaceDescriptor
{
    public required string ExternalId { get; init; }
    public required string Name { get; init; }
    public bool? Enabled { get; init; }
    public bool IsProtected { get; init; }
}

public interface IOidcConfigurationInspector
{
    Task<OidcConfiguration> InspectAsync(CancellationToken cancellationToken);
}

public interface IIdentitySpaceDiscovery
{
    Task<IReadOnlyList<IdentitySpaceDescriptor>> DiscoverAsync(CancellationToken cancellationToken);
}

public enum ProviderDiagnosticStage { Reachability, Discovery, TechnicalAuthentication, AdministrativeAuthorization }

public sealed record ProviderDiagnosticCheck(ProviderDiagnosticStage Stage, ProviderError? Error)
{
    public bool Succeeded => Error is null;
}

public sealed record ProviderDiagnosticReport(IReadOnlyList<ProviderDiagnosticCheck> Checks)
{
    public bool Succeeded => Checks.All(check => check.Succeeded);
}

public interface IProviderDiagnostics
{
    Task<ProviderDiagnosticReport> DiagnoseAsync(CancellationToken cancellationToken);
}
