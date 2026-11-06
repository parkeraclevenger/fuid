import type { AccessRequirement, DirectoryAccount, Employee } from "../../content/schemas";

export interface DirectorySession {
  accountId: string;
  employeeId: string;
  username: string;
  displayName: string;
  title: string;
  clearance: number;
  departmentId: string;
  grants: readonly string[];
  applications: readonly DirectoryAccount["applications"][number][];
}

export function createSession(
  account: DirectoryAccount,
  employee: Employee,
  grantIds: readonly string[] = account.grants,
): DirectorySession {
  return Object.freeze({
    accountId: account.id,
    employeeId: employee.id,
    username: account.username,
    displayName: employee.name,
    title: employee.title,
    clearance: employee.clearance,
    departmentId: employee.departmentId,
    grants: Object.freeze([...grantIds]),
    applications: Object.freeze([...account.applications]),
  });
}

export function canAccess(
  requirement: AccessRequirement,
  session: DirectorySession | null,
): boolean {
  if (requirement.kind === "public") return true;
  if (!session) return false;

  if (requirement.minClearance && session.clearance < requirement.minClearance) return false;
  if (
    requirement.departments.length > 0 &&
    !requirement.departments.includes(session.departmentId)
  ) {
    return false;
  }
  if (requirement.grants.some((grant) => !session.grants.includes(grant))) return false;

  return true;
}
