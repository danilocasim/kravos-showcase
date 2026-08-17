import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KravosChatWidget } from "./kravos-chat-widget";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("KravosChatWidget", () => {
  it("does not render a broken loader when the public widget key is absent", () => {
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_WIDGET_API_KEY", "");

    expect(KravosChatWidget()).toBeNull();
  });

  it("renders the Paw & Polish launcher loader from public configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_WIDGET_API_KEY", "spk_public_test_key");
    vi.stubEnv("NEXT_PUBLIC_KRAVOS_APP_URL", "");

    const element = KravosChatWidget() as ReactElement<{
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
});
