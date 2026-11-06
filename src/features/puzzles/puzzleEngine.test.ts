import { describe, expect, it } from "vitest";

import { catalog } from "../../content/catalog";
import { createSession } from "../access/accessService";
import {
  canAccessPuzzleSources,
  evaluatePuzzleAnswer,
  normalizePuzzleAnswer,
} from "./puzzleEngine";

describe("puzzle answer evaluation", () => {
  const puzzle = catalog.getPuzzle("puzzle.harrow-index-recovery")!;

  it("normalizes case, spacing, and punctuation deterministically", () => {
    expect(normalizePuzzleAnswer("  Lower—Tower! ")).toBe("lower tower");
  });

  it("accepts the authored index term and rejects a different location", async () => {
    await expect(evaluatePuzzleAnswer(puzzle, "LOWER TOWER")).resolves.toBe(true);
    await expect(evaluatePuzzleAnswer(puzzle, "Harrow Ridge")).resolves.toBe(false);
  });

  it("accepts the Wrenfield service-level term", async () => {
    const wrenfield = catalog.getPuzzle("puzzle.wrenfield-index-recovery")!;
    await expect(evaluatePuzzleAnswer(wrenfield, "Eighth—Basement")).resolves.toBe(true);
    await expect(evaluatePuzzleAnswer(wrenfield, "seventh basement")).resolves.toBe(false);
  });

  it("limits each internal puzzle to a session that can read its source records", () => {
    const lenaAccount = catalog.getAccount("account.lena-ortez")!;
    const lena = createSession(lenaAccount, catalog.getEmployee(lenaAccount.employeeId)!);
    const nadiaAccount = catalog.getAccount("account.nadia-merritt")!;
    const nadia = createSession(nadiaAccount, catalog.getEmployee(nadiaAccount.employeeId)!);
    const wrenfield = catalog.getPuzzle("puzzle.wrenfield-index-recovery")!;

    expect(canAccessPuzzleSources(puzzle, lena)).toBe(true);
    expect(canAccessPuzzleSources(wrenfield, lena)).toBe(false);
    expect(canAccessPuzzleSources(puzzle, nadia)).toBe(false);
    expect(canAccessPuzzleSources(wrenfield, nadia)).toBe(true);
  });
});
