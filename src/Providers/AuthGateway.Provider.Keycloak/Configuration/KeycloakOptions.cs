using Microsoft.Extensions.Options;

namespace AuthGateway.Provider.Keycloak.Configuration;

public sealed class KeycloakOptions
{
    public const string SectionName = "Keycloak";
    public string BaseUrl { get; set; } = "";
    public string PublicIssuerUrl { get; set; } = "";
    public string? DiscoveryUrl { get; set; }
    public string AdministrativeApiUrl { get; set; } = "";
    public string AuthenticationRealm { get; set; } = "master";
    public string ClientId { get; set; } = "";
    public string ClientSecret { get; set; } = "";
    public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(10);
    public TimeSpan TokenRenewalMargin { get; set; } = TimeSpan.FromSeconds(30);
    // Explicit development opt-in. TLS certificate validation is never disabled.
    public bool AllowInsecureHttp { get; set; }
}

public sealed class KeycloakOptionsValidator : IValidateOptions<KeycloakOptions>
{
    public ValidateOptionsResult Validate(string? name, KeycloakOptions options)
    {
        List<string> errors = [];
        ValidateUrls(options, errors);
        ValidateCredentials(options, errors);
        if (options.Timeout < TimeSpan.FromMilliseconds(100) || options.Timeout > TimeSpan.FromMinutes(2))
            errors.Add("Keycloak:Timeout must be between 100 milliseconds and two minutes.");
        if (options.TokenRenewalMargin < TimeSpan.Zero || options.TokenRenewalMargin > TimeSpan.FromMinutes(5))
            errors.Add("Keycloak:TokenRenewalMargin must be between zero and five minutes.");
        return errors.Count == 0 ? ValidateOptionsResult.Success : ValidateOptionsResult.Fail(errors);
    }

    private static void ValidateUrls(KeycloakOptions options, List<string> errors)
    {
        if (!IsSafeUrl(options.BaseUrl, options.AllowInsecureHttp))
            errors.Add("Keycloak:BaseUrl requires a trusted absolute HTTPS URL (HTTP needs explicit development opt-in).");
        if (!IsSafeUrl(options.PublicIssuerUrl, options.AllowInsecureHttp))
            errors.Add("Keycloak:PublicIssuerUrl requires a trusted absolute issuer URL.");
        if (options.DiscoveryUrl is not null && !IsSafeUrl(options.DiscoveryUrl, options.AllowInsecureHttp))
            errors.Add("Keycloak:DiscoveryUrl requires a trusted absolute metadata URL.");
        if (!IsSafeUrl(options.AdministrativeApiUrl, options.AllowInsecureHttp))
            errors.Add("Keycloak:AdministrativeApiUrl requires a trusted absolute Admin API root URL.");
    }

    private static void ValidateCredentials(KeycloakOptions options, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(options.AuthenticationRealm) || options.AuthenticationRealm.Any(character =>
            !char.IsAsciiLetterOrDigit(character) && character is not '-' and not '_' and not '.'))
            errors.Add("Keycloak:AuthenticationRealm requires a realm name using letters, digits, dots, hyphens or underscores.");
        if (string.IsNullOrWhiteSpace(options.ClientId) || string.IsNullOrWhiteSpace(options.ClientSecret))
            errors.Add("Keycloak requires a confidential ClientId and ClientSecret from a secure configuration source.");
    }

    internal static bool IsSafeUrl(string value, bool allowHttp) =>
        Uri.TryCreate(value, UriKind.Absolute, out Uri? uri) &&
        (uri.Scheme == Uri.UriSchemeHttps || (allowHttp && uri.Scheme == Uri.UriSchemeHttp)) &&
        string.IsNullOrEmpty(uri.UserInfo) && string.IsNullOrEmpty(uri.Query) && string.IsNullOrEmpty(uri.Fragment);
}
