# 0003. Frontend server-state governance

- Date: 2026-10-08
- Status: Accepted

## Context

Future frontend work needs persistent rules for TanStack Query and TanStack Router so agents avoid stale data, cache collisions, incorrect invalidation, and duplicate server-state sources. Engineering standards already require TanStack Query for remote state but lacked detailed cache governance.

## Decision

- Adopt [frontend server state](../engineering/frontend-server-state.md) as the single detailed authority for Query and Router caching, invalidation, freshness, retries, testing, and review expectations.
- Add `@tanstack/eslint-plugin-query` 5.104.1 with `flat/recommended` to both frontends. Enable `@tanstack/query/prefer-query-options` in Admin where system queries already use `queryOptions`. Client enables `prefer-query-options` only after its system query is migrated in a separate authorized change.
- Add the `tanstack-cache-consistency` Cursor skill for implementation and review procedures that reference the canonical document without copying rules.
- Update `AGENTS.md` and engineering standards to link the document and enforcement table. This governance change does not require refactoring unrelated features.

## Consequences

- Agents discover server-state rules before implementing queries, mutations, or loaders.
- ESLint enforces structural Query rules; agents review mutation impact, freshness, security context, and consistency semantics (including that invalidation is not deletion).
- Admin boilerplate `createQueryClient` and `systemInformationQueryOptions` align with the documented defaults. Client remains on legacy inline `useQuery` until a focused cleanup; pre-existing Client lint findings outside this scope are reported separately.
