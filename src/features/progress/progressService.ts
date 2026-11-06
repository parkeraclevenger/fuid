import { z } from "zod";

import { catalog } from "../../content/catalog";
import type { Puzzle } from "../../content/schemas";

export const PROGRESS_STORAGE_KEY = "fuid.progress";
export const CURRENT_PROGRESS_VERSION = 1 as const;

const progressV1Schema = z.object({
  format: z.literal("fuid-progress"),
  version: z.literal(CURRENT_PROGRESS_VERSION),
  sessionAccountId: z.string().nullable(),
  grantIds: z.array(z.string()),
  reviewedDocumentIds: z.array(z.string()),
  discoveryIds: z.array(z.string()),
  solvedPuzzleIds: z.array(z.string()),
  updatedAt: z.iso.datetime(),
});

const progressV0Schema = z.object({
  format: z.literal("fuid-progress"),
  version: z.literal(0),
  accountId: z.string().nullable().default(null),
  grants: z.array(z.string()).default([]),
  viewedRecordIds: z.array(z.string()).default([]),
  discoveries: z.array(z.string()).default([]),
  solvedPuzzles: z.array(z.string()).default([]),
});

export type PlayerProgress = z.infer<typeof progressV1Schema>;

export interface ProgressStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class ProgressDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProgressDataError";
  }
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function createEmptyProgress(now: () => Date): PlayerProgress {
  return {
    format: "fuid-progress",
    version: CURRENT_PROGRESS_VERSION,
    sessionAccountId: null,
    grantIds: [],
    reviewedDocumentIds: [],
    discoveryIds: [],
    solvedPuzzleIds: [],
    updatedAt: now().toISOString(),
  };
}

export function resolveDiscoveryIds(reviewedDocumentIds: readonly string[]): string[] {
  const reviewed = new Set(reviewedDocumentIds);
  return catalog.discoveries
    .filter((discovery) => discovery.requiredDocumentIds.every((id) => reviewed.has(id)))
    .map((discovery) => discovery.id);
}

function migrateV0(value: z.infer<typeof progressV0Schema>, now: () => Date): PlayerProgress {
  return {
    format: "fuid-progress",
    version: CURRENT_PROGRESS_VERSION,
    sessionAccountId: value.accountId,
    grantIds: unique(value.grants),
    reviewedDocumentIds: unique(value.viewedRecordIds),
    discoveryIds: unique(value.discoveries),
    solvedPuzzleIds: unique(value.solvedPuzzles),
    updatedAt: now().toISOString(),
  };
}

function parseProgressText(text: string, now: () => Date): PlayerProgress {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ProgressDataError("The selected file is not valid JSON.");
  }

  if (!value || typeof value !== "object") {
    throw new ProgressDataError("The selected file is not a FUID progress file.");
  }

  const version = "version" in value ? value.version : undefined;
  let parsed: PlayerProgress;
  if (version === 0) {
    const legacy = progressV0Schema.safeParse(value);
    if (!legacy.success) throw new ProgressDataError("The legacy progress file is malformed.");
    parsed = migrateV0(legacy.data, now);
  } else if (version === CURRENT_PROGRESS_VERSION) {
    const current = progressV1Schema.safeParse(value);
    if (!current.success) throw new ProgressDataError("The progress file is malformed.");
    parsed = current.data;
  } else {
    throw new ProgressDataError("This progress-file version is not supported.");
  }

  validateReferences(parsed);
  return {
    ...parsed,
    grantIds: unique(parsed.grantIds),
    reviewedDocumentIds: unique(parsed.reviewedDocumentIds),
    discoveryIds: unique([...parsed.discoveryIds, ...resolveDiscoveryIds(parsed.reviewedDocumentIds)]),
    solvedPuzzleIds: unique(parsed.solvedPuzzleIds),
  };
}

function validateReferences(progress: PlayerProgress): void {
  if (progress.sessionAccountId && !catalog.getAccount(progress.sessionAccountId)) {
    throw new ProgressDataError("The progress file references an unknown directory account.");
  }

  const knownGrants = new Set([
    ...catalog.accounts.flatMap((account) => account.grants),
    ...catalog.puzzles.map((puzzle) => puzzle.resultGrant),
  ]);
  if (progress.grantIds.some((id) => !knownGrants.has(id))) {
    throw new ProgressDataError("The progress file contains an unknown access grant.");
  }
  if (progress.reviewedDocumentIds.some((id) => !catalog.getDocument(id))) {
    throw new ProgressDataError("The progress file references an unknown record.");
  }
  if (progress.discoveryIds.some((id) => !catalog.getDiscovery(id))) {
    throw new ProgressDataError("The progress file references an unknown discovery.");
  }
  if (progress.solvedPuzzleIds.some((id) => !catalog.getPuzzle(id))) {
    throw new ProgressDataError("The progress file references an unknown index task.");
  }
}

export class ProgressService {
  constructor(
    private readonly storage: ProgressStorage,
    private readonly now: () => Date = () => new Date(),
  ) {}

  load(): PlayerProgress {
    const stored = this.storage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) return createEmptyProgress(this.now);
    try {
      const parsed = parseProgressText(stored, this.now);
      const raw = JSON.parse(stored) as { version?: unknown };
      if (raw.version === 0) {
        this.storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return createEmptyProgress(this.now);
    }
  }

  export(progress: PlayerProgress): string {
    validateReferences(progress);
    return `${JSON.stringify(progress, null, 2)}\n`;
  }

  import(text: string): PlayerProgress {
    return this.persist(parseProgressText(text, this.now));
  }

  signIn(
    progress: PlayerProgress,
    accountId: string,
    accountGrantIds: readonly string[],
  ): PlayerProgress {
    return this.persist({
      ...progress,
      sessionAccountId: accountId,
      grantIds: unique([...progress.grantIds, ...accountGrantIds]),
    });
  }

  signOut(progress: PlayerProgress): PlayerProgress {
    return this.persist({ ...progress, sessionAccountId: null });
  }

  reviewDocument(progress: PlayerProgress, documentId: string): PlayerProgress {
    if (!catalog.getDocument(documentId)) return progress;
    const reviewedDocumentIds = unique([...progress.reviewedDocumentIds, documentId]);
    const discoveryIds = unique([
      ...progress.discoveryIds,
      ...resolveDiscoveryIds(reviewedDocumentIds),
    ]);
    if (
      reviewedDocumentIds.length === progress.reviewedDocumentIds.length &&
      discoveryIds.length === progress.discoveryIds.length
    ) {
      return progress;
    }
    return this.persist({ ...progress, reviewedDocumentIds, discoveryIds });
  }

  solvePuzzle(progress: PlayerProgress, puzzle: Puzzle): PlayerProgress {
    return this.persist({
      ...progress,
      grantIds: unique([...progress.grantIds, puzzle.resultGrant]),
      solvedPuzzleIds: unique([...progress.solvedPuzzleIds, puzzle.id]),
    });
  }

  private persist(progress: PlayerProgress): PlayerProgress {
    const next: PlayerProgress = { ...progress, updatedAt: this.now().toISOString() };
    validateReferences(next);
    this.storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
    return next;
  }
}

class MemoryStorage implements ProgressStorage {
  private value: string | null = null;

  getItem(): string | null {
    return this.value;
  }

  setItem(_key: string, value: string): void {
    this.value = value;
  }
}

export function createDefaultProgressService(): ProgressService {
  const storage = typeof window === "undefined" ? new MemoryStorage() : window.localStorage;
  return new ProgressService(storage);
}
