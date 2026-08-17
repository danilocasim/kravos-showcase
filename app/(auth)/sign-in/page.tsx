import { safeInternalNextPath } from "../../../lib/ui/auth/next-path";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly error?: string | string[]; readonly next?: string | string[] }>;
}) {
  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : undefined;
  const next = safeInternalNextPath(typeof query.next === "string" ? query.next : null);

  return (
    <>
      <h1 className="[font:var(--type-h1)] tracking-tight text-heading">Welcome back</h1>
      <p className="mt-2 mb-8 [font:var(--type-body)] text-muted">
        Sign in to book a visit, manage your pets, and change appointments.
      </p>
      <SignInForm next={next} {...(error === undefined ? {} : { initialErrorCode: error })} />
    </>
  );
}
