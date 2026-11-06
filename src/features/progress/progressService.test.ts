import { describe, expect, it } from "vitest";

import { catalog } from "../../content/catalog";
import {
  CURRENT_PROGRESS_VERSION,
  ProgressDataError,
  ProgressService,
  type ProgressStorage,
} from "./progressService";

class TestStorage implements ProgressStorage {
  value: string | null = null;

  getItem(): string | null {
    return this.value;
  }

  setItem(_key: string, value: string): void {
    this.value = value;
  }
}

const fixedNow = () => new Date("2026-11-05T12:00:00.000Z");

describe("versioned progress service", () => {
  it("persists a directory session, reviewed records, discoveries, and puzzle grants", () => {
    const storage = new TestStorage();
    const service = new ProgressService(storage, fixedNow);
    let progress = service.load();
    const account = catalog.accounts[0]!;

    progress = service.signIn(progress, account.id, account.grants);
    for (const id of [
      "document.or-1986-011-field-report-01",
      "document.or-1986-011-memorandum-02",
      "document.or-1986-011-internal-memorandum-01",
    ]) {
      progress = service.reviewDocument(progress, id);
    }

    expect(progress.discoveryIds).toContain("discovery.harrow-departure-gap");
    progress = service.solvePuzzle(progress, catalog.getPuzzle("puzzle.harrow-index-recovery")!);

    const restored = new ProgressService(storage, fixedNow).load();
    expect(restored.sessionAccountId).toBe(account.id);
    expect(restored.grantIds).toContain("archive.harrow-appendix");
    expect(restored.solvedPuzzleIds).toContain("puzzle.harrow-index-recovery");
  });

  it("exports and validates a current progress file", () => {
    const source = new ProgressService(new TestStorage(), fixedNow);
    const exported = source.export(source.load());
    const target = new ProgressService(new TestStorage(), fixedNow);
    expect(target.import(exported).version).toBe(CURRENT_PROGRESS_VERSION);

    const invalid = JSON.parse(exported) as Record<string, unknown>;
    invalid.reviewedDocumentIds = ["document.unknown"];
    expect(() => target.import(JSON.stringify(invalid))).toThrow(ProgressDataError);
  });

  it("migrates the supported version-zero fixture", () => {
    const storage = new TestStorage();
    storage.value = JSON.stringify({
      format: "fuid-progress",
      version: 0,
      accountId: "account.lena-ortez",
      grants: ["archive.internal"],
      viewedRecordIds: ["document.co-2004-014-memorandum-01"],
      discoveries: [],
      solvedPuzzles: [],
    });

    const migrated = new ProgressService(storage, fixedNow).load();
    expect(migrated.version).toBe(1);
    expect(migrated.sessionAccountId).toBe("account.lena-ortez");
    expect(migrated.reviewedDocumentIds).toEqual(["document.co-2004-014-memorandum-01"]);
    expect(JSON.parse(storage.value ?? "{}").version).toBe(1);
  });
});
