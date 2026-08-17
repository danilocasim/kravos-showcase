import type { ApplicationRole } from "../../auth/guards";

export interface CustomerNavigationItem {
  readonly href: string;
  readonly label: string;
  readonly icon: "calendar-days" | "dog" | "shield-check";
}

const customerItems: ReadonlyArray<CustomerNavigationItem> = [
  { href: "/appointments", label: "Appointments", icon: "calendar-days" },
  { href: "/pets", label: "Pets", icon: "dog" },
];

/** Returns destinations appropriate to the verified database-backed role. */
export const customerNavigationItems = (
  role: ApplicationRole,
): ReadonlyArray<CustomerNavigationItem> => role === "ADMIN"
  ? [...customerItems, { href: "/admin", label: "Admin console", icon: "shield-check" }]
  : customerItems;
