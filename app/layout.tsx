import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

/* The design system substitutes these three Google faces for a brand family it
   never had. They are self-hosted by next/font rather than imported over the
   network, so app/globals.css does not copy claude-design/tokens/fonts.css. */
const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-face",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-face",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono-face",
});

export const metadata: Metadata = {
  title: "Paw & Polish",
  description: "Book a dog grooming visit in Brooklyn.",
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:m-3 focus:rounded-md focus:border focus:border-default-border focus:bg-card focus:px-4 focus:py-2 focus:[font:var(--type-label)] focus:text-heading"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
