/** Roles persisted in public.profiles and authorized by the database. */
export type ApplicationRole = "CUSTOMER" | "ADMIN";

/** Minimal verified identity that server code may pass to domain use cases. */
export interface AuthenticatedActor {
  readonly id: string;
  readonly role: ApplicationRole;
}

/** Test seam and implementation contract for obtaining a verified actor. */
export interface AuthDependencies {
  readonly getVerifiedUserId: () => Promise<string | null>;
  readonly getProfile: (
    userId: string,
  ) => Promise<AuthenticatedActor | null>;
}

/** A predictable unauthenticated error for Route Handlers and Server Actions. */
export class AuthenticationRequiredError extends Error {
  public readonly code = "AUTHENTICATION_REQUIRED";
  public readonly status = 401;

  public constructor() {
    super("Authentication is required.");
    this.name = "AuthenticationRequiredError";
  }
}

/** A predictable authenticated-but-not-authorized error. */
export class AuthorizationRequiredError extends Error {
  public readonly code = "ADMIN_REQUIRED";
  public readonly status = 403;

  public constructor() {
    super("Administrator access is required.");
    this.name = "AuthorizationRequiredError";
  }
}

/**
 * Gets the optional actor exclusively from verified authentication and the
 * database-backed application profile. It deliberately accepts no `customerId`,
 * role, request-body, or other caller-controlled identity input.
 *
 * @param dependencies - Server-only authentication and profile lookup functions.
 * @returns The verified actor, or null for missing/invalid authentication or an
 *   absent application profile.
 */
export const getOptionalActor = async (
  dependencies: AuthDependencies,
): Promise<AuthenticatedActor | null> => {
  const verifiedUserId = await dependencies.getVerifiedUserId();

  if (verifiedUserId === null) {
    return null;
  }

  const profile = await dependencies.getProfile(verifiedUserId);

  if (profile === null || profile.id !== verifiedUserId) {
    return null;
  }

  return profile;
};

/**
 * Requires a verified authenticated actor.
 *
 * @param dependencies - Server-only authentication and profile lookup functions.
 * @returns The verified actor.
 * @throws AuthenticationRequiredError if no verified actor is available.
 */
export const requireAuthenticatedActor = async (
  dependencies: AuthDependencies,
): Promise<AuthenticatedActor> => {
  const actor = await getOptionalActor(dependencies);

  if (actor === null) {
    throw new AuthenticationRequiredError();
  }

  return actor;
};

/**
 * Requires an actor whose database-backed application role is ADMIN.
 *
 * @param dependencies - Server-only authentication and profile lookup functions.
 * @returns The verified administrator.
 * @throws AuthenticationRequiredError if no verified actor is available.
 * @throws AuthorizationRequiredError if the verified actor is not an admin.
 */
export const requireAdmin = async (
  dependencies: AuthDependencies,
): Promise<AuthenticatedActor> => {
  const actor = await requireAuthenticatedActor(dependencies);

  if (actor.role !== "ADMIN") {
    throw new AuthorizationRequiredError();
  }

  return actor;
};
