import { describe, expect, it } from "vitest";

import contract from "../doc/openapi.v1.json";

type Contract = {
  readonly openapi: string;
  readonly info: { readonly version: string };
  readonly paths: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  readonly components: {
    readonly schemas: Readonly<Record<string, unknown>>;
    readonly securitySchemes: Readonly<Record<string, unknown>>;
  };
};

const apiContract = contract as Contract;

const requiredOperations = [
  ["/api/v1/services", "get"],
  ["/api/v1/groomers", "get"],
  ["/api/v1/pets", "get"],
  ["/api/v1/pets", "post"],
  ["/api/v1/pets/{petId}", "patch"],
  ["/api/v1/pets/{petId}", "delete"],
  ["/api/v1/availability/search", "post"],
  ["/api/v1/appointments", "get"],
  ["/api/v1/appointments", "post"],
  ["/api/v1/appointments/{appointmentId}/reschedule", "post"],
  ["/api/v1/appointments/{appointmentId}/cancel", "post"],
] as const;

const kravosOperations = [
  ["/api/v1/integrations/kravos/catalog", "post"],
  ["/api/v1/integrations/kravos/customers/resolve", "post"],
  ["/api/v1/integrations/kravos/customers/context", "post"],
  ["/api/v1/integrations/kravos/booking/options", "post"],
  ["/api/v1/integrations/kravos/booking/confirm", "post"],
  ["/api/v1/integrations/kravos/booking/reschedule", "post"],
  ["/api/v1/integrations/kravos/availability/search", "post"],
  ["/api/v1/integrations/kravos/appointments/create", "post"],
  ["/api/v1/integrations/kravos/appointments/reschedule", "post"],
  ["/api/v1/integrations/kravos/appointments/cancel", "post"],
] as const;

const getOperation = (path: string, method: string) => {
  const operation = apiContract.paths[path]?.[method];
  expect(operation, `${method.toUpperCase()} ${path} must be documented`).toBeDefined();

  return operation as {
    readonly operationId?: unknown;
    readonly security?: unknown;
    readonly responses?: Readonly<Record<string, unknown>>;
  };
};

