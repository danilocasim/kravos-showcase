import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { createSupabaseBookingRepository } from "./supabase-repository";

const customerId = "00000000-0000-4000-8000-000000000801";
const petId = "00000000-0000-4000-8000-000000000802";

interface CapturedRequest {
  readonly body: string;
  readonly method: string;
  readonly url: URL;
}

const response = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const createTestClient = (requests: Array<CapturedRequest>) =>
  createClient("https://example.supabase.co", "sb_publishable_test_key", {
    global: {
      fetch: async (input, init) => {
        const request = new Request(input, init);
        const capturedRequest: CapturedRequest = {
          body: await request.text(),
          method: request.method,
          url: new URL(request.url),
        };
        requests.push(capturedRequest);

        if (
          capturedRequest.method === "POST" &&
          capturedRequest.url.pathname.endsWith("/rpc/list_confirmed_appointment_blocks")
        ) {
          return response([]);
        }
        if (
          capturedRequest.method === "POST" &&
          capturedRequest.url.pathname.includes("/rpc/")
        ) {
          return response([
            {
              id: petId,
              customer_id: customerId,
              pet_id: petId,
              groomer_id: "00000000-0000-4000-8000-000000000803",
              status: "CONFIRMED",
              starts_at: "2026-09-07T13:00:00.000Z",
              service_ends_at: "2026-09-07T14:00:00.000Z",
              blocked_until: "2026-09-07T14:15:00.000Z",
              subtotal_cents: 5500,
              applied_buffer_minutes: 15,
              cancelled_at: null,
            },
          ]);
        }
        if (capturedRequest.method === "POST") {
          return response({
            id: petId,
            owner_id: customerId,
            name: "Baxter",
            breed: "Beagle",
            size: "MEDIUM",
            age_years: 2,
            temperament: null,
            coat_condition: null,
            allergies: null,
            notes: null,
          });
        }
        if (capturedRequest.method === "PATCH") {
          return response({
            id: petId,
            owner_id: customerId,
            name: "Baxter",
            breed: "Beagle",
            size: "MEDIUM",
            age_years: 3,
            temperament: null,
            coat_condition: null,
            allergies: null,
            notes: null,
          });
        }
        if (capturedRequest.method === "DELETE") {
          return response({ id: petId });
        }

        return response([]);
      },
    },
  });

const findRequest = (
  requests: ReadonlyArray<CapturedRequest>,
  method: string,
  table: string,
): CapturedRequest => {
  const request = requests.find(
    (candidate) =>
      candidate.method === method && candidate.url.pathname.endsWith(`/${table}`),
  );

  if (request === undefined) {
    throw new Error(`Missing ${method} request for ${table}.`);
  }

  return request;
};

