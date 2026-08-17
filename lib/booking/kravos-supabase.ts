import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { createKravosBookingUseCases } from "./kravos-use-cases";
import type { KravosCustomerProfile } from "./kravos-use-cases";
import { createSupabaseBookingRepository } from "./supabase-repository";
import { createBookingUseCases } from "./use-cases";

const profileSchema = z.object({
  id: z.guid(),
  display_name: z.string().trim().min(1),
});

const databaseError = (error: unknown): Error => {
  const parsed = z.object({ message: z.string().min(1) }).safeParse(error);
  return new Error(
    parsed.success ? parsed.data.message : "Customer directory operation failed.",
  );
};

const toProfile = (row: z.infer<typeof profileSchema>): KravosCustomerProfile => ({
  id: row.id,
  displayName: row.display_name,
});

/** Composes privileged Kravos reads with customer-delegated booking use cases. */
export const createSupabaseKravosBookingUseCases = (supabase: SupabaseClient) => {
  const baseRepository = createSupabaseBookingRepository(supabase);

  return createKravosBookingUseCases({
    findCustomersByDisplayName: async (displayName) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("role", "CUSTOMER")
        .ilike("display_name", displayName)
        .limit(5);
      if (error !== null) throw databaseError(error);
      const parsed = z.array(profileSchema).safeParse(data);
      if (!parsed.success) throw new Error("Database returned an invalid customer.");

      return parsed.data.map(toProfile);
    },
    getCustomerById: async (customerId) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", customerId)
        .eq("role", "CUSTOMER")
        .maybeSingle();
      if (error !== null) throw databaseError(error);
      if (data === null) return null;
      const parsed = profileSchema.safeParse(data);
      if (!parsed.success) throw new Error("Database returned an invalid customer.");

      return toProfile(parsed.data);
    },
    listPetsByOwnerIds: async (ownerIds) =>
      (
        await Promise.all(
          ownerIds.map((ownerId) => baseRepository.listPetsByOwner(ownerId)),
        )
      ).flat(),
    listActiveServices: async () =>
      (await baseRepository.listServices()).filter((service) => service.isActive),
    listActiveGroomers: async () =>
      (await baseRepository.listGroomers()).filter((groomer) => groomer.isActive),
    getCustomerUseCases: (customerId) =>
      createBookingUseCases({
        repository: createSupabaseBookingRepository(supabase, {
          delegatedCustomerId: customerId,
        }),
        getCurrentActor: async () => ({ id: customerId, role: "CUSTOMER" }),
      }),
  });
};
