# Auth Gateway — Foundation

Auth Gateway's foundation establishes two independent .NET services and two independent React applications. Delivery 2 adds an isolated Keycloak provider with validated OIDC inspection, technical authentication and read-only identity-space discovery. Administrative HTTP authentication and business management remain deferred.

Read [AGENTS.md](AGENTS.md) before changing the repository. Detailed rules live in [architecture](docs/architecture/overview.md), [engineering standards](docs/engineering/standards.md), and the [decision register](docs/decisions/README.md).

## Prerequisites

- .NET 10 SDK compatible with `src/global.json` (10.0.302 or a newer stable .NET 10 feature band).
- Node.js 24 and npm 11. Each frontend has an independent package manifest and lockfile.
- Docker Engine with Linux containers and Docker Compose v2. Docker must be running for database verification and Testcontainers.
- PowerShell 7 for the optional development setup scripts. On other platforms, copy `infrastructure/docker/.env.example` to `infrastructure/docker/.env` and fill the three password values with separate local secrets.

No Keycloak, Redis, telemetry collector, or message broker is required.

## Architecture and structure

```text
src/AuthGateway.slnx                           # .NET solution
src/global.json                                # Pinned .NET SDK
src/.config/dotnet-tools.json                  # Local dotnet-ef tool manifest
src/Directory.Build.props                      # Shared backend build settings
src/Directory.Packages.props                   # Central package versions
src/NuGet.Config                               # NuGet source policy
src/BuildingBlocks/AuthGateway.Contracts       # Technical wire contract only
src/Server/AuthGateway.Server.{Domain,Application,Infrastructure,Presentation,Host}
src/Admin/AuthGateway.Admin.{Domain,Application,Infrastructure,Presentation,Host}
src/tests/AuthGateway.{Server,Admin}.{UnitTests,IntegrationTests}
frontend/auth-gateway-admin                    # Admin frontend
frontend/auth-gateway-client                   # Client frontend connected to Server
infrastructure/docker                         # Images, PostgreSQL init, local Compose .env
scripts                                       # Local environment initialization
docs                                          # Architecture, decisions, standards, verification
```

Domain has no package or framework dependency and defines no invented entities. Application references Domain and registers MediatR and FluentValidation without artificial requests or custom pipelines. Infrastructure references Application and owns its DbContext, database options, health check, and design-time factory. Presentation references Application and the small shared technical contract project; it owns technical endpoints, OpenAPI, and HTTP error handling. Host composes Application, Infrastructure, and Presentation, and owns startup, CORS, logging, and configuration.

Server and Admin do not reference each other. Module composition is explicit:

```csharp
builder.Services.AddAuthGatewayServerModule(builder.Configuration);
app.MapAuthGatewayServerModule();
// The independent Admin host uses AddAuthGatewayAdminModule / MapAuthGatewayAdminModule.
```

There is no generic module framework. `AddAuthGateway(...)` remains reserved for the future public SDK.

## Local setup: PostgreSQL in Docker, applications on the machine

From the repository root:

```powershell
./scripts/Initialize-Development.ps1
docker compose --env-file infrastructure/docker/.env config --quiet
docker compose --env-file infrastructure/docker/.env up -d --wait postgres
Push-Location src
dotnet restore AuthGateway.slnx --configfile NuGet.Config
dotnet build AuthGateway.slnx --no-restore
Pop-Location
```

Run backend `dotnet` commands from `src/` so `global.json` and the local tool manifest apply. The initializer creates an ignored `infrastructure/docker/.env` with independently generated database passwords. It keeps any existing file. Never commit local credentials. Do not use these development credentials for production.

Pass `--env-file infrastructure/docker/.env` to every `docker compose` command from the repository root so Compose can resolve the development variables.

In a Server terminal:

```powershell
. ./scripts/Set-DevelopmentEnvironment.ps1 -Service Server
dotnet run --project src/Server/AuthGateway.Server.Host --no-launch-profile
```

In a separate Admin terminal:

```powershell
. ./scripts/Set-DevelopmentEnvironment.ps1 -Service Admin
dotnet run --project src/Admin/AuthGateway.Admin.Host --no-launch-profile
```

