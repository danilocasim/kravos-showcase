import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { exchangeCodeForSession, verifyOtp } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("../../../lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession, verifyOtp },
  })),
}));

import { GET } from "./route";

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    verifyOtp.mockReset();
  });

  it("exchanges the confirmation code from Supabase's default email template", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      new NextRequest(
        "https://paw-polish.vercel.app/auth/confirm?code=confirmation-code&next=/appointments",
      ),
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("confirmation-code");
    expect(response.headers.get("location")).toBe(
      "https://paw-polish.vercel.app/appointments",
    );
  });
});
