import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");

const kindDirectories = {
  case: "cases",
  "controlled-document": "documents",
  department: "departments",
  discovery: "discoveries",
  document: "documents",
  memorandum: "documents",
  puzzle: "puzzles",
};

export const supportedKinds = Object.freeze(Object.keys(kindDirectories));

export function assertValidKind(kind) {
  if (!Object.hasOwn(kindDirectories, kind)) {
    throw new Error(`Unsupported content kind "${kind}". Use: ${supportedKinds.join(", ")}.`);
  }
}

export function assertValidSlug(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug must use lowercase kebab-case letters and numbers.");
  }
}

export function createTemplate(kind, slug, today = new Date().toISOString().slice(0, 10)) {
  assertValidKind(kind);
  assertValidSlug(slug);

  if (kind === "department") {
    return {
      id: `department.${slug}`,
      abbreviation: "TODO",
      name: "TODO: Department name",
      summary: "TODO: Explain this department's specific public responsibility before release.",
    };
  }

  if (kind === "case") {
    return {
      id: `case.${slug}`,
      slug,
      caseNumber: "FUID-XX-0000-000",
      title: "TODO: Investigation title",
      status: "open-monitoring",
      incidentDate: today,
      openedDate: today,
      location: { locality: "TODO", region: "XX" },
      departmentId: "department.field-investigations",
      summary:
        "TODO: Write a restrained public summary with enough specific detail to explain why this investigation exists.",
      access: { kind: "public" },
      search: { indexable: true, keywords: [] },
      relatedDocumentIds: [],
    };
  }

  if (kind === "discovery") {
    return {
      id: `discovery.${slug}`,
      caseId: "case.todo",
      label: "Analyst correlation",
      title: "TODO: Correlation title",
      summary:
        "TODO: Explain the specific connection a reader can earn by reviewing every required record.",
      requiredDocumentIds: ["document.todo-one", "document.todo-two"],
    };
  }

  if (kind === "puzzle") {
    return {
      id: `puzzle.${slug}`,
      slug,
      caseId: "case.todo",
      title: "TODO: Recovery task title",
      prompt: "TODO: State the fair answer-entry task and the evidence the reader should compare.",
      clueDocumentIds: ["document.todo-one", "document.todo-two"],
      prerequisiteDiscoveryIds: ["discovery.todo"],
      answerNormalization: "phrase-v1",
      answerHashes: ["0".repeat(64)],
      resultGrant: `archive.${slug}`,
      unlockDocumentIds: ["document.todo-unlock"],
      successMessage: "TODO: Confirm what archive entry or record group has been restored.",
    };
  }

  if (kind === "memorandum") {
    return {
      id: `document.${slug}`,
      slug,
      documentNumber: "FUID-XX-0000-000-M-00",
      type: "memorandum",
      title: "TODO: Memorandum title",
      abstract: "TODO: Write a concise public description for search results and cross-references.",
      createdDate: today,
      from: { name: "TODO: Author", role: "Field Investigator" },
      to: ["TODO: Recipient"],
      cc: [],
      subject: "TODO: Memorandum subject",
      caseId: "case.todo",
      departmentId: "department.field-investigations",
      access: { kind: "public" },
      search: { indexable: true, keywords: [] },
      classificationMarking: "PUBLIC RELEASE",
      metadata: [],
      body: [{ type: "paragraph", text: "TODO: Memorandum body." }],
    };
  }

  if (kind === "controlled-document") {
    return {
      id: `document.${slug}`,
      slug,
      documentNumber: "FUID-XX-0000-000-FR-INT-00",
      type: "field-report",
      title: "TODO: Controlled record title",
      abstract: "TODO: Describe the controlled record without copying puzzle solutions.",
      createdDate: today,
      byline: { name: "TODO: Author", role: "Field Investigator" },
      caseId: "case.todo",
      departmentId: "department.field-investigations",
      access: {
        kind: "restricted",
        minClearance: 2,
        departments: ["department.field-investigations"],
        grants: ["archive.internal"],
      },
      search: { indexable: false, keywords: [] },
      classificationMarking: "FUID INTERNAL // CONTROLLED",
      distribution: ["Office of Field Investigations", "Records Review Console"],
      metadata: [],
      body: [{ type: "paragraph", text: "TODO: Controlled record body." }],
    };
  }

  return {
    id: `document.${slug}`,
    slug,
    documentNumber: "FUID-XX-0000-000-FR-00",
    type: "field-report",
    title: "TODO: Document title",
    abstract: "TODO: Write a concise public description for search results and cross-references.",
    createdDate: today,
    byline: { name: "TODO: Author", role: "Field Investigator" },
    caseId: "case.todo",
    departmentId: "department.field-investigations",
    access: { kind: "public" },
    search: { indexable: true, keywords: [] },
    classificationMarking: "PUBLIC RELEASE",
    distribution: ["Public Records Reading Room"],
    metadata: [],
    body: [{ type: "paragraph", text: "TODO: Document body." }],
  };
}

export function getDraftPath(root, kind, slug) {
  assertValidKind(kind);
  assertValidSlug(slug);
  return path.join(root, "src", "content", "data", kindDirectories[kind], `${slug}.draft.json`);
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writeDraft(root, kind, slug) {
  const destination = getDraftPath(root, kind, slug);
  if (await fileExists(destination)) {
    throw new Error(`Draft already exists: ${destination}`);
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(createTemplate(kind, slug), null, 2)}\n`, "utf8");
  return destination;
}

function printUsage() {
  console.log(
    "Usage: pnpm new:content -- <case|department|document|memorandum|controlled-document|discovery|puzzle> <kebab-case-slug>",
  );
  console.log("Creates a non-deployed .draft.json file. Complete it, then rename it to .json.");
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const [kind, slug] = process.argv.slice(2);
  if (!kind || !slug || kind === "--help" || kind === "-h") {
    printUsage();
    process.exitCode = kind === "--help" || kind === "-h" ? 0 : 1;
  } else {
    try {
      const destination = await writeDraft(projectRoot, kind, slug);
      console.log(`Created ${path.relative(projectRoot, destination)}`);
      console.log("Complete every TODO, rename the file to .json, and run pnpm validate:content.");
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }
}
