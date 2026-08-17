"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "../../lib/supabase/server";

export async function signOutAction(_formData: FormData): Promise<void> {
  void _formData;
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: "local" });
  } finally {
    redirect("/sign-in");
  }
}
