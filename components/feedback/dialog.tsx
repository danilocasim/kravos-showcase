"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

import { Icon } from "../core/icon";

export interface DialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose: () => void;
  readonly tone?: "default" | "warning" | "danger";
  readonly width?: "md" | "lg";
}

export const Dialog = ({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  tone = "default",
  width = "md",
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-xl border border-subtle-border bg-card p-0 text-body shadow-overlay ${
        width === "lg" ? "max-w-[560px]" : "max-w-[480px]"
      }`}
    >
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        {tone !== "default" ? (
          <span
            className={`grid size-9 flex-none place-items-center rounded-full ${
              tone === "danger"
                ? "bg-danger-50 text-danger-500"
                : "bg-warning-50 text-warning-700"
            }`}
          >
            <Icon name={tone === "danger" ? "triangle-alert" : "circle-alert"} size={19} />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="[font:var(--type-h3)] tracking-tight text-heading">
            {title}
          </h2>
          {description !== undefined ? (
            <p id={descriptionId} className="mt-1 [font:var(--type-small)] text-muted">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="grid size-11 flex-none place-items-center rounded-md text-muted hover:bg-sunken focus-visible:outline-2 focus-visible:outline-focus sm:size-8"
        >
          <Icon name="x" size={17} />
        </button>
      </div>
      {children !== undefined ? <div className="px-5 pb-5 sm:px-6">{children}</div> : null}
      {footer !== undefined ? (
        <div className="flex flex-col-reverse gap-2 border-t border-subtle-border bg-sunken px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
};
