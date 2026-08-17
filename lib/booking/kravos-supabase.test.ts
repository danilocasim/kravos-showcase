import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { createSupabaseKravosBookingUseCases } from "./kravos-supabase";

const customerId = "00000000-0000-4000-8000-000000005201";
const petId = "00000000-0000-4000-8000-000000005202";

interface CapturedRequest {
  readonly url: URL;
}

const json = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("Supabase Kravos booking composition", () => {
  it("queries customer profiles by role/name and returns their pets", async () => {
    const requests: Array<CapturedRequest> = [];
    const supabase = createClient(
      "https://example.supabase.co",
      "service-role-test-key",
      {
        global: {
          fetch: async (input, init) => {
            const request = new Request(input, init);
            const url = new URL(request.url);
            requests.push({ url });

            if (url.pathname.endsWith("/profiles")) {
              return json([{ id: customerId, display_name: "Jane Doe" }]);
            }
            if (url.pathname.endsWith("/pets")) {
              return json([
                {
                  id: petId,
                  owner_id: customerId,
                  name: "Milo",
                  breed: "Golden Retriever",
                  size: "LARGE",
                  age_years: 4,
                  temperament: null,
                  coat_condition: null,
                  allergies: null,
                  notes: null,
                },
              ]);
            }

            return json([]);
          },
        },
      },
    );
    const useCases = createSupabaseKravosBookingUseCases(supabase);

    await expect(
      useCases.resolveCustomer({ customerName: "Jane Doe", petName: "Milo" }),
    ).resolves.toMatchObject({
      status: "RESOLVED",
      customer: { id: customerId, displayName: "Jane Doe" },
      pets: [{ id: petId, ownerId: customerId, name: "Milo" }],
    });

    const profileRequest = requests.find((request) =>
      request.url.pathname.endsWith("/profiles"),
    );
    expect(profileRequest?.url.searchParams.get("role")).toBe("eq.CUSTOMER");
    expect(profileRequest?.url.searchParams.get("display_name")).toBe(
      "ilike.Jane Doe",
    );
    expect(profileRequest?.url.searchParams.get("limit")).toBe("5");
  });
});
