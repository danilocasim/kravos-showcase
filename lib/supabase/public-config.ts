import { z } from "zod";

const publicSupabaseConfigSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
});

/** Public values that are safe to use when creating Supabase clients. */
export interface SupabasePublicConfig {
  readonly url: string;
  readonly publishableKey: string;
}

type PublicSupabaseEnvironment = Readonly<Record<string, string | undefined>>;

/**
 * Validates the public Supabase configuration without including values in errors.
 *
 * The configuration is evaluated only when a client is created so linting, tests,
 * and production builds do not require local credentials.
 *
 * @param environment - Public environment variables, injected by tests when needed.
 * @returns Validated public connection values.
 * @throws Error if the required public configuration is missing or invalid.
 */
export const getSupabasePublicConfig = (
  environment: PublicSupabaseEnvironment = process.env,
): SupabasePublicConfig => {
  const parsedConfig = publicSupabaseConfigSchema.safeParse(environment);

  if (!parsedConfig.success) {
    throw new Error("Missing or invalid public Supabase configuration.");
  }

  return {
    url: parsedConfig.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: parsedConfig.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
};
