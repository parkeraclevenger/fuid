import { z } from "zod";

import {
  caseSchema,
  departmentSchema,
  documentSchema,
  employeeSchema,
  accountSchema,
  discoverySchema,
  puzzleSchema,
  type Employee,
  type DirectoryAccount,
  type Department,
  type Discovery,
  type FuidCase,
  type FuidDocument,
  type Puzzle,
} from "./schemas";

interface RawModuleMap {
  [path: string]: unknown;
}

export interface ContentCatalog {
  departments: readonly Department[];
  cases: readonly FuidCase[];
  documents: readonly FuidDocument[];
  employees: readonly Employee[];
  accounts: readonly DirectoryAccount[];
  discoveries: readonly Discovery[];
  puzzles: readonly Puzzle[];
  getDepartment(id: string): Department | undefined;
  getCase(id: string): FuidCase | undefined;
  getCaseBySlug(slug: string): FuidCase | undefined;
  getDocument(id: string): FuidDocument | undefined;
  getDocumentBySlug(slug: string): FuidDocument | undefined;
  getEmployee(id: string): Employee | undefined;
  getAccount(id: string): DirectoryAccount | undefined;
  getDiscovery(id: string): Discovery | undefined;
  getPuzzle(id: string): Puzzle | undefined;
  getPuzzleBySlug(slug: string): Puzzle | undefined;
}

