import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KravosChatWidget } from "./kravos-chat-widget";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("KravosChatWidget", () => {
  it("does not reuse the authenticated concierge key on the public landing page", () => {
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_WIDGET_API_KEY", "spk_public_test_key");
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_LANDING_WIDGET_API_KEY", "");

    expect(KravosChatWidget({ audience: "public" })).toBeNull();
  });

  it("does not render a broken customer loader when its key is absent", () => {
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_WIDGET_API_KEY", "");

    expect(KravosChatWidget({ audience: "customer" })).toBeNull();
  });

  it("renders the authenticated booking concierge from its existing configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_WIDGET_API_KEY", "spk_public_test_key");
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_APP_URL", "");

    const element = KravosChatWidget({ audience: "customer" }) as ReactElement<{
      readonly id: string;
      readonly src: string;
      readonly strategy: string;
      readonly "data-api-key": string;
      readonly "data-position": string;
    }>;

    expect(element.props).toMatchObject({
      id: "kravos-chat-widget-loader",
      src: "https://kravos.ai/sdk/v1/loader.js",
      strategy: "afterInteractive",
      "data-api-key": "spk_public_test_key",
      "data-position": "bottom-right",
    });
  });

  it("renders a separate public concierge from the landing-page key", () => {
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_LANDING_WIDGET_API_KEY", "spk_landing_test_key");
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_APP_URL", "");

    const element = KravosChatWidget({ audience: "public" }) as ReactElement<{
      readonly id: string;
      readonly "data-api-key": string;
    }>;

    expect(element.props).toMatchObject({
      id: "kravos-public-chat-widget-loader",
      "data-api-key": "spk_landing_test_key",
    });
  });
});
