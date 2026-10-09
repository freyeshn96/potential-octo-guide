# Delivery 2: Keycloak provider integration

## Ownership and registration

`src/Providers/AuthGateway.Provider.Keycloak` implements three Server Application ports:
`IOidcConfigurationInspector`, `IIdentitySpaceDiscovery`, and `IProviderDiagnostics`.
Only Server Host references and registers the adapter, through `AddKeycloakProvider(configuration)`
in its existing module composition. Domain, Application, generic Infrastructure and Admin do not
reference the provider. No provider-specific packages, persistence, environment imports or management
operations are introduced. A descriptor is an observed accessible identity space, not an Environment.
`master` is always marked protected; discovery never conveys permission to manage resources.

## Configuration

Supply the `Keycloak` configuration section through environment variables (`Keycloak__ClientSecret`)
or .NET user secrets/a deployment secret store. Do not put secrets into tracked appsettings or Vite.

- `BaseUrl`: trusted transport root for administrative client credentials, including any proxy prefix.
- `PublicIssuerUrl`: exact public realm issuer, including any proxy prefix. Do not add a trailing slash
  unless the provider actually publishes one. Issuer comparison is ordinal and exact.
- `DiscoveryUrl`: optional trusted transport URL for the well-known document. Defaults to the issuer's
  `.well-known/openid-configuration` endpoint. Use this explicit override for Docker-internal transport;
  it never changes the trusted public issuer or relaxes metadata validation.
- `AdministrativeApiUrl`: trusted Admin API root, including `/admin` and any proxy prefix; may have
  a separate internal hostname. Credentials are sent only to configured URLs.
- `AuthenticationRealm`, `ClientId`, `ClientSecret`: dedicated confidential client with service account
  enabled. Authentication uses `client_credentials`; bootstrap administrator credentials are not used.
- `Timeout`: per-request duration, 100 milliseconds to two minutes (default ten seconds).
- `TokenRenewalMargin`: zero to five minutes (default thirty seconds), capped at half the token lifetime.
- `AllowInsecureHttp`: false by default. Explicit opt-in for development transport only.

Configuration is validated when a capability is invoked, not during unrelated module startup. Invalid
configuration produces the neutral `InvalidConfiguration` error. `KeycloakOptionsValidator` provides
field-specific errors without interpolating configured values. The host console prints only error codes.
Production deployments require HTTPS, trusted configuration, and normal TLS certificate validation.

Discovery validates issuer, authorization/token/JWKS endpoints, response types (including `code`), and
optional advertised grant/code-challenge lists. Endpoints must use the issuer's scheme, authority and
realm path. Arbitrary additional endpoint hosts are unsupported in this delivery. No discovered URL is
followed. This inspection is not an OIDC login implementation; consumers should use standard OIDC libraries.

HTTP uses a named `IHttpClientFactory` client, disables automatic redirects and HTTP client logging,
limits buffered responses to 1 MiB and propagates caller cancellation. There are no automatic retries.
Timeout, connectivity, invalid credentials, insufficient permissions, malformed responses and invalid
discovery are normalized without upstream response bodies. Tokens are cached only in process and acquired
under a cancellable semaphore. Failed renewal clears the old token; a rejected administrative token is
invalidated without replaying the failed request. Tokens and credentials are never returned by diagnostics.

## Local infrastructure and permissions

Run from the repository root:

```powershell
./scripts/Initialize-Development.ps1
docker compose --env-file infrastructure/docker/.env --profile identity up -d keycloak
./scripts/Set-DevelopmentEnvironment.ps1 -Service Server
dotnet run --project src/Server/AuthGateway.Server.Host -- --provider-diagnostics
```

