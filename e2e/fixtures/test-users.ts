/**
 * The two customers every end-to-end run signs in as.
 *
 * Two distinct accounts are needed because Task 11 must prove that one customer
 * cannot see another's pets, and Task 12 must produce a booking conflict from a
 * second customer without touching the first one's session.
 */

export interface TestUser {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
}

/* A local-stack-only password. The stack is disposable and its keys are the
   Supabase CLI's published defaults, so this is not a credential of record. */
const localTestPassword = "paw-polish-e2e-password";

export const customerOne: TestUser = {
  email: "customer.one@paw-polish.test",
  password: localTestPassword,
  displayName: "Ada Customer",
};

export const customerTwo: TestUser = {
  email: "customer.two@paw-polish.test",
  password: localTestPassword,
  displayName: "Bo Customer",
};

export const adminUser: TestUser = {
  email: "admin@paw-polish.test",
  password: localTestPassword,
  displayName: "Ari Admin",
};

export const allTestUsers: ReadonlyArray<TestUser> = [customerOne, customerTwo];
