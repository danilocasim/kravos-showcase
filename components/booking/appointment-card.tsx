import type { ReactNode } from "react";

import { Card } from "../core/card";
import { Icon } from "../core/icon";
import { StatusPill, type AppointmentStatus } from "../core/status-pill";

export interface AppointmentDateLabel {
  readonly weekday: string;
  readonly day: string;
  readonly month: string;
}

export interface AppointmentCardProps {
  readonly petName: string;
  /** Snapshotted service names in display order. */
  readonly services: ReadonlyArray<string>;
  readonly groomerName: string;
  readonly dateLabel: AppointmentDateLabel;
  readonly timeLabel: string;
  readonly endTimeLabel?: string;
  /** Already formatted by the caller from the appointment price snapshot. */
  readonly subtotalLabel?: string;
  readonly status?: AppointmentStatus;
  readonly reference?: string;
  readonly actions?: ReactNode;
  readonly lockedNote?: string;
  readonly compact?: boolean;
  readonly className?: string;
}

/** A customer-facing appointment summary with lifecycle state and action slots. */
export const AppointmentCard = ({
  petName,
  services,
  groomerName,
  dateLabel,
  timeLabel,
  endTimeLabel,
  subtotalLabel,
  status = "CONFIRMED",
  reference,
  actions,
  lockedNote,
  compact = false,
  className = "",
}: AppointmentCardProps) => (
  <Card
    as="article"
    padding={compact ? "sm" : "md"}
    className={`flex flex-col gap-4 ${status === "CANCELLED" ? "opacity-85" : ""} ${className}`}
  >
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="w-14 flex-none rounded-md border border-spruce-200 bg-primary-soft py-2 text-center">
        <div className="[font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">
          {dateLabel.weekday}
        </div>
        <div className="font-(family-name:--font-display) text-xl leading-tight font-bold text-spruce-900">
          {dateLabel.day}
        </div>
        <div className="[font:var(--type-caption)] text-spruce-700">
          {dateLabel.month}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="[font:var(--type-h4)] text-heading">
            {services.join(" + ")}
          </h2>
          <StatusPill status={status} />
        </div>
        <div className="flex flex-col gap-x-4 gap-y-1 [font:var(--type-small)] text-muted sm:flex-row sm:flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" size={14} />
            {timeLabel}
            {endTimeLabel !== undefined ? ` – ${endTimeLabel}` : null}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="dog" size={14} />
            {petName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="user-round" size={14} />
            {groomerName}
          </span>
          {subtotalLabel !== undefined ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="credit-card" size={14} />
              {subtotalLabel}
            </span>
          ) : null}
        </div>
        {reference !== undefined ? (
          <p className="m-0 [font:var(--type-mono)] text-xs text-subtle">
            {reference}
          </p>
        ) : null}
      </div>
    </div>
    {lockedNote !== undefined ? (
      <p className="m-0 flex items-start gap-1.5 rounded-sm border border-apricot-200 bg-warning-50 px-3 py-2 [font:var(--type-caption)] text-warning-700">
        <Icon name="lock" size={13} className="mt-0.5 flex-none" />
        {lockedNote}
      </p>
    ) : null}
    {actions !== undefined ? (
      <div className="flex flex-wrap gap-2 [&_a]:min-h-11 [&_button]:min-h-11 sm:[&_a]:min-h-(--control-h-sm) sm:[&_button]:min-h-(--control-h-sm)">
        {actions}
      </div>
    ) : null}
  </Card>
);
