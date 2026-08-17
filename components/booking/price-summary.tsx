import type { ReactNode } from "react";

import { Card } from "../core/card";
import { Icon } from "../core/icon";

export interface PriceSummaryLineViewModel {
  readonly key: string;
  readonly name: string;
  /** Already formatted by the caller from a persisted price snapshot. */
  readonly priceLabel: string;
  /** Already formatted by the caller from a server-derived duration. */
  readonly durationLabel?: string;
}

export interface PriceSummaryProps {
  readonly lines: ReadonlyArray<PriceSummaryLineViewModel>;
  readonly subtotalLabel: string;
  readonly totalDurationLabel?: string;
  readonly bufferLabel?: string;
  readonly footnote?: ReactNode;
  readonly className?: string;
}

/** Displays server-derived summary labels without calculating money or duration. */
export const PriceSummary = ({
  lines,
  subtotalLabel,
  totalDurationLabel,
  bufferLabel,
  footnote,
  className = "",
}: PriceSummaryProps) => (
  <Card tone="sunken" padding="md" className={className}>
    <dl className="flex flex-col gap-2">
      {lines.map((line) => (
        <div key={line.key} className="flex justify-between gap-4 [font:var(--type-body)]">
          <dt className="min-w-0 text-body">
            {line.name}
            {line.durationLabel !== undefined ? (
              <span className="text-subtle"> · {line.durationLabel}</span>
            ) : null}
          </dt>
          <dd className="flex-none [font:var(--type-mono)] text-body">
            {line.priceLabel}
          </dd>
        </div>
      ))}
    </dl>
    <div className="my-4 h-px bg-subtle-border" />
    <div className="flex items-baseline justify-between gap-4">
      <span className="[font:var(--type-body-strong)] text-heading">Subtotal</span>
      <span className="font-(family-name:--font-display) text-xl font-bold text-heading">
        {subtotalLabel}
      </span>
    </div>
    {totalDurationLabel !== undefined || bufferLabel !== undefined ? (
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 [font:var(--type-caption)] text-muted">
        {totalDurationLabel !== undefined ? (
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" size={12} />
            {totalDurationLabel}
          </span>
        ) : null}
        {bufferLabel !== undefined ? (
          <span className="inline-flex items-center gap-1.5">
            <Icon name="sparkles" size={12} />
            {bufferLabel}
          </span>
        ) : null}
      </div>
    ) : null}
    {footnote !== undefined ? (
      <div className="mt-3 [font:var(--type-caption)] text-subtle">{footnote}</div>
    ) : null}
  </Card>
);
