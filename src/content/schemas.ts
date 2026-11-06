import { z } from "zod";

const stableId = z
  .string()
  .regex(/^[a-z]+\.[a-z0-9-]+$/, "Use a lowercase namespaced stable ID.");
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase kebab-case slug.");
const isoDate = z.iso.date();

export const publicAccessSchema = z.object({
  kind: z.literal("public"),
});

const restrictedAccessSchema = z.object({
  kind: z.literal("restricted"),
  minClearance: z.number().int().min(1).max(5).optional(),
  departments: z.array(stableId).default([]),
  grants: z.array(z.string().regex(/^[a-z]+(?:\.[a-z0-9-]+)+$/)).default([]),
});

export const accessRequirementSchema = z.discriminatedUnion("kind", [
  publicAccessSchema,
  restrictedAccessSchema,
]);

const searchMetadataSchema = z.object({
  indexable: z.boolean(),
  keywords: z.array(z.string().min(2)).max(24).default([]),
});

export const departmentSchema = z.object({
  id: stableId,
  abbreviation: z.string().min(2).max(12),
  name: z.string().min(3),
  summary: z.string().min(20),
});

export const caseSchema = z.object({
  id: stableId,
  slug,
  caseNumber: z.string().regex(/^FUID-[A-Z]{2}-\d{4}-\d{3}$/),
  title: z.string().min(5),
  status: z.enum(["open-monitoring", "closed-explained", "closed-unresolved"]),
  incidentDate: isoDate,
  openedDate: isoDate,
  location: z.object({
    locality: z.string().min(2),
    region: z.string().length(2),
  }),
  departmentId: stableId,
  summary: z.string().min(80),
  access: accessRequirementSchema,
  search: searchMetadataSchema,
  relatedDocumentIds: z.array(stableId),
});

const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  text: z.string().min(1),
});

const headingBlockSchema = z.object({
  type: z.literal("heading"),
  text: z.string().min(1),
});

const calloutBlockSchema = z.object({
  type: z.literal("callout"),
  label: z.string().min(1),
  text: z.string().min(1),
});

const redactionBlockSchema = z.object({
  type: z.literal("redaction"),
  length: z.number().int().min(4).max(80),
  explanation: z.string().min(1).optional(),
});

export const documentBlockSchema = z.discriminatedUnion("type", [
  paragraphBlockSchema,
  headingBlockSchema,
  calloutBlockSchema,
  redactionBlockSchema,
]);

const documentBaseSchema = z.object({
  id: stableId,
  slug,
  documentNumber: z.string().min(8),
  title: z.string().min(5),
  abstract: z.string().min(40),
  createdDate: isoDate,
  revisedDate: isoDate.optional(),
  caseId: stableId,
  departmentId: stableId,
  access: accessRequirementSchema,
  search: searchMetadataSchema,
  classificationMarking: z.enum(["PUBLIC RELEASE", "FUID INTERNAL // CONTROLLED"]),
  metadata: z.array(
    z.object({
      label: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
  body: z.array(documentBlockSchema).min(1),
});

const personLineSchema = z.object({
  name: z.string().min(3),
  role: z.string().min(3),
});

export const fieldReportDocumentSchema = documentBaseSchema.extend({
  type: z.literal("field-report"),
  byline: personLineSchema,
  distribution: z.array(z.string().min(2)).min(1),
});

export const memorandumDocumentSchema = documentBaseSchema.extend({
  type: z.literal("memorandum"),
  from: personLineSchema,
  to: z.array(z.string().min(2)).min(1),
  cc: z.array(z.string().min(2)).default([]),
  subject: z.string().min(5),
});

export const documentSchema = z.discriminatedUnion("type", [
  fieldReportDocumentSchema,
  memorandumDocumentSchema,
]);

export const employeeSchema = z.object({
  id: stableId,
  directoryId: z.string().regex(/^[a-z][a-z0-9-]{2,31}$/),
  name: z.string().min(3),
  title: z.string().min(3),
  departmentId: stableId,
  clearance: z.number().int().min(1).max(5),
  status: z.enum(["active", "inactive"]),
});

export const accountSchema = z.object({
  id: stableId,
  employeeId: stableId,
  username: z.string().regex(/^[a-z][a-z0-9-]{2,31}$/),
  passwordHash: z.string().regex(/^[a-f0-9]{64}$/),
  grants: z.array(z.string().regex(/^[a-z]+(?:\.[a-z0-9-]+)+$/)),
  applications: z.array(z.enum(["records-review"])),
});

export const discoverySchema = z.object({
  id: stableId,
  caseId: stableId,
  label: z.string().min(3).max(48),
  title: z.string().min(5),
  summary: z.string().min(80),
  requiredDocumentIds: z.array(stableId).min(2),
});

export const puzzleSchema = z.object({
  id: stableId,
  slug,
  caseId: stableId,
  title: z.string().min(5),
  prompt: z.string().min(40),
  clueDocumentIds: z.array(stableId).min(2),
  prerequisiteDiscoveryIds: z.array(stableId).min(1),
  answerNormalization: z.literal("phrase-v1"),
  answerHashes: z.array(z.string().regex(/^[a-f0-9]{64}$/)).min(1),
  resultGrant: z.string().regex(/^[a-z]+(?:\.[a-z0-9-]+)+$/),
  unlockDocumentIds: z.array(stableId).min(1),
  successMessage: z.string().min(40),
});

export type Department = z.infer<typeof departmentSchema>;
export type FuidCase = z.infer<typeof caseSchema>;
export type FuidDocument = z.infer<typeof documentSchema>;
export type DocumentBlock = z.infer<typeof documentBlockSchema>;
export type AccessRequirement = z.infer<typeof accessRequirementSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type DirectoryAccount = z.infer<typeof accountSchema>;
export type Discovery = z.infer<typeof discoverySchema>;
export type Puzzle = z.infer<typeof puzzleSchema>;
