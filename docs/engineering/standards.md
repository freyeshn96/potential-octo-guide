# Engineering standards

## Approved technology

Use the approved stack below. Add another library, framework, infrastructure component, or architectural pattern only when a concrete need is demonstrated and the choice is justified.

- **Backend:** .NET 10 LTS, ASP.NET Core, PostgreSQL, Entity Framework Core, MediatR, CQRS, Hexagonal Architecture (Ports and Adapters), FluentValidation, Serilog, xUnit, REST by default, OpenAPI, Problem Details (RFC 9457), and native .NET dependency injection. gRPC is an option when technically justified.
- **Frontend:** React, TypeScript, Vite, Zustand, TanStack Query, TanStack Router, Tailwind CSS, shadcn/ui, Vitest, and React Testing Library.
- **Infrastructure:** Docker, Docker Compose, PostgreSQL, and Keycloak. Redis is available for authorization decision caching if adopted. Use Testcontainers for integration testing where appropriate.
- **Excluded:** OpenTelemetry.

Prefer native .NET capabilities when they solve the problem adequately. The approved stack does not require using every listed technology in every service or feature.

## Language

All source code and technical documentation must be in English. This includes identifiers, projects, namespaces, paths, API contracts, database objects and migrations, comments, technical errors, tests, and internal messages. User-facing content may be localized.

## Design practices

Apply SOLID, KISS, DRY, YAGNI, separation of concerns, explicit dependencies, high cohesion, low coupling, composition over inheritance when appropriate, secure defaults, fail-closed authorization, testability, and maintainability pragmatically. Simplicity takes precedence over unnecessary sophistication.

Avoid abstractions created only to satisfy a pattern, excessive interfaces, generic repositories without demonstrated need, unnecessary wrappers, premature extensibility, excess project fragmentation, distributed-system patterns without need, redundant business logic, and frameworks added only for popularity.

## Testing and validation

Unit and integration tests are expected for meaningful business behavior. Prioritize domain invariants, CQRS handlers, application validation, API contracts, PostgreSQL persistence, provider integration, synchronization failures, authorization, cache invalidation, concurrency, module composition, and isolation between environments and applications. Use real infrastructure through Testcontainers where appropriate. Tests should verify behavior rather than inflate coverage numbers.

Before reporting a change, compile the affected projects and run relevant tests and checks. State what was validated and disclose checks that could not run.

## Implementation workflow

Before changing code:

1. Inspect the relevant files and conventions. Identify the owning service, module, and layer.
2. Check whether the capability already exists in Keycloak or the selected provider.
3. Reuse existing capabilities and choose the smallest implementation that meets the requirement.
4. Respect dependency boundaries and consider security, consistency, failure modes, and environment/application isolation.
5. Add or update tests for meaningful behavior and run relevant validation.

For incomplete requirements, do not invent major domain rules. Separate confirmed decisions from assumptions, document important open questions, and prefer reversible choices. Ask for clarification before a security-sensitive, irreversible, or high-impact choice when necessary, while continuing independent work.

Before introducing a significant dependency or architectural pattern, explain the problem, why the current approach is insufficient, the proposed solution, its complexity and operational costs, and simpler alternatives considered. Do not silently replace established decisions.
