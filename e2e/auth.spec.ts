import { expect, test } from "@playwright/test";

import { signIn, signOut } from "./fixtures/auth";
import { customerOne, customerTwo } from "./fixtures/test-users";
import { removeUserByEmail, requireUserId, resetCustomerData, seedPet } from "./fixtures/seed";

test.describe("customer authentication", () => {
  test("signs a customer in and lands on my appointments", async ({ page }) => {
    await signIn(page, customerOne);

    await expect(
      page.getByRole("heading", { name: "My appointments" }),
    ).toBeVisible();
    await expect(page.getByText("AC", { exact: true })).toBeVisible();
  });

  test("explains an incorrect password without saying which field was wrong", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(customerOne.email);
    await page.getByLabel("Password").fill("not-the-right-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    const alert = page.getByRole("alert").filter({ hasText: "That email and password do not match" });

    await expect(alert).toContainText("That email and password do not match");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("keeps the customer on the form when a field is empty", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Enter your email address.")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("creates an account and signs the new customer straight in", async ({ page }) => {
    const email = "new.customer@paw-polish.test";
    await removeUserByEmail(email);

    await page.goto("/sign-up");
    await page.getByLabel("Name").fill("New Customer");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("new-customer-password");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/appointments/);
    await expect(page.getByText("NC", { exact: true })).toBeVisible();
    await removeUserByEmail(email);
  });

  test("returns to validated booking state after signing in", async ({ page }) => {
    await resetCustomerData(await requireUserId(customerOne));
    const petId = await seedPet(customerOne);
    const intent = "00000000-0000-4000-8000-000000000099";
    await page.goto(`/book?intent=${intent}&step=services&petId=${petId}`);
    await expect(page).toHaveURL(/\/sign-in\?next=/);

    await page.getByLabel("Email").fill(customerOne.email);
    await page.getByLabel("Password").fill(customerOne.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("heading", { name: "Choose services" })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`petId=${petId}`));
  });

  test("signs the customer out and returns them to sign in", async ({
    page,
  }) => {
    await signIn(page, customerOne);
    await signOut(page);

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("sends a signed-out visitor from a protected page to sign in", async ({
    page,
  }) => {
    await page.goto("/pets");

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("keeps the inverse brand panel readable", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chromium", "The brand panel is intentionally hidden on narrow screens.");
    await page.goto("/sign-in");
    const panel = page.getByRole("complementary");
    const contrast = await panel.evaluate((element) => {
      const heading = element.querySelector("h2");
      if (heading === null) return 0;
      const channels = (value: string): [number, number, number] => {
        const parsed = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
        return [parsed[0] ?? 0, parsed[1] ?? 0, parsed[2] ?? 0];
      };
      const luminance = ([red, green, blue]: [number, number, number]): number => {
        const linear = [red, green, blue].map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
      };
      const foreground = luminance(channels(getComputedStyle(heading).color));
      const background = luminance(channels(getComputedStyle(element).backgroundColor));
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });

  test("signs in as either customer", async ({ page }) => {
    await signIn(page, customerTwo);

    await expect(page.getByText("BC", { exact: true })).toBeVisible();
  });
});
