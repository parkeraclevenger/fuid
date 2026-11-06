import { describe, expect, it } from "vitest";

import { catalog } from "../../content/catalog";
import { canAccess, createSession } from "./accessService";
import { authenticateDirectoryAccount } from "./authenticationService";

describe("central access evaluation", () => {
  const account = catalog.accounts[0]!;
  const employee = catalog.getEmployee(account.employeeId)!;
  const session = createSession(account, employee);

  it("allows public records without a directory session", () => {
    expect(canAccess({ kind: "public" }, null)).toBe(true);
  });

  it("requires all declared clearance, department, and grant conditions", () => {
    expect(
      canAccess(
        {
          kind: "restricted",
          minClearance: 2,
          departments: ["department.field-investigations"],
          grants: ["archive.internal"],
        },
        session,
      ),
    ).toBe(true);
    expect(
      canAccess(
        {
          kind: "restricted",
          minClearance: 3,
          departments: [],
          grants: ["archive.internal"],
        },
        session,
      ),
    ).toBe(false);
  });
});

describe("directory authentication", () => {
  it("creates the expected session for the discovered credentials", async () => {
    const session = await authenticateDirectoryAccount("LORTEZ", "Documented Route Variance");
    expect(session?.displayName).toBe("Lena Ortez");
    expect(session?.grants).toContain("archive.internal");
  });

  it("creates the Wrenfield records session from its released memorandum", async () => {
    const session = await authenticateDirectoryAccount("NMERRITT", "Unassigned Room Variance");
    expect(session?.displayName).toBe("Nadia Merritt");
    expect(session?.departmentId).toBe("department.records-analysis");
    expect(session?.grants).toContain("archive.wrenfield");
  });

  it("rejects an incorrect passphrase", async () => {
    await expect(authenticateDirectoryAccount("lortez", "wrong phrase")).resolves.toBeNull();
  });
});
