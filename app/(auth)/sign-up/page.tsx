import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  return (
    <>
      <h1 className="[font:var(--type-h1)] tracking-tight text-heading">Create your account</h1>
      <p className="mt-2 mb-8 [font:var(--type-body)] text-muted">
        Save each dog once, then booking takes about a minute.
      </p>
      <SignUpForm />
    </>
  );
}
