import { seedTestUsers } from "./fixtures/seed";

/**
 * Prepares the local stack once per end-to-end run.
 *
 * Catalogue, groomers, schedules, and time off already come from
 * `supabase/seeds/demo_catalogue.sql`, which `supabase db reset` applies. Only
 * the customers are created here, because the suite owns those.
 *
 * @returns Nothing; it throws when the local stack is unreachable.
 */
const globalSetup = async (): Promise<void> => {
  const seeded = await seedTestUsers();

  console.log(
    `Seeded ${seeded.length} test users: ${seeded
      .map((user) => user.email)
      .join(", ")}`,
  );
};

export default globalSetup;
