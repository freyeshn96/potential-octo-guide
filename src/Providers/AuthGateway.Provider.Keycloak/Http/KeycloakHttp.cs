using System.Net;
using System.Text.Json;
using AuthGateway.Provider.Keycloak.Configuration;
using AuthGateway.Server.Application.Providers;
using Microsoft.Extensions.Options;

namespace AuthGateway.Provider.Keycloak.Http;

internal sealed class KeycloakHttp(IHttpClientFactory clients, IOptions<KeycloakOptions> options)
{
    internal const string ClientName = "Keycloak";
    internal KeycloakOptions Settings
    {
        get
        {
            try { return options.Value; }
            catch (OptionsValidationException) { throw new ProviderOperationException(ProviderError.InvalidConfiguration); }
        }
    }

    internal static Uri Append(string root, string path) => new($"{root.TrimEnd('/')}/{path}");

    internal async Task<T> SendAsync<T>(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        KeycloakOptions settings = Settings;
        using HttpClient client = clients.CreateClient(ClientName);
        client.Timeout = settings.Timeout;
        client.MaxResponseContentBufferSize = 1024 * 1024;
        try
        {
            using HttpResponseMessage response = await client.SendAsync(request, cancellationToken);
            CheckStatus(response.StatusCode, request.Method == HttpMethod.Post);
            byte[] body = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            return JsonSerializer.Deserialize<T>(body) ?? throw new ProviderOperationException(ProviderError.UnexpectedResponse);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        { throw new ProviderOperationException(ProviderError.Timeout); }
        catch (HttpRequestException)
        { throw new ProviderOperationException(ProviderError.Unavailable); }
        catch (JsonException)
        { throw new ProviderOperationException(ProviderError.UnexpectedResponse); }
    }

    private static void CheckStatus(HttpStatusCode status, bool tokenRequest)
    {
        if ((int)status is >= 200 and < 300) return;
        ProviderError error = status switch
        {
            HttpStatusCode.Unauthorized => ProviderError.InvalidCredentials,
            HttpStatusCode.Forbidden => ProviderError.InsufficientPermissions,
            HttpStatusCode.BadRequest when tokenRequest => ProviderError.InvalidCredentials,
            HttpStatusCode.RequestTimeout or HttpStatusCode.GatewayTimeout => ProviderError.Timeout,
            HttpStatusCode.TooManyRequests => ProviderError.Unavailable,
            _ when (int)status >= 500 => ProviderError.Unavailable,
            _ => ProviderError.UnexpectedResponse
        };
        throw new ProviderOperationException(error);
    }
}
