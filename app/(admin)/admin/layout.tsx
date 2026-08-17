import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminHeader } from "../../../components/navigation/admin-header";
import { AdminNav } from "../../../components/navigation/admin-nav";
import { getRequestProfile } from "../../../lib/auth/profile";

export default async function AdminLayout({ children }: { readonly children: ReactNode }) {
  const profile = await getRequestProfile();
  if (profile === null) return children;
  if (profile.role !== "ADMIN") redirect("/appointments");

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <AdminHeader userName={profile.displayName} />
      <div className="mx-auto flex w-full max-w-(--container-wide) flex-1 flex-col lg:flex-row">
        <AdminNav />
        <main id="main-content" className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
