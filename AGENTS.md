# Auth Gateway agent instructions

Auth Gateway simplifies application integration with identity providers while preserving security, correctness, and authorization granularity. All agents must follow the repository's confirmed architecture and engineering standards.

## Read before work

1. Read [architecture overview](docs/architecture/overview.md) for service, module, domain, provider, and integration boundaries.
2. Read [engineering standards](docs/engineering/standards.md) for the approved stack, language, implementation practices, and validation expectations.
3. Read [decision register](docs/decisions/README.md) before making or treating an architectural choice as settled.
4. Read [frontend server state](docs/engineering/frontend-server-state.md) before adding or changing TanStack Query usage, mutations, route loaders that fetch data, or cache invalidation.
5. Read any nearer `AGENTS.md` that applies to the files being changed. More specific repository instructions supplement these rules; they must not silently reverse a confirmed decision.

If detailed guidance conflicts, follow the user's current explicit direction, then the applicable confirmed decision, then these general instructions. Record and resolve conflicts instead of silently choosing between contradictory repository rules.

## For every change

- Inspect relevant code and conventions, identify the owning service, module, and layer, and check for existing provider capabilities before adding a Gateway feature.
- Prefer the smallest secure implementation that satisfies the requirement. Keep provider-specific details in adapters and preserve the service and module boundaries in the architecture overview.
- Treat items in the decision register's **Open questions and conditional choices** section as undecided. Do not turn examples, options, or proposed approaches into requirements. Make reversible local choices when needed and state the assumption; ask only when an unresolved choice materially affects security, compatibility, or architecture.
- Follow the mandatory quality rules, approval requirements, implementation workflow, and enforcement checks in engineering standards throughout every code change. Add or update tests for meaningful behavior and run relevant checks before reporting completion.
- Do not scaffold unrelated application features or introduce infrastructure, dependencies, or patterns without a concrete need and justification.

## Maintaining architectural decisions

When the user or project owner approves a new architectural decision:

1. Add a dated record under `docs/decisions/` describing the context, decision, and consequences. Move the item from **Open questions and conditional choices** to **Confirmed decisions** in the decision register when applicable.
2. Update the single detailed document that owns the affected rule. Update this file only when the entry point, hierarchy, or agent workflow changes.
3. Search the repository instructions for related wording and check that the record, register, and detailed guidance agree. Resolve contradictions and remove obsolete duplicate guidance in the same change.
4. Keep rejected or superseded decisions linked to their replacement instead of deleting the decision history.

The repository root `AGENTS.md` is the portable entry point for coding agents that support `AGENTS.md`. Other agent-specific files may be added only when the repository adopts a tool that requires them; keep them aligned with this source. For TanStack cache work, use the `tanstack-cache-consistency` skill in `.cursor/skills/` when implementing or reviewing queries and mutations; it references engineering standards and does not replace them.

For every task involving UI, always use the [frontend-design skill](.agents/skills/frontend-design/SKILL.md), sourced from [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design). This includes creating, modifying, fixing, or reviewing UI. Its visual guidance supplements [engineering standards](docs/engineering/standards.md) and confirmed decisions; preserve the approved stack, existing UI conventions, and localization requirements unless the user explicitly requests a change.
