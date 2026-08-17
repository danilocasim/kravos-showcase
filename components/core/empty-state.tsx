import type { ReactNode } from "react";

import { Icon, type IconName } from "./icon";

export interface EmptyStateProps {
  readonly icon?: IconName;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly compact?: boolean;
}

export const EmptyState = ({
  icon = "paw-print",
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) => (
  <div
    className={`flex flex-col items-center gap-2 rounded-lg border border-dashed border-default-border bg-card px-6 text-center ${
      compact ? "py-6" : "py-12"
    }`}
  >
    <span className="mb-1 grid size-11 place-items-center rounded-full bg-primary-soft text-spruce-600">
      <Icon name={icon} size={22} />
    </span>
    <h2 className="[font:var(--type-h4)] text-heading">{title}</h2>
    {description !== undefined ? (
      <p className="max-w-[340px] [font:var(--type-small)] text-muted">
        {description}
      </p>
    ) : null}
    {action !== undefined ? <div className="mt-3">{action}</div> : null}
  </div>
);
