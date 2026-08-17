import { describe, expect, it } from "vitest";

import { customerNavigationItems } from "./items";

describe("customer shell navigation", () => {
  it("adds an admin-console destination only for a verified admin role", () => {
    expect(customerNavigationItems("CUSTOMER").map((item) => item.href)).toEqual([
      "/appointments",
      "/pets",
    ]);
    expect(customerNavigationItems("ADMIN")).toContainEqual({
      href: "/admin",
      label: "Admin console",
      icon: "shield-check",
    });
  });
});
