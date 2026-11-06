# Changelog

All meaningful project changes are recorded here. Dates use `YYYY-MM-DD`.

## 2026-11-05

### Added

- Established the FUID technical architecture, content strategy, continuity baseline, development workflow, and phased roadmap.
- Added repository instructions for future coding agents.
- Completed Milestone 1: a responsive public agency shell, homepage, public investigations index, case detail route, and reusable document route.
- Added the first schema-validated investigation, “The Bellwether Mile,” and its initial field report.
- Added cross-entity content validation, unit tests, GitHub Pages-safe hash routing, graceful not-found handling, and a reproducible static build.
- Completed the local portion of Milestone 2 with two additional Bellwether records, a type-specific memorandum presentation, stronger catalog validation, purposeful empty states, and a safer route error screen.
- Added the `new:content` draft generator with traversal/overwrite protections and isolated helper tests.
- Added Playwright smoke tests covering the full public archive flow, refresh-safe routes, keyboard entry, clear not-found pages, console errors, and responsive overflow at desktop and mobile widths.
- Completed Milestone 3 public search with explicit index opt-in, curated searchable fields, deterministic ranking, record-type filtering, shareable query URLs, and responsive result states.
- Added two independent investigations: the explained Ash Creek Siren electrical fault and the unresolved Harrow Station personnel discrepancy, with two supporting records each.
- Expanded unit and browser coverage to protect unindexed records, ranking, filters, three-case navigation, search results, and no-result behavior.
- Completed Milestone 4 with employee and account schemas, normalized fictional credential verification, centralized access evaluation, an in-memory session, and a distinct internal Records Review Console.
- Added a clearly labeled interactive-fiction sign-in flow and one controlled Bellwether endpoint-observation addendum that is excluded from public listings and search.
- Added two independent cryptid investigations: the flag-sorting Saint Orison Drainage Animal and the culvert-crossing Lantern Ridge Long Elk, each with operationally grounded supporting records.
- Expanded Bellwether with marker-replacement and controlled-observation records, Harrow with unverified claimant correspondence, and Ash Creek with a one-year post-closure confirmation.
- Expanded catalog, access, authentication, leakage, desktop, and mobile coverage for five investigations, fifteen documents, fictional login, controlled access, and deliberately volatile sessions.
- Updated architecture, authoring, continuity, puzzle, development, and roadmap documentation for the new access boundary and canon.
- Refined the public site into a more institutional records portal with a federal-service utility bar, records-service navigation, stronger information hierarchy, denser archive styling, and an expanded records footer.
- Reworked Employee Resources to remain fully in-world and added progressive hints that directly identify the Lena Ortez memorandum and explain how to derive both credential fields.
- Added controlled Harrow personnel-recollection, Saint Orison pump-house, and Lantern Ridge thermal-timing records, bringing the archive to eighteen documents and the internal registry to four authorized records.
- Removed out-of-character fiction and non-affiliation language from the production interface while retaining developer-only project and security context.
- Completed Milestone 5 with a single versioned local progress service, persistent session and grants, reviewed-record and discovery state, validated export/import, unknown-reference rejection, and a version-zero migration fixture.
- Added three authored analyst correlations for Harrow Station, Saint Orison, and Lantern Ridge that appear only after the required public and controlled records have been reviewed.
- Completed Milestone 6 with a content-validated phrase puzzle engine, an accessible Harrow property-index recovery task, persistent puzzle grants, and a hidden controlled record.
- Added “Property Storage Incident and Relief Call Transcript,” a direct and deliberately unsettling Harrow anomaly involving an unpowered telephone, recorded contact with Vale, physical movement, and a reversed inventory impression.
- Added an archive tone standard requiring future content to balance explained cases and procedural unease with some genuinely creepy, physically impossible, or threatening events.
- Completed Milestone 7 with two additional four-record investigations: “The Bellglass Orchard Visitor” and “The Morrow Cut Choir,” bringing the archive to seven cases and twenty-seven documents.
- Added controlled Bellglass and Morrow Cut escalations plus two earned analyst correlations, while preserving both cases as independent incidents rather than forcing a shared conspiracy.
- Completed Milestone 8 with expanded draft templates, a validated content/reference/puzzle-dependency report, and a production asset-size report.
- Split page routes and separated React/router, validation, and archive data into cacheable chunks, reducing the application entry from 521.54 kB to 17.10 kB while documenting the remaining eager-catalog tradeoff.
- Added a least-privilege GitHub Actions workflow that runs the complete verification gate on pull requests and deploys the exact tested `dist/` artifact to GitHub Pages after pushes to `main`.
- Published the repository and verified the production site at `https://parkeraclevenger.github.io/fuid/`.
- Added “The Wrenfield Hotel,” a six-record nationwide transient-building investigation involving disoriented guests, impossible hotel parcels, persistent switchboard records, and a controlled service level connecting appearances across place and time.
- Added the Office of Records Analysis and Nadia Merritt credential trail, with released credential clues and department-bound Wrenfield records that remain unavailable to the Lena Ortez session.
- Added the Wrenfield absent-levels correlation and a second phrase-recovery puzzle that restores the “Eighth Basement” service-lift operation.
- Limited internal puzzle visibility to active sessions that can access every clue record, preserving employee-specific archive boundaries while retaining profile-wide progress.
- Added sixteen substantial records across all eight investigations, bringing the archive to forty-nine documents with an even split of eight new public and eight new controlled entries.
- Expanded the existing document families into varied in-world forms including shift and incident logs, evidence inventories, audio worksheets, medical and health bulletins, calibration and remediation certificates, quarantine paperwork, and engineering closure reports without adding UI or schema features.
- Extended the Harrow recovery grant to restore both the relief-call report and its companion warehouse sensor-and-inventory log.
