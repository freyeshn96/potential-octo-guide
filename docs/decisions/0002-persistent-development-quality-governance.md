# 0002. Persistent development quality governance

- Date: 2026-10-08
- Status: Accepted

## Context

The owner requested persistent quality rules for future AI agents, preserving existing architecture and application behavior. Root instructions, central engineering documentation, native .NET analyzers, and independent frontend quality tooling already exist.

## Decision

Use root `AGENTS.md` as the portable discovery entry point and `docs/engineering/standards.md` as the single detailed quality authority. Adopt the owner's mandatory typing, parameter, reuse, maintainability, cleanup, asynchronous, security, and approval requirements there. Reinforce installed tooling without adding dependencies. Keep architectural and judgment-based requirements explicitly subject to review.

Do not add redundant tool-specific instructions, scoped rule copies, or placeholder skills. The canonical implementation and verification workflow suffices today; a future skill must add a concrete repeatable procedure and reference the standards. Mandatory rule changes require explicit owner approval.

## Consequences

Agents discover quality requirements before code changes without manual skill invocation. Builds and frontend lint enforce objective checks; agents review cohesion, parameter limits, cognitive complexity, abstractions, and security. Significant shared abstractions and justified non-framework parameter exceptions require approval before implementation. Existing application code is not refactored by this governance change; pre-existing findings are reported separately. Future approved rule changes follow the existing decision-maintenance workflow.

## Adoption verification

Verified on 2026-10-08:

- Root `AGENTS.md` links to the canonical engineering rules and decision register; README already links to that entry point. No nearer AGENTS files or alternative tool-specific rules were found.
- `git diff --check` passed. No application source, dependency manifests, lockfiles, or TypeScript compiler configurations were changed.
- .NET build activates the new diagnostics and fails on existing IDE0008 (`var`) and IDE0005 (unused using) findings. Formatting verification also reports existing style findings. These are not suppressed or refactored in this governance-only task. Backend tests were not rerun against a new build because that build is blocked.
- Both frontends passed strict typecheck, six tests each, production build, and full Prettier checks. Each enhanced lint run reports seven existing findings in `src/components/connectivity.tsx`, `src/config.ts`, and `src/main.tsx`: an unhandled promise, unsafe `any` operations from Vite environment values, and a non-null assertion. Configuration files themselves pass lint.
- The default npm launcher failed to locate its CLI; checks used the already installed Node/npm runtime directly. No tooling was installed.

The quality gates are active, but the existing application has not yet been migrated to all newly approved rules. A passing repository-wide quality baseline requires a separately authorized code cleanup; this record does not grant exceptions to the rules.
