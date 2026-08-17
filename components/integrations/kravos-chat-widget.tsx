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

/** Loads the hosted Paw & Polish concierge as a minimized floating launcher. */
export function KravosChatWidget() {
  const apiKey = process.env.NEXT_PUBLIC_KRAVOS_WIDGET_API_KEY?.trim();
  const appUrl = normalizedAppUrl(process.env.NEXT_PUBLIC_KRAVOS_APP_URL);
  if (!apiKey || appUrl === null) return null;

  return (
    <Script
      id="kravos-chat-widget-loader"
      src={`${appUrl}/sdk/v1/loader.js`}
      strategy="afterInteractive"
      data-api-key={apiKey}
      data-position="bottom-right"
    />
  );
}
