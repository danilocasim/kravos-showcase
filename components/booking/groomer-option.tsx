import type { InputHTMLAttributes } from "react";

import { ChoiceCard } from "../forms/choice-card";

export interface GroomerOptionViewModel {
  readonly name: string;
  readonly description?: string;
  readonly hoursLabel?: string;
  /** Caller-supplied initials for a named groomer. */
  readonly initials?: string;
  readonly anyAvailable?: boolean;
}

export interface GroomerOptionProps {
  readonly groomer: GroomerOptionViewModel;
  readonly inputProps: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "children" | "className" | "type"
  >;
  readonly disabledReason?: string;
  readonly className?: string;
}

/** A named or any-available groomer choice with no qualification logic inside. */
export const GroomerOption = ({
  groomer,
  inputProps,
  disabledReason,
  className,
}: GroomerOptionProps) => {
  const details =
    groomer.description !== undefined && groomer.hoursLabel !== undefined
      ? `${groomer.description} · ${groomer.hoursLabel}`
      : (groomer.description ?? groomer.hoursLabel);

  return (
    <ChoiceCard
      title={groomer.name}
      {...(details === undefined ? {} : { description: details })}
      {...(groomer.anyAvailable === true ? { icon: "users" as const } : {})}
      {...(groomer.anyAvailable === true || groomer.initials === undefined
        ? {}
        : { avatar: groomer.initials })}
      control="radio"
      {...(disabledReason === undefined ? {} : { disabledReason })}
      inputProps={inputProps}
      {...(className === undefined ? {} : { className })}
    />
  );
};
