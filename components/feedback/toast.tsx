"use client";

import { Icon } from "../core/icon";

export interface ToastProps {
  readonly title: string;
  readonly description?: string;
  readonly onDismiss: () => void;
  readonly tone?: "success" | "info" | "danger";
}

export const Toast = ({
  title,
  description,
  onDismiss,
  tone = "success",
}: ToastProps) => (
  <div
    role={tone === "danger" ? "alert" : "status"}
    className="flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 rounded-md bg-inverse-surface p-4 text-inverse shadow-overlay"
  >
    <span className={tone === "danger" ? "text-danger-500" : "text-spruce-300"}>
      <Icon name={tone === "danger" ? "circle-alert" : tone === "info" ? "info" : "circle-check"} size={18} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="[font:var(--type-body-strong)]">{title}</p>
      {description !== undefined ? (
        <p className="mt-0.5 [font:var(--type-small)] text-spruce-200">{description}</p>
      ) : null}
    </div>
    <button type="button" aria-label="Dismiss" onClick={onDismiss} className="text-spruce-300">
      <Icon name="x" size={16} />
    </button>
  </div>
);
