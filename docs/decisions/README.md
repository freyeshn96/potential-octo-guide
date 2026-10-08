# Decision register

This register separates confirmed constraints from choices that remain open. An option, example, or future possibility is not a requirement. Do not resolve an open item by silently treating one proposal as approved.

## Confirmed decisions

- The initial provider is Keycloak. The MVP supports one provider implementation.
- The MVP maps each stable Gateway Environment to one Keycloak realm; a Company is a business entity and is not equivalent to an Environment or realm.
- Auth Gateway owns a provider-independent canonical resource model and business metadata. Keycloak remains operational authority for resources it manages.
- The backend has independently deployable Server and Admin services with the ownership boundaries in [the architecture overview](../architecture/overview.md).
- Backend layers are separated into Domain, Application, Infrastructure, Presentation, and Host projects. Modules compose their own dependencies and use the `Module` suffix. Reserve `AddAuthGateway(...)` for the public .NET SDK.
- The functional authorization strategy is Centralized Decisions with Balanced Revocation, using Keycloak Authorization Services initially. Authorization fails closed, and Admin's authorization model is separate.
- REST is preferred. gRPC is allowed when technically justified. Applications use provider OIDC capabilities directly when those capabilities meet the need.
- The approved technology stack and OpenTelemetry exclusion are recorded in [engineering standards](../engineering/standards.md).
- All source code and technical documentation use English.

## Open questions and conditional choices

These are intentionally not settled. Resolve them only when a concrete task requires a decision or the owner approves one.

- Whether Company should map to Keycloak Organizations, and the exact mapping rules.
- Whether authorization decision caching is needed for the MVP, whether Redis will be adopted, and which decision classes may be cached. The security constraints in the architecture overview apply if caching is introduced.
- Whether any service-to-service operation warrants gRPC instead of REST.
- The final names and boundaries of individual modules beyond the confirmed `Module` suffix and service ownership boundaries.
- Whether additional providers, migration support, asynchronous brokers, or an OIDC reverse proxy are needed beyond the MVP. They are not current implementation requirements.

## Recording a new decision

For every approved architectural decision, add a dated `NNNN-short-title.md` record in this directory. Include context, the decision, consequences, and status. Move a resolved item from **Open questions and conditional choices** to **Confirmed decisions**, update the single detailed document responsible for the rule, then search and review related instructions for contradictions. Follow the maintenance workflow in [AGENTS.md](../../AGENTS.md).

Do not repeat full rules across documents. The register provides status and links; the architecture and engineering documents own the detailed requirements.

## Decision record template

Copy this template to a new numbered file when a decision is approved:

```markdown
# NNNN. Decision title

- Date: YYYY-MM-DD
- Status: Accepted

## Context

What problem or choice required a decision?

## Decision

What was approved?

## Consequences

What changes, tradeoffs, or follow-up work result?
```
