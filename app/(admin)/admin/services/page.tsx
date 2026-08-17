import { redirect } from "next/navigation";

import { Badge } from "../../../../components/core/badge";
import { Card } from "../../../../components/core/card";
import { EmptyState } from "../../../../components/core/empty-state";
import { getRequestProfile } from "../../../../lib/auth/profile";
import { createSupabaseBookingUseCases } from "../../../../lib/booking/server";
import { formatMoney } from "../../../../lib/ui/format/money";

export default async function AdminServicesPage() {
  const profile = await getRequestProfile();
  if (profile === null) redirect(`/sign-in?${new URLSearchParams({ next: "/admin/services" })}`);
  if (profile.role !== "ADMIN") redirect("/appointments");
  const useCases = await createSupabaseBookingUseCases();
  const services = await useCases.listActiveServices();

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <p className="[font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">Catalogue reference</p>
      <h1 className="mt-1 [font:var(--type-h1)] tracking-tight text-heading">Services</h1>
      <p className="mt-2 max-w-2xl text-muted">Read-only persisted duration and pricing. Appointment rows retain the snapshots applied when each booking was confirmed.</p>
      {services.length > 0 ? (
        <Card padding="none" className="mt-6 overflow-hidden">
          <ul className="divide-y divide-subtle-border">
            {services.map((service) => (
              <li key={service.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-heading">{service.name}</h2><Badge size="sm" tone={service.kind === "BASE" ? "primary" : "accent"}>{service.kind === "BASE" ? "Base service" : "Add-on"}</Badge>{service.isStandaloneEligible ? <Badge size="sm">Standalone eligible</Badge> : null}</div>
                  <p className="mt-1 [font:var(--type-small)] text-muted">{service.description}</p>
                </div>
                <div className="flex gap-4 sm:block sm:text-right"><span className="font-semibold text-heading">{formatMoney(service.priceCents)}</span><span className="block [font:var(--type-caption)] text-subtle">{service.durationMinutes} min</span></div>
              </li>
            ))}
          </ul>
        </Card>
      ) : <div className="mt-6"><EmptyState icon="scissors" title="No active services" description="Active catalogue services will appear here when configured." /></div>}
    </div>
  );
}
