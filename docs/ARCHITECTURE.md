# Architecture

Status: accepted for the initial foundation on 2026-11-05.

## Goals and boundaries

The architecture optimizes for years of content growth while keeping the first release small. Content authors should usually add validated data, not React routes or bespoke components. The initial host is GitHub Pages, so everything shipped must work as static files without server-side secrecy, authentication, or database access.

The completed foundation proves a content-driven seven-case public archive, public search, fictional access, versioned progress, cross-record discoveries, and one puzzle/unlock path with two document families. It does not pre-build encryption or a general workflow engine.

## Technology decisions

| Concern | Decision | Rationale |
| --- | --- | --- |
| UI | React 19 + TypeScript | Stable component model, strong ecosystem, and explicit domain types. |
| Build | Vite 8 with lazy route modules and measured manual chunks | Fast local workflow, static output, and cacheable separation between application routes, archive data, validation, and framework code. |
| Routing | React Router hash router | Reliable on GitHub Pages repository subpaths and on browser refresh, with no fragile `404.html` rewrite trick. |
| Content | One JSON file per entity, validated by Zod | Easy diffs, stable IDs, no runtime parser, and clear schema errors. |
| Styling | Plain CSS with design tokens | Multiple shells can share tokens without adopting a styling framework prematurely. |
| Tests | Vitest, Node test runner, and Playwright | Domain validation, authoring-helper safety, and the stable public flow each use the smallest suitable runner. |
| Package manager | pnpm with a committed lockfile | Reproducible installs and efficient dependency storage. |

Hash URLs are the main presentation tradeoff: deployed routes look like `/<repo>/#/investigations/...`. Puzzle clues must refer to fictional record identifiers, not depend on visually clean pathnames. A later host with rewrite support can adopt browser routing behind the routing boundary.

## System shape

```text
JSON content files
      ↓
Zod entity schemas → catalog validation → immutable domain catalog
                                             ↓
React Router → feature pages → shared document/UI components
                                             ↓
                                browser services (introduced only as needed)
```

### Application layer

`src/app/` owns router creation, page composition, and top-level error behavior. It may depend on features and shared components. It must not contain narrative records.

### Feature layer

`src/features/` groups user-facing capabilities such as investigations and documents. A feature can query the content catalog and render domain objects. Features should not import another feature's internal components; shared elements move to `src/components/` only after reuse is real.

### Content layer

`src/content/` is the deployable source of truth. Raw JSON is loaded through a single catalog boundary, parsed with Zod, and checked for cross-references. Components receive validated objects rather than raw imports.

The implemented entities are intentionally limited:

- `Department`: stable ID, public name, abbreviation, and summary.
- `Case`: record number, title, status, incident date/location, responsible department, public summary, access rule, and related document IDs.
- `Document`: a discriminated union with shared record metadata plus type-specific fields. Field reports use byline/distribution data; memoranda use explicit To/From/CC/Subject routing.
- `Employee`: directory identity, department, clearance, and fictional employment status.
- `Account`: a fictional username, normalized passphrase hash, grants, and permitted internal applications linked to one employee.
- `Discovery`: an authored analyst correlation unlocked after all required records have been reviewed.
- `Puzzle`: an index-recovery task with clue records, prerequisite discoveries, hashed normalized answers, a result grant, and explicit unlocked records.

Structured body blocks support paragraphs, headings, callouts, and redactions. Presentation dispatches on the validated document type, so field reports and memoranda can look authentic without coupling their content to React. This is less pleasant than free-form Markdown for very long documents but gives predictable, safe rendering and first-class semantic redactions. Reconsider Markdown only after real authoring experience demonstrates the need; do not support two body formats concurrently without a migration plan.

Stable IDs use namespaced lowercase strings such as `case.co-2004-014` and `document.co-2004-014-field-report`. Human-facing record numbers remain separate and may contain punctuation. Released IDs are never reused or renamed.

### Service boundaries

