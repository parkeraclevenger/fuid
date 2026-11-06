# Puzzle Guide

Developer-only spoiler document. This file must never be imported by application code or copied to `public/`.

## Current state

The archive contains one credential trail, five cross-record discoveries, and one solved-answer puzzle with a hidden record. Session, review state, discoveries, solved puzzles, and grants persist through the versioned local profile. Ash Creek remains intentionally explained and does not conceal a second supernatural answer.

## Credential trail: Lena Ortez records access

- **Stable ID:** `credential.lena-ortez`
- **Associated records:** Bellwether mileage reimbursement memorandum, employee resources page, Records Review Console, and six initially available controlled records.
- **Intended reasoning:** the employee-resources hint directs the visitor to the Bellwether reimbursement memorandum written by Lena Ortez. The memorandum's metadata names directory reference `LORTEZ`; its terminology notice identifies the exact phrase “documented route variance.”
- **Clue locations:** both credential values remain in the public Bellwether mileage memorandum. A progressive disclosure on the employee-resources page explains which record to open, which metadata value becomes the directory ID, and which labeled phrase becomes the passphrase. It includes a direct link to the memorandum.
- **Accepted username:** `lortez` after trimming surrounding whitespace and case-folding to lowercase.
- **Accepted passphrase:** `documented route variance` after trimming surrounding whitespace and case-folding to lowercase.
- **Prerequisites:** none beyond public archive access.
- **Result:** creates a persistent local session for employee `employee.lena-ortez`, grants `archive.internal`, permits the `records-review` application, and reveals the initial controlled records for Bellwether, Harrow, Saint Orison, Lantern Ridge, Bellglass Orchard, and Morrow Cut. Harrow's later property-storage report still requires its separate puzzle grant.
- **Alternate path:** visitors may discover the memo naturally through Bellwether or follow the direct hint link from Employee Resources. Direct navigation to an internal route displays a session-required state rather than controlled text.
- **Accessibility:** clues are ordinary selectable text and labeled metadata, not color, audio, hover, or image-dependent. Inputs have visible labels and errors are announced in text.
- **Tests:** unit tests cover normalized success and failure; desktop and mobile browser tests cover the progressive hint, login, all six initial registry entries, public-search exclusion, and session restoration after refresh.

## Cross-record discoveries

- `discovery.harrow-departure-gap`: review the public field report, 1994 claimant memorandum, and controlled recollection matrix. Notes that every record contains Vale without a verifiable arrival, departure, or point of origin.
- `discovery.saint-orison-signal-order`: review the public Saint Orison field report and controlled pump-house supplement. Notes that the cabinet's matching signal begins 0.4 seconds before the animal's recorded call.
- `discovery.lantern-ridge-direction`: review the public Lantern Ridge field report and controlled thermal addendum. Notes that snow impressions and the thermal form both move west while facing east.
- `discovery.bellglass-inside-path`: review the public Bellglass field report, fruit-evidence memorandum, and controlled night watch. Notes that both the altered fruit and the sealed-crate event begin inside an intact boundary.
- `discovery.morrow-arrival-order`: review the public Morrow Cut field report, acoustic memorandum, and controlled final descent. Notes that the bore progresses from repeating names spoken at the site to reporting an unannounced arrival nine minutes before the vehicle reaches the gate.

These are authored correlations, not answer-entry puzzles. They persist by stable discovery ID and appear as analyst flags in the Records Review Console.

## Puzzle: Harrow property index recovery

- **Stable ID:** `puzzle.harrow-index-recovery`
- **Associated storyline:** `case.or-1986-011` and the Harrow controlled property-storage follow-up.
- **Prerequisite:** `discovery.harrow-departure-gap`, which requires the three Harrow records listed above.
- **Prompt:** recover the two-word location remembered by personnel but absent from all verified site plans.
- **Clue records:** `document.or-1986-011-field-report-01` and `document.or-1986-011-internal-memorandum-01` both name the location and explicitly establish that it cannot be verified.
- **Accepted solution:** `lower tower` using `phrase-v1` normalization: Unicode NFKC, lowercase, punctuation converted to spaces, surrounding whitespace removed, and repeated whitespace collapsed.
- **Result:** marks the puzzle solved, grants `archive.harrow-appendix`, and reveals `document.or-1986-011-internal-field-report-02`.
- **Hidden record:** “Property Storage Incident and Relief Call Transcript,” a controlled 1994 report concerning an unpowered recovered telephone, a voice identifying itself as Vale, physical movement in an empty aisle, and an unexplained inventory impression.
- **Failure behavior:** a wrong answer retains the task and directs the reader back to location language in the listed records. There is no penalty, timer, or attempt limit.
- **Accessibility:** the prompt, source links, form label, error, and success state are semantic text. The solution does not depend on color, audio playback, or handwriting recognition.
- **Persistence:** solved puzzle ID and result grant are stored in the versioned local profile; the unlocked record remains accessible after refresh and through validated export/import.
- **Tests:** unit tests cover answer normalization and success/failure. Desktop and mobile browser tests cover prerequisites, discovery, wrong answer, correct answer, unlock, hidden record, and refresh persistence.

## Rules for future entries

Every implemented puzzle must document:

- stable puzzle ID;
- associated records and storylines;
- intended player observation and reasoning;
- all clue locations;
- accepted solutions and normalization rules;
- prerequisites and resulting grants/discoveries;
- alternate discovery paths;
- accessibility considerations;
- tests covering success, failure, and save persistence.

Difficulty must come from coherent reasoning, not inaccessible controls, unspecified guessing, or random search behavior. Extend the current engine only when another implemented puzzle demonstrates a real additional abstraction.
