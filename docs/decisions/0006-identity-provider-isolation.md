# 0006. Identity provider isolation

- Date: 2026-10-08
- Status: Accepted

## Context

The owner confirmed provider independence and physical isolation of every concrete identity provider implementation. Earlier architecture guidance described provider-neutral contracts as a target and grouped Keycloak adapters within service Infrastructure projects. Those formulations did not establish the now-required project boundary. The initial implementation scope remains Keycloak, with no integration code introduced by this governance task.

## Decision

Adopt the mandatory provider isolation rules in [the architecture overview](../architecture/overview.md#identity-provider-isolation), the single detailed authority for Application contracts, concrete provider class libraries, composition references, capability semantics, and equivalent frontend isolation. Design for multiple providers while implementing only Keycloak initially and introducing contracts for actual use cases.

This decision refines the earlier Infrastructure adapter placement; provider implementation remains an infrastructure responsibility but requires its own physical project. It preserves [Foundation service composition and persistence](0001-foundation-composition-and-persistence.md), the canonical resource model, the MVP realm mapping, direct standardized OIDC usage, and provider synchronization/reconciliation constraints. The Foundation record describes its delivered project set, not a prohibition on future justified provider projects.

## Consequences

Future integrations must keep concrete provider dependencies and models outside the business core and generic frontend functionality. Provider replacement is primarily an adapter/composition change for equivalent capabilities; unsupported administrative capabilities require explicit handling rather than semantic imitation.

Additional provider implementations, runtime selection, and frontend package extraction remain conditional future work. No provider projects, placeholders, dependencies, integration functionality, or application refactoring are authorized by this governance change.

Existing root `AGENTS.md` discovery of the architecture overview and decision register exposes these rules automatically. No entry-point change, directory-specific rule, or new skill is necessary: the existing implementation workflow covers inspection, boundaries, provider capabilities, and verification without duplicating this decision.
