import { describe, expect, it } from "vitest";

import { catalog } from "../../content/catalog";
import { buildPublicSearchIndex, searchIndex, type SearchIndexEntry } from "./searchService";

const index = buildPublicSearchIndex(catalog);

describe("public search index", () => {
  it("indexes explicitly public, indexable cases and documents", () => {
    expect(index.filter((entry) => entry.kind === "case")).toHaveLength(7);
    expect(index.filter((entry) => entry.kind === "document")).toHaveLength(20);
    expect(index.some((entry) => entry.id === "document.co-2004-014-internal-memorandum-01")).toBe(
      false,
    );
    expect(index.some((entry) => entry.id === "document.or-1986-011-internal-memorandum-01")).toBe(
      false,
    );
    expect(index.some((entry) => entry.id === "document.la-2013-006-internal-field-report-01")).toBe(
      false,
    );
    expect(index.some((entry) => entry.id === "document.mt-1997-019-internal-memorandum-01")).toBe(
      false,
    );
  });

  it("ranks an exact record number ahead of related keyword matches", () => {
    const results = searchIndex(index, "FUID-CO-2004-014");
    expect(results[0]?.id).toBe("case.co-2004-014");
  });

  it("supports content-type filtering", () => {
    const results = searchIndex(index, "Bellwether", { kind: "document" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((entry) => entry.kind === "document")).toBe(true);
  });

  it("never returns an entry explicitly excluded from indexing", () => {
    const hidden: SearchIndexEntry = {
      ...index[0]!,
      id: "case.unindexed",
      title: "Unindexed Canary Record",
      normalizedTitle: "unindexed canary record",
      normalizedAll: "unindexed canary record",
      indexable: false,
    };
    expect(searchIndex([hidden], "canary")).toEqual([]);
  });
});