These contracts separate browser implementations from feature pages:

- `AccessService` (implemented): evaluates an `AccessRequirement` against the active fictional session and explicit grants. The current rule vocabulary is `public`, minimum clearance, required department membership, and named grants.
- `ProgressService` (implemented): the only reader/writer of the `fuid.progress` browser save. It exposes sign-in, sign-out, record review, discovery resolution, puzzle completion, export, import, and migration as domain actions rather than raw storage keys.
- `SearchService` (implemented): derives a visibility-filtered in-memory index once from the validated catalog and searches only explicitly public/indexable fields.
- `AuthenticationService` (implemented): normalizes and hashes in-world credentials locally, matches them to a validated account, and creates a directory session persisted through the versioned progress boundary. The entry page remains in-world and provides progressive hints linking visitors to the relevant released record.

The UI will depend on interfaces owned near the domain, allowing future browser-only implementations to be replaced by HTTP-backed adapters without rewriting pages.

## Access, secrets, and encryption

Ordinary hidden routes and fictional clearance checks are narrative gates, not security. Any plaintext shipped to a browser or committed to a public repository is discoverable. The current controlled records are intentionally shipped as plaintext and gated only for the story; they must never be described as secret or secure.

The fictional passphrase is stored as a SHA-256 digest to avoid placing the exact credential in deployable account data, but this provides no meaningful security in a static application. The active account ID and grants persist through the versioned local profile; credentials themselves are never stored.

The public interface intentionally omits out-of-character fiction and non-affiliation notices. This is a presentation choice, not a security change: developer documentation continues to identify the project as fiction, and no real account data, personal data, or real authentication may be introduced through the in-world form.

Most content should use visibility metadata and centralized access checks. Only a few high-value secrets should ever use Web Crypto encryption. For those, the deployed artifact contains ciphertext only; plaintext source and keys must stay outside public source and build output. No custom cryptography will be written.

## Search strategy

Public search is implemented as a small index derived once at application startup from the validated static catalog. A case or document must have public access and `search.indexable: true` before it can enter the index. Searchable text is deliberately limited to record numbers, titles, public summaries/abstracts, and curated keywords; raw document bodies are not crawled. This keeps visibility intentional and gives future restricted or encrypted content a safe boundary.

Queries are normalized and require every query token to match. Ranking favors exact record numbers, exact titles, then title, keyword, and summary matches. Content-type filtering is deterministic. Deliberately unindexed records are explicit metadata, never random omissions.

For the current archive, in-memory search across 27 explicitly indexable case/document entries is adequate and avoids another dependency. The same query engine can later receive an already-authorized internal dataset. A build-emitted index, fuzzy-search library, or lazy detail chunks will be introduced only after measured archive size or query quality justifies them.

## Persistence strategy

Progress uses one versioned JSON document in `localStorage`, because current state is small and synchronous. Version 1 stores stable IDs for the active account, grants, reviewed documents, discoveries, solved puzzles, and an update timestamp—not credentials or copied content. Import parses untrusted JSON through a schema, checks the format marker/version, validates every referenced ID, migrates the supported version-zero shape, and rejects unknown or malformed data. Export emits the same validated version-one document. IndexedDB remains unnecessary until user-created media or substantially larger data appears.

`ProgressProvider` is the React boundary over `ProgressService`; authentication derives its session from persisted account and grant IDs. Record pages report reviewed IDs through the provider, and authored discovery definitions resolve only when every required record has been reviewed. No component writes directly to browser storage.

## Puzzle strategy

The implemented puzzle engine has one deliberately narrow shape: normalize a short phrase deterministically, compare its SHA-256 digest with authored hashes, and issue an explicit grant on success. A puzzle becomes visible only after its prerequisite discovery IDs exist. Puzzle definitions name their clue records and unlocked records, and catalog validation confirms every reference and required grant.

