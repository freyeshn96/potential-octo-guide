---
name: tanstack-cache-consistency
description: >-
  Implements and reviews TanStack Query and Router cache consistency using
  repository frontend-server-state rules. Use when adding or changing queries,
  mutations, loaders, invalidation, or diagnosing stale UI data.
---

# TanStack cache consistency

Read [docs/engineering/frontend-server-state.md](docs/engineering/frontend-server-state.md) for mandatory rules. This skill adds repeatable workflows only.

## Implement a query or mutation

1. Identify the owning feature and existing key factories; extend the factory, do not invent parallel keys.
2. Add `queryOptions` (or `infiniteQueryOptions`) co-locating `queryKey` and `queryFn`. Pass `signal` to the shared HTTP client.
3. Choose a named freshness policy from the document. Override defaults only with justification.
4. For mutations, write a short impact map: details, lists, counters, summaries, other features, visibility changes.
5. Pick post-success consistency: targeted `invalidateQueries`, known-good `setQueryData`, or await refetch before success UI.
6. Add tests with an isolated `QueryClient` (`retry: false`) for keys, cancellation, and mutation refresh behavior when applicable.

## Review cache consistency

1. List every query key affected by the change.
2. Confirm invalidations match the impact map; flag missing list or detail refresh.
3. Check context boundaries (user, tenant, environment) in keys when responses differ.
4. Verify `signal` propagation and no duplicate server state in Zustand, loaders, or local state.
5. Confirm invalidation semantics: stale data may remain visible until refetch; flag UX that needs immediate consistency.
6. Note race risks (rapid filters, pagination, navigation) and whether keys plus cancellation suffice.

## Output format for reviews

```markdown
## Cache consistency review

### Affected keys
- ...

### Invalidation / updates
- ...

### Risks
- ...

### Verdict
- Pass / needs changes
```
