# Engineering standards

## Approved technology

Use the approved stack below. Add another library, framework, infrastructure component, or architectural pattern only when a concrete need is demonstrated and the choice is justified.

- **Backend:** .NET 10 LTS, ASP.NET Core, PostgreSQL, Entity Framework Core, MediatR, CQRS, Hexagonal Architecture (Ports and Adapters), FluentValidation, Serilog, xUnit, REST by default, OpenAPI, Problem Details (RFC 9457), and native .NET dependency injection. gRPC is an option when technically justified.
- **Frontend:** React, TypeScript, Vite, Axios, Zustand, TanStack Query, TanStack Router, Tailwind CSS, shadcn/ui, Vitest, and React Testing Library.
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

For every code change:

1. Read project and applicable directory instructions; inspect related implementations.
2. Identify the owning service, module, and layer; check existing provider capabilities and reusable code.
3. Implement the smallest secure solution with explicit types and clear contracts.
4. Review method/constructor parameter counts, complexity, cohesion, coupling, and duplication during implementation.
5. Remove unused imports and declarations in affected files.
6. Review nullability, exceptions, asynchronous operations, security, consistency, and isolation.
7. Add/update tests for meaningful behavior and execute relevant automated quality checks.
8. Correct warnings/errors introduced by the change; report validation limits and justified deviations with their approval or framework constraint.

Code quality applies from the beginning, not only at final review.

For incomplete requirements, do not invent major domain rules. Separate confirmed decisions from assumptions, document important open questions, and prefer reversible choices. Ask for clarification before a security-sensitive, irreversible, or high-impact choice when necessary, while continuing independent work.

Before introducing a significant dependency or architectural pattern, explain the problem, why the current approach is insufficient, the proposed solution, its complexity and operational costs, and simpler alternatives considered. Do not silently replace established decisions.

## Mandatory code quality

These rules apply during implementation, including tests and tooling code. Changes to mandatory rules require explicit owner approval; never edit governance to justify a violating implementation.

### Types and contracts

C#: never use `var` or `dynamic`; explicitly type local variables. Prefer strongly typed contracts and models. Avoid unnecessary `object`, unsafe casts, and reflection when typed alternatives exist.

TypeScript: never use `var` or explicit or implicit `any`. Use `const` unless reassignment requires `let`. Use meaningful interfaces, types, and generics; use `unknown` and narrowing for genuinely unknown data. Explicitly type public contracts and complex shared structures; safe inference is allowed for straightforward local expressions. Avoid unsafe assertions and unnecessary non-null assertions. Keep strict checking enabled. Never suppress compiler or analyzer diagnostics merely to bypass these rules.

### Parameters and reuse

C# methods and constructors, including primary constructors, must declare at most three parameters by default. Before a fourth parameter, evaluate responsibilities, unrelated operations, dependency cohesion, domain concepts, cohesive value/parameter objects, and splitting responsibilities. Do not create meaningless containers, artificial facades, service locators, or dependency containers to hide coupling. Explain and obtain owner approval before introducing a justified exception. Framework-required signatures and overrides are exempt only when they cannot reasonably be changed; document the reason.

Before adding behavior, inspect equivalent implementations and provider capabilities. Evaluate helpers, cohesive services, domain policies, validators, processing mechanisms, React components, and hooks for actual duplication. Significant new shared abstractions require a proposal and approval before implementation: explain the duplication/problem, justification, consumers, introduced coupling, and simpler alternatives. Similar implementation alone does not make unrelated business concepts interchangeable. Apply DRY with SOLID, KISS, and YAGNI.

### Maintainability and cleanup

Inspect affected files and remove unused imports/usings, variables, private fields, dead code, unreachable branches, obsolete commented implementations, unnecessary casts, and redundant assignments. Do not leave unintended debugging statements.