This hashing is an anti-spoiler convenience, not security; a static bundle remains inspectable. The engine does not support branching conversations, arbitrary scripts, scoring, retries, timers, or a universal condition language. Add another answer or condition shape only when a second authored puzzle proves it necessary.

## GitHub Pages strategy

- Vite emits static files to `dist/`.
- `base: './'` keeps scripts and assets repository-subpath safe.
- The hash router keeps all navigable state after `#`, so the host only needs to return `index.html`.
- A future GitHub Actions workflow will run the full check, upload `dist/`, and deploy through the official Pages actions.
- Developer documentation is outside `src/` and `public/`; Vite does not copy it to `dist/`.

## Validation and tests

The catalog boundary validates individual schemas, duplicate IDs/slugs/public numbers/department abbreviations/directory IDs/usernames, related entity existence, repeated document membership, department and employee references, access grant vocabulary, and reciprocal case/document membership. Build and tests fail on invalid content. Future validators will be added alongside the feature that needs them—puzzle dependencies with puzzles, and assets with media.

The verification gate is:

1. content catalog validation;
2. unit tests for domain rules and reference resolution;
3. TypeScript checking;
4. production build;
5. Playwright smoke testing at desktop and mobile widths for representative public routes, credentials, persistent sessions, restricted-record visibility, cross-record discovery, puzzle failure/success, hidden-record access, refresh behavior, console errors, and horizontal overflow.

The authoring helper creates `.draft.json` files outside the deployable content glob for cases, departments, public field reports, public memoranda, controlled field reports, discoveries, and phrase puzzles. This lets an author work from a structurally representative template without breaking every build before the draft is complete. `pnpm report:content` validates first, then prints case coverage, public/restricted and searchable counts, unresolved references, and puzzle dependency chains.

Production routes load lazily. Vite separates archive JSON, Zod, and React/router code into cacheable chunks, while individual pages remain small route chunks. After Milestone 8, the former 521.54 kB application entry is 17.10 kB; the largest chunks are React/router at 313.64 kB, validation at 87.28 kB, and archive data at 85.76 kB. Combined JavaScript and CSS are 572.37 kB uncompressed. This improves caching and avoids one monolithic entry but does not claim to eliminate initial catalog availability: progress/reference validation still uses the complete catalog. `pnpm report:bundle` records future changes.

## Complexity deliberately deferred

- No CMS, database, backend, or real authentication.
- No universal workflow or condition engine. The current puzzle engine implements only the phrase-recovery shape exercised by a real puzzle.
- No multiple internal applications before one complete application proves shared needs.
- No encryption framework before a story requires a genuinely withheld asset.
- No worker-based search or IndexedDB at archive scale where arrays are sufficient.
- No universal document-templating DSL. Add renderer variants from actual document families.
- No attempt to simulate email, a desktop OS, or a federal enterprise suite.

## Main risks

1. **Static secrecy:** source inspection defeats ordinary gates. Mitigation: honest narrative gating and selective standard encryption.
2. **Content leakage:** public indexes or source maps can expose restricted text. Mitigation: derived visibility-filtered artifacts and deployment checks.
3. **Continuity drift:** many records can contradict accidentally. Mitigation: stable IDs, reference validation, and `WORLD_BIBLE.md` as canon.
4. **Schema rigidity:** modeling every imagined future field now creates friction. Mitigation: small discriminated schemas extended by real content needs.
5. **Bundle growth:** archive JSON remains eagerly available to the progress/catalog layer even though routes and major concerns are separately chunked. Mitigation: track sizes with the bundle report and retain one catalog API so summary/detail loading can replace eager data without rewriting feature pages when measurements warrant it.
6. **Atmospheric UI harming usability:** mystery must not depend on illegible design or hidden controls. Mitigation: semantic HTML, visible focus, contrast, and clues in content rather than accessibility failures.
7. **Dependency churn:** the project is long-lived. Mitigation: few dependencies, committed lockfile, and upgrades as reviewed milestones rather than automatic drift.
