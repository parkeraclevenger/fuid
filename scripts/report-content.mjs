import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");

async function readEntities(root, directory) {
  const absolute = path.join(root, "src", "content", "data", directory);
  const files = (await readdir(absolute)).filter((name) => name.endsWith(".json")).sort();
  return Promise.all(
    files.map(async (name) => JSON.parse(await readFile(path.join(absolute, name), "utf8"))),
  );
}

export async function loadContent(root = projectRoot) {
  const [accounts, cases, discoveries, documents, puzzles] = await Promise.all([
    readEntities(root, "accounts"),
    readEntities(root, "cases"),
    readEntities(root, "discoveries"),
    readEntities(root, "documents"),
    readEntities(root, "puzzles"),
  ]);
  return { accounts, cases, discoveries, documents, puzzles };
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function analyzeContent(content) {
  const problems = [];
  const entities = [
    ...content.accounts,
    ...content.cases,
    ...content.discoveries,
    ...content.documents,
    ...content.puzzles,
  ];
  const documents = new Map(content.documents.map((item) => [item.id, item]));
  const cases = new Map(content.cases.map((item) => [item.id, item]));
  const discoveries = new Map(content.discoveries.map((item) => [item.id, item]));

  for (const duplicate of duplicateValues(entities.map((item) => item.id))) {
    problems.push(`duplicate stable ID ${duplicate}`);
  }

  for (const record of content.cases) {
    for (const documentId of record.relatedDocumentIds ?? []) {
      const document = documents.get(documentId);
      if (!document) problems.push(`${record.id} -> missing ${documentId}`);
      else if (document.caseId !== record.id) problems.push(`${record.id} -> foreign ${documentId}`);
    }
  }

  for (const document of content.documents) {
    const record = cases.get(document.caseId);
    if (!record) problems.push(`${document.id} -> missing ${document.caseId}`);
    else if (!record.relatedDocumentIds.includes(document.id)) {
      problems.push(`${document.id} is absent from ${record.id}`);
    }
  }

  for (const discovery of content.discoveries) {
    if (!cases.has(discovery.caseId)) problems.push(`${discovery.id} -> missing ${discovery.caseId}`);
    for (const documentId of discovery.requiredDocumentIds ?? []) {
      if (!documents.has(documentId)) problems.push(`${discovery.id} -> missing ${documentId}`);
    }
  }

  for (const puzzle of content.puzzles) {
    if (!cases.has(puzzle.caseId)) problems.push(`${puzzle.id} -> missing ${puzzle.caseId}`);
    for (const discoveryId of puzzle.prerequisiteDiscoveryIds ?? []) {
      if (!discoveries.has(discoveryId)) problems.push(`${puzzle.id} -> missing ${discoveryId}`);
    }
    for (const documentId of [
      ...(puzzle.clueDocumentIds ?? []),
      ...(puzzle.unlockDocumentIds ?? []),
    ]) {
      if (!documents.has(documentId)) problems.push(`${puzzle.id} -> missing ${documentId}`);
    }
  }

  const publicDocuments = content.documents.filter((item) => item.access?.kind === "public");
  const restrictedDocuments = content.documents.filter((item) => item.access?.kind === "restricted");
  const searchableRecords = [
    ...content.cases.filter((item) => item.search?.indexable),
    ...publicDocuments.filter((item) => item.search?.indexable),
  ];

  return {
    problems,
    totals: {
      cases: content.cases.length,
      documents: content.documents.length,
      publicDocuments: publicDocuments.length,
      restrictedDocuments: restrictedDocuments.length,
      discoveries: content.discoveries.length,
      puzzles: content.puzzles.length,
      searchableRecords: searchableRecords.length,
    },
    cases: [...content.cases]
      .sort((a, b) => a.caseNumber.localeCompare(b.caseNumber))
      .map((record) => ({
        caseNumber: record.caseNumber,
        title: record.title,
        documentCount: record.relatedDocumentIds.length,
        discoveryCount: content.discoveries.filter((item) => item.caseId === record.id).length,
      })),
    puzzles: content.puzzles.map((puzzle) => ({
      id: puzzle.id,
      prerequisites: puzzle.prerequisiteDiscoveryIds,
      clues: puzzle.clueDocumentIds,
      unlocks: puzzle.unlockDocumentIds,
      grant: puzzle.resultGrant,
    })),
  };
}

export function formatReport(report) {
  const lines = [
    "FUID content dependency report",
    "",
    `Cases: ${report.totals.cases}`,
    `Documents: ${report.totals.documents} (${report.totals.publicDocuments} public, ${report.totals.restrictedDocuments} restricted)`,
    `Discoveries: ${report.totals.discoveries}`,
    `Puzzles: ${report.totals.puzzles}`,
    `Searchable records: ${report.totals.searchableRecords}`,
    `Reference issues: ${report.problems.length}`,
    "",
    "Case coverage",
    ...report.cases.map(
      (record) =>
        `- ${record.caseNumber} — ${record.title}: ${record.documentCount} documents, ${record.discoveryCount} discoveries`,
    ),
    "",
    "Puzzle dependencies",
  ];

  if (report.puzzles.length === 0) lines.push("- none");
  for (const puzzle of report.puzzles) {
    lines.push(`- ${puzzle.id}`);
    lines.push(`  prerequisites: ${puzzle.prerequisites.join(", ")}`);
    lines.push(`  clues: ${puzzle.clues.join(", ")}`);
    lines.push(`  grant: ${puzzle.grant}`);
    lines.push(`  unlocks: ${puzzle.unlocks.join(", ")}`);
  }

  if (report.problems.length > 0) {
    lines.push("", "Reference issues", ...report.problems.map((problem) => `- ${problem}`));
  }

  return `${lines.join("\n")}\n`;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const report = analyzeContent(await loadContent());
  process.stdout.write(formatReport(report));
  if (report.problems.length > 0) process.exitCode = 1;
}
