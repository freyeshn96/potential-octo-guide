# Frontend server state (TanStack Query and Router)

This document owns mandatory rules and the review checklist for remote server state, caching, and TanStack Router integration in React frontends. Engineering standards reference this file; do not duplicate full rules elsewhere.

## Single authority

- TanStack Query is the primary cache for remote server state.
- TanStack Router handles route matching, navigation, loading coordination, and optional query preloading.
- Do not keep competing copies of the same business data in Router loaders, TanStack Query, Zustand, or component state.
- Route loaders that need server data must integrate with Query through `queryClient.ensureQueryData`, `fetchQuery`, or equivalent supported APIs, using the same `queryOptions` factory as components.
- When the first loader reads from Query, set the router `defaultPreloadStaleTime` to `0` so Query controls freshness (per TanStack external-data guidance).
- Do not build a custom cache layer on top of Query. Feature-owned key factories, named freshness policies, and targeted invalidation are sufficient.

## Query keys

- Each feature owns a typed key factory (`all`, `lists`, `list(params)`, `details`, `detail(id)`).
- Keys must be deterministic, serializable, and include every variable that changes the API response: pagination, sorting, filtering, search, and security or business context (user, tenant, company, environment, application) when it affects visibility.
- Define keys with `queryOptions` and reuse the same factory for `useQuery`, `invalidateQueries`, `getQueryData`, and `setQueryData`. Do not scatter literal key arrays in components.

## Invalidation is not deletion

- `invalidateQueries` marks data stale and, for active queries, typically triggers a background refetch. The UI may still show the previous version until the refetch completes.
- When the UI requires immediate consistency after a mutation, use one of:
  - `await` the relevant `invalidateQueries` (or refetch) before showing final success.
  - `setQueryData` when the post-mutation representation is known to be correct.
  - Visible provisional state while `isFetching` is true.
- Reserve `removeQueries` and `resetQueries` for context changes (logout, tenant switch), not ordinary mutations.

## Mutations

- Before implementing a mutation, identify affected detail queries, lists, counters, summaries, and cross-feature queries, including permission or visibility changes.
- After success, invalidate or update caches with key factories. Prefer targeted `invalidateQueries` over broad `router.invalidate()`.
- Distinguish mutation success from a subsequent refetch failure; do not report the mutation as failed when the server persisted the change.
- Optimistic updates are not the default. When justified: cancel conflicting queries, snapshot rollback state, apply immutable updates, reconcile on error, and revalidate afterward. Do not use optimistic updates for authorization, deletion, or security configuration without explicit design review.

## Cancellation and HTTP

- Every `queryFn` must accept TanStack Query's `signal` and pass it to the shared HTTP client, which forwards it to the underlying request. Components must not call `fetch` or the HTTP library directly for server state.
- Treat timeouts separately from cancellation.
- Resolve races with query keys and cancellation, not manual request counters.

## Session and context boundaries

- On user, tenant, company, or environment change: cancel in-flight queries and remove private cached data.
- Never persist sensitive query results in browser storage.
- Frontend cache isolation does not replace backend authorization.

## Freshness policies

Use named policies instead of ad hoc values:

| Policy | `staleTime` | Notes |
| --- | --- | --- |
| Dynamic | `0` | Polling only with a defined purpose and interval |
| Administrative lists | 30 seconds | Default query client baseline |
| Resource detail | 60 seconds | |
| Stable catalogs | 10 minutes | |
| Application configuration | 10 minutes | Invalidate on context change |

Default `gcTime` is five minutes. Do not use `staleTime: Infinity` or `'static'` for mutable business data without written justification. Do not disable caching or refetch globally to hide invalidation bugs.

## Retries

- Only TanStack Query retries. The HTTP client must not retry (no `axios-retry`, no retry interceptors).
- Queries: no retry for 400, 401, 403, 404, 409, 422, or cancellation; limited retry for 5xx and network errors (default client: up to two attempts); respect `Retry-After` for 429 when present.
- Mutations: no automatic retry unless idempotent and explicitly documented.

## Pagination, sorting, and filtering

- Include all list parameters in the query key. Sync with validated Router search params when appropriate. Reset page index when filters change if required by UX. Use `placeholderData` for previous pages only with a visible provisional indicator.

## Loading and errors

- Distinguish initial load, background refetch, and mutation pending state. Do not clear valid data during background refetch or show full-page loading for background refresh. Avoid global toast spam for every query error.

## Router

- Route params and validated search dependencies belong in query keys.
- Do not use `router.invalidate()` as the default mutation response when targeted query invalidation suffices. Document exceptions when a loader owns non-Query data.

## Testing

- Use a new `QueryClient` per test with `retry: false`. Avoid shared cache between cases.
- Cover, when applicable: key isolation, pagination and filters, create/update/delete refresh, related summaries, cancellation, mutation errors, context switches, optimistic rollback, and retry behavior.

## Enforcement

| Mechanism | Automatically checked |
| --- | --- |
| `@tanstack/eslint-plugin-query` `flat/recommended` | `exhaustive-deps`, `stable-query-client`, `no-rest-destructuring`, `no-unstable-deps`, `no-void-query-fn`, `infinite-query-property-order`, `mutation-property-order` |
| `@tanstack/query/prefer-query-options` | Enabled in Admin; mandatory for agents in all frontends; enable in Client when its system query uses `queryOptions` |

## Review checklist (agent judgment)

- Mutation impact map complete (lists, details, counters, other features, visibility).
- Freshness policy chosen and documented for new queries.
- Immediate vs eventual consistency after mutations is intentional.
- Security context included in keys when responses differ by context.
- No duplicate server state in Zustand or loaders.
- `signal` propagated end to end for new query functions.
