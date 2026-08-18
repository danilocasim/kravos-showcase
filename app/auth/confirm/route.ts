import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { safeInternalNextPath } from "../../../lib/ui/auth/next-path";

const allowedTypes = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const rawType = request.nextUrl.searchParams.get("type");
  const next = safeInternalNextPath(request.nextUrl.searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  if (code !== null) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error === null) return NextResponse.redirect(new URL(next, request.url));
  }

  if (
    tokenHash !== null &&
    rawType !== null &&
    allowedTypes.has(rawType as EmailOtpType)
  ) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: rawType as EmailOtpType,
    });

    if (error === null) return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(
    new URL("/sign-in?error=CONFIRMATION_LINK_INVALID", request.url),
  );
}
