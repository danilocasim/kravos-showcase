import type { InputHTMLAttributes } from "react";

import { ChoiceCard } from "../forms/choice-card";
import type { IconName } from "../core/icon";

export interface ServiceOptionViewModel {
  readonly name: string;
  readonly description?: string;
  /** Already formatted by the caller from the server-derived duration. */
  readonly durationLabel?: string;
  /** Already formatted by the caller from the persisted price. */
  readonly priceLabel?: string;
  readonly kind: "BASE" | "ADD_ON";
  readonly icon?: IconName;
}

export interface ServiceOptionProps {
  readonly service: ServiceOptionViewModel;
  readonly inputProps: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "children" | "className" | "type"
  >;
  readonly disabledReason?: string;
  readonly className?: string;
}

const serviceIcons: Readonly<Partial<Record<string, IconName>>> = {
  "Bath & Brush": "droplets",
  "Full Groom": "scissors",
  "Puppy Introduction Groom": "heart",
  "Nail Trim": "paw-print",
  "De-shedding Treatment": "sparkles",
};

/** A catalogue choice that renders only caller-supplied prices and durations. */
export const ServiceOption = ({
  service,
  inputProps,
  disabledReason,
  className,
}: ServiceOptionProps) => {
  const details =
    service.description !== undefined && service.durationLabel !== undefined ? (
      <>
        {service.description} <span className="text-subtle">· {service.durationLabel}</span>
      </>
    ) : (service.description ?? service.durationLabel);

  return (
    <ChoiceCard
      title={service.name}
      {...(details === undefined ? {} : { description: details })}
      {...(service.priceLabel === undefined ? {} : { meta: service.priceLabel })}
      icon={service.icon ?? serviceIcons[service.name] ?? "scissors"}
      control={service.kind === "ADD_ON" ? "checkbox" : "radio"}
      {...(disabledReason === undefined ? {} : { disabledReason })}
      inputProps={inputProps}
      {...(className === undefined ? {} : { className })}
    />
  );
};
