# Architecture overview

## Product direction

Auth Gateway simplifies the configuration, registration, administration, and integration of applications with identity providers using OpenID Connect. Keycloak is the initial provider. The platform owns a canonical representation of managed resources, provides SDKs, and adds authorization capabilities where they provide real value.

Concepts and operations may be renamed, grouped, abstracted, or automated to improve the administrative experience. Simplification must preserve security, correctness, and authorization granularity.

## Executable services and ownership

Auth Gateway has two independently deployable backend services:

- **Server** owns the canonical functional resource model, provider coordination, functional authorization, synchronization and reconciliation, and the official configuration published to SDKs.
- **Admin** is the administrative entry point. It authenticates administrators, enforces administrative roles, permissions, and scopes, receives administrative requests, forwards authorized operations to Server, and presents management information.

Admin must not duplicate Server business logic or own functional resources. Server must not depend on Admin sessions, roles, or authorization. Service communication must use authenticated, explicit contracts. Prefer REST; use gRPC only when a concrete technical need justifies it.

## Backend boundaries

Keep the backend in independent .NET projects with these responsibilities:

- **Domain:** business entities, value objects, invariants, justified domain services, and domain events. It is independent of infrastructure, frameworks, persistence, HTTP, and identity providers.
- **Application:** use cases, commands and queries, orchestration, validation, ports and contracts, and transaction coordination policies. It may depend on Domain, not on concrete infrastructure.
- **Infrastructure:** EF Core, PostgreSQL, Keycloak and Redis adapters, and external integrations.
- **Presentation:** REST endpoints, justified gRPC endpoints, HTTP contract mapping, authentication middleware, and API concerns.
- **Host:** startup, dependency composition, configuration, module registration, and runtime initialization.

Do not add layers without clear responsibilities. Apply Hexagonal Architecture and CQRS pragmatically; patterns must solve concrete problems.

## Modules

Modules are independently composable. Internal registrations use the `Module` suffix and encapsulate their dependencies, options, handlers, validators, infrastructure, and related services. Modules must not depend on other modules' concrete implementations. Do not use dynamic assembly loading or an elaborate plugin framework without explicit need.

The exact sample names such as `AddAuthGatewayServerModule` are provisional. The `Module` suffix is confirmed. Reserve `AddAuthGateway(...)` for the public .NET SDK; never use it for internal module composition.

## Canonical model and providers

Auth Gateway owns its canonical identifiers, business metadata, resource relationships, and platform-specific rules. The model may include applications, environments, companies, screens and actions, managed roles and permission definitions, provider bindings, identity references, and synchronization status. It must not depend on Keycloak entities.

Keycloak remains operational authority for resources it manages, such as OIDC clients, realms, and provider authorization policies. Do not replicate the Keycloak database or synchronize resources Auth Gateway does not manage. Provider-neutral contracts are the target for internal business logic; isolate unavoidable provider-specific structures in adapters. Keycloak is the only implemented provider in the MVP. Multiple provider support and provider migration are future considerations, not MVP requirements.

For the MVP, an Environment has a stable Gateway identifier and maps to one Keycloak realm. A Company is a business entity in the corporate group and is not equivalent to a realm. Whether and how Companies map to Keycloak Organizations remains open (see the [decision register](../decisions/README.md)). An Application is a logical business system, may have multiple OIDC clients, and may be associated with multiple environments. It may be available to all companies or selected companies.

Keep company membership, application availability, and functional permissions distinct. Access to a company does not grant all functional permissions in its applications. The UI should not require a global active-environment selection; resource operations should let administrators choose applicable environments and make differences and partial results understandable.

## Provider integration and SDKs

Applications should use standardized provider capabilities directly when safe and sufficient. Auth Gateway must not become an unnecessary proxy for OIDC authentication, Authorization Code with PKCE, token issuance or refresh, logout, discovery, or JWKS retrieval. Gateway APIs are appropriate when they simplify work, apply business rules, manage configuration, coordinate providers, or provide centralized functional authorization or other missing capabilities. An OIDC reverse proxy is outside the initial scope.

Official SDKs are planned for .NET / ASP.NET Core and TypeScript / React. They retrieve official application configuration from Server and simplify discovery, functional authorization, permission checks, capability registration, error handling, and typed API consumption. SDK contracts are versioned and provider-neutral. Use established OIDC libraries; do not reimplement OIDC unnecessarily. Frontend checks support user experience; backends enforce security-sensitive actions.

## Authorization and communication

The confirmed functional authorization strategy is **Centralized Decisions with Balanced Revocation**. Keycloak Authorization Services is the initial provider-side authorization engine. Server exposes a provider-neutral authorization API and normalizes decisions. The administrative authorization model stays separate from functional authorization.

MediatR handles application requests and suitable in-process events. Do not assume separate modules share process memory. Cross-module or cross-process integration events use provider-neutral contracts; do not use `IMediator.Publish` as cross-process delivery. Define an abstraction such as `IEventBus` if asynchronous integration events are needed. Prefer REST or justified gRPC when immediate confirmation is needed. Do not add a message broker without a concrete requirement; if one is approved, address idempotency, delivery, retries, and transactional outbox needs.

## External consistency and reconciliation

For operations that change both Gateway persistence and a provider, define ordering, idempotency, concurrency protection, provider verification, safe local persistence, failure recovery, auditing, and reconciliation. Persist operation tracking when needed. Never claim an atomic transaction across PostgreSQL and Keycloak without a real distributed transaction guarantee.

Detect direct provider changes through reconciliation. Do not silently overwrite conflicts; provide explicit detection and resolution. Distinguish desired, observed, and published configuration when needed, and publish only confirmed, safe SDK configuration. Avoid three complete persistence models if a simpler representation works.

## Explicit security constraints

- Fail closed for authorization. Distinguish denial from infrastructure failure.
- Redis is never the source of truth. Do not preload every user's roles or permissions.
- Cache selectively and on demand. Use short configurable TTLs for static decisions; avoid caching contextual or sensitive decisions unless correctness is guaranteed.
- Invalidate affected decisions after known changes and prevent stale decisions from being reinserted during concurrent operations.
- Preserve isolation between applications and environments. Validate identities and service consumers; never trust arbitrary client-supplied user identifiers.
- Do not implement a second complete authorization policy engine in PostgreSQL.

Redis adoption and the precise caching policy for each decision type remain implementation choices; the constraints above apply if decision caching is introduced.
