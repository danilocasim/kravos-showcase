import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { getRequestProfile } from "../../../lib/auth/profile";
import { createSupabaseBookingUseCases } from "../../../lib/booking/server";
import type { Groomer, ResolvedServiceSelection } from "../../../lib/booking/use-cases";
import { nextBookableWeek } from "../../../lib/ui/booking/date-range";
import { groupSlotsIntoDays } from "../../../lib/ui/booking/slot-days";
import {
  parseWizardState,
  selectedServiceIds,
  wizardQuery,
  type RawSearchParams,
} from "../../../lib/ui/booking/wizard-state";
import { StepIndicator } from "../../../components/navigation/step-indicator";
import { GroomerStep } from "./steps/groomer-step";
import { PetStep } from "./steps/pet-step";
import { ReviewStep } from "./steps/review-step";
import { ServicesStep } from "./steps/services-step";
import { TimeStep } from "./steps/time-step";
import { SummaryRail } from "./summary-rail";

const stepIndexes = { pet: 0, services: 1, groomer: 2, time: 3, review: 4 } as const;

export default async function BookPage({
  searchParams,
}: {
  readonly searchParams: Promise<RawSearchParams>;
}) {
  const query = await searchParams;
  const state = parseWizardState(query);
  if (await getRequestProfile() === null) {
    const next = `/book?${wizardQuery(state)}`;
    redirect(`/sign-in?${new URLSearchParams({ next })}`);
  }
  if (state.intent === null) redirect(`/book?intent=${randomUUID()}&step=pet`);

  const useCases = await createSupabaseBookingUseCases();
  const [pets, services, compatibility, groomers] = await Promise.all([
    useCases.listMyPets(),
    useCases.listActiveServices(),
    useCases.listServiceCompatibility(),
    useCases.listActiveGroomers(),
  ]);
  const pet = pets.find((candidate) => candidate.id === state.petId) ?? null;
  if (state.step !== "pet" && pet === null) {
    redirect(`/book?${wizardQuery(state, { step: "pet", petId: null })}`);
  }

  const serviceIds = selectedServiceIds(state);
  let selection: ResolvedServiceSelection | null = null;
  if (serviceIds.length > 0) {
    try {
      selection = await useCases.resolveServiceSelection(serviceIds);
    } catch {
      if (state.step !== "services") {
        redirect(`/book?${wizardQuery(state, { step: "services" })}`);
      }
    }
  }
  if (["groomer", "time", "review"].includes(state.step) && selection === null) {
    redirect(`/book?${wizardQuery(state, { step: "services" })}`);
  }

  const qualified = selection === null ? [] : await useCases.listQualifiedGroomers(serviceIds);
  const selectedGroomer: Groomer | null =
    groomers.find((candidate) => candidate.id === state.groomerId) ?? null;
  const range = nextBookableWeek();
  const effectiveState = {
    ...state,
    startsOn: state.startsOn ?? range.startsOn,
    endsOn: state.endsOn ?? range.endsOn,
  };
  let days = [] as ReturnType<typeof groupSlotsIntoDays>;
  let availabilityErrorCode: string | undefined;
  if (state.step === "time" && selection !== null && pet !== null) {
    try {
      const availability = await useCases.searchAvailability({
        petId: pet.id,
        selectedServiceIds: serviceIds,
        groomerId: state.groomerId === "any" || state.groomerId === null ? null : state.groomerId,
        startsOn: effectiveState.startsOn,
        endsOn: effectiveState.endsOn,
      });
      days = groupSlotsIntoDays(
        availability.slots.map((slot) => ({
          groomerId: slot.groomerId,
          startsAt: slot.startsAt.toISOString(),
          serviceEndsAt: slot.serviceEndsAt.toISOString(),
          blockedUntil: slot.blockedUntil.toISOString(),
        })),
      );
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "INVALID_AVAILABILITY_SEARCH") throw error;
      availabilityErrorCode = "INVALID_AVAILABILITY_SEARCH";
    }
  }
  if (state.step === "review" && (state.startsAt === null || selectedGroomer === null)) {
    redirect(`/book?${wizardQuery(effectiveState, { step: "time", startsAt: null })}`);
  }

  const stepItems = ["Pet", "Services", "Groomer", "Date & time", "Review"].map(
    (label, index) => ({
      label,
      ...(index < stepIndexes[state.step]
        ? {
            href: `/book?${wizardQuery(effectiveState, {
              step: (["pet", "services", "groomer", "time", "review"] as const)[index]!,
            })}`,
          }
        : {}),
    }),
  );
  const errorCode = availabilityErrorCode ?? (typeof query.error === "string" ? query.error : undefined);

  return (
    <div className="mx-auto max-w-(--container-app) px-4 pt-6 pb-24 sm:px-6 sm:pt-8 lg:pb-8">
      <StepIndicator steps={stepItems} current={stepIndexes[state.step]} className="mb-8" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {state.step === "pet" ? <PetStep pets={pets} state={effectiveState} /> : null}
          {state.step === "services" ? <ServicesStep services={services} compatibility={compatibility} state={effectiveState} /> : null}
          {state.step === "groomer" && selection !== null ? <GroomerStep groomers={groomers} qualified={qualified} selectedServices={selection.services} state={effectiveState} /> : null}
          {state.step === "time" ? <TimeStep state={effectiveState} days={days} {...(errorCode === undefined ? {} : { errorCode })} /> : null}
          {state.step === "review" ? <ReviewStep state={effectiveState} selectedServiceIds={serviceIds} freshIntent={randomUUID()} /> : null}
        </div>
        <SummaryRail pet={pet} selection={selection} groomer={selectedGroomer} startsAt={state.startsAt} />
      </div>
    </div>
  );
}
