import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import PublicConciergeKnowledge from "./page";

describe("public concierge knowledge", () => {
  it("keeps dog booking facts separate from educational cat guidance", () => {
    const html = renderToStaticMarkup(<PublicConciergeKnowledge />);

    expect(html).toContain("Dogs only in v1");
    expect(html).toContain("Cat guidance is educational only");
    expect(html).toContain("Bath &amp; Brush");
    expect(html).toContain("not veterinary advice");
  });
});
