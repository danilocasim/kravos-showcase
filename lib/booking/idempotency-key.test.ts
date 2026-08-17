import { describe, expect, it } from "vitest";
import { createIdempotencyKey } from "./idempotency-key";

describe("createIdempotencyKey", () => {
  it("is stable across service ordering and changes when the request changes", () => {
    const first = createIdempotencyKey("create", "intent-1", {
      petId: "pet-1", groomerId: "groomer-1", startsAt: "2026-09-02T14:00:00.000Z", selectedServiceIds: ["b", "a"],
    });
    const retry = createIdempotencyKey("create", "intent-1", {
      petId: "pet-1", groomerId: "groomer-1", startsAt: "2026-09-02T14:00:00.000Z", selectedServiceIds: ["a", "b"],
    });
    const changed = createIdempotencyKey("create", "intent-1", {
      petId: "pet-1", groomerId: "groomer-1", startsAt: "2026-09-02T14:15:00.000Z", selectedServiceIds: ["a", "b"],
    });

    expect(retry).toBe(first);
    expect(changed).not.toBe(first);
    expect(first).toMatch(/^create:intent-1:[a-f0-9]{64}$/);
  });
});
