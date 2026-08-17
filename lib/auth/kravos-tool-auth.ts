import "server-only";

import { timingSafeEqual } from "node:crypto";

import type { AuthenticatedActor } from "./guards";
import { AuthenticationRequiredError } from "./guards";

export type KravosBookingPrincipal =
  | {
      readonly kind: "CUSTOMER_SESSION";
      readonly actor: AuthenticatedActor & { readonly role: "CUSTOMER" };
    }
  | { readonly kind: "KRAVOS_TOOL" };

export interface KravosToolAuthDependencies {
  readonly getOptionalActor: () => Promise<AuthenticatedActor | null>;
  readonly getBearerSecret: () => string;
  readonly isAllowedDemoRequest?: (request: Request) => boolean;
}

const bearerValue = (request: Request): string | null => {
  const authorization = request.headers.get("authorization");
  const match = authorization === null ? null : /^Bearer ([^\s]+)$/.exec(authorization);

  return match?.[1] ?? null;
};

const secretsMatch = (provided: string, configured: string): boolean => {
  const providedBytes = Buffer.from(provided);
  const configuredBytes = Buffer.from(configured);

  return (
    providedBytes.length === configuredBytes.length &&
    timingSafeEqual(providedBytes, configuredBytes)
  );
};

/** Resolves a customer session first, then the server-to-server Kravos bearer. */
export const createKravosToolAuthResolver = (
  dependencies: KravosToolAuthDependencies,
) =>
  async (request: Request): Promise<KravosBookingPrincipal> => {
    const actor = await dependencies.getOptionalActor();
    if (actor?.role === "CUSTOMER") {
      return {
        kind: "CUSTOMER_SESSION",
        actor: { id: actor.id, role: "CUSTOMER" },
      };
    }

    if (dependencies.isAllowedDemoRequest?.(request) === true) {
      return { kind: "KRAVOS_TOOL" };
    }

    const providedBearer = bearerValue(request);
    if (
      providedBearer === null ||
      !secretsMatch(providedBearer, dependencies.getBearerSecret())
    ) {
      throw new AuthenticationRequiredError();
    }

    return { kind: "KRAVOS_TOOL" };
  };
