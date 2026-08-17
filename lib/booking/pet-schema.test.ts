import { describe, expect, it } from "vitest";

import { createPetSchema, updatePetSchema } from "./pet-schema";

const completePet = {
  name: "Biscuit",
  breed: "Cockapoo",
  size: "MEDIUM",
  ageYears: 3,
  temperament: "Calm, nervous with clippers",
  coatCondition: "Slightly matted behind the ears",
  allergies: "Oatmeal shampoo",
  notes: "Bring them in a few minutes early",
};

describe("createPetSchema", () => {
  it("accepts a complete pet", () => {
    const parsed = createPetSchema.safeParse(completePet);

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.name).toBe("Biscuit");
  });

  it("rejects a blank name", () => {
    const parsed = createPetSchema.safeParse({ ...completePet, name: "   " });

    expect(parsed.success).toBe(false);
    expect(parsed.success === false && parsed.error.issues[0]?.path).toEqual([
      "name",
    ]);
  });

  it("rejects an age outside 0 to 30", () => {
    expect(createPetSchema.safeParse({ ...completePet, ageYears: 31 }).success).toBe(
      false,
    );
    expect(createPetSchema.safeParse({ ...completePet, ageYears: -1 }).success).toBe(
      false,
    );
    expect(createPetSchema.safeParse({ ...completePet, ageYears: 2.5 }).success).toBe(
      false,
    );
  });

  it("normalizes blank optional text to null", () => {
    const parsed = createPetSchema.safeParse({
      ...completePet,
      temperament: "   ",
      notes: "",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.temperament).toBeNull();
    expect(parsed.success && parsed.data.notes).toBeNull();
  });

  it("rejects an unknown field", () => {
    expect(
      createPetSchema.safeParse({ ...completePet, species: "cat" }).success,
    ).toBe(false);
  });
});

describe("updatePetSchema", () => {
  it("accepts a partial update", () => {
    const parsed = updatePetSchema.safeParse({ breed: "Labradoodle" });

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.breed).toBe("Labradoodle");
  });

  it("rejects an update that changes nothing", () => {
    expect(updatePetSchema.safeParse({}).success).toBe(false);
  });
});
