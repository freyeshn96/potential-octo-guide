# Foundation verification

Date: 2026-10-08 (America/Tegucigalpa).

## Environment

- Windows, .NET SDK 10.0.302, ASP.NET Core runtime 10.0.10.
- Node.js 24.12.0, npm 11.6.2.
- Docker CLI 29.1.3 and Compose v2.40.3.
- Docker Desktop's engine was unavailable. Its explicit startup attempt timed out. No further startup attempts were made after the user requested avoiding retries without a new reason.

## Executed checks

| Check | Result |
| --- | --- |
| dotnet restore AuthGateway.slnx --configfile NuGet.Config | Passed |
| dotnet build AuthGateway.slnx --no-restore | Passed after dependency alignment |
| dotnet build AuthGateway.slnx --no-restore -c Release | Passed, zero warnings and errors |
| dotnet test AuthGateway.slnx -c Release --no-build --filter "Category!=PostgreSQL" | 32 passed: 14 unit and 18 HTTP integration tests |
| EF Core tool restore and dbcontext info for Server and Admin | Passed; distinct DbContexts and logical database names, Npgsql provider |
| Independent real Server and Admin process startup | Passed on ports 5080 and 5081 |
| GET /health/live on both processes | 200 |
| GET /api/v1/system/info on both processes | 200, expected service identity and version |
| GET /openapi/v1.json in Development on both processes | 200 |
| GET /health/ready without PostgreSQL on both processes | 503, safe minimal response |
| Admin frontend installation, strict typecheck, lint, formatting check, tests, production build | Passed, six tests |
| Client frontend installation, strict typecheck, lint, formatting check, tests, production build | Passed, six tests |
| Both frontends against their real backend in a browser | API connected with the appropriate service identity |
| Browser layout and navigation | Admin desktop layout and Client mobile layout/navigation verified |
| docker compose config --quiet | Passed |

The unit tests verify module isolation, configured services, empty models, and database options. The HTTP integration tests independently initialize each host and verify diagnostics, readiness failure, safe Problem Details, startup validation, OpenAPI visibility, and CORS restrictions. Neither host references the other service's assemblies or calls it during startup.

Dependencies were installed from official registries, checked for compatible framework/Node requirements, and compiled together. EF Core transitive packages are aligned centrally at 10.0.10. Microsoft.OpenApi is explicitly pinned to 2.7.5 to address the [upstream advisory](https://github.com/advisories/GHSA-v5pm-xwqc-g5wc) affecting the default transitive version. TypeScript 5.9.3 satisfies the selected TypeScript ESLint peer range; jsdom 26.1.0 works with the installed Node version. npm installation reported zero vulnerabilities. OpenTelemetry is not installed or configured; Vitest's optional peer metadata does not install it.

## Not executed

- The two PostgreSQL Testcontainers tests (one per service). They were explicitly excluded from the executed test command, not counted as passed or skipped.
- A full unfiltered dotnet test run.
- Docker image builds and container runtime startup.
- PostgreSQL startup, database role isolation, successful EF connectivity, and healthy readiness against real PostgreSQL.
- Complete Compose runtime verification and Nginx-to-backend API proxy verification.

These require a functioning Docker engine. Compose configuration validation does not prove container runtime behavior. Foundation implementation is present, but infrastructure runtime acceptance remains pending.

## Remaining acceptance commands

Once Docker is running:

```powershell
dotnet test AuthGateway.slnx -c Release --no-build
docker compose up -d --build --wait
docker compose ps
```

Stop locally running backend processes first if they occupy the published Compose ports. Then check both hosts' three technical endpoints, both frontend API proxies, and their SPA runtime routes. Check that each service connects using only its own database role. Do not remove the persistent development volume as a routine verification step.
