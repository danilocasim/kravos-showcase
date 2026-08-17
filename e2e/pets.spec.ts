import { expect, test } from "@playwright/test";

import { signIn, signOut } from "./fixtures/auth";
import { resetCustomerData, requireUserId, seedAppointment, seedPet } from "./fixtures/seed";
import { customerOne, customerTwo } from "./fixtures/test-users";

test.describe("pet management", () => {
  test.beforeEach(async () => {
    await resetCustomerData(await requireUserId(customerOne));
    await resetCustomerData(await requireUserId(customerTwo));
  });

  test("shows the empty state when the customer has no pets", async ({ page }) => {
    await signIn(page, customerOne);
    await page.getByRole("link", { name: "Pets" }).click();

    await expect(page.getByRole("heading", { name: "No pets yet" })).toBeVisible();
  });

  test("adds a pet and shows it in the list", async ({ page }) => {
    await signIn(page, customerOne);
    await page.goto("/pets");
    await page.getByRole("button", { name: "Add a pet" }).first().click();
    await page.getByLabel("Name").fill("Biscuit");
    await page.getByLabel("Breed").fill("Cockapoo");
    await page.getByLabel("Size").selectOption("MEDIUM");
    await page.getByLabel("Age in years").fill("3");
    await page.getByRole("button", { name: "Save pet" }).click();

    await expect(page.getByRole("heading", { name: "Biscuit", exact: true })).toBeVisible();
    await expect(page.getByText(/Cockapoo/)).toBeVisible();
  });

  test("edits a pet's breed and shows the new value", async ({ page }) => {
    await signIn(page, customerOne);
    await page.goto("/pets");
    await page.getByRole("button", { name: "Add a pet" }).first().click();
    await page.getByLabel("Name").fill("Moose");
    await page.getByLabel("Breed").fill("Mixed");
    await page.getByLabel("Size").selectOption("LARGE");
    await page.getByLabel("Age in years").fill("5");
    await page.getByRole("button", { name: "Save pet" }).click();
    await page.getByRole("button", { name: "Edit Moose" }).click();
    await page.getByLabel("Breed").fill("Bernese Mountain Dog");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText(/Bernese Mountain Dog/)).toBeVisible();
  });

  test("removes a pet the customer has never booked", async ({ page }) => {
    await signIn(page, customerOne);
    await page.goto("/pets");
    await page.getByRole("button", { name: "Add a pet" }).first().click();
    await page.getByLabel("Name").fill("Scout");
    await page.getByLabel("Breed").fill("Beagle");
    await page.getByLabel("Size").selectOption("SMALL");
    await page.getByLabel("Age in years").fill("2");
    await page.getByRole("button", { name: "Save pet" }).click();
    await page.getByRole("button", { name: "Delete Scout" }).click();
    await page.getByRole("button", { name: "Remove pet" }).click();

    await expect(page.getByRole("heading", { name: "Scout" })).toHaveCount(0);
  });

  test("keeps a pet that has appointment history", async ({ page }) => {
    const petId = await seedPet(customerOne);
    await seedAppointment({ user: customerOne, petId });
    await signIn(page, customerOne);
    await page.goto("/pets");

    await page.getByRole("button", { name: "Delete Biscuit" }).click();
    await page.getByRole("button", { name: "Remove pet" }).click();

    await expect(page.getByText("This pet has appointment history")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Biscuit", exact: true })).toBeVisible();
  });

  test("keeps each customer's pets private", async ({ page }) => {
    await signIn(page, customerOne);
    await page.goto("/pets");
    await page.getByRole("button", { name: "Add a pet" }).first().click();
    await page.getByLabel("Name").fill("Private Pup");
    await page.getByLabel("Breed").fill("Mixed");
    await page.getByLabel("Size").selectOption("SMALL");
    await page.getByLabel("Age in years").fill("1");
    await page.getByRole("button", { name: "Save pet" }).click();
    await signOut(page);
    await signIn(page, customerTwo);
    await page.goto("/pets");

    await expect(page.getByText("Private Pup")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "No pets yet" })).toBeVisible();
  });
});
