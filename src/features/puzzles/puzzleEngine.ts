import type { Puzzle } from "../../content/schemas";
import type { PlayerProgress } from "../progress/progressService";

export function normalizePuzzleAnswer(answer: string): string {
  return answer
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function evaluatePuzzleAnswer(puzzle: Puzzle, answer: string): Promise<boolean> {
  if (puzzle.answerNormalization !== "phrase-v1") return false;
  const candidateHash = await sha256(normalizePuzzleAnswer(answer));
  return puzzle.answerHashes.includes(candidateHash);
}

export function isPuzzleAvailable(puzzle: Puzzle, progress: PlayerProgress): boolean {
  return puzzle.prerequisiteDiscoveryIds.every((id) => progress.discoveryIds.includes(id));
}