export class ContentCatalogError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Content catalog is invalid:\n- ${problems.join("\n- ")}`);
    this.name = "ContentCatalogError";
  }
}

function parseModules<T>(modules: RawModuleMap, schema: z.ZodType<T>, entityName: string): T[] {
  const parsed: T[] = [];
  const problems: string[] = [];

  for (const [path, value] of Object.entries(modules)) {
    const result = schema.safeParse(value);
    if (result.success) {
      parsed.push(result.data);
      continue;
    }

    for (const issue of result.error.issues) {
      const field = issue.path.length > 0 ? issue.path.join(".") : "record";
      problems.push(`${entityName} ${path}: ${field} — ${issue.message}`);
    }
  }

  if (problems.length > 0) {
    throw new ContentCatalogError(problems);
  }

  return parsed;
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function createCatalog(input: {
  departments: Department[];
  cases: FuidCase[];
  documents: FuidDocument[];
  employees?: Employee[];
  accounts?: DirectoryAccount[];
  discoveries?: Discovery[];
  puzzles?: Puzzle[];
}): ContentCatalog {
  const problems: string[] = [];
  const inputEmployees = input.employees ?? [];
  const inputAccounts = input.accounts ?? [];
  const inputDiscoveries = input.discoveries ?? [];
  const inputPuzzles = input.puzzles ?? [];
  const allEntities = [
    ...input.departments,
    ...input.cases,
    ...input.documents,
    ...inputEmployees,
    ...inputAccounts,
    ...inputDiscoveries,
    ...inputPuzzles,
  ];

  for (const duplicate of findDuplicates(allEntities.map((entity) => entity.id))) {
    problems.push(`Duplicate stable ID: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(input.cases.map((record) => record.slug))) {
    problems.push(`Duplicate case slug: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(input.cases.map((record) => record.caseNumber))) {
    problems.push(`Duplicate case number: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(input.documents.map((record) => record.slug))) {
    problems.push(`Duplicate document slug: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(input.documents.map((record) => record.documentNumber))) {
    problems.push(`Duplicate document number: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(input.departments.map((record) => record.abbreviation))) {
    problems.push(`Duplicate department abbreviation: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(inputEmployees.map((record) => record.directoryId))) {
    problems.push(`Duplicate employee directory ID: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(inputAccounts.map((record) => record.username))) {
    problems.push(`Duplicate account username: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(inputPuzzles.map((record) => record.slug))) {
    problems.push(`Duplicate puzzle slug: ${duplicate}`);
  }

  const departments = new Map(input.departments.map((department) => [department.id, department]));
  const cases = new Map(input.cases.map((record) => [record.id, record]));
  const documents = new Map(input.documents.map((document) => [document.id, document]));
  const employees = new Map(inputEmployees.map((employee) => [employee.id, employee]));
  const accounts = new Map(inputAccounts.map((account) => [account.id, account]));
  const discoveries = new Map(inputDiscoveries.map((discovery) => [discovery.id, discovery]));
  const puzzles = new Map(inputPuzzles.map((puzzle) => [puzzle.id, puzzle]));
  const definedGrants = new Set([
    ...inputAccounts.flatMap((account) => account.grants),
    ...inputPuzzles.map((puzzle) => puzzle.resultGrant),
  ]);

  for (const record of input.cases) {
    if (!departments.has(record.departmentId)) {
      problems.push(`${record.id} references missing department ${record.departmentId}`);
    }
    for (const duplicate of findDuplicates(record.relatedDocumentIds)) {
      problems.push(`${record.id} lists document ${duplicate} more than once`);
    }
    for (const documentId of record.relatedDocumentIds) {
      const document = documents.get(documentId);
      if (!document) {
        problems.push(`${record.id} references missing document ${documentId}`);
      } else if (document.caseId !== record.id) {
        problems.push(`${record.id} lists ${documentId}, but that document points to ${document.caseId}`);
      }
    }
  }

  for (const document of input.documents) {
    const relatedCase = cases.get(document.caseId);
    if (!departments.has(document.departmentId)) {
      problems.push(`${document.id} references missing department ${document.departmentId}`);
    }
    if (!relatedCase) {
      problems.push(`${document.id} references missing case ${document.caseId}`);
    } else if (!relatedCase.relatedDocumentIds.includes(document.id)) {
      problems.push(`${document.id} points to ${document.caseId}, but the case does not list the document`);
    }
    if (document.access.kind === "restricted") {
      for (const departmentId of document.access.departments) {
        if (!departments.has(departmentId)) {
          problems.push(`${document.id} requires missing department ${departmentId}`);
        }
      }
      for (const grant of document.access.grants) {
        if (!definedGrants.has(grant)) {
          problems.push(`${document.id} requires undefined access grant ${grant}`);
        }
      }
    }
  }

  for (const employee of inputEmployees) {
    if (!departments.has(employee.departmentId)) {
      problems.push(`${employee.id} references missing department ${employee.departmentId}`);
    }
  }

  for (const account of inputAccounts) {
    if (!employees.has(account.employeeId)) {
      problems.push(`${account.id} references missing employee ${account.employeeId}`);
    }
  }

  for (const discovery of inputDiscoveries) {
    if (!cases.has(discovery.caseId)) {
      problems.push(`${discovery.id} references missing case ${discovery.caseId}`);
    }
    for (const duplicate of findDuplicates(discovery.requiredDocumentIds)) {
      problems.push(`${discovery.id} requires document ${duplicate} more than once`);
    }
    for (const documentId of discovery.requiredDocumentIds) {
      const document = documents.get(documentId);
      if (!document) {
        problems.push(`${discovery.id} references missing document ${documentId}`);
      } else if (document.caseId !== discovery.caseId) {
        problems.push(`${discovery.id} uses ${documentId} from a different case`);
      }
    }
  }

  for (const puzzle of inputPuzzles) {
    if (!cases.has(puzzle.caseId)) {
      problems.push(`${puzzle.id} references missing case ${puzzle.caseId}`);
    }
    for (const discoveryId of puzzle.prerequisiteDiscoveryIds) {
      if (!discoveries.has(discoveryId)) {
        problems.push(`${puzzle.id} references missing discovery ${discoveryId}`);
      }
    }
    for (const documentId of puzzle.clueDocumentIds) {
      if (!documents.has(documentId)) {
        problems.push(`${puzzle.id} references missing clue document ${documentId}`);
      }
    }
    for (const documentId of puzzle.unlockDocumentIds) {
      const document = documents.get(documentId);
      if (!document) {
        problems.push(`${puzzle.id} references missing unlock document ${documentId}`);
      } else if (
        document.access.kind !== "restricted" ||
        !document.access.grants.includes(puzzle.resultGrant)
      ) {
        problems.push(`${documentId} must require puzzle grant ${puzzle.resultGrant}`);
      }
    }
  }

  if (problems.length > 0) {
    throw new ContentCatalogError(problems);
  }

  const sortedCases = [...input.cases].sort((a, b) => b.openedDate.localeCompare(a.openedDate));
  const sortedDocuments = [...input.documents].sort((a, b) =>
    b.createdDate.localeCompare(a.createdDate),
  );

  return {
    departments: Object.freeze([...input.departments]),
    cases: Object.freeze(sortedCases),
    documents: Object.freeze(sortedDocuments),
    employees: Object.freeze([...inputEmployees]),
    accounts: Object.freeze([...inputAccounts]),
    discoveries: Object.freeze([...inputDiscoveries]),
    puzzles: Object.freeze([...inputPuzzles]),
    getDepartment: (id) => departments.get(id),
    getCase: (id) => cases.get(id),
    getCaseBySlug: (recordSlug) => sortedCases.find((record) => record.slug === recordSlug),
    getDocument: (id) => documents.get(id),
    getDocumentBySlug: (recordSlug) =>
      sortedDocuments.find((document) => document.slug === recordSlug),
    getEmployee: (id) => employees.get(id),
    getAccount: (id) => accounts.get(id),
    getDiscovery: (id) => discoveries.get(id),
    getPuzzle: (id) => puzzles.get(id),
    getPuzzleBySlug: (puzzleSlug) => inputPuzzles.find((puzzle) => puzzle.slug === puzzleSlug),
  };
}

const departmentModules = import.meta.glob("./data/departments/*.json", {
  eager: true,
  import: "default",
});
const caseModules = import.meta.glob("./data/cases/*.json", { eager: true, import: "default" });
const documentModules = import.meta.glob("./data/documents/*.json", {
  eager: true,
  import: "default",
});
const employeeModules = import.meta.glob("./data/employees/*.json", {
  eager: true,
  import: "default",
});
const accountModules = import.meta.glob("./data/accounts/*.json", {
  eager: true,
  import: "default",
});
const discoveryModules = import.meta.glob("./data/discoveries/*.json", {
  eager: true,
  import: "default",
});
const puzzleModules = import.meta.glob("./data/puzzles/*.json", {
  eager: true,
  import: "default",
});

export const catalog = createCatalog({
  departments: parseModules(departmentModules, departmentSchema, "department"),
  cases: parseModules(caseModules, caseSchema, "case"),
  documents: parseModules(documentModules, documentSchema, "document"),
  employees: parseModules(employeeModules, employeeSchema, "employee"),
  accounts: parseModules(accountModules, accountSchema, "account"),
  discoveries: parseModules(discoveryModules, discoverySchema, "discovery"),
  puzzles: parseModules(puzzleModules, puzzleSchema, "puzzle"),
});
