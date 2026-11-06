# Roadmap

The roadmap is a sequence of review gates, not a promise to implement every listed feature unchanged. Each milestone should end with a working site and a user review before the next begins.

## Phase 1 — Architecture and public foundation

### Milestone 1: public archive vertical slice — complete (2026-11-05)

Deliverables:

- accepted architecture and development documentation;
- React/TypeScript/Vite project with GitHub Pages-safe routing;
- public agency shell, homepage, and investigation index;
- one validated case and one reusable document page;
- responsive/accessibility baseline;
- catalog/reference tests and a successful production build.

Acceptance flow: open the homepage, browse public investigations, open `FUID-CO-2004-014`, follow its report, refresh on each route, and return through navigation without an error.

Explicitly absent: search, login, restricted content, player progress, puzzles, export/import, and deployment automation.

### Milestone 2: complete working foundation — complete locally (2026-11-05)

- refine content schemas from Milestone 1 feedback;
- add a second document template and two additional documents to the existing case;
- add a robust not-found/error boundary and purposeful empty states;
- add a small content-authoring helper;
- add browser smoke tests for the complete public flow;
- add GitHub Pages workflow after repository settings are known;
- perform accessibility and production-output checks.

Completed locally. The GitHub Pages workflow is intentionally reserved for the requested repository-upload step because no repository, default branch, or Pages configuration exists yet.

Review gate: a new public document can be added from the guide without editing application code, and CI can validate/build the site.

## Phase 2 — Core interactive systems

### Milestone 3: public search — complete locally (2026-11-05)

- derive an index from validated, explicitly public/indexable fields;
- search cases and documents with consistent filters;
- test that unindexed or non-public fixtures cannot leak.

Completed with deterministic token matching and ranking, explicit public/indexable metadata, case/document filtering, shareable query URLs, responsive results and empty states, and unit/browser leakage checks. The same milestone includes a user-requested bounded archive expansion to three investigations and seven documents; this advances part of Milestone 7 without introducing its future entity or performance work.

### Milestone 4: fictional access vertical slice — complete locally (2026-11-05)

- introduce employee/account schemas only as required by one story;
- centralized fictional authentication and access evaluation;
- one internal application shell and one restricted record;
- clear messaging that credentials are fictional and stored locally.

Completed with a single Lena Ortez credential trail, volatile in-memory session, centralized access evaluation, a distinct Records Review Console, and one controlled Bellwether addendum excluded from public search. The session intentionally expires on refresh so Milestone 5 can introduce persistence behind one service boundary instead of accreting ad hoc storage.

Refined after review with progressive credential hints, an in-world public presentation, a more institutional visual system, and three additional controlled records for Harrow Station, Saint Orison, and Lantern Ridge. The same account and access grant authorize all four records; no new access abstraction was introduced.

This milestone also includes a user-requested archive expansion to five investigations and eighteen documents: the Saint Orison Drainage Animal and Lantern Ridge Long Elk cases, plus new Bellwether, Harrow, and Ash Creek follow-up records. This completes the numerical target of Milestone 7 early without adding speculative document types or performance infrastructure.

### Milestone 5: versioned progress — complete locally (2026-11-05)

- centralized local progress service;
- session, discoveries, and grants persist across refresh;
- validated versioned export/import and one migration fixture;
- no completion totals or quest interface.

Completed with a single Zod-validated `fuid.progress` local profile, stable-ID reference validation, persistent directory session and grants, reviewed-record and discovery state, export/import controls, and a version-zero migration fixture. Malformed, unknown-version, or unknown-reference imports are rejected. No credentials or copied narrative content are stored.

Review gate: one carefully authored flow moves from public clue to fictional login to permitted document and persists safely.

## Phase 3 — Discovery and authoring depth

### Milestone 6: first puzzle and hidden path — complete locally (2026-11-05)

- implement one fair multi-source puzzle without a general-purpose engine;
- record solution, clues, alternatives, and tests in `PUZZLE_GUIDE.md`;
- verify keyboard and screen-reader usability.

Completed with three authored cross-record correlations and the Harrow property-index recovery task. Reviewing the public Harrow field report, claimant memorandum, and controlled recollection matrix exposes the task; the normalized phrase solution issues a persistent grant and reveals a new controlled property-storage incident report. The engine remains limited to this proven phrase-recovery shape.

### Milestone 7: representative archive — complete locally (2026-11-05)

- grow to three to five distinct, well-developed investigations;
- add only the document themes those stories actually require;
- introduce employee/location/organization entities where duplication proves the need;
- strengthen continuity and asset validation.

Completed with seven investigations and twenty-seven documents after the requested addition of two cases. The Bellglass Orchard Visitor adds a cryptid-focused agricultural case built around discontinuous movement and fruit consumed from the inside; the Morrow Cut Choir adds an acoustic/physical anomaly involving anticipatory voices and a sealed instrument capsule. Each has three paced public records, one controlled escalation, a distinct investigator and location, and an earned analyst correlation. No cross-case conspiracy, new document type, or unnecessary location/organization entity was introduced.

### Milestone 8: authoring and performance pass — complete locally (2026-11-05)

- add case/document generation templates;
- measure bundle and search costs;
- split detail payloads or indexes only if measurements justify it;
- add reference and puzzle dependency reports for authors.

Completed with draft templates for both document families, controlled records, discoveries, and puzzles; a validated content/reference/puzzle-dependency report; a production asset report; lazy route modules; and cacheable React/router, validation, and archive-data chunks. The original 521.54 kB application entry is now 17.10 kB. The largest chunk is React/router at 313.64 kB, followed by validation at 87.28 kB and archive data at 85.76 kB. Combined JavaScript/CSS is 572.37 kB uncompressed after the two-case expansion. A deeper summary/detail catalog split remains deferred because it would complicate synchronous progress/reference validation without a demonstrated user-facing need.

## Phase 4 — Release hardening

- broader end-to-end coverage of the canonical player flow;
- responsive, accessibility, error, and reduced-motion audits;
- GitHub Pages validation and deployment workflow — implemented locally; remote deployment verification pending repository push;
- deployment and rollback rehearsal;
- source-map and artifact leakage audit;
- content editing and continuity pass;
- public release documentation.

## Long-term options, not commitments

Selective encrypted assets, audio/video evidence, maps, additional internal applications, and a future backend remain possible. Each requires a real narrative or operational need and its own architecture review.
