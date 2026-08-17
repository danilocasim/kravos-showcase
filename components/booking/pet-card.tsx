import type { Pet } from "../../lib/booking/use-cases";
import { Badge } from "../core/badge";
import { Card } from "../core/card";
import { Icon } from "../core/icon";

const sizeLabels: Readonly<Record<Pet["size"], string>> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

export interface PetCardProps {
  readonly pet: Pet;
  readonly actions?: React.ReactNode;
  readonly selectableControl?: React.ReactNode;
}

export const PetCard = ({ pet, actions, selectableControl }: PetCardProps) => (
  <Card as="article" padding="sm" className="flex gap-4">
    {selectableControl}
    <span className="grid size-11 flex-none place-items-center rounded-md bg-apricot-100 text-apricot-700">
      <Icon name="dog" size={23} />
    </span>
    <div className="min-w-0 flex-1">
      <h2 className="[font:var(--type-h4)] text-heading">{pet.name}</h2>
      <p className="mt-1 [font:var(--type-small)] text-muted">
        {pet.breed} · {sizeLabels[pet.size]} · {pet.ageYears} {pet.ageYears === 1 ? "yr" : "yrs"}
      </p>
      {pet.temperament !== null || pet.allergies !== null || pet.notes !== null ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pet.temperament !== null ? <Badge size="sm" icon="heart">{pet.temperament}</Badge> : null}
          {pet.allergies !== null ? <Badge size="sm" tone="warning" icon="triangle-alert">{pet.allergies}</Badge> : null}
          {pet.notes !== null ? <Badge size="sm" icon="notebook-pen">{pet.notes}</Badge> : null}
        </div>
      ) : null}
    </div>
    {actions !== undefined ? <div className="flex flex-none items-start gap-0.5">{actions}</div> : null}
  </Card>
);
