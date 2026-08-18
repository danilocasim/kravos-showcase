import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../components/integrations/kravos-chat-widget", () => ({
  KravosChatWidget: ({ audience }: { readonly audience: string }) => (
    <div data-testid={`${audience}-concierge`} />
  ),
}));

import Home from "./page";

describe("public landing page", () => {
  it("introduces the salon before asking a visitor to sign in", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("Calm grooming for Brooklyn dogs");
    expect(html).toContain("Bath &amp; Brush");
    expect(html).toContain('href="/sign-in"');
    expect(html).toContain('data-testid="public-concierge"');
  });
});
