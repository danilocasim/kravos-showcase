import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./fixtures/auth";
import { resetCustomerData, requireUserId, seedConflictingAppointment, seedPet } from "./fixtures/seed";
import { customerOne, customerTwo } from "./fixtures/test-users";

const reachReview = async (page: Page): Promise<void> => {
  await page.getByRole("link", { name: "Book a visit" }).first().click();
  await page.getByRole("heading", { name: "Biscuit" }).click();
  await page.getByLabel("Full Groom", { exact: false }).check();
  await page.getByRole("button", { name: "Choose add-ons" }).click();
  await page.getByRole("button", { name: "Continue to groomer" }).click();
  await page.getByLabel("Any available groomer", { exact: false }).check();
  await page.getByRole("button", { name: "Find times" }).click();
  await page.locator("label").filter({ has: page.locator('input[name="slot"]') }).first().click();
  await page.getByRole("button", { name: "Review booking" }).click();
  await expect(page.getByRole("heading", { name: "Review and confirm" })).toBeVisible();
};

test("recovers when a reviewed slot becomes unavailable", async ({ page }) => {
  await resetCustomerData(await requireUserId(customerOne));
  await resetCustomerData(await requireUserId(customerTwo));
  await seedPet(customerOne);
  await signIn(page, customerOne);
  await reachReview(page);

  const reviewUrl = new URL(page.url());
  const groomerId = reviewUrl.searchParams.get("groomerId");
  const startsAt = reviewUrl.searchParams.get("startsAt");
  const startsOn = reviewUrl.searchParams.get("startsOn");
  const endsOn = reviewUrl.searchParams.get("endsOn");
  if (groomerId === null || startsAt === null || startsOn === null || endsOn === null) throw new Error("Review URL is incomplete.");
  await seedConflictingAppointment({ groomerId, startsAt });
  await page.getByLabel("I confirm these appointment details", { exact: false }).check();
  await page.getByRole("button", { name: "Confirm booking" }).click();

  await expect(page.getByText("That time was just booked")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose a date and time" })).toBeVisible();
  await expect(page).toHaveURL(/error=SLOT_UNAVAILABLE/);
  const recoveryUrl = new URL(page.url());
  expect(recoveryUrl.searchParams.get("startsOn")).toBe(startsOn);
  expect(recoveryUrl.searchParams.get("endsOn")).toBe(endsOn);
});
