import type { FuidCase, FuidDocument } from "./schemas";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const statusLabels: Record<FuidCase["status"], string> = {
  "open-monitoring": "Open — Monitoring",
  "closed-explained": "Closed — Explained",
  "closed-unresolved": "Closed — Unresolved",
};

const documentTypeLabels: Record<FuidDocument["type"], string> = {
  "field-report": "Field Investigation Report",
  memorandum: "Internal Memorandum",
};

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function formatStatus(status: FuidCase["status"]): string {
  return statusLabels[status];
}

export function formatDocumentType(type: FuidDocument["type"]): string {
  return documentTypeLabels[type];
}
