import { expect, test } from "@playwright/test";

test("a public visitor sees the salon before authentication", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Calm grooming for Brooklyn dogs." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "The right amount of care, clearly priced." })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("link", { name: "Book a visit" }).first().click();
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
});
