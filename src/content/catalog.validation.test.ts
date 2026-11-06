import { describe, expect, it } from "vitest";

import { catalog, ContentCatalogError, createCatalog } from "./catalog";
import type { Department, FuidCase, FuidDocument } from "./schemas";

const department: Department = {
  id: "department.test",
  abbreviation: "TST",
  name: "Test Department",
  summary: "A sufficiently detailed department summary used only by the unit tests.",
};

const record: FuidCase = {
  id: "case.test-001",
  slug: "test-case",
  caseNumber: "FUID-CO-2026-001",
  title: "Test Investigation",
  status: "open-monitoring",
  incidentDate: "2026-01-01",
  openedDate: "2026-01-02",
  location: { locality: "Test Site", region: "CO" },
  departmentId: department.id,
  summary:
    "This is a deliberately long public summary that satisfies the schema and supports catalog relationship tests.",
  access: { kind: "public" },
  search: { indexable: true, keywords: ["test investigation"] },
  relatedDocumentIds: ["document.test-001"],
};

const document: FuidDocument = {
  id: "document.test-001",
  slug: "test-document",
  documentNumber: "FUID-CO-2026-001-FR-01",
  type: "field-report",
  title: "Test Field Report",
  abstract: "A sufficiently detailed abstract for the catalog relationship test document.",
  createdDate: "2026-01-03",
  byline: { name: "Test Author", role: "Field Investigator" },
  caseId: record.id,
  departmentId: department.id,
  access: { kind: "public" },
  search: { indexable: true, keywords: ["test report"] },
  classificationMarking: "PUBLIC RELEASE",
  distribution: ["Test Distribution"],
  metadata: [],
  body: [{ type: "paragraph", text: "Test body." }],
};

describe("deployed content catalog", () => {
  it("loads the public archive and resolves all relationships", () => {
    expect(catalog.cases).toHaveLength(7);
    expect(catalog.documents).toHaveLength(27);
    expect(catalog.employees).toHaveLength(1);
    expect(catalog.accounts).toHaveLength(1);
    expect(catalog.discoveries).toHaveLength(5);
    expect(catalog.puzzles).toHaveLength(1);
    const bellwether = catalog.getCaseBySlug("bellwether-mile");
    expect(bellwether?.caseNumber).toBe("FUID-CO-2004-014");
    expect(bellwether?.relatedDocumentIds).toHaveLength(5);
    expect(catalog.getCaseBySlug("harrow-station-empty-desk")?.relatedDocumentIds).toHaveLength(5);
    expect(catalog.getCaseBySlug("bellglass-orchard-visitor")?.relatedDocumentIds).toHaveLength(4);
    expect(catalog.getCaseBySlug("morrow-cut-choir")?.relatedDocumentIds).toHaveLength(4);
    expect(catalog.getDocument(bellwether?.relatedDocumentIds[0] ?? "")?.caseId).toBe(
      bellwether?.id,
    );
    expect(catalog.getDocumentBySlug("bellwether-mileage-memorandum-01")?.type).toBe(
      "memorandum",
    );
  });
});

describe("catalog reference validation", () => {
  it("rejects a document that points at a missing case", () => {
    expect(() =>
      createCatalog({
        departments: [department],
        cases: [],
        documents: [document],
      }),
    ).toThrow(ContentCatalogError);
  });

  it("rejects duplicate stable IDs across entity types", () => {
    expect(() =>
      createCatalog({
        departments: [department],
        cases: [record],
        documents: [{ ...document, id: record.id }],
      }),
    ).toThrow(/Duplicate stable ID/);
  });

  it("rejects duplicate public document numbers", () => {
    expect(() =>
      createCatalog({
        departments: [department],
        cases: [{ ...record, relatedDocumentIds: [document.id, "document.test-002"] }],
        documents: [
          document,
          {
            ...document,
            id: "document.test-002",
            slug: "test-document-two",
          },
        ],
      }),
    ).toThrow(/Duplicate document number/);
  });
});
