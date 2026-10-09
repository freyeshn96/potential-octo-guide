using System.Net.Http.Headers;
using System.Text.Json.Serialization;
using AuthGateway.Provider.Keycloak.Authentication;
using AuthGateway.Provider.Keycloak.Http;
using AuthGateway.Server.Application.Providers;

namespace AuthGateway.Provider.Keycloak;

internal sealed class IdentitySpaceDiscovery(KeycloakHttp http, ServiceTokenStore tokens) : IIdentitySpaceDiscovery
{
    public async Task<IReadOnlyList<IdentitySpaceDescriptor>> DiscoverAsync(CancellationToken cancellationToken)
    {
        string token = await tokens.GetAsync(cancellationToken);
        using HttpRequestMessage request = new(HttpMethod.Get,
            KeycloakHttp.Append(http.Settings.AdministrativeApiUrl, "realms?briefRepresentation=true"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        RealmResponse[] realms;
        try { realms = await http.SendAsync<RealmResponse[]>(request, cancellationToken); }
        catch (ProviderOperationException exception) when (exception.Error == ProviderError.InvalidCredentials)
        {
            await tokens.RejectAsync(token, cancellationToken);
            throw;
        }
        if (realms.Any(realm => realm is null || string.IsNullOrWhiteSpace(realm.Realm)) ||
            realms.Select(realm => realm.Realm).Distinct(StringComparer.Ordinal).Count() != realms.Length)
            throw new ProviderOperationException(ProviderError.UnexpectedResponse);
        return realms.Select(realm => new IdentitySpaceDescriptor
        {
            ExternalId = realm.Realm!,
            Name = realm.Realm!,
            Enabled = realm.Enabled,
            IsProtected = string.Equals(realm.Realm, "master", StringComparison.OrdinalIgnoreCase)
        }).ToArray();
    }

    private sealed record RealmResponse
    {
        [JsonPropertyName("realm")] public string? Realm { get; init; }
        [JsonPropertyName("enabled")] public bool? Enabled { get; init; }
    }
}
