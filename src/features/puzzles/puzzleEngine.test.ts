import { describe, expect, it } from "vitest";

import { catalog } from "../../content/catalog";
import { evaluatePuzzleAnswer, normalizePuzzleAnswer } from "./puzzleEngine";

describe("puzzle answer evaluation", () => {
  const puzzle = catalog.getPuzzle("puzzle.harrow-index-recovery")!;

  it("normalizes case, spacing, and punctuation deterministically", () => {
    expect(normalizePuzzleAnswer("  Lower—Tower! ")).toBe("lower tower");
  });

  it("accepts the authored index term and rejects a different location", async () => {
    await expect(evaluatePuzzleAnswer(puzzle, "LOWER TOWER")).resolves.toBe(true);
    await expect(evaluatePuzzleAnswer(puzzle, "Harrow Ridge")).resolves.toBe(false);
  });
});
