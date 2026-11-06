import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { createTemplate, getDraftPath } from "./create-content.mjs";

test("creates a namespaced case draft with a stable slug", () => {
  const draft = createTemplate("case", "quiet-lake", "2026-11-05");
  assert.equal(draft.id, "case.quiet-lake");
  assert.equal(draft.slug, "quiet-lake");
  assert.equal(draft.incidentDate, "2026-11-05");
});

test("keeps generated drafts outside the deployed JSON glob", () => {
  const destination = getDraftPath("C:\\fuid", "document", "sample-report");
  assert.equal(path.basename(destination), "sample-report.draft.json");
});

test("creates document-family and discovery drafts with safe defaults", () => {
  const memorandum = createTemplate("memorandum", "quiet-lake-review", "2026-11-05");
  const controlled = createTemplate("controlled-document", "quiet-lake-annex", "2026-11-05");
  const discovery = createTemplate("discovery", "quiet-lake-pattern", "2026-11-05");
  const puzzle = createTemplate("puzzle", "quiet-lake-index", "2026-11-05");

  assert.equal(memorandum.type, "memorandum");
  assert.equal(controlled.access.kind, "restricted");
  assert.equal(controlled.search.indexable, false);
  assert.equal(discovery.id, "discovery.quiet-lake-pattern");
  assert.equal(puzzle.answerHashes[0].length, 64);
});

test("rejects unsafe or ambiguous slugs", () => {
  assert.throws(() => createTemplate("case", "../escape"), /kebab-case/);
  assert.throws(() => createTemplate("case", "MixedCase"), /kebab-case/);
  assert.throws(() => createTemplate("unknown", "safe-slug"), /Unsupported content kind/);
});
