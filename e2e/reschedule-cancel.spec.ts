import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures/auth";
import { resetCustomerData, requireUserId, seedAppointment, seedPet } from "./fixtures/seed";
import { customerOne } from "./fixtures/test-users";

test.describe("appointment management", () => {
  test.beforeEach(async () => {
    await resetCustomerData(await requireUserId(customerOne));
  });

  test("reschedules a visit to a new server-calculated time", async ({ page }) => {
    const petId = await seedPet(customerOne);
    await seedAppointment({ user: customerOne, petId });
    await signIn(page, customerOne);
    await expect(page.getByText("Bath & Brush")).toBeVisible();
    const originalAppointment = await page.getByRole("article").innerText();
    await page.getByRole("link", { name: "Reschedule" }).click();
    await page.locator("label").filter({ has: page.locator('input[name="startsAt"]') }).first().click();
    await page.getByRole("button", { name: "Save new time" }).click();

    await expect(page).toHaveURL(/\/appointments$/);
    await expect(page.getByText("Bath & Brush")).toBeVisible();
    await expect(page.getByRole("article")).not.toHaveText(originalAppointment);
  });

  test("cancels an upcoming visit and moves it to the past tab", async ({ page }) => {
    const petId = await seedPet(customerOne);
    await seedAppointment({ user: customerOne, petId });
    await signIn(page, customerOne);
    await page.getByRole("button", { name: "Cancel" }).click();
    await page.getByRole("button", { name: "Cancel appointment" }).click();
    await page.getByRole("link", { name: /Past & cancelled/ }).click();

    await expect(page.getByText("Cancelled")).toBeVisible();
    await expect(page.getByText("Bath & Brush")).toBeVisible();
  });

  test("locks a visit inside the twenty-four-hour window and shows the salon phone", async ({ page }) => {
    const petId = await seedPet(customerOne);
    await seedAppointment({
      user: customerOne,
      petId,
      startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });
    await signIn(page, customerOne);

    await expect(page.getByText(/Inside the 24-hour window/)).toBeVisible();
    await expect(page.getByText(/\(718\) 555-0148/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Reschedule" })).toHaveCount(0);
  });
});
