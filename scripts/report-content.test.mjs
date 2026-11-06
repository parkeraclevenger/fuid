import assert from "node:assert/strict";
import test from "node:test";

import { analyzeContent, formatReport } from "./report-content.mjs";

const fixture = {
  accounts: [],
  cases: [
    {
      id: "case.test",
      caseNumber: "FUID-CO-2026-001",
      title: "Test Case",
      relatedDocumentIds: ["document.test"],
      search: { indexable: true },
    },
  ],
  documents: [
    {
      id: "document.test",
      caseId: "case.test",
      access: { kind: "public" },
      search: { indexable: true },
    },
  ],
  discoveries: [
    {
      id: "discovery.test",
      caseId: "case.test",
      requiredDocumentIds: ["document.test"],
    },
  ],
  puzzles: [
    {
      id: "puzzle.test",
      caseId: "case.test",
      prerequisiteDiscoveryIds: ["discovery.test"],
      clueDocumentIds: ["document.test"],
      unlockDocumentIds: ["document.test"],
      resultGrant: "archive.test",
    },
  ],
};

test("reports case, search, and puzzle dependency coverage", () => {
  const report = analyzeContent(fixture);
  assert.equal(report.problems.length, 0);
  assert.equal(report.totals.searchableRecords, 2);
  assert.match(formatReport(report), /puzzle\.test/);
  assert.match(formatReport(report), /Reference issues: 0/);
});

test("reports unresolved references", () => {
  const broken = structuredClone(fixture);
  broken.cases[0].relatedDocumentIds.push("document.missing");
  const report = analyzeContent(broken);
  assert.deepEqual(report.problems, ["case.test -> missing document.missing"]);
});
