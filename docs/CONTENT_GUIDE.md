# Content Guide

This guide describes the content format that exists now. Planned media will be documented when its schema is implemented.

## Principles

- One entity per JSON file.
- IDs are stable, lowercase, and namespaced.
- Relationships use IDs; never duplicate an employee, department, case, or document record to save a lookup.
- Dates use ISO `YYYY-MM-DD` when the exact day is known.
- Player-visible record numbers are separate from internal IDs.
- All deployable content lives below `src/content/`. Developer-only solutions and continuity notes belong in `docs/`.

## Add a department

Start a non-deployed draft:

```bash
pnpm new:content -- department <slug>
```

Complete the generated `.draft.json`, then rename it to `.json`. The final file belongs in `src/content/data/departments/` with an ID such as `department.field-investigations`. Include its public name, unique abbreviation, and a restrained public summary. Run `pnpm validate:content`.

## Add an investigation

Run `pnpm new:content -- case <record-slug>`, complete the draft, and rename it to `src/content/data/cases/<record-slug>.json`.

Required fields include the stable ID, visible case number, title, status, incident date and location, department ID, public summary, an access rule, and an array of related document IDs. Use `"access": { "kind": "public" }` for public records. A restricted case should not be added until a real story and complete navigation flow require one.

Every public case also has explicit search metadata. Set `search.indexable` to `true` only when its title, case number, summary, and curated keywords are safe to expose through public search. Keywords should be plausible terms a visitor might know; do not use them to plant invisible puzzle solutions.

Then add the referenced documents. Validation requires every relationship to resolve and every document listed by a case to point back to that case.

## Add a document

Use the template matching the intended record:

```bash
pnpm new:content -- document <record-slug>
pnpm new:content -- memorandum <record-slug>
pnpm new:content -- controlled-document <record-slug>
```

The first two create public field-report and memorandum drafts. The controlled template creates a non-indexable Level 2 field report using the current internal grant; change only the access requirements the story actually needs. Complete the draft before renaming it to `.json`.

Current document types:

- `field-report`: requires `byline` and a non-empty `distribution` list;
- `memorandum`: requires `from`, non-empty `to`, optional `cc`, and `subject` fields.

Shared metadata includes stable ID, slug, document number, title, public `abstract`, dates, related case and department IDs, access rule, search metadata, classification marking, metadata rows, and an ordered body of semantic blocks:

- `paragraph`: ordinary prose;
- `heading`: an internal section heading;
- `callout`: a labeled administrative or routing note;
- `redaction`: an accessible redacted span with an optional public explanation.

Metadata rows are purposeful label/value pairs. Do not add empty decorative fields.

Public search indexes the document number, title, abstract, and curated keywords. It does not index the document body. This is intentional: search visibility must be reviewed as content, not inferred from every shipped string.

To restrict a document for the fictional internal archive, use an access object with `kind: "restricted"` and only the requirements the story needs: `minClearance`, `departments`, and/or `grants`. Set `search.indexable` to `false` and leave keywords empty. The central access service enforces every listed condition. Because this is a static site, restricted plaintext remains discoverable through source inspection; this mechanism is a narrative gate, never real authorization.

## Add a fictional employee and account

Employee files live in `src/content/data/employees/` and contain a stable ID, lowercase directory ID, display name, title, department, clearance from 1–5, and status. Account files live in `src/content/data/accounts/` and link to one employee with a unique lowercase username, a lowercase SHA-256 passphrase digest, explicit grants, and permitted applications.

Add these entities only for an authored access flow. Never collect a visitor's real name, email, government identifier, or actual password. The public sign-in page stays in-world, so every credential must be recoverable from released archive material and documented in `PUZZLE_GUIDE.md`.

Profile grants persist as player progress across account changes. If a controlled storyline must remain exclusive to the active employee, require both its account grant and that employee's department on every controlled document. Any puzzle in that storyline must include at least one such controlled source record; the puzzle UI verifies source access for the current session before displaying the task.

## Add a discovery

Discovery files live in `src/content/data/discoveries/`. A discovery is a short analyst correlation that becomes available only after every ID in `requiredDocumentIds` has been reviewed. It includes a stable ID, related case, restrained label, title, and summary. All required documents must belong to the same case.

Start with `pnpm new:content -- discovery <slug>` and replace every placeholder reference before renaming the draft.

Use discoveries for meaningful comparisons a reader could make from the actual records. Do not reward opening arbitrary pages, restate one document, or imply a cross-case conspiracy merely because two anomalies share a motif.

## Add a puzzle

Puzzle files live in `src/content/data/puzzles/`. The current engine supports one shape: a short phrase recovered from authored records after prerequisite discoveries are present. Each puzzle names its case, clue documents, prerequisite discoveries, normalization mode, accepted SHA-256 answer hashes, result grant, unlocked documents, and success message.

Start with `pnpm new:content -- puzzle <slug>`. The generated zero hash is a placeholder and must be replaced with the digest of every accepted normalized answer.

The answer must be fairly derivable from visible text and documented in `PUZZLE_GUIDE.md`. Hashes reduce casual source spoilers but do not provide security. An unlocked document must explicitly require the puzzle's result grant. Do not add timers, random answers, inaccessible visual-only clues, or new engine concepts for cosmetic variation.

## Anomaly intensity and tone

Maintain contrast across the archive. A healthy mix includes:

- conventional explanations that establish institutional credibility;
- procedural unease, memory gaps, and administrative contradictions;
- directly observed physical impossibilities or disturbing sensory events;
- occasional credible danger or fear without relying on gore or arbitrary cruelty.

Some records should be legitimately creepy or weird, not merely contradictory on paper. Make those events concrete: something moves, speaks, arrives, leaves evidence, violates space or sequence, or behaves with unsettling intent. Keep the prose restrained so the impossible detail carries the weight. Do not make every case extreme; ordinary records and low-risk anomalies provide pacing and make severe incidents more believable.

## Writing checklist

- Consult `docs/WORLD_BIBLE.md` first.
- Establish why the record exists administratively.
- Use concrete dates, places, actions, and consequences.
- Keep the official voice restrained.
- Let humor arise from procedure, not punchlines.
- Decide the intended anomaly intensity and confirm the portfolio is not drifting toward only clerical contradictions.
- Record intentional contradictions in the world bible.
- Avoid making every anomaly part of the same plot.
- Confirm that public-facing language remains consistently in-world and that developer-only context remains outside the production build.

## Validate

```bash
pnpm validate:content
pnpm report:content
pnpm test
```

Validation catches malformed records, duplicate IDs/slugs/public record numbers/department abbreviations/directory IDs/usernames, broken department/case/document/employee references, unknown access grants, repeated document membership, and inconsistent case-document relationships. A successful production build and browser suite are still required before release.

The content report runs validation first and then summarizes case coverage, public/restricted documents, searchable records, discoveries, unresolved references, and complete puzzle prerequisite/clue/grant/unlock chains. Use it before review when a change touches more than one record.
