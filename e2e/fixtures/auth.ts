import { expect, type Page } from "@playwright/test";

import type { TestUser } from "./test-users";

/**
 * Signs a customer in through the real form.
 *
 * A saved `storageState` is deliberately not used: the local stack has refresh
 * token rotation on with a 10 second reuse interval, so a stored refresh token is
 * rotated away by the first test that loads it and every later test starts signed
 * out. Signing in per test costs about a second and removes that whole class of
 * flake.
 *
 * @param page - The page to drive.
 * @param user - The customer to sign in as.
 */
export const signIn = async (page: Page, user: TestUser): Promise<void> => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/appointments/);
};

/**
 * Signs the current customer out through the header control.
 *
 * @param page - The page to drive.
 */
export const signOut = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(page).toHaveURL(/\/sign-in/);
};
