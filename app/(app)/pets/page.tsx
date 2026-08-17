import { redirect } from "next/navigation";

import { getRequestProfile } from "../../../lib/auth/profile";
import { createSupabaseBookingUseCases } from "../../../lib/booking/server";
import { PetCard } from "../../../components/booking/pet-card";
import { Card } from "../../../components/core/card";
import { EmptyState } from "../../../components/core/empty-state";
import { Icon } from "../../../components/core/icon";
import { DeletePetDialog } from "./delete-pet-dialog";
import { PetFormDialog } from "./pet-form-dialog";

export default async function PetsPage() {
  if (await getRequestProfile() === null) redirect("/sign-in?next=%2Fpets");
  const useCases = await createSupabaseBookingUseCases();
  const pets = await useCases.listMyPets();

  return (
    <div className="mx-auto max-w-(--container-app) px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="[font:var(--type-h1)] tracking-tight text-heading">My pets</h1>
          <p className="mt-1 [font:var(--type-body)] text-muted">
            Details you save here are shared with your groomer at every visit.
          </p>
        </div>
        {pets.length === 0 ? null : <PetFormDialog mode="create" />}
      </div>
      {pets.length === 0 ? (
        <EmptyState
          icon="dog"
          title="No pets yet"
          description="Add your dog’s details once and reuse them at every booking."
          action={<PetFormDialog mode="create" />}
        />
      ) : (
        <div className="grid gap-3">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              actions={
                <>
                  <PetFormDialog mode="edit" pet={pet} />
                  <DeletePetDialog pet={pet} />
                </>
              }
            />
          ))}
        </div>
      )}
      <Card tone="sunken" padding="sm" className="mt-6 flex items-start gap-3 shadow-none">
        <Icon name="info" size={16} className="mt-0.5 flex-none text-muted" />
        <p className="[font:var(--type-small)] text-muted">
          Pet details are operational notes for your groomer — coat condition,
          temperament, and product allergies. They are not medical records, and
          we do not give veterinary advice.
        </p>
      </Card>
    </div>
  );
}
