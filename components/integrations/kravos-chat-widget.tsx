import Script from "next/script";

const defaultKravosAppUrl = "https://kravos.ai";

const normalizedAppUrl = (value: string | undefined): string | null => {
  const requested = value?.trim() || defaultKravosAppUrl;

  try {
    const url = new URL(requested);
    const isLocalHttp =
      url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.protocol !== "https:" && !isLocalHttp) return null;

    return url.origin;
  } catch {
    return null;
  }
};

export type KravosWidgetAudience = "public" | "customer";

interface KravosChatWidgetProps {
  /** Selects the agent-scoped key without exposing an agent ID to the browser. */
  readonly audience: KravosWidgetAudience;
}

/** Loads the hosted Paw & Polish concierge as a minimized floating launcher. */
export function KravosChatWidget({ audience }: KravosChatWidgetProps) {
  const apiKey = (
    audience === "public"
      ? process.env.NEXT_PUBLIC_KRAVOS_LANDING_WIDGET_API_KEY
      : process.env.NEXT_PUBLIC_KRAVOS_WIDGET_API_KEY
  )?.trim();
  const appUrl = normalizedAppUrl(process.env.NEXT_PUBLIC_KRAVOS_APP_URL);
  if (!apiKey || appUrl === null) return null;

  return (
    <Script
      id={
        audience === "public"
          ? "kravos-public-chat-widget-loader"
          : "kravos-chat-widget-loader"
      }
      src={`${appUrl}/sdk/v1/loader.js`}
      strategy="afterInteractive"
      data-api-key={apiKey}
      data-position="bottom-right"
    />
  );
}
