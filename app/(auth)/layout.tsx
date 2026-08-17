import type { ReactNode } from "react";

import { Badge } from "../../components/core/badge";
import { Icon } from "../../components/core/icon";
import { Logotype } from "../../components/core/logotype";

const valuePoints = [
  ["calendar-check", "Real availability", "Live appointment times already include the cleanup buffer our groomers need."],
  ["dog", "One profile per dog", "Coat, temperament, allergies, and visit history stay together."],
  ["refresh-cw", "Changes without the phone tag", "Reschedule or cancel online up to 24 hours before a visit."],
] as const;

export default function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <main id="main-content" className="grid min-h-dvh bg-page-alt lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="flex flex-col justify-center border-subtle-border bg-card px-6 py-10 sm:px-12 lg:border-r lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-12 flex items-center justify-between gap-4">
            <Logotype size="md" />
            <Badge tone="primary" size="sm">Customer portal</Badge>
          </div>
          {children}
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-spruce-950 px-12 py-16 [--text-body:var(--spruce-100)] [--text-heading:var(--sand-50)] [--text-muted:var(--spruce-200)] lg:flex lg:items-center xl:px-20">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 size-[420px] rounded-full border border-spruce-800/70" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 bottom-8 size-56 rounded-full border border-spruce-800/50" />

        <div className="relative z-10 w-full max-w-xl">
          <p className="mb-4 [font:var(--type-overline)] tracking-(--tracking-caps) text-apricot-300 uppercase">
            Calm care, clearly organized
          </p>
          <h2 className="max-w-lg [font:var(--type-display)] text-5xl leading-[1.04] tracking-tight">
            Brooklyn&apos;s calmest grooming appointments.
          </h2>
          <p className="mt-5 max-w-lg [font:var(--type-body)] leading-relaxed text-spruce-100">
            A quieter way to plan every visit—from the first puppy introduction to a familiar full groom.
          </p>

          <div className="mt-10 max-w-xl divide-y divide-spruce-800 border-y border-spruce-800">
            {valuePoints.map(([icon, title, body]) => (
              <div key={title} className="flex gap-4 py-5">
                <span className="grid size-10 flex-none place-items-center rounded-md border border-spruce-700 bg-spruce-900 text-apricot-300">
                  <Icon name={icon} size={18} />
                </span>
                <div>
                  <h3 className="[font:var(--type-body-strong)]">{title}</h3>
                  <p className="mt-1 mb-0 [font:var(--type-small)] leading-relaxed text-spruce-100">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 inline-flex items-center gap-2 [font:var(--type-caption)] text-spruce-200">
            <Icon name="map-pin" size={14} />
            Court Street, Brooklyn · Mon–Fri 9–6, Sat 9–4
          </p>
        </div>
      </aside>
    </main>
  );
}
