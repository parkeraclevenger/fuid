# Puzzle Guide

Developer-only spoiler document. This file must never be imported by application code or copied to `public/`.

## Current state

The archive contains two credential trails, six cross-record discoveries, and two solved-answer puzzles with hidden records. Session, review state, discoveries, solved puzzles, and grants persist through the versioned local profile. Puzzle visibility also requires the active directory session to access every source record, so account-specific tasks do not cross department boundaries. Ash Creek remains intentionally explained and does not conceal a supernatural answer.

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

## Credential trail: Nadia Merritt Wrenfield access

- **Stable ID:** `credential.nadia-merritt`
- **Associated records:** Wrenfield guest-property routing memorandum, employee resources page, Records Review Console, and the two initially available Wrenfield controlled records.
- **Intended reasoning:** the Wrenfield case's released property-routing memorandum is written by Nadia Merritt. Its metadata provides directory reference `NMERRITT`, and its labeled Legacy credential routing notice names the filing phrase “unassigned room variance.”
- **Clue locations:** both credential values are selectable text in the public property-routing memorandum. Employee Resources links to the memorandum and explains that legacy accounts pair a directory reference with a filing phrase from the same released record.
- **Accepted username:** `nmerritt` after trimming surrounding whitespace and case-folding to lowercase.
- **Accepted passphrase:** `unassigned room variance` after trimming surrounding whitespace and case-folding to lowercase.
- **Prerequisites:** none beyond public archive access.
- **Result:** creates a persistent local session for employee `employee.nadia-merritt`, grants `archive.internal` and `archive.wrenfield`, permits the `records-review` application, and reveals the controlled guest-interview annex and switchboard review. The final service-lift report still requires the Wrenfield index-recovery grant.
- **Account boundary:** all Wrenfield controlled records require both the Wrenfield grant and `department.records-analysis`. Lena's OFI session cannot read them even if profile progress has retained the Wrenfield grant. Conversely, Nadia cannot read OFI-controlled source records or the Harrow task.
- **Alternate path:** visitors may find the memorandum from the Wrenfield case page or follow its direct hint link from Employee Resources. Direct navigation to a Wrenfield controlled route displays an access-denied state for missing or wrong-department sessions.
- **Accessibility:** clues use labeled metadata and ordinary text. The path does not depend on color, images, audio, or source inspection.
- **Tests:** unit tests cover normalized authentication and department separation. Desktop and mobile browser tests cover the public clues, Nadia login, account-specific registry, discovery, puzzle failure/success, and hidden record.

## Cross-record discoveries

- `discovery.harrow-departure-gap`: review the public field report, 1994 claimant memorandum, and controlled recollection matrix. Notes that every record contains Vale without a verifiable arrival, departure, or point of origin.
- `discovery.saint-orison-signal-order`: review the public Saint Orison field report and controlled pump-house supplement. Notes that the cabinet's matching signal begins 0.4 seconds before the animal's recorded call.
- `discovery.lantern-ridge-direction`: review the public Lantern Ridge field report and controlled thermal addendum. Notes that snow impressions and the thermal form both move west while facing east.
- `discovery.bellglass-inside-path`: review the public Bellglass field report, fruit-evidence memorandum, and controlled night watch. Notes that both the altered fruit and the sealed-crate event begin inside an intact boundary.
- `discovery.morrow-arrival-order`: review the public Morrow Cut field report, acoustic memorandum, and controlled final descent. Notes that the bore progresses from repeating names spoken at the site to reporting an unannounced arrival nine minutes before the vehicle reaches the gate.
- `discovery.wrenfield-absent-levels`: review the public Wrenfield pattern assessment and floor comparison plus the controlled guest-interview annex. Notes that transfer sleeves, a staff-only B8 control, and a separately remembered clerk instruction all name the eighth basement despite the absence of intermediate levels or subsurface volume.

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

## Puzzle: Wrenfield service-level index recovery

- **Stable ID:** `puzzle.wrenfield-index-recovery`
- **Associated storyline:** `case.us-2017-031` and the sealed service-lift instrument operation.
- **Prerequisite:** `discovery.wrenfield-absent-levels`, requiring the Wrenfield pattern assessment, public floor comparison, and controlled guest-interview annex.
- **Prompt:** recover the two-word destination printed on transfer sleeves and repeated as the night clerk's exit instruction even though the intermediate levels do not exist.
- **Clue records:** `document.us-2017-031-memorandum-02` prints EIGHTH BASEMENT on three independently recovered transfer sleeves; `document.us-2017-031-internal-memorandum-01` records the Newark guest's unprompted memory of the same destination.
- **Accepted solution:** `eighth basement` using `phrase-v1` normalization: Unicode NFKC, lowercase, punctuation converted to spaces, surrounding whitespace removed, and repeated whitespace collapsed.
- **Result:** marks the puzzle solved, grants `archive.wrenfield-basement`, and reveals `document.us-2017-031-internal-field-report-02` only while a Records Analysis employee session is active.
- **Hidden record:** “Service-Lift Instrument Recovery: Eighth Basement,” a controlled 2019 operation in which a tethered camera descends farther than the building permits, records city-marked doors showing earlier manifestations at their historical dates, observes the lobby team 23 minutes ahead, and encounters a deceased former guest at her recovery age.
- **Failure behavior:** a wrong answer retains the task and directs the reader back to index language in the two listed records. There is no penalty, timer, or attempt limit.
- **Accessibility:** the prompt, both source links, form label, error, success message, and hidden-record link are semantic text. The solution does not require an image, audio transcription, or visual-only floor plan.
- **Persistence and access:** the solved puzzle and grant persist in the versioned profile, but the task and hidden document require an active session whose department can read the Wrenfield sources. Switching to Lena preserves progress without exposing ORA records.
- **Tests:** unit tests cover accepted and rejected phrases plus per-session source access. Desktop and mobile browser tests cover public review, Nadia authentication, controlled discovery, wrong answer, correct answer, and hidden-record access.

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
