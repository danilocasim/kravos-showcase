"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "../core/button";

export interface SubmitButtonProps
  extends Omit<ButtonProps, "loading" | "type"> {
  readonly pendingLabel?: string;
}

export const SubmitButton = ({
  children,
  pendingLabel = "Saving…",
  ...props
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
};
