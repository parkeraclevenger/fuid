import { catalog } from "../../content/catalog";
import { createSession, type DirectorySession } from "./accessService";

function normalizeUsername(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

function normalizePassphrase(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function authenticateDirectoryAccount(
  username: string,
  passphrase: string,
): Promise<DirectorySession | null> {
  const normalizedUsername = normalizeUsername(username);
  const account = catalog.accounts.find((candidate) => candidate.username === normalizedUsername);
  if (!account) return null;

  const candidateHash = await sha256(normalizePassphrase(passphrase));
  if (candidateHash !== account.passwordHash) return null;

  const employee = catalog.getEmployee(account.employeeId);
  if (!employee || employee.status !== "active") return null;

  return createSession(account, employee);
}

export function restoreDirectorySession(
  accountId: string,
  grantIds: readonly string[],
): DirectorySession | null {
  const account = catalog.getAccount(accountId);
  if (!account) return null;
  const employee = catalog.getEmployee(account.employeeId);
  if (!employee || employee.status !== "active") return null;
  return createSession(account, employee, grantIds);
}
