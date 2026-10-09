# 0005. Admin frontend internationalization

- Date: 2026-10-09
- Status: Accepted

## Context

The Admin application needs user-facing copy in Spanish while keeping code identifiers in English. The reusable boilerplate should support future locales without rewriting the shell.

## Decision

- Use **i18next** and **react-i18next** in `auth-gateway-admin`.
- Ship a single locale (`es`) with `lng` and `fallbackLng` set to `es`. No language switcher in the UI for this delivery.
- Reusable strings live under `frontend/auth-gateway-admin/src/boilerplate/locales/es/` (namespace `shell`). Application strings live under `src/locales/es/` (namespaces such as `navigation`, `pages`, `connectivity`, `meta`).
- Navigation registry entries use `labelKey` values resolved at render time. Sidebar search filters against translated labels via an injected `resolveLabel` function in pure navigation helpers.
- URL paths remain English (`/`, `/overview`). Product and demo configuration names in `app.config.ts` stay as non-translated data.

## Consequences

- New user-visible text must be added to locale JSON files, not hardcoded in components.
- Vitest initializes the same `es` resources in `src/test/setup.ts` so tests assert Spanish copy.
- Additional locales can be added later by extending `resources` and optional runtime language selection.
