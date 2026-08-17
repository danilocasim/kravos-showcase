import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures/auth";
import { resetCustomerData, requireUserId, seedPet } from "./fixtures/seed";
import { customerOne } from "./fixtures/test-users";

test.describe("customer booking", () => {
  let petId: string;
  test.beforeEach(async () => {
    await resetCustomerData(await requireUserId(customerOne));
    petId = await seedPet(customerOne);
  });

  test("books the first server-calculated available time", async ({ page }) => {
    await signIn(page, customerOne);
    await page.getByRole("link", { name: "Book a visit" }).first().click();
    await expect(page.getByRole("heading", { name: "Who is this visit for?" })).toBeVisible();
    await page.getByRole("heading", { name: "Biscuit" }).click();

    await page.getByLabel("Bath & Brush", { exact: false }).check();
    await page.getByRole("button", { name: "Choose add-ons" }).click();
    await page.getByRole("checkbox", { name: /Nail Trim/ }).check();
    await page.getByRole("checkbox", { name: /De-shedding/ }).check();
    await page.getByRole("button", { name: "Continue to groomer" }).click();
    await expect(page.getByRole("complementary").getByText("$100")).toBeVisible();

    await page.getByLabel("Any available groomer", { exact: false }).check();
    await page.getByRole("button", { name: "Find times" }).click();
    await page.locator('label').filter({ has: page.locator('input[name="slot"]') }).first().click();
    await page.getByRole("button", { name: "Review booking" }).click();

    await page.getByLabel("I confirm these appointment details", { exact: false }).check();
    await page.getByRole("button", { name: "Confirm booking" }).click();

    await expect(page.getByText("Your visit is confirmed")).toBeVisible();
    await expect(page.getByText("Bath & Brush")).toBeVisible();
    await expect(page.getByText("Nail Trim")).toBeVisible();
    await expect(page.getByText("De-shedding")).toBeVisible();
    await expect(page).toHaveURL(/\/book\/confirmed\//);
  });
  test("recovers from an invalid deep-linked date range", async ({ page }) => {
    await signIn(page, customerOne);
    const query = new URLSearchParams({
      intent: "00000000-0000-4000-8000-000000000098",
      step: "time",
      petId,
      baseServiceId: "10000000-0000-0000-0000-000000000001",
      groomerId: "any",
      startsOn: "2026-09-05",
      endsOn: "2026-08-31",
    });
    await page.goto(`/book?${query}`);

    await expect(page.getByText("Check the date range")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Choose a date and time" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Review booking" })).toHaveCount(0);
  });

});
