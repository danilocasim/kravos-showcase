import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { createSupabaseAdminBookingRepository } from "./admin-supabase-repository";

interface CapturedRequest { readonly body: string; readonly method: string; readonly url: URL }
const response = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const appointmentId = "00000000-0000-4000-8000-000000009001";

const createTestClient = (requests: Array<CapturedRequest>) => createClient(
  "https://example.supabase.co",
  "sb_publishable_test_key",
  { global: { fetch: async (input, init) => {
    const request = new Request(input, init);
    const captured = { body: await request.text(), method: request.method, url: new URL(request.url) };
    requests.push(captured);
    if (captured.url.pathname.endsWith("/rpc/complete_confirmed_appointment_as_admin")) return response([{
      id: appointmentId, status: "COMPLETED", starts_at: "2026-09-02T13:00:00Z", service_ends_at: "2026-09-02T14:00:00Z", blocked_until: "2026-09-02T14:15:00Z", subtotal_cents: 5500, applied_buffer_minutes: 15, completed_at: "2026-09-02T14:01:00Z", status_changed_at: "2026-09-02T14:01:00Z", status_changed_by: "00000000-0000-4000-8000-000000009099",
    }]);
    if (captured.url.pathname.endsWith("/rpc/cancel_confirmed_appointment")) return response([{
      id: appointmentId, status: "CANCELLED", cancelled_at: "2026-09-02T12:00:00Z",
    }]);
    if (captured.url.pathname.endsWith("/profiles")) return response([{ id: "00000000-0000-4000-8000-000000009010", display_name: "Ada Customer" }]);
    if (captured.url.pathname.endsWith("/pets")) return response([{ id: "00000000-0000-4000-8000-000000009011", name: "Biscuit", breed: "Cockapoo", size: "MEDIUM" }]);
    if (captured.url.pathname.endsWith("/groomers")) return response([{ id: "20000000-0000-0000-0000-000000000001", display_name: "Maya Chen" }]);
    if (captured.url.pathname.endsWith("/appointment_services")) return response([{ appointment_id: appointmentId, service_id: "10000000-0000-0000-0000-000000000001", service_name: "Bath & Brush", service_kind: "BASE", duration_minutes: 60, price_cents: 5500 }]);
    return response([{
      id: appointmentId,
      customer_id: "00000000-0000-4000-8000-000000009010",
      pet_id: "00000000-0000-4000-8000-000000009011",
      groomer_id: "20000000-0000-0000-0000-000000000001",
      status: "CONFIRMED",
      starts_at: "2026-09-02T13:00:00Z",
      service_ends_at: "2026-09-02T14:00:00Z",
      blocked_until: "2026-09-02T14:15:00Z",
      subtotal_cents: 5500,
      completed_at: null,
      cancelled_at: null,
      status_changed_at: "2026-09-01T12:00:00Z",
      status_changed_by: "00000000-0000-4000-8000-000000009010",
      customer_profile: { display_name: "Ada Customer" },
      pet: { name: "Biscuit", breed: "Cockapoo", size: "MEDIUM" },
      groomer: { display_name: "Maya Chen" },
      appointment_services: [{ appointment_id: appointmentId, service_id: "10000000-0000-0000-0000-000000000001", service_name: "Bath & Brush", service_kind: "BASE", duration_minutes: 60, price_cents: 5500 }],
    }]);
  } } },
);

describe("Supabase admin booking repository", () => {
  it("scopes schedule reads by instant range and groomer and hydrates display snapshots", async () => {
    const requests: Array<CapturedRequest> = [];
    const repository = createSupabaseAdminBookingRepository(createTestClient(requests));
    await expect(repository.listAppointmentsInRange({
      startsAt: new Date("2026-09-02T04:00:00Z"),
      endsAt: new Date("2026-09-03T04:00:00Z"),
      groomerId: "20000000-0000-0000-0000-000000000001",
    })).resolves.toMatchObject([{ petName: "Biscuit", customerDisplayName: "Ada Customer", subtotalCents: 5500 }]);
    expect(requests[0]?.url.searchParams.get("starts_at")).toBe("gte.2026-09-02T04:00:00.000Z");
    expect(requests[0]?.url.searchParams.get("groomer_id")).toBe("eq.20000000-0000-0000-0000-000000000001");
  });

  it("uses only guarded lifecycle RPCs for admin status mutations", async () => {
    const requests: Array<CapturedRequest> = [];
    const repository = createSupabaseAdminBookingRepository(createTestClient(requests));
    await repository.completeConfirmedAppointment(appointmentId);
    await repository.cancelConfirmedAppointment({ appointmentId, idempotencyKey: "opaque-intent" });
    expect(requests.map((entry) => entry.url.pathname)).toEqual([
      "/rest/v1/rpc/complete_confirmed_appointment_as_admin",
      "/rest/v1/rpc/cancel_confirmed_appointment",
    ]);
  });
});