describe("OpenAPI v1 contract", () => {
  it("documents every Kravos custom-tool operation with session-or-bearer authentication", () => {
    expect(apiContract.components.securitySchemes).toHaveProperty("KravosBearer");
    expect(apiContract.components.securitySchemes).toHaveProperty(
      "DemoConciergeMarker",
    );

    for (const [path, method] of kravosOperations) {
      const operation = getOperation(path, method);
      expect(operation.security).toEqual([
        { SupabaseSession: [] },
        { KravosBearer: [] },
        ...(path.includes("/booking/") ? [{ DemoConciergeMarker: [] }] : []),
      ]);
      expect(operation.responses).toHaveProperty(
        path.endsWith("/appointments/create") || path.endsWith("/booking/confirm")
          ? "201"
          : "200",
      );
      expect(operation.responses).toHaveProperty("401");
      expect(operation.responses).toHaveProperty("422");
      expect(operation.responses).toHaveProperty("500");
    }
  });

  it("defines every public API operation, version, and cookie-session requirement", () => {
    expect(apiContract.openapi).toMatch(/^3\.0\./);
    expect(apiContract.info.version).toBe("1.0.0");
    expect(apiContract.components.securitySchemes).toHaveProperty("SupabaseSession");

    for (const [path, method] of requiredOperations) {
      const operation = getOperation(path, method);
      expect(operation.operationId).toEqual(expect.any(String));
      expect(operation.security).toEqual([{ SupabaseSession: [] }]);
      expect(operation.responses).toHaveProperty("401");
      expect(operation.responses).toHaveProperty("500");

      if (path.includes("{") || method === "post") {
        expect(operation.responses).toHaveProperty("422");
      }
    }
  });

  it("documents every lifecycle error code at the status returned by the server", () => {
    const operation = (path: string, method: string) =>
      apiContract.paths[path]?.[method] as {
        readonly responses: Readonly<Record<string, { readonly $ref?: string }>>;
      };
    const responseExample = (reference: string) => {
      const responseName = reference.replace("#/components/responses/", "");
      const response = (contract as {
        readonly components: {
          readonly responses: Record<
            string,
            {
              readonly content: {
                readonly "application/json": {
                  readonly example?: unknown;
                  readonly examples?: Record<string, { readonly value: unknown }>;
                };
              };
            }
          >;
        };
      }).components.responses[responseName];
      expect(response, `Response component ${responseName} must exist`).toBeDefined();
      const mediaType = response!.content["application/json"];
      return (
        mediaType.example ??
        (mediaType.examples === undefined
          ? undefined
          : Object.values(mediaType.examples)[0]?.value)
      );
    };

    const create = operation("/api/v1/appointments", "post");
    const reschedule = operation(
      "/api/v1/appointments/{appointmentId}/reschedule",
      "post",
    );
    const cancel = operation("/api/v1/appointments/{appointmentId}/cancel", "post");

    expect(responseExample(create.responses["404"]?.$ref ?? "")).toMatchObject({
      error: { code: "PET_NOT_FOUND" },
    });
    expect(responseExample(create.responses["409"]?.$ref ?? "")).toMatchObject({
      error: { code: "SLOT_UNAVAILABLE" },
    });
    expect(responseExample(reschedule.responses["403"]?.$ref ?? "")).toMatchObject({
      error: { code: "CANCELLATION_CUTOFF_PASSED" },
    });
    expect(responseExample(reschedule.responses["404"]?.$ref ?? "")).toMatchObject({
      error: { code: "APPOINTMENT_NOT_FOUND" },
    });
    expect(responseExample(cancel.responses["409"]?.$ref ?? "")).toMatchObject({
      error: { code: "APPOINTMENT_NOT_CHANGEABLE" },
    });
  });

  it("declares the public error-code alternatives for lifecycle conflicts", () => {
    const responseExample = (responseName: string) => {
      const responses = (contract as unknown as {
        readonly components: {
          readonly responses: Record<
            string,
            {
              readonly content: {
                readonly "application/json": {
                  readonly examples?: Record<string, { readonly value: unknown }>;
                };
              };
            }
          >;
        };
      }).components.responses;
      const response = responses[responseName];
      expect(response, `Response component ${responseName} must exist`).toBeDefined();
      const example = response?.content["application/json"].examples?.slotUnavailable;
      expect(example, `Response component ${responseName} needs slotUnavailable`).toBeDefined();

      return example?.value;
    };
    const create = apiContract.paths["/api/v1/appointments"]?.post as {
      readonly responses: Readonly<Record<string, { readonly $ref: string }>>;
    };

    const conflictReference = create.responses["409"]?.$ref;
    expect(conflictReference).toEqual("#/components/responses/CreateAppointmentConflict");
    expect(responseExample("CreateAppointmentConflict")).toMatchObject({
      error: {
        code: "SLOT_UNAVAILABLE",
        message: "This appointment time is no longer available.",
      },
    });
  });

  it("reuses complete success, validation, and error schemas instead of undocumented inline payloads", () => {
    const schemaNames = Object.keys(apiContract.components.schemas);
    expect(schemaNames).toEqual(
      expect.arrayContaining([
        "ErrorResponse",
        "ValidationErrorResponse",
        "Service",
        "Groomer",
        "Pet",
        "Appointment",
        "AvailabilityResult",
      ]),
    );

    for (const [path, method] of requiredOperations) {
      const operation = getOperation(path, method);
      const responses = operation.responses ?? {};
      const createsResource =
        (path === "/api/v1/pets" || path === "/api/v1/appointments") &&
        method === "post";
      expect(responses).toHaveProperty(createsResource ? "201" : "200");
    }
  });
});
