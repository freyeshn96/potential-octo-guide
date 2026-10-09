using System.Text.Json.Serialization;
using AuthGateway.Provider.Keycloak.Configuration;
using AuthGateway.Provider.Keycloak.Http;
using AuthGateway.Server.Application.Providers;

namespace AuthGateway.Provider.Keycloak;

internal sealed class OidcConfigurationInspector(KeycloakHttp http) : IOidcConfigurationInspector
{
    public async Task<OidcConfiguration> InspectAsync(CancellationToken cancellationToken)
    {
        KeycloakOptions settings = http.Settings;
        using HttpRequestMessage request = new(HttpMethod.Get,
            settings.DiscoveryUrl is null ? KeycloakHttp.Append(settings.PublicIssuerUrl, ".well-known/openid-configuration") : new Uri(settings.DiscoveryUrl));
        DiscoveryDocument document = await http.SendAsync<DiscoveryDocument>(request, cancellationToken);
        if (!string.Equals(document.Issuer, settings.PublicIssuerUrl, StringComparison.Ordinal))
            throw new ProviderOperationException(ProviderError.IssuerMismatch);
        string[] responseTypes = document.ResponseTypes ?? throw new ProviderOperationException(ProviderError.InvalidDiscovery);
        if (!ValidList(responseTypes) || !responseTypes.Contains("code", StringComparer.Ordinal) ||
            (document.GrantTypes is not null && !ValidList(document.GrantTypes)) ||
            (document.CodeChallengeMethods is not null && !ValidList(document.CodeChallengeMethods)))
            throw new ProviderOperationException(ProviderError.InvalidDiscovery);
        Uri issuer = new(settings.PublicIssuerUrl);
        return new OidcConfiguration
        {
            Issuer = issuer,
            AuthorizationEndpoint = ValidateEndpoint(document.AuthorizationEndpoint, issuer),
            TokenEndpoint = ValidateEndpoint(document.TokenEndpoint, issuer),
            JwksUri = ValidateEndpoint(document.JwksUri, issuer),
            ResponseTypes = responseTypes,
            GrantTypes = document.GrantTypes,
            CodeChallengeMethods = document.CodeChallengeMethods
        };
    }

    private static bool ValidList(string[]? values) => values is { Length: > 0 } && values.All(value => !string.IsNullOrWhiteSpace(value));

    private static Uri ValidateEndpoint(string? value, Uri issuer)
    {
        if (value is null || !KeycloakOptionsValidator.IsSafeUrl(value, issuer.Scheme == Uri.UriSchemeHttp))
            throw new ProviderOperationException(ProviderError.InvalidDiscovery);
        Uri endpoint = new(value);
        if (endpoint.Scheme != issuer.Scheme || endpoint.Authority != issuer.Authority ||
            !endpoint.AbsolutePath.StartsWith(issuer.AbsolutePath.TrimEnd('/') + "/", StringComparison.Ordinal))
            throw new ProviderOperationException(ProviderError.InvalidDiscovery);
        return endpoint;
    }

    private sealed record DiscoveryDocument
    {
        [JsonPropertyName("issuer")] public string? Issuer { get; init; }
        [JsonPropertyName("authorization_endpoint")] public string? AuthorizationEndpoint { get; init; }
        [JsonPropertyName("token_endpoint")] public string? TokenEndpoint { get; init; }
        [JsonPropertyName("jwks_uri")] public string? JwksUri { get; init; }
        [JsonPropertyName("response_types_supported")] public string[]? ResponseTypes { get; init; }
        [JsonPropertyName("grant_types_supported")] public string[]? GrantTypes { get; init; }
        [JsonPropertyName("code_challenge_methods_supported")] public string[]? CodeChallengeMethods { get; init; }
    }
}