Target cognitive complexity at most 15 per method unless an approved analyzer configuration establishes another threshold. Keep methods focused, names meaningful, cohesion high, and coupling low. Prefer guard clauses where useful; avoid deep nesting and unnecessary Boolean complexity. Handle nullability correctly. Avoid empty catches, silent exception swallowing, and unnecessary generic catches. Preserve exception information. Avoid repeated expensive enumeration, dispose resources appropriately, and avoid unnecessary allocations in critical paths. Name meaningful rule constants instead of scattering magic strings or numbers. Never create artificial abstractions merely to reduce a metric. Verify Sonar identifiers and thresholds against the actual installed analyzer/profile; no Sonar analyzer is currently installed.

### Asynchronous operations and security

.NET: prefer asynchronous I/O; avoid `.Result`, `.Wait()`, unnecessary `Task.Run`, unmanaged fire-and-forget tasks, and `async void` except required event handlers. Propagate `CancellationToken` where appropriate and dispose resources correctly.

React/TypeScript: handle rejected promises and avoid floating promises. Follow Hooks rules and correct dependencies; clean up subscriptions and side effects. Avoid unnecessary effects and duplicated server state. Use TanStack Query for remote state and follow [frontend server state](frontend-server-state.md) for caching, invalidation, Router integration, and testing.

Never hardcode or log credentials, secrets, or tokens. Validate untrusted external data, avoid unsafe SQL construction, preserve backend authorization enforcement, and never disable TLS validation. Keep internal exception details out of public responses. Do not ignore security analyzer warnings. Protect concurrent operations from races and use secure defaults.

## Quality verification and enforcement

The root `AGENTS.md` automatically directs agents to this canonical document. No tool-specific instruction copy, directory override, or skill is needed for the current uniform standards. Skills may be introduced for a concrete repeatable procedure beyond this workflow; they must reference these standards instead of copying them.

| Mechanism | Automatically checked | Review still required |
| --- | --- | --- |
| `.editorconfig` and .NET build | Explicit local typing style (IDE0007/IDE0008), unused usings (IDE0005 where supported), unnecessary assignments (IDE0059), native analyzer/compiler diagnostics | `dynamic`, unnecessary `object`, unsafe casts/reflection, parameter count and cohesion, dead code not diagnosed by tooling |
| `Directory.Build.props` | Nullable references, warnings as errors, native analyzers and style enforcement during build | Security, asynchronous design, resource ownership, architectural boundaries |
| Both frontend ESLint configurations | No `var`/explicit `any`, unused declarations, unsafe operations involving `any`, floating/misused promises, unnecessary assertions, non-null assertions, Hooks rules, `@tanstack/eslint-plugin-query` `flat/recommended` | Public contract completeness, validated external data, meaningful reuse, server-state ownership, mutation impact, freshness policy, invalidation semantics |
| Both TypeScript configurations | Strict checking (including implicit `any`), unused locals/parameters, indexed access safety | Assertions that escape types, nullability intent, business correctness |
| Agent review | Three-parameter default, approval records, cognitive complexity target, duplication, coupling, all remaining mandatory standards | Owner approval for significant shared abstractions and justified parameter exceptions |

XML documentation generation enables IDE0005 during builds. Only CS1591 (missing XML documentation comments) is excluded because documentation completeness is not a mandated gate; no mandatory quality diagnostic is suppressed. Native style diagnostics are not a universal substitute for review: generated code, implicit/global usings, and compiler-supported diagnostic contexts can differ. Cognitive complexity is a review target, not an ESLint cyclomatic-complexity threshold. No duplicate Sonar toolchain or new analyzer dependency is introduced without a concrete need.

From the root, run `dotnet build AuthGateway.slnx --no-restore` and relevant `dotnet test AuthGateway.slnx --no-build` checks after restoring dependencies if needed. Use `dotnet format AuthGateway.slnx --verify-no-changes --no-restore` for formatting/style verification; do not automatically rewrite unrelated code. In each frontend, run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run format:check` (use `npm ci` when dependencies are missing). Full backend integration tests require Docker; when unavailable, the explicit `--filter "Category!=PostgreSQL"` subset must be reported as incomplete infrastructure validation. Do not suppress findings to obtain a passing result or perform unrelated cleanup: report pre-existing failures separately.
