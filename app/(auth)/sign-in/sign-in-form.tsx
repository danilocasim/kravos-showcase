"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { signInAction } from "../actions";
import { initialActionResult } from "../../action-result";
import { Alert } from "../../../components/core/alert";
import { Icon } from "../../../components/core/icon";
import { Field } from "../../../components/forms/field";
import { Input } from "../../../components/forms/input";
import { SubmitButton } from "../../../components/forms/submit-button";
import { presentErrorCode } from "../../../lib/ui/error-messages";

export const SignInForm = ({ initialErrorCode, next }: { readonly initialErrorCode?: string; readonly next: string }) => {
  const [state, action] = useActionState(signInAction, initialActionResult);
  const formRef = useRef<HTMLFormElement>(null);
  const code = state.status === "error" ? state.code : initialErrorCode;

  useEffect(() => {
    if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }, [state]);

  const presentation = code === undefined ? null : presentErrorCode(code);

  return (
    <form ref={formRef} action={action} noValidate className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      {presentation !== null ? (
        <Alert tone="danger" title={presentation.title} code={presentation.code}>
          {presentation.body}
        </Alert>
      ) : null}
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
        error={state.status === "error" ? state.fieldErrors?.password : undefined}
      >
        <Input name="password" type="password" autoComplete="current-password" />
      </Field>
      <SubmitButton fullWidth size="lg" iconRight="arrow-right" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
      <div className="flex items-center justify-between [font:var(--type-small)]">
        <Link href="/sign-up" className="text-link hover:text-link-hover hover:underline">
          Create an account
        </Link>
      </div>
      <p className="mt-1 inline-flex items-start gap-1.5 [font:var(--type-caption)] text-subtle">
        <Icon name="shield-check" size={14} className="mt-0.5 flex-none" />
        An account keeps your pets&apos; details and appointment history in one place.
      </p>
    </form>
  );
};
