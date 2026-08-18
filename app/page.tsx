import type { Metadata } from "next";

import { KravosChatWidget } from "../components/integrations/kravos-chat-widget";
import { LandingExperience } from "../components/marketing/landing-experience";
import { LandingHeader } from "../components/marketing/landing-header";
import { LandingHero } from "../components/marketing/landing-hero";
import { LandingServices } from "../components/marketing/landing-services";
import { LandingVisit } from "../components/marketing/landing-visit";

export const metadata: Metadata = {
  title: "Paw & Polish | Calm dog grooming in Brooklyn",
  description: "Explore Paw & Polish dog grooming services, meet the team, and book a calm visit on Court Street in Brooklyn.",
};

/** Public marketing homepage with a general-information concierge. */
export default function Home() {
  return (
    <>
      <LandingHeader />
      <main id="main-content">
        <LandingHero />
        <LandingServices />
        <LandingExperience />
        <LandingVisit />
      </main>
      <KravosChatWidget audience="public" />
    </>
  );
}
