"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { signUpAction } from "../actions";
import { initialActionResult } from "../../action-result";
import { Alert } from "../../../components/core/alert";
import { Field } from "../../../components/forms/field";
import { Input } from "../../../components/forms/input";
import { SubmitButton } from "../../../components/forms/submit-button";
import { presentErrorCode } from "../../../lib/ui/error-messages";

export const SignUpForm = () => {
  const [state, action] = useActionState(signUpAction, initialActionResult);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }, [state]);

  const presentation =
    state.status === "error" || state.status === "pending"
      ? presentErrorCode(state.code)
      : null;

  return (
    <form ref={formRef} action={action} noValidate className="grid gap-4">
      {presentation !== null ? (
        <Alert
          tone={state.status === "pending" ? "info" : "danger"}
          title={presentation.title}
          code={presentation.code}
        >
          {presentation.body}
        </Alert>
      ) : null}
      <Field
        label="Name"
        htmlFor="displayName"
        required
        error={state.status === "error" ? state.fieldErrors?.displayName : undefined}
      >
        <Input name="displayName" autoComplete="name" />
      </Field>
      <Field
        label="Email"
        htmlFor="email"
        required
        error={state.status === "error" ? state.fieldErrors?.email : undefined}
      >
        <Input name="email" type="email" autoComplete="email" />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        required
        hint="Use at least 8 characters."
        error={state.status === "error" ? state.fieldErrors?.password : undefined}
      >
        <Input name="password" type="password" autoComplete="new-password" />
      </Field>
      <SubmitButton fullWidth size="lg" pendingLabel="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-center [font:var(--type-small)] text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-link hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
};
