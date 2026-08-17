import type { ReactNode } from "react";

import { AppHeader } from "../../components/navigation/app-header";
import { getRequestProfile } from "../../lib/auth/profile";

export default async function CustomerLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const profile = await getRequestProfile();
  if (profile === null) {
    return children;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <AppHeader userName={profile.displayName} role={profile.role} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
  );
}