Using `--no-launch-profile` preserves the session's configured ports. Both hosts start independently; database failure affects readiness, not liveness. Invalid or missing required database configuration fails startup with a safe validation message.

Run each frontend from its own directory:

```powershell
cd frontend/auth-gateway-admin
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Use the same commands in `frontend/auth-gateway-client` in another terminal. The default URLs are:

| Component | URL |
| --- | --- |
| Server API | http://localhost:5080 |
| Admin API | http://localhost:5081 |
| Admin frontend (Vite) | http://localhost:5173 |
| Client frontend (Vite) | http://localhost:5174 |

For Bash or another shell, export `Database__ConnectionString`, `ASPNETCORE_ENVIRONMENT=Development`, and the service's `ASPNETCORE_URLS` yourself. A connection string must select the service's own database and user, and bound `Timeout` and `Command Timeout` to 1–30 seconds. The supplied development configuration uses five seconds.

## Full Docker workflow and selective startup

```powershell
docker compose --env-file infrastructure/docker/.env up -d --build --wait             # Complete Foundation
docker compose --env-file infrastructure/docker/.env up -d --build --wait server      # PostgreSQL + Server
docker compose --env-file infrastructure/docker/.env up -d --build --wait admin       # PostgreSQL + Admin
docker compose --env-file infrastructure/docker/.env up -d --wait postgres            # Database infrastructure only
docker compose --env-file infrastructure/docker/.env ps
docker compose --env-file infrastructure/docker/.env down                            # Retains the database volume
```

Service selection includes only declared dependencies; Server does not depend on Admin. Complete Compose exposes the Admin frontend at http://localhost:8081 and the Client frontend at http://localhost:8082 by default. The production frontend assets are served by Nginx with SPA route fallback. Its `/api` proxy forwards to the appropriate backend on the Compose network; no browser credentials or private configuration are embedded in Vite.

The backend Dockerfiles use separate publish stages and non-root runtime users. The frontend image uses Node for compilation and Nginx for serving. PostgreSQL uses a persistent named volume. All published development ports bind to loopback.

## Configuration

| Setting | Purpose |
| --- | --- |
| `Database__ConnectionString` | Required backend PostgreSQL configuration, independent per host |
| `ASPNETCORE_ENVIRONMENT` | Development enables the OpenAPI document; Production disables it |
| `ASPNETCORE_URLS` / `ASPNETCORE_HTTP_PORTS` | Host HTTP binding |
| `Api__AllowedOrigins__0` and subsequent indices | Explicit allowed frontend HTTP(S) origins |
| `Serilog__MinimumLevel__Default` | Structured console log threshold |
| `VITE_API_BASE_URL` | Public frontend API origin, or `/` for same-origin Docker access |
| `VITE_APP_BASE_PATH` | Public frontend path prefix compiled into Vite (`/`, `/admin/`, etc.); independent from `VITE_API_BASE_URL` |
| `POSTGRES_PORT` | Published PostgreSQL development port |
| `SERVER_PORT`, `ADMIN_PORT` | Published backend development ports |
| `ADMIN_FRONTEND_PORT`, `CLIENT_FRONTEND_PORT` | Published frontend development ports |
| `SERVER_DATABASE*`, `ADMIN_DATABASE*` | Owned logical database, role, and password |
| `POSTGRES_PASSWORD` | PostgreSQL bootstrap password used only by infrastructure |

Backend configuration follows standard `appsettings.json`, environment-specific settings, and environment-variable overrides. No credentials are present in committed settings. CORS allows only explicit origins (local Vite origins in Development), without credentials. If development ports change, update allowed origins as well. The Vite API URL is public and compiled into the frontend build; never put private secrets in `VITE_*` variables.

Admin prefixed deployments set `VITE_APP_BASE_PATH` at build time (for example `/admin/`). TanStack Router uses the same compiled base. Reverse proxies should strip the external prefix before requests reach the frontend container while preserving SPA fallback to `index.html` for nested routes. The API base URL remains configured separately through `VITE_API_BASE_URL`.

Database initialization creates separate roles and logical databases, revoking default public database access. Initialization runs only on a new PostgreSQL volume. Changing database names or passwords in `infrastructure/docker/.env` does not modify an existing volume; apply deliberate database administration changes, or reset disposable development data explicitly.

## Technical API surface

Each service provides:

- `GET /health/live`: process liveness, independent of PostgreSQL.
- `GET /health/ready`: bounded PostgreSQL connectivity check; returns 503 when unavailable.
- `GET /api/v1/system/info`: non-sensitive service name, running status, and version.
- `GET /openapi/v1.json`: generated OpenAPI in Development only.

System information confirms the API can respond; it does not replace readiness. Health responses are intentionally minimal. HTTP failures use native Problem Details with a correlation identifier. Unexpected public responses omit exception details. FluentValidation exceptions are distinguished as 400 validation errors.

Serilog writes structured JSON console logs with service, environment, request, and correlation context. Sensitive data logging is disabled for EF Core. Authorization headers, credentials, and request bodies are not logged.

## Persistence and migrations

Server owns `ServerDbContext` and `auth_gateway_server`; Admin owns `AdminDbContext` and `auth_gateway_admin`. Each logical database has its own EF model and migration history. Foundation models are empty; there are no generated business tables or artificial migrations. Connectivity is verified through the configured EF provider.

Migration tooling is repository-local and versioned. Once a later delivery adds an actual model, run migrations explicitly using the matching service configuration:

```powershell
. ./scripts/Set-DevelopmentEnvironment.ps1 -Service Server
Push-Location src
dotnet tool restore
dotnet ef migrations add <MeaningfulMigrationName> --project Server/AuthGateway.Server.Infrastructure --startup-project Server/AuthGateway.Server.Host
dotnet ef database update --project Server/AuthGateway.Server.Infrastructure --startup-project Server/AuthGateway.Server.Host
Pop-Location
```

Replace Server with Admin for its independently owned model. For production, generate and review an idempotent SQL script or migration bundle and apply it as a controlled deployment step. Hosts never call `EnsureCreated` or automatically apply production migrations at startup.

## Tests and quality checks

Backend:

```powershell
Push-Location src
dotnet restore AuthGateway.slnx --configfile NuGet.Config
dotnet build AuthGateway.slnx --no-restore
dotnet test AuthGateway.slnx --no-build
Pop-Location
```

Full tests require Docker. Testcontainers starts disposable PostgreSQL instances; tests do not depend on the local Compose database. To execute only configuration/composition tests and database-independent HTTP integration checks when Docker is unavailable:

```powershell
Push-Location src
dotnet test AuthGateway.slnx --no-build --filter "Category!=PostgreSQL"
Pop-Location
```

This filter explicitly excludes real PostgreSQL tests; it is not full infrastructure verification.

In **each** frontend directory:

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

Tests cover module isolation, options validation, endpoint contracts, safe failures, liveness/readiness behavior, OpenAPI visibility, CORS, EF/PostgreSQL connectivity, mounting, routing, and frontend connectivity/error states. Nullable reference types, strict TypeScript, central package management, ESLint, Prettier, and `.editorconfig` are configured.

See [Foundation verification](docs/engineering/foundation-verification.md) for the checks actually executed for this delivery.

## Current scope and next delivery

There are no business entities, interactive authentication flows, administrative authorization policies, synchronization, SDK implementation, or business screens. The Keycloak adapter implements only diagnostics, OIDC inspection, service-account authentication and read-only identity-space discovery. Domain projects intentionally contain no artificial code. The Client frontend has only a technical shell and does not prescribe future product workflows. shadcn/ui's Button and styling tokens provide the initial local component foundation; there is no shared frontend package.

The next delivery is **Environment Management**, within each service's established ownership boundaries. Redis, company-to-organization mapping, and additional providers remain subject to the decision register.

## Keycloak delivery

See [Delivery 2 provider integration](docs/engineering/keycloak-integration.md) for configuration,
least-privilege local setup, controlled console diagnostics and provider test commands.
