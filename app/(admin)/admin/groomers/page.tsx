import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "../../../../components/core/badge";
import { Card } from "../../../../components/core/card";
import { EmptyState } from "../../../../components/core/empty-state";
import { getRequestProfile } from "../../../../lib/auth/profile";
import { createSupabaseBookingUseCases } from "../../../../lib/booking/server";

const linkClass = "inline-flex min-h-11 items-center justify-center rounded-md border border-default-border bg-card px-4 font-semibold text-body hover:border-strong-border hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export default async function AdminGroomersPage() {
  const profile = await getRequestProfile();
  if (profile === null) redirect(`/sign-in?${new URLSearchParams({ next: "/admin/groomers" })}`);
  if (profile.role !== "ADMIN") redirect("/appointments");
  const useCases = await createSupabaseBookingUseCases();
  const groomers = await useCases.listActiveGroomers();

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <p className="[font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">Team directory</p>
      <h1 className="mt-1 [font:var(--type-h1)] tracking-tight text-heading">Groomers</h1>
      <p className="mt-2 max-w-2xl text-muted">Read-only team details for schedule navigation. Qualifications and working hours remain server-managed in v1.</p>
      {groomers.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groomers.map((groomer) => (
            <Card key={groomer.id} className="flex flex-col">
              <div className="flex items-start gap-3">
                <span className="grid size-11 flex-none place-items-center rounded-full bg-apricot-100 font-bold text-spruce-900" aria-hidden="true">{groomer.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
                <div><h2 className="[font:var(--type-h3)] text-heading">{groomer.displayName}</h2><Badge tone="success" size="sm">Active</Badge></div>
              </div>
              <p className="mt-4 flex-1 [font:var(--type-small)] text-muted">{groomer.bio ?? "No public bio has been added."}</p>
              <Link href={`/admin?${new URLSearchParams({ groomerId: groomer.id })}`} className={`${linkClass} mt-5`}>View day schedule</Link>
            </Card>
          ))}
        </div>
      ) : <div className="mt-6"><EmptyState icon="users" title="No active groomers" description="Active groomers will appear here when configured." /></div>}
    </div>
  );
}
