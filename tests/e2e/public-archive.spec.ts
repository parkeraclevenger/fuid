import { expect, test } from "@playwright/test";

test("public archive flow remains navigable and refresh-safe", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/#/");
  await expect(page.getByRole("heading", { name: "Unresolved does not mean unrecorded." })).toBeVisible();
  await expect(page.locator(".utility-banner__label")).toContainText("Federal records service");
  await expect(page.locator("body")).not.toContainText(/fictional|work of fiction|not affiliated/i);

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();

  await page.getByRole("link", { name: "Browse public investigations" }).click();
  await expect(page).toHaveURL(/#\/investigations$/);
  await expect(page.locator(".case-card")).toHaveCount(7);
  await page.getByRole("link", { name: "The Bellwether Mile" }).click();
  await expect(page.getByRole("heading", { name: "The Bellwether Mile" })).toBeVisible();
  await expect(page.locator(".document-row")).toHaveCount(4);

  await page.getByRole("link", { name: /Mileage Reconciliation Procedures/ }).click();
  await expect(page.getByRole("heading", { name: "Mileage Reconciliation Procedures for Service Road 6" })).toBeVisible();
  await expect(page.getByText("Memorandum", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Mileage Reconciliation Procedures for Service Road 6" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    "document.documentElement.scrollWidth > document.documentElement.clientWidth",
  );
  expect(hasHorizontalOverflow).toBe(false);
  expect(consoleErrors).toEqual([]);
});

test("public search uses explicit metadata and record-type filters", async ({ page }) => {
  await page.goto("/#/search");
  await expect(page.getByRole("heading", { name: "Records search" })).toBeVisible();

  await page.getByLabel("Search terms or record number").fill("Bellwether");
  await page.getByLabel("Record type").selectOption("document");
  await page.getByRole("button", { name: "Search records" }).click();
  await expect(page.getByRole("heading", { name: "4 records found" })).toBeVisible();
  await expect(page.locator(".search-result")).toHaveCount(4);

  await page.getByLabel("Search terms or record number").fill("FUID-NE-2019-021");
  await page.getByLabel("Record type").selectOption("all");
  await page.getByRole("button", { name: "Search records" }).click();
  await expect(page.getByRole("link", { name: "The Ash Creek Siren" })).toBeVisible();

  await page.getByLabel("Search terms or record number").fill("record-that-does-not-exist");
  await page.getByRole("button", { name: "Search records" }).click();
  await expect(page.getByRole("heading", { name: "No public records matched this search" })).toBeVisible();
});

test("released-record clues unlock the unreleased record registry", async ({ page }) => {
  await page.goto("/#/records/bellwether-mileage-memorandum-01");
  await expect(page.getByText("LORTEZ", { exact: true })).toBeVisible();
  await expect(page.getByText("documented route variance", { exact: false })).toBeVisible();

  await page.goto("/#/employee-resources");
  await page.getByText("Need help locating your credentials?").click();
  await expect(page.getByText("Bellwether Mile reimbursement memorandum", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open the relevant released memorandum/ })).toBeVisible();
  await page.getByLabel("Directory ID").fill("lortez");
  await page.getByLabel("Passphrase").fill("documented route variance");
  await page.getByRole("button", { name: "Access employee resources" }).click();

  await expect(page.getByRole("heading", { name: "Unreleased record registry" })).toBeVisible();
  await expect(page.locator(".internal-record-table__row")).toHaveCount(6);
  await expect(page.getByText("FUID-CO-2004-014-M-INT-01", { exact: true })).toBeVisible();
  await expect(page.getByText("FUID-OR-1986-011-M-INT-01", { exact: true })).toBeVisible();
  await expect(page.getByText("FUID-LA-2013-006-FR-INT-01", { exact: true })).toBeVisible();
  await expect(page.getByText("FUID-MT-1997-019-M-INT-01", { exact: true })).toBeVisible();
  await expect(page.getByText("FUID-GA-1971-002-FR-INT-01", { exact: true })).toBeVisible();
  await expect(page.getByText("FUID-WV-2008-009-FR-INT-01", { exact: true })).toBeVisible();
  await page
    .locator(".internal-record-table__row")
    .filter({ hasText: "FUID-CO-2004-014-M-INT-01" })
    .getByRole("link", { name: "OPEN" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Controlled Addendum: Endpoint Observation Protocol" }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Controlled Addendum: Endpoint Observation Protocol" }),
  ).toBeVisible();
});

