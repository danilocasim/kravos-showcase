import { expect, test } from "@playwright/test";
import { addDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import { businessTimeZone } from "../lib/booking/business-time";
import { nextBookableWeek } from "../lib/ui/booking/date-range";
import { signIn, signOut } from "./fixtures/auth";
import { query } from "./fixtures/database";
import { requireUserId, resetCustomerData, seedAppointment, seedPet } from "./fixtures/seed";
import { adminUser, customerOne } from "./fixtures/test-users";

const scheduleDate = addDays(
  new Date(`${nextBookableWeek().startsOn}T00:00:00.000Z`),
  3,
).toISOString().slice(0, 10);
const startsAt = fromZonedTime(`${scheduleDate}T16:00:00`, businessTimeZone).toISOString();

const seedVisit = async (): Promise<string> => {
  const customerId = await requireUserId(customerOne);
  await resetCustomerData(customerId);
  const petId = await seedPet(customerOne);
  return seedAppointment({ user: customerOne, petId, startsAt });
};

const openAdminSchedule = async (page: import("@playwright/test").Page): Promise<void> => {
  await signIn(page, adminUser);
  await page.goto(`/admin?${new URLSearchParams({ date: scheduleDate })}`);
  await expect(page.getByText("Day schedule")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
};

test("a customer is denied the admin console", async ({ page }) => {
  await signIn(page, customerOne);
  await expect(page.getByRole("link", { name: "Admin console" })).toHaveCount(0);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/appointments$/);
  await expect(page.getByRole("navigation", { name: "Admin" })).toHaveCount(0);
});

test("an admin can open the console from the signed-in product navigation", async ({ page }) => {
  await signIn(page, adminUser);
  const adminLink = page.getByRole("navigation", { name: "Customer" }).getByRole("link", { name: "Admin console" });
  await expect(adminLink).toBeVisible();
  await adminLink.click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("navigation", { name: "Admin" })).toBeVisible();
});

test("an admin can scan and filter the responsive day schedule", async ({ page }) => {
  await seedVisit();
  await openAdminSchedule(page);
  await expect(page.getByRole("heading", { name: "Appointments" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Schedule date" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Biscuit" })).toBeVisible();
  await expect(page.getByText("1 of 1 shown")).toBeVisible();
  if (test.info().project.name === "chromium") {
    const statusBox = await page.getByRole("table").getByText("Confirmed", { exact: true }).boundingBox();
    const actionBox = await page.getByRole("button", { name: /Mark Biscuit's .* appointment completed/ }).boundingBox();
    expect(statusBox).not.toBeNull();
    expect(actionBox).not.toBeNull();
    expect(actionBox!.x).toBeGreaterThanOrEqual(statusBox!.x + statusBox!.width);
  }

  await page.getByLabel("Groomer").selectOption("20000000-0000-0000-0000-000000000002");
  await expect(page).toHaveURL(/groomerId=20000000-0000-0000-0000-000000000002/);
  await expect(page.getByText("0 of 1 shown")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nothing matches these filters" })).toBeVisible();
  await page.getByRole("link", { name: "Clear filters" }).click();
  await expect(page.getByText("1 of 1 shown")).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("an admin completes a confirmed appointment and the audit records the actor", async ({ page }) => {
  const appointmentId = await seedVisit();
  const adminId = await requireUserId(adminUser);
  await openAdminSchedule(page);

  await page.getByRole("button", { name: /Mark Biscuit's .* appointment completed/ }).click();
  const row = page.locator(`#appointment-${appointmentId}`);
  await expect(row.getByText("Completed", { exact: true })).toBeVisible();
  await expect(row.getByText("No actions")).toBeVisible();

  const rows = await query<{ status: string; completed_at: Date | null; status_changed_by: string | null; status_changed_at: Date | null }>(
    "select status, completed_at, status_changed_by, status_changed_at from public.appointments where id = $1",
    [appointmentId],
  );
  expect(rows[0]).toMatchObject({ status: "COMPLETED", status_changed_by: adminId });
  expect(rows[0]?.completed_at).not.toBeNull();
  expect(rows[0]?.status_changed_at).not.toBeNull();
});

test("an admin can cancel as an audited override and the customer sees the result", async ({ page }) => {
  const appointmentId = await seedVisit();
  const adminId = await requireUserId(adminUser);
  await openAdminSchedule(page);

  await page.getByRole("button", { name: /Cancel Biscuit's .* appointment/ }).click();
  await expect(page.getByRole("dialog", { name: "Cancel this appointment?" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel appointment", exact: true }).click();
  const row = page.locator(`#appointment-${appointmentId}`);
  await expect(row.getByText("Cancelled", { exact: true })).toBeVisible();

  const rows = await query<{ status: string; cancelled_at: Date | null; status_changed_by: string | null }>(
    "select status, cancelled_at, status_changed_by from public.appointments where id = $1",
    [appointmentId],
  );
  expect(rows[0]).toMatchObject({ status: "CANCELLED", status_changed_by: adminId });
  expect(rows[0]?.cancelled_at).not.toBeNull();

  await signOut(page);
  await signIn(page, customerOne);
  await page.getByRole("link", { name: /Past & cancelled/ }).click();
  await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
});