The `identity` profile runs pinned `quay.io/keycloak/keycloak:26.8.0` and a dedicated PostgreSQL
container/volume with no host database port. Foundation can still start selectively without Keycloak.
Initialization creates independent random secrets in ignored `.env` and `.keycloak-realm.json` files.
The import creates only a local development fixture realm and `gateway-reader` confidential client,
with login/password grants and full scope disabled. It assigns `realm-management:view-realm` to its service
account and limits the client's role scope to that role.
This is enough to read its own realm and does not confer cross-realm administration. No `realm-admin`,
global `admin`, `manage-realm`, or `create-realm` is assigned. Runtime has no provisioning capability.
Existing realms are skipped by startup import: regenerating the file does not rotate stored credentials.
Rotate credentials explicitly in Keycloak and update the secret source together if required.

For deliberate cross-realm read access, an operator can place the dedicated client in `master` and
grant `view-realm` on each target `<realm>-realm` management client. Limit scope to target realms and
ensure client role scope permits the assigned roles. Do not grant global admin to solve a 403.
The pinned implementation filters `GET /admin/realms?briefRepresentation=true` by accessible realms
and returns 403 when none are accessible. A successful token does not imply administrative access;
discovering a subset does not prove permission to every configured future environment.

Browser/local .NET URL: `http://localhost:8180`; Docker transport: `http://keycloak:8080`.
Compose preserves the public issuer through `KC_HOSTNAME` while explicitly using internal transport for
discovery, token acquisition and Admin API calls. Production reverse proxies must set an accurate public
hostname and proxy headers; use `start`, HTTPS and a production deployment configuration, not `start-dev`.
Only port 8080 is mapped to loopback; the health management port 9000 is not exposed. Readiness uses
Bash `/dev/tcp` with the management health endpoint and does not require curl in the Keycloak image.

## Controlled diagnostics and deferred security

Server's `--provider-diagnostics` console mode requires Development, starts no HTTP listener, prints
neutral stage/error results and exits with status 0 or 1. Access requires local process/container execution
and access to the configuration secret. Use `docker compose ... run --rm --no-deps server --provider-diagnostics`
after building Server to inspect the internal transport configuration.

Reachability, discovery validity, technical authentication and administrative authorization are separate
checks. Administrative authorization is attempted only after technical authentication succeeds. This
does not install an anonymous HTTP diagnostic endpoint. Unmapped diagnostic/realm routes continue to
return standard safe Problem Details 404 responses in Development and Production.

Admin has no secured Admin-to-Server channel yet, so HTTP administrative exposure and the live frontend
are deferred. Future authenticated API handlers should map neutral errors to the existing Problem Details
conventions rather than forward provider statuses. Environment lifecycle, application/client provisioning,
users, permissions, synchronization and reconciliation remain outside this delivery.

## Validation

Provider unit tests use controlled HTTP responses and a clock to cover configuration, token acquisition,
reuse, renewal, concurrency, failure recovery, discovery safety, response mapping, cancellation, timeout
and neutral errors. Provider integration tests use a disposable Keycloak container with an imported
fixture, a random secret and read-only/unprivileged clients; no manually configured server is required.
Server integration tests verify independent startup and absence of administrative HTTP exposure.

With the repository's pinned SDK and Docker running:

```powershell
Set-Location src
dotnet restore AuthGateway.slnx --configfile NuGet.Config
dotnet build AuthGateway.slnx --no-restore
dotnet test AuthGateway.slnx --no-build
dotnet format AuthGateway.slnx --verify-no-changes --no-restore
```

Without Docker, `--filter "Category!=PostgreSQL&Category!=Keycloak"` is an explicitly incomplete subset.
See the [delivery validation report](keycloak-verification.md) for the checks actually executed in the implementation environment.

## Official references

- [Keycloak 26.8 administration guide: service accounts and realm administration](https://www.keycloak.org/docs/26.8.0/server_admin/).
- [Keycloak 26.8 Admin REST API](https://www.keycloak.org/docs-api/26.8.0/rest-api/index.html).
- [Pinned accessible-realm filtering implementation](https://github.com/keycloak/keycloak/blob/26.8.0/services/src/main/java/org/keycloak/services/resources/admin/RealmsAdminResource.java).
- [Container startup, hostnames, health and development limitations](https://www.keycloak.org/server/containers).
