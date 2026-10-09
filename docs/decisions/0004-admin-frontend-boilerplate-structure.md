# 0004. Admin frontend boilerplate structure

- Date: 2026-10-08
- Status: Accepted for Delivery 1.5 stage 1

## Context

Delivery 1.5 requires a reusable Admin frontend foundation without changing visible UI or Auth Gateway business behavior. The Admin application needs typed configuration, file-based routing, an independent public base path, a shared HTTP client, and centralized TanStack Query defaults while keeping reusable code in one movable folder.

## Decision

- Reusable Admin frontend code lives under `frontend/auth-gateway-admin/src/boilerplate`, including layout shell, UI button, navigation menu state, environment access, HTTP client, QueryClient factory, and foundation styles.
- Application-specific routes, pages, and feature code remain outside `boilerplate` (`src/routes`, `src/features`, `src/app.config.ts`, `src/navigation`).
- TanStack Router uses file-based routes with `@tanstack/router-plugin` and a generated `src/routeTree.gen.ts`.
- `VITE_APP_BASE_PATH` configures the Vite `base` option at build time. `VITE_API_BASE_URL` remains independent. The router reads `import.meta.env.BASE_URL` for `basepath`.
- The shared HTTP client uses Axios 1.20.0 with the Fetch adapter, `allowAbsoluteUrls: false`, no automatic retries, and normalized `HttpError` mapping including Problem Details.
- UI components may use Radix or shadcn when justified, or plain HTML and CSS when sufficient. Do not add Radix primitives before a component needs them.

## Consequences

- The Admin frontend can be adapted by editing `app.config.ts`, navigation registry, and feature modules without forking shell infrastructure.
- Prefixed deployments require build-time `VITE_APP_BASE_PATH` and ingress configuration that strips the public prefix before the frontend container serves assets (existing Nginx template unchanged).
- `axios` is added to the approved frontend stack in engineering standards.
- Client frontend is unchanged in this stage. Further boilerplate UI stages remain separate authorized deliveries.
- User-visible shell copy is localized through i18next resources under `boilerplate/locales` and application locales under `src/locales`; see [0005. Admin frontend internationalization](0005-admin-frontend-i18n.md). Do not hardcode user-facing strings in boilerplate components.