test("cross-record review reveals and preserves the Harrow index-recovery puzzle", async ({ page }) => {
  await page.goto("/#/records/harrow-station-field-report-01");
  await expect(page.getByRole("heading", { name: "Personnel and Site Reconciliation" })).toBeVisible();
  await page.goto("/#/records/harrow-station-claimant-memorandum-02");
  await expect(
    page.getByRole("heading", { name: "Review of Unverified Claimant Correspondence" }),
  ).toBeVisible();

  await page.goto("/#/employee-resources");
  await page.getByLabel("Directory ID").fill("lortez");
  await page.getByLabel("Passphrase").fill("documented route variance");
  await page.getByRole("button", { name: "Access employee resources" }).click();

  await page
    .locator(".internal-record-table__row")
    .filter({ hasText: "FUID-OR-1986-011-M-INT-01" })
    .getByRole("link", { name: "OPEN" })
    .click();
  await expect(page.getByRole("heading", { name: "No recorded departure" })).toBeVisible();
  await page.getByRole("link", { name: /View in record queue/ }).click();

  await expect(page.getByRole("heading", { name: "A recovery task is available" })).toBeVisible();
  await page.getByRole("link", { name: "Open index recovery" }).click();
  await page.getByRole("link", { name: /Open recovery task/ }).click();

  await page.getByLabel("Recovered index term").fill("upper tower");
  await page.getByRole("button", { name: "Restore index entry" }).click();
  await expect(page.getByRole("alert")).toContainText("Index term not recognized");
  await page.getByLabel("Recovered index term").fill("lower tower");
  await page.getByRole("button", { name: "Restore index entry" }).click();

  await expect(page.getByRole("heading", { name: "Misfiled record recovered" })).toBeVisible();
  await page.getByRole("link", { name: /Open FUID-OR-1986-011-FR-INT-02/ }).click();
  await expect(
    page.getByRole("heading", { name: "Property Storage Incident and Relief Call Transcript" }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Property Storage Incident and Relief Call Transcript" }),
  ).toBeVisible();
});

test("Bellglass and Morrow Cut build distinct public-to-controlled discoveries", async ({ page }) => {
  await page.goto("/#/investigations/bellglass-orchard-visitor");
  await expect(page.getByRole("heading", { name: "The Bellglass Orchard Visitor" })).toBeVisible();
  await expect(page.locator(".document-row")).toHaveCount(3);
  await page.goto("/#/records/bellglass-orchard-field-report-01");
  await expect(page.getByText("Tracks began and ended at tree trunks", { exact: false })).toBeVisible();
  await page.goto("/#/records/bellglass-orchard-evidence-memorandum-01");
  await expect(page.getByText("The fruit was opened from its interior", { exact: false })).toBeVisible();

  await page.goto("/#/investigations/morrow-cut-choir");
  await expect(page.getByRole("heading", { name: "The Morrow Cut Choir" })).toBeVisible();
  await expect(page.locator(".document-row")).toHaveCount(3);
  await page.goto("/#/records/morrow-cut-field-report-01");
  await expect(page.getByText("said “Kade, Mercer, Ives”", { exact: false })).toBeVisible();
  await page.goto("/#/records/morrow-cut-acoustic-memorandum-01");
  await expect(page.getByText("No conventional acoustic route", { exact: false })).toBeVisible();

  await page.goto("/#/employee-resources");
  await page.getByLabel("Directory ID").fill("lortez");
  await page.getByLabel("Passphrase").fill("documented route variance");
  await page.getByRole("button", { name: "Access employee resources" }).click();

  await page
    .locator(".internal-record-table__row")
    .filter({ hasText: "FUID-GA-1971-002-FR-INT-01" })
    .getByRole("link", { name: "OPEN" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Controlled Night Watch and Packing-Shed Incident" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "The feeding path begins inside" })).toBeVisible();

  await page.getByRole("link", { name: /View in record queue/ }).click();
  await page
    .locator(".internal-record-table__row")
    .filter({ hasText: "FUID-WV-2008-009-FR-INT-01" })
    .getByRole("link", { name: "OPEN" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Final Instrument Descent and Capsule Examination" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "The bore reports arrivals before the gate" })).toBeVisible();
});

test("unknown public routes fail clearly without looking like a clue", async ({ page }) => {
  await page.goto("/#/records/not-a-record");
  await expect(page.getByRole("heading", { name: "Record not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to public investigations" })).toBeVisible();

  await page.goto("/#/not-a-route");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
