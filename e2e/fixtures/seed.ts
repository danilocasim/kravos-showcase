import { fromZonedTime } from "date-fns-tz";

import { businessTimeZone } from "../../lib/booking/business-time";
import { nextBookableWeek } from "../../lib/ui/booking/date-range";
import { query } from "./database";
import { getSupabaseAdminClient } from "./supabase-admin";
import { adminUser, allTestUsers, customerTwo, type TestUser } from "./test-users";

/**
 * Idempotent database setup for the end-to-end suite.
 *
 * Every helper can run repeatedly against the same local stack. Users are
 * recreated rather than reused so a run never inherits state from the last one.
 */

/**
 * Finds a Supabase Auth user by email.
 *
 * @param email - The address to look for.
 * @returns The user's id, or null when no such user exists.
 */
const findUserIdByEmail = async (email: string): Promise<string | null> => {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });

  if (error !== null) {
    throw new Error(`Could not list auth users: ${error.message}`);
  }

  return data.users.find((user) => user.email === email)?.id ?? null;
};

const clearCustomerRows = async (userId: string): Promise<void> => {
  await query(
    `delete from public.appointment_services
       where appointment_id in (
         select id from public.appointments where customer_id = $1
       )`,
    [userId],
  );
  await query("delete from public.appointments where customer_id = $1", [userId]);
  await query("delete from public.idempotency_records where actor_id = $1", [userId]);
  await query("delete from public.pets where owner_id = $1", [userId]);
};

/**
 * Creates a confirmed customer, replacing any existing account with that email.
 *
 * The `profiles` row is deliberately not inserted here. A database trigger
 * creates it with the CUSTOMER role on signup, so every run also proves that
 * trigger still works.
 *
 * @param user - The test user to create.
 * @returns The new user's id.
 */
export const ensureUser = async (user: TestUser): Promise<string> => {
  const admin = getSupabaseAdminClient();
  const existingId = await findUserIdByEmail(user.email);

  if (existingId !== null) {
    await clearCustomerRows(existingId);
    const { error } = await admin.auth.admin.deleteUser(existingId);

    if (error !== null) {
      throw new Error(`Could not remove ${user.email}: ${error.message}`);
    }
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { display_name: user.displayName },
  });

  if (error !== null || data.user === null) {
    throw new Error(
      `Could not create ${user.email}: ${error?.message ?? "no user returned"}`,
    );
  }

  return data.user.id;
};

/** Removes a disposable auth user and their application rows when present. */
export const removeUserByEmail = async (email: string): Promise<void> => {
  const id = await findUserIdByEmail(email);
  if (id === null) return;
  await clearCustomerRows(id);
  const { error } = await getSupabaseAdminClient().auth.admin.deleteUser(id);
  if (error !== null) throw new Error(`Could not remove disposable test user: ${error.message}`);
};

/**
 * Removes every appointment and pet belonging to a customer.
 *
 * Appointments go first: `appointments.pet_id` is `on delete restrict`, so a pet
 * with history cannot be deleted while its visits remain.
 *
 * @param userId - The customer whose data should be cleared.
 */
export const resetCustomerData = async (userId: string): Promise<void> => {
  await clearCustomerRows(userId);
};

/** A test customer with the auth id the fixtures created for them. */
export interface SeededUser extends TestUser {
  readonly id: string;
}

/**
 * Recreates both test customers with no pets and no appointments.
 *
 * @returns The seeded customers, in the order they are declared.
 */
export const seedTestUsers = async (): Promise<ReadonlyArray<SeededUser>> => {
  const seeded: Array<SeededUser> = [];

  for (const user of allTestUsers) {
    const id = await ensureUser(user);

    await resetCustomerData(id);
    seeded.push({ ...user, id });
  }

  const adminId = await ensureUser(adminUser);
  await query("update public.profiles set role = 'ADMIN' where id = $1", [adminId]);
  seeded.push({ ...adminUser, id: adminId });

  return seeded;
};

/**
 * Looks up a seeded customer's auth id at test time.
 *
 * @param user - The test user to resolve.
 * @returns Their auth id.
 */
export const requireUserId = async (user: TestUser): Promise<string> => {
  const id = await findUserIdByEmail(user.email);

  if (id === null) {
    throw new Error(
      `${user.email} does not exist. Did the Playwright global setup run?`,
    );
  }

  return id;
};

/** Inserts one owned pet directly for booking-flow setup. */
export const seedPet = async (
  user: TestUser,
  name = "Biscuit",
): Promise<string> => {
  const ownerId = await requireUserId(user);
  const rows = await query<{ id: string }>(
    `insert into public.pets (
       owner_id, name, breed, size, age_years,
       temperament, coat_condition, allergies, notes
     ) values ($1, $2, 'Cockapoo', 'MEDIUM', 3, 'Calm', null, null, null)
     returning id`,
    [ownerId, name],
  );
  const id = rows[0]?.id;
  if (id === undefined) throw new Error("Could not seed a pet.");
  return id;
};

/** Seeds a confirmed Bath & Brush visit for appointment-management tests. */
export const seedAppointment = async ({
  user,
  petId,
  startsAt,
}: {
  readonly user: TestUser;
  readonly petId: string;
  readonly startsAt?: string;
}): Promise<string> => {
  const customerId = await requireUserId(user);
  const effectiveStartsAt = startsAt ?? fromZonedTime(
    `${nextBookableWeek().startsOn}T09:00:00`,
    businessTimeZone,
  ).toISOString();
  const rows = await query<{ id: string }>(
    `insert into public.appointments (
       customer_id, pet_id, groomer_id, starts_at, service_ends_at,
       blocked_until, status, subtotal_cents, applied_buffer_minutes
     ) values (
       $1, $2, '20000000-0000-0000-0000-000000000001', $3,
       $3::timestamptz + interval '60 minutes',
       $3::timestamptz + interval '75 minutes', 'CONFIRMED', 5500, 15
     ) returning id`,
    [customerId, petId, effectiveStartsAt],
  );
  const appointmentId = rows[0]?.id;
  if (appointmentId === undefined) throw new Error("Could not seed an appointment.");
  await query(
    `insert into public.appointment_services (
       appointment_id, service_id, service_name, service_kind,
       duration_minutes, price_cents
     ) values (
       $1, '10000000-0000-0000-0000-000000000001',
       'Bath & Brush', 'BASE', 60, 5500
     )`,
    [appointmentId],
  );
  return appointmentId;
};

/** Occupies a reviewed slot with customer two to reproduce stale availability. */
export const seedConflictingAppointment = async ({
  groomerId,
  startsAt,
}: {
  readonly groomerId: string;
  readonly startsAt: string;
}): Promise<string> => {
  const petId = await seedPet(customerTwo, "Conflict Pup");
  const customerId = await requireUserId(customerTwo);
  const rows = await query<{ id: string }>(
    `insert into public.appointments (
       customer_id, pet_id, groomer_id, starts_at, service_ends_at,
       blocked_until, status, subtotal_cents, applied_buffer_minutes
     ) values (
       $1, $2, $3, $4, $4::timestamptz + interval '90 minutes',
       $4::timestamptz + interval '105 minutes', 'CONFIRMED', 8500, 15
     ) returning id`,
    [customerId, petId, groomerId, startsAt],
  );
  const id = rows[0]?.id;
  if (id === undefined) throw new Error("Could not occupy the stale slot.");
  return id;
};
