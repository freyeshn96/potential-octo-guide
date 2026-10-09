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
- **Infrastructure:** EF Core, PostgreSQL, Redis adapters, and external integrations other than concrete identity provider implementations. Identity provider adapters are infrastructure concerns implemented in separate provider class libraries as specified below.
- **Presentation:** REST endpoints, justified gRPC endpoints, HTTP contract mapping, authentication middleware, and API concerns.
- **Host:** startup, dependency composition, configuration, module registration, and runtime initialization.

Do not add layers without clear responsibilities. Apply Hexagonal Architecture and CQRS pragmatically; patterns must solve concrete problems.

## Modules

Modules are independently composable. Internal registrations use the `Module` suffix and encapsulate their dependencies, options, handlers, validators, infrastructure, and related services. Modules must not depend on other modules' concrete implementations. Do not use dynamic assembly loading or an elaborate plugin framework without explicit need.

Foundation implements `AddAuthGatewayServerModule` and `AddAuthGatewayAdminModule` in their respective Host composition roots, with matching endpoint mapping methods. Future functional module names remain open. The `Module` suffix is confirmed. Reserve `AddAuthGateway(...)` for the public .NET SDK; never use it for internal module composition. See [Foundation composition and persistence](../decisions/0001-foundation-composition-and-persistence.md).

## Canonical model and providers

Auth Gateway owns its canonical identifiers, business metadata, resource relationships, and platform-specific rules. The model may include applications, environments, companies, screens and actions, managed roles and permission definitions, provider bindings, identity references, and synchronization status. It must not depend on Keycloak entities.

Keycloak remains operational authority for resources it manages, such as OIDC clients, realms, and provider authorization policies. Do not replicate the Keycloak database or synchronize resources Auth Gateway does not manage. Provider isolation is mandatory under [0006. Identity provider isolation](../decisions/0006-identity-provider-isolation.md) and the rules below. Design for multiple providers, implement only Keycloak initially. Additional provider implementations and provider migration remain future considerations, not MVP requirements.

For the MVP, an Environment has a stable Gateway identifier and maps to one Keycloak realm. A Company is a business entity in the corporate group and is not equivalent to a realm. Whether and how Companies map to Keycloak Organizations remains open (see the [decision register](../decisions/README.md)). An Application is a logical business system, may have multiple OIDC clients, and may be associated with multiple environments. It may be available to all companies or selected companies.

Keep company membership, application availability, and functional permissions distinct. Access to a company does not grant all functional permissions in its applications. The UI should not require a global active-environment selection; resource operations should let administrators choose applicable environments and make differences and partial results understandable.

## Identity provider isolation

### Application contracts and backend dependencies

Auth Gateway communicates with identity providers exclusively through provider-neutral contracts defined in the appropriate service's Application layer. Domain and Application must never depend directly on Keycloak, Auth0, Entra ID, or another concrete provider or its implementation project. Contracts describe Gateway capabilities, not provider-specific REST endpoints; requests, responses, and error models remain provider-independent. Introduce contracts incrementally for actual use cases rather than a speculative universal provider API.

Every concrete provider implementation must have its own physically separate .NET class library project. `AuthGateway.Provider.Keycloak` is the initial project example; `AuthGateway.Provider.Auth0` and `AuthGateway.Provider.EntraId` illustrate possible future implementations, not required projects. Provider libraries implement the relevant Application contracts without reversing the dependency into the business core. Only the appropriate Host composition root may reference concrete provider implementations for runtime composition; other production projects consume Application contracts. Provider-focused test projects may reference the implementation under test.

Each provider project encapsulates its technical authentication and token management, HTTP clients and API communication, configuration, serialization, DTOs, contract mapping, error normalization, provider-specific SDKs/dependencies, exceptions, and API models. Keep provider-specific integration tests with that provider's implementation ownership in dedicated test projects, following the repository's existing test-project convention. No provider-specific types or exceptions may leak into Application contracts or business logic.

Expose an explicit dependency injection registration method, such as `AddKeycloakProvider()`, invoked from the owning composition root. Provider registration complements internal service/module composition; it does not replace the confirmed `Module` suffix or the public SDK's reserved `AddAuthGateway(...)` entry point. Do not add dynamic plugin loading, unnecessary factories, or generic provider frameworks prematurely. For equivalent supported capabilities, replacing a provider should primarily change its adapter and dependency composition rather than business logic.

### Capability correctness

OIDC providers do not necessarily offer equivalent administrative capabilities. Do not equate Keycloak realms, Auth0 tenants, and Entra ID directories or assume identical semantics. Handle unsupported capabilities explicitly through provider-neutral contracts and errors; never silently simulate unsupported behavior or invent artificial equivalences. Provider independence must preserve correctness, canonical resource ownership, service boundaries, and the synchronization/reconciliation strategy described in this document. The confirmed MVP Environment-to-Keycloak-realm mapping remains unchanged; it is not a universal mapping for every provider.

### Frontend boundaries and incremental delivery

Generic frontend functionality consumes provider-neutral Auth Gateway API contracts. When provider-specific interfaces are necessary, isolate their components, hooks, schemas, translations, and configuration in a dedicated provider module. Extract a separate frontend package only when independent reuse or distribution justifies it. Do not introduce microfrontends or complex plugin systems without a real requirement. This boundary preserves the existing direct use of standardized OIDC capabilities described below.

Create only the Keycloak implementation when a concrete integration task requires it. Do not create placeholder projects or implementations for hypothetical providers, or runtime provider selection before it is needed. Physical backend provider separation is mandatory; future provider names, frontend package extraction, and runtime selection are conditional possibilities, not current deliverables.

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
