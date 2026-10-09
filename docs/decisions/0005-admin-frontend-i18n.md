# 0005. Admin frontend internationalization

- Date: 2026-10-09
- Status: Accepted

## Context

The Admin application needs user-facing copy in Spanish while keeping code identifiers in English. The reusable boilerplate should support future locales without rewriting the shell.

## Decision

- Use **i18next** and **react-i18next** in `auth-gateway-admin`.
- Locale policy is declared in `app.config.ts` as `i18n.defaultLocale` and `i18n.supportedLocales` (code plus end-user label). The initial delivery ships only `es`. No language switcher in the UI yet.
- `createI18n` reads that config for `lng`, `fallbackLng`, and `supportedLngs`, and validates that each supported locale has registered resource bundles.
- Reusable strings live under `frontend/auth-gateway-admin/src/boilerplate/locales/es/` (namespace `shell`). Application strings live under `src/locales/es/` (namespaces such as `navigation`, `pages`, `connectivity`, `meta`).
- Navigation registry entries use `labelKey` values resolved at render time. Sidebar search filters against translated labels via an injected `resolveLabel` function in pure navigation helpers.
- URL paths remain English (`/`, `/overview`). Product and demo configuration names in `app.config.ts` stay as non-translated data.

## Consequences

- New user-visible text must be added to locale JSON files, not hardcoded in components.
- Vitest initializes the same `es` resources in `src/test/setup.ts` so tests assert Spanish copy.
- Additional locales can be added later by extending `resources` and optional runtime language selection.
