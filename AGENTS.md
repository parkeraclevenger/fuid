# AGENTS.md

These instructions apply to the entire FUID repository.

## Mission

FUID is a long-lived, static-first interactive fiction project disguised as a restrained fictional federal agency archive. Favor a small, understandable foundation and complete vertical slices over broad scaffolding or large quantities of content.

## Start every task here

1. Read `README.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md`.
2. For narrative or content work, also read `docs/WORLD_BIBLE.md` and `docs/CONTENT_GUIDE.md`.
3. For puzzles, clues, credentials, or hidden paths, read `docs/PUZZLE_GUIDE.md`.
4. Inspect the working tree and preserve unrelated user changes.
5. State which roadmap milestone the change advances. Do not silently pull work forward from later milestones.

## Engineering rules

- Use TypeScript in strict mode. Prefer explicit, readable code over clever abstractions.
- Keep content, presentation, access rules, and player progress separate.
- Put authoritative narrative data in `src/content/`; do not duplicate names or relationships in components.
- Reference entities by stable IDs. IDs are permanent once released.
- Validate content at the catalog boundary. UI components consume validated domain objects.
- Keep access decisions centralized when access control is introduced. A component must not invent its own clearance logic.
- Keep browser persistence behind one versioned progress service when persistence is introduced.
- Treat fictional login and permissions as gameplay, never as real security.
- Do not ship developer-only spoilers, plaintext secrets, puzzle solutions, or the `docs/` directory in the Vite build.
- Preserve hash-based routing and relative asset paths unless the hosting decision in `docs/ARCHITECTURE.md` is explicitly revised.
- Avoid dependencies that only save a few lines of code.
- Do not add a generic framework for a single puzzle, document, or internal application.

## Content and tone

- Write restrained federal bureaucracy first; let unease emerge from specific details.
- Keep the public interface in-world. Do not add out-of-character fiction or non-affiliation notices unless a later release decision explicitly restores them; developer documentation must still identify the project's real nature and static-security limits.
- Not every page is a clue. Ordinary administrative material is part of the pacing.
- Do not add a connection to a grand conspiracy merely to make a record feel important.
- Intentional contradictions must be recorded in `docs/WORLD_BIBLE.md`; accidental contradictions are defects.

## Verification

Run the smallest relevant checks while iterating, then run the full gate before handing off:

```text
pnpm check
```

`pnpm check` must include content validation, unit tests, TypeScript checks, and a production build. Add targeted tests for new domain logic. Add end-to-end coverage only when a user flow is stable enough to justify its maintenance cost.

## Documentation discipline

- Update `docs/ARCHITECTURE.md` when a technical boundary or decision changes.
- Update `docs/WORLD_BIBLE.md` for canonical facts.
- Update `docs/PUZZLE_GUIDE.md` for solutions, clue paths, or unlock behavior.
- Update `docs/ROADMAP.md` when a milestone changes state or scope.
- Add a concise entry to `CHANGELOG.md` for meaningful changes.
- Keep documentation factual: distinguish current behavior from planned behavior.

## Milestone handoff

At the end of a milestone, report what works, what was tested, what remains intentionally absent, important decisions, and the recommended next milestone. Stop for review before beginning the next major milestone.
