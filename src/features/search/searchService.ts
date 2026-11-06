import type { ContentCatalog } from "../../content/catalog";
import type { FuidCase, FuidDocument } from "../../content/schemas";

export type SearchKind = "case" | "document";
export type SearchKindFilter = "all" | SearchKind;

export interface SearchIndexEntry {
  id: string;
  kind: SearchKind;
  title: string;
  recordNumber: string;
  abstract: string;
  route: string;
  date: string;
  keywords: readonly string[];
  indexable: boolean;
  caseStatus?: FuidCase["status"];
  documentType?: FuidDocument["type"];
  relatedCaseTitle?: string;
  location?: string;
  normalizedTitle: string;
  normalizedRecordNumber: string;
  normalizedAbstract: string;
  normalizedKeywords: string;
  normalizedAll: string;
}

export interface SearchOptions {
  kind?: SearchKindFilter;
  limit?: number;
}

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function createEntry(
  input: Omit<
    SearchIndexEntry,
    | "normalizedTitle"
    | "normalizedRecordNumber"
    | "normalizedAbstract"
    | "normalizedKeywords"
    | "normalizedAll"
  >,
): SearchIndexEntry {
  const normalizedTitle = normalize(input.title);
  const normalizedRecordNumber = normalize(input.recordNumber);
  const normalizedAbstract = normalize(input.abstract);
  const normalizedKeywords = normalize(input.keywords.join(" "));

  return {
    ...input,
    normalizedTitle,
    normalizedRecordNumber,
    normalizedAbstract,
    normalizedKeywords,
    normalizedAll: [
      normalizedTitle,
      normalizedRecordNumber,
      normalizedAbstract,
      normalizedKeywords,
    ].join(" "),
  };
}

export function buildPublicSearchIndex(catalog: ContentCatalog): readonly SearchIndexEntry[] {
  const caseTitles = new Map(catalog.cases.map((record) => [record.id, record.title]));

  const caseEntries = catalog.cases
    .filter((record) => record.access.kind === "public" && record.search.indexable)
    .map((record) =>
      createEntry({
        id: record.id,
        kind: "case",
        title: record.title,
        recordNumber: record.caseNumber,
        abstract: record.summary,
        route: `/investigations/${record.slug}`,
        date: record.openedDate,
        keywords: record.search.keywords,
        indexable: record.search.indexable,
        caseStatus: record.status,
        location: `${record.location.locality}, ${record.location.region}`,
      }),
    );

  const documentEntries = catalog.documents
    .filter((document) => document.access.kind === "public" && document.search.indexable)
    .map((document) =>
      createEntry({
        id: document.id,
        kind: "document",
        title: document.title,
        recordNumber: document.documentNumber,
        abstract: document.abstract,
        route: `/records/${document.slug}`,
        date: document.createdDate,
        keywords: document.search.keywords,
        indexable: document.search.indexable,
        documentType: document.type,
        relatedCaseTitle: caseTitles.get(document.caseId),
      }),
    );

  return Object.freeze([...caseEntries, ...documentEntries]);
}

function scoreEntry(entry: SearchIndexEntry, normalizedQuery: string, tokens: readonly string[]): number {
  let score = 0;

  if (entry.normalizedRecordNumber === normalizedQuery) score += 300;
  if (entry.normalizedTitle === normalizedQuery) score += 250;
  if (entry.normalizedRecordNumber.includes(normalizedQuery)) score += 130;
  if (entry.normalizedTitle.includes(normalizedQuery)) score += 100;
  if (entry.normalizedKeywords.includes(normalizedQuery)) score += 55;
  if (entry.normalizedAbstract.includes(normalizedQuery)) score += 35;

  for (const token of tokens) {
    if (entry.normalizedRecordNumber.includes(token)) score += 35;
    if (entry.normalizedTitle.includes(token)) score += 25;
    if (entry.normalizedKeywords.includes(token)) score += 14;
    if (entry.normalizedAbstract.includes(token)) score += 8;
  }

  return score;
}

export function searchIndex(
  entries: readonly SearchIndexEntry[],
  query: string,
  options: SearchOptions = {},
): readonly SearchIndexEntry[] {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) return [];

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const kind = options.kind ?? "all";
  const limit = options.limit ?? 50;

  return entries
    .filter((entry) => entry.indexable)
    .filter((entry) => kind === "all" || entry.kind === kind)
    .filter((entry) => tokens.every((token) => entry.normalizedAll.includes(token)))
    .map((entry) => ({ entry, score: scoreEntry(entry, normalizedQuery, tokens) }))
    .sort((a, b) => b.score - a.score || b.entry.date.localeCompare(a.entry.date))
    .slice(0, limit)
    .map(({ entry }) => entry);
}
