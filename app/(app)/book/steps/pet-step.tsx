import Link from "next/link";

import type { Pet } from "../../../../lib/booking/use-cases";
import type { WizardState } from "../../../../lib/ui/booking/wizard-state";
import { wizardQuery } from "../../../../lib/ui/booking/wizard-state";
import { PetCard } from "../../../../components/booking/pet-card";
import { EmptyState } from "../../../../components/core/empty-state";

export const PetStep = ({ pets, state }: { readonly pets: ReadonlyArray<Pet>; readonly state: WizardState }) => {
  if (pets.length === 0) {
    return <EmptyState icon="dog" title="Add a pet before booking" description="We need your dog’s details before we can find the right visit." action={<Link href="/pets" className="text-link underline">Go to My pets</Link>} />;
  }

  return (
    <section aria-labelledby="pet-step-title">
      <h1 id="pet-step-title" className="[font:var(--type-h2)] tracking-tight text-heading">Who is this visit for?</h1>
      <p className="mt-1 mb-5 text-muted">Choose one of your saved pets.</p>
      <div className="grid gap-3">
        {pets.map((pet) => (
          <Link key={pet.id} href={`/book?${wizardQuery(state, { petId: pet.id, step: "services" })}`} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-focus">
            <PetCard pet={pet} />
          </Link>
        ))}
      </div>
    </section>
  );
};