describe("createSupabaseBookingRepository", () => {
  it("maps catalogue queries and binds every pet mutation to the verified owner", async () => {
    const requests: Array<CapturedRequest> = [];
    const repository = createSupabaseBookingRepository(createTestClient(requests));

    await repository.listServices();
    await repository.listGroomerTimeOff("groomer-maya");
    await repository.listConfirmedAppointmentBlocks("groomer-maya", {
      startsAt: new Date("2026-09-07T00:00:00.000Z"),
      endsAt: new Date("2026-09-08T00:00:00.000Z"),
    });
    await repository.createConfirmedAppointment({
      petId,
      groomerId: "00000000-0000-4000-8000-000000000803",
      selectedServiceIds: ["00000000-0000-4000-8000-000000000804"],
      startsAt: "2026-09-07T13:00:00.000Z",
      idempotencyKey: "00000000-0000-4000-8000-000000000805",
    });
    await repository.rescheduleConfirmedAppointment({
      appointmentId: petId,
      groomerId: "00000000-0000-4000-8000-000000000803",
      selectedServiceIds: ["00000000-0000-4000-8000-000000000804"],
      startsAt: "2026-09-08T13:00:00.000Z",
      idempotencyKey: "00000000-0000-4000-8000-000000000806",
    });
    await repository.cancelConfirmedAppointment({
      appointmentId: petId,
      idempotencyKey: "00000000-0000-4000-8000-000000000807",
    });
    await repository.listAppointmentsByCustomer(customerId);
    await repository.createPet({
      ownerId: customerId,
      name: "Baxter",
      breed: "Beagle",
      size: "MEDIUM",
      ageYears: 2,
      temperament: null,
      coatCondition: null,
      allergies: null,
      notes: null,
    });
    await repository.updatePetByOwner(petId, customerId, { ageYears: 3 });
    await repository.deletePetByOwner(petId, customerId);

    const servicesRequest = findRequest(requests, "GET", "services");
    expect(servicesRequest.url.searchParams.get("order")).toBe("name.asc");

    const timeOffRequest = findRequest(requests, "GET", "groomer_time_off");
    expect(timeOffRequest.url.searchParams.get("groomer_id")).toBe(
      "eq.groomer-maya",
    );

    const availabilityRequest = findRequest(
      requests,
      "POST",
      "rpc/list_confirmed_appointment_blocks",
    );
    expect(JSON.parse(availabilityRequest.body)).toEqual({
      target_groomer_id: "groomer-maya",
      range_starts_at: "2026-09-07T00:00:00.000Z",
      range_ends_at: "2026-09-08T00:00:00.000Z",
    });

    expect(
      JSON.parse(
        findRequest(requests, "POST", "rpc/create_confirmed_appointment").body,
      ),
    ).toEqual({
      requested_pet_id: petId,
      requested_groomer_id: "00000000-0000-4000-8000-000000000803",
      requested_starts_at: "2026-09-07T13:00:00.000Z",
      requested_service_ids: ["00000000-0000-4000-8000-000000000804"],
      requested_idempotency_key: "00000000-0000-4000-8000-000000000805",
    });
    expect(
      JSON.parse(
        findRequest(requests, "POST", "rpc/reschedule_confirmed_appointment").body,
      ),
    ).toEqual({
      requested_appointment_id: petId,
      requested_groomer_id: "00000000-0000-4000-8000-000000000803",
      requested_starts_at: "2026-09-08T13:00:00.000Z",
      requested_service_ids: ["00000000-0000-4000-8000-000000000804"],
      requested_idempotency_key: "00000000-0000-4000-8000-000000000806",
    });
    expect(
      JSON.parse(
        findRequest(requests, "POST", "rpc/cancel_confirmed_appointment").body,
      ),
    ).toEqual({
      requested_appointment_id: petId,
      requested_idempotency_key: "00000000-0000-4000-8000-000000000807",
    });

    const appointmentsRequest = findRequest(requests, "GET", "appointments");
    expect(appointmentsRequest.url.searchParams.get("customer_id")).toBe(
      `eq.${customerId}`,
    );
    expect(appointmentsRequest.url.searchParams.get("order")).toBe("starts_at.desc");

    const insertRequest = findRequest(requests, "POST", "pets");
    expect(JSON.parse(insertRequest.body)).toEqual({
      owner_id: customerId,
      name: "Baxter",
      breed: "Beagle",
      size: "MEDIUM",
      age_years: 2,
      temperament: null,
      coat_condition: null,
      allergies: null,
      notes: null,
    });

    const updateRequest = findRequest(requests, "PATCH", "pets");
    expect(JSON.parse(updateRequest.body)).toEqual({ age_years: 3 });
    expect(updateRequest.url.searchParams.get("id")).toBe(`eq.${petId}`);
    expect(updateRequest.url.searchParams.get("owner_id")).toBe(
      `eq.${customerId}`,
    );

    const deleteRequest = findRequest(requests, "DELETE", "pets");
    expect(deleteRequest.url.searchParams.get("id")).toBe(`eq.${petId}`);
    expect(deleteRequest.url.searchParams.get("owner_id")).toBe(
      `eq.${customerId}`,
    );
  });

  it("maps an RPC PET_NOT_FOUND error to the stable lifecycle not-found error", async () => {
    const repository = createSupabaseBookingRepository(
      createClient("https://example.supabase.co", "sb_publishable_test_key", {
        global: {
          fetch: async () => response({ message: "PET_NOT_FOUND" }, 400),
        },
      }),
    );

    await expect(
      repository.createConfirmedAppointment({
        petId,
        groomerId: "00000000-0000-4000-8000-000000000803",
        selectedServiceIds: ["00000000-0000-4000-8000-000000000804"],
        startsAt: "2028-09-07T13:00:00.000Z",
        idempotencyKey: "missing-pet-key",
      }),
    ).rejects.toMatchObject({
      code: "PET_NOT_FOUND",
      status: 404,
    });
  });

  it("maps idempotency-key reuse conflicts to a stable domain error", async () => {
    const repository = createSupabaseBookingRepository(
      createClient("https://example.supabase.co", "sb_publishable_test_key", {
        global: {
          fetch: async () => response({ message: "IDEMPOTENCY_KEY_REUSED" }, 400),
        },
      }),
    );

    await expect(
      repository.createConfirmedAppointment({
        petId,
        groomerId: "00000000-0000-4000-8000-000000000803",
        selectedServiceIds: ["00000000-0000-4000-8000-000000000804"],
        startsAt: "2026-09-07T13:00:00.000Z",
        idempotencyKey: "retry-key-1",
      }),
    ).rejects.toMatchObject({
      code: "IDEMPOTENCY_KEY_REUSED",
      status: 409,
    });
  });

  it("reports a pet that still has appointments as PET_IN_USE", async () => {
    const repository = createSupabaseBookingRepository(
      createClient("https://example.supabase.co", "sb_publishable_test_key", {
        global: {
          fetch: async () =>
            response(
              {
                code: "23503",
                message: "update or delete on table pets violates foreign key constraint",
              },
              409,
            ),
        },
      }),
    );

    await expect(
      repository.deletePetByOwner(petId, customerId),
    ).rejects.toMatchObject({
      code: "PET_IN_USE",
      status: 409,
    });
  });

  it("fails closed when Supabase reports a database error", async () => {
    const repository = createSupabaseBookingRepository(
      createClient("https://example.supabase.co", "sb_publishable_test_key", {
        global: {
          fetch: async () => response({ message: "unavailable" }, 500),
        },
      }),
    );

    await expect(repository.listServices()).rejects.toThrow("unavailable");
  });
});
