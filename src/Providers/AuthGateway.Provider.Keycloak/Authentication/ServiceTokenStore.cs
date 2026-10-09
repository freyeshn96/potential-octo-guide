using System.Text.Json.Serialization;
using AuthGateway.Provider.Keycloak.Http;
using AuthGateway.Server.Application.Providers;

namespace AuthGateway.Provider.Keycloak.Authentication;

internal sealed class ServiceTokenStore(KeycloakHttp http, TimeProvider clock) : IDisposable
{
    private readonly SemaphoreSlim gate = new(1, 1);
    private string? token;
    private DateTimeOffset renewAt;

    internal async Task<string> GetAsync(CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try
        {
            if (token is not null && clock.GetUtcNow() < renewAt) return token;
            token = null;
            using HttpRequestMessage request = new(HttpMethod.Post,
                KeycloakHttp.Append(http.Settings.BaseUrl,
                    $"realms/{Uri.EscapeDataString(http.Settings.AuthenticationRealm)}/protocol/openid-connect/token"));
            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = http.Settings.ClientId,
                ["client_secret"] = http.Settings.ClientSecret
            });
            DateTimeOffset acquiredAt = clock.GetUtcNow();
            TokenResponse response = await http.SendAsync<TokenResponse>(request, cancellationToken);
            if (string.IsNullOrWhiteSpace(response.AccessToken) || response.AccessToken.Any(character =>
                !char.IsAsciiLetterOrDigit(character) && character is not '-' and not '.' and not '_' and not '~' and not '+' and not '/' and not '=') ||
                !string.Equals(response.TokenType, "Bearer", StringComparison.OrdinalIgnoreCase) ||
                response.ExpiresIn is <= 0 or > 86400)
                throw new ProviderOperationException(ProviderError.UnexpectedResponse);
            TimeSpan lifetime = TimeSpan.FromSeconds(response.ExpiresIn);
            TimeSpan margin = TimeSpan.FromTicks(Math.Min(http.Settings.TokenRenewalMargin.Ticks, lifetime.Ticks / 2));
            renewAt = acquiredAt + lifetime - margin;
            if (clock.GetUtcNow() >= renewAt) throw new ProviderOperationException(ProviderError.UnexpectedResponse);
            token = response.AccessToken;
            return token;
        }
        finally { gate.Release(); }
    }

    internal async Task RejectAsync(string rejectedToken, CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try { if (token == rejectedToken) token = null; }
        finally { gate.Release(); }
    }

    public void Dispose() => gate.Dispose();

    private sealed record TokenResponse
    {
        [JsonPropertyName("access_token")] public string? AccessToken { get; init; }
        [JsonPropertyName("token_type")] public string? TokenType { get; init; }
        [JsonPropertyName("expires_in")] public int ExpiresIn { get; init; }
    }
}
