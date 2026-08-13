import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import pg from "pg";

import { assertSafeTestDatabase } from "./test-database-safety.mjs";

const connectionString = process.env.TEST_DATABASE_URL;

if (connectionString === undefined || connectionString === "") {
  throw new Error("Set TEST_DATABASE_URL to a disposable Supabase-compatible test database.");
}

const customerOneId = "00000000-0000-4000-8000-000000002901";
const customerTwoId = "00000000-0000-4000-8000-000000002902";
const petOneId = "00000000-0000-4000-8000-000000002911";
const petTwoId = "00000000-0000-4000-8000-000000002912";
const groomerId = "20000000-0000-0000-0000-000000000001";
const serviceId = "10000000-0000-0000-0000-000000000001";
const raceBarrierKey = 8_028_001;

const { Client } = pg;
const client = () => new Client({ connectionString });

const connectAs = async (actorId) => {
  const connection = client();
  await connection.connect();
  await connection.query("begin");
  await connection.query("set local role authenticated");
  await connection.query("select set_config('request.jwt.claim.sub', $1, true)", [actorId]);
  return connection;
};

const nextMondayAtNine = async () => {
  const connection = client();
  await connection.connect();
  try {
    const { rows } = await connection.query(`
      select (
        (date_trunc('week', now() at time zone 'America/New_York')::date + 14 + time '09:00')
        at time zone 'America/New_York'
      ) as starts_at
    `);
    return rows[0].starts_at;
  } finally {
    await connection.end();
  }
};

const cleanFixtures = async () => {
  const connection = client();
  await connection.connect();
  try {
    await connection.query("delete from public.appointments where customer_id = any($1::uuid[])", [
      [customerOneId, customerTwoId],
    ]);
    await connection.query("delete from public.pets where id = any($1::uuid[])", [
      [petOneId, petTwoId],
    ]);
    await connection.query("delete from public.idempotency_records where actor_id = any($1::uuid[])", [
      [customerOneId, customerTwoId],
    ]);
    await connection.query("delete from public.profiles where id = any($1::uuid[])", [
      [customerOneId, customerTwoId],
    ]);
    await connection.query("delete from auth.users where id = any($1::uuid[])", [
      [customerOneId, customerTwoId],
    ]);
  } finally {
    await connection.end();
  }
};

const createFixtures = async () => {
  const connection = client();
  await connection.connect();
  try {
    for (const [id, email] of [
      [customerOneId, "task8-concurrent-one@pawandpolish.example"],
      [customerTwoId, "task8-concurrent-two@pawandpolish.example"],
    ]) {
      await connection.query(
        `insert into auth.users (
          id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) values (
          $1, '00000000-0000-0000-0000-000000000000', 'authenticated',
          'authenticated', $2, 'not-a-real-password', now(),
          '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
        )`,
        [id, email],
      );
    }
    await connection.query(
      `insert into public.pets (id, owner_id, name, breed, size, age_years)
       values
         ($1, $2, 'Mochi', 'Spaniel', 'MEDIUM', 3),
         ($3, $4, 'Pippa', 'Terrier', 'SMALL', 4)`,
      [petOneId, customerOneId, petTwoId, customerTwoId],
    );
  } finally {
    await connection.end();
  }
};

const installInsertRaceBarrier = async () => {
  const connection = client();
  await connection.connect();
  try {
    await connection.query(`
      create function public.task8_pause_before_appointment_insert()
      returns trigger
      language plpgsql
      as $$
      begin
        perform pg_catalog.pg_advisory_lock_shared(${raceBarrierKey});
        perform pg_catalog.pg_advisory_unlock_shared(${raceBarrierKey});
        return new;
      end;
      $$;

      create trigger task8_pause_before_appointment_insert
      before insert on public.appointments
      for each row execute function public.task8_pause_before_appointment_insert();
    `);
  } finally {
    await connection.end();
  }
};

const removeInsertRaceBarrier = async () => {
  const connection = client();
  await connection.connect();
  try {
    await connection.query(`
      drop trigger if exists task8_pause_before_appointment_insert on public.appointments;
      drop function if exists public.task8_pause_before_appointment_insert();
    `);
  } finally {
    await connection.end();
  }
};

const startCreate = async (connection, petId, startsAt, idempotencyKey) => {
  try {
    const result = await connection.query(
      `select * from public.create_confirmed_appointment($1, $2, $3::timestamptz, $4::uuid[], $5)`,
      [petId, groomerId, startsAt, [serviceId], idempotencyKey],
    );
    await connection.query("commit");
    return { ok: true, result };
  } catch (error) {
    await connection.query("rollback");
    return { ok: false, error };
  } finally {
    await connection.end();
  }
};

const waitForBarrierWaiters = async (expected) => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const connection = client();
    await connection.connect();
    try {
      const { rows } = await connection.query(
        `select count(*)::integer as count
         from pg_locks
         where locktype = 'advisory'
           and classid = 0
           and objid = $1
           and objsubid = 1
           and mode = 'ShareLock'
           and not granted`,
        [raceBarrierKey],
      );
      if (rows[0].count >= expected) {
        return;
      }
    } finally {
      await connection.end();
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`Timed out waiting for ${expected} concurrent appointment inserts.`);
};

const waitForIdempotencyWaiter = async () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const connection = client();
    await connection.connect();
    try {
      const { rows } = await connection.query(
        `select count(*)::integer as count
         from pg_locks
         where locktype = 'advisory'
           and mode = 'ExclusiveLock'
           and not granted`,
      );
      if (rows[0].count >= 1) {
        return;
      }
    } finally {
      await connection.end();
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("Timed out waiting for a same-key idempotency lock waiter.");
};

const verifyCount = async (sql, values, expected, message) => {
  const connection = client();
  await connection.connect();
  try {
    const { rows } = await connection.query(sql, values);
    assert.equal(rows[0].count, expected, message);
  } finally {
    await connection.end();
  }
};

await assertSafeTestDatabase(connectionString);
await cleanFixtures();
try {
  await createFixtures();
  const startsAt = await nextMondayAtNine();

  // Same actor/key callers serialize through the idempotency advisory lock.
  // The first call is held immediately before INSERT; the second is observed
  // waiting on its idempotency lock before the first is permitted to commit.
  const barrier = client();
  await barrier.connect();
  await installInsertRaceBarrier();
  const sameKey = "task8-same-key-concurrent-retry";
  const sameKeyFirst = await connectAs(customerOneId);
  const sameKeySecond = await connectAs(customerOneId);
  await barrier.query(`select pg_advisory_lock(${raceBarrierKey})`);
  const firstSameKey = startCreate(sameKeyFirst, petOneId, startsAt, sameKey);
  await waitForBarrierWaiters(1);
  const secondSameKey = startCreate(sameKeySecond, petOneId, startsAt, sameKey);
  await waitForIdempotencyWaiter();
  await barrier.query(`select pg_advisory_unlock(${raceBarrierKey})`);
  const sameKeyOutcomes = await Promise.all([firstSameKey, secondSameKey]);
  assert.equal(sameKeyOutcomes.filter((outcome) => outcome.ok).length, 2);
  assert.equal(sameKeyOutcomes[0].result.rows[0].id, sameKeyOutcomes[1].result.rows[0].id);
  await verifyCount(
    "select count(*)::integer as count from public.appointments where customer_id = $1",
    [customerOneId],
    1,
    "Same-key retries must create one appointment.",
  );
  await verifyCount(
    "select count(*)::integer as count from public.appointment_services snapshot join public.appointments appointment on appointment.id = snapshot.appointment_id where appointment.customer_id = $1",
    [customerOneId],
    1,
    "Same-key retries must create one snapshot.",
  );
  await verifyCount(
    "select count(*)::integer as count from public.idempotency_records where actor_id = $1 and operation = 'CREATE_APPOINTMENT' and idempotency_key = $2",
    [customerOneId, sameKey],
    1,
    "Same-key retries must persist one idempotency record.",
  );

  // Two different actors/keys reach the appointment INSERT concurrently. The
  // held shared advisory lock lets the harness observe both before release.
  const raceStartsAt = new Date(new Date(startsAt).getTime() + 2 * 60 * 60 * 1_000);
  await barrier.query(`select pg_advisory_lock(${raceBarrierKey})`);
  const firstConnection = await connectAs(customerOneId);
  const secondConnection = await connectAs(customerTwoId);
  const firstKey = randomUUID();
  const secondKey = randomUUID();
  const first = startCreate(firstConnection, petOneId, raceStartsAt, firstKey);
  const second = startCreate(secondConnection, petTwoId, raceStartsAt, secondKey);
  await waitForBarrierWaiters(2);
  await barrier.query(`select pg_advisory_unlock(${raceBarrierKey})`);
  const outcomes = await Promise.all([first, second]);

  assert.equal(outcomes.filter((outcome) => outcome.ok).length, 1);
  assert.equal(outcomes.filter((outcome) => !outcome.ok).length, 1);
  assert.match(String(outcomes.find((outcome) => !outcome.ok)?.error), /SLOT_UNAVAILABLE/);
  const losingKey = outcomes[0].ok ? secondKey : firstKey;
  const losingActorId = outcomes[0].ok ? customerTwoId : customerOneId;
  await verifyCount(
    "select count(*)::integer as count from public.idempotency_records where actor_id = $1 and operation = 'CREATE_APPOINTMENT' and idempotency_key = $2",
    [losingActorId, losingKey],
    0,
    "A failed different-key slot race must roll back its idempotency record.",
  );
  await barrier.end();
  await removeInsertRaceBarrier();

  await verifyCount(
    `select count(*)::integer as count
     from public.appointments
     where groomer_id = $1 and starts_at = $2::timestamptz and status = 'CONFIRMED'`,
    [groomerId, raceStartsAt],
    1,
    "Exactly one confirmed booking must survive a true same-slot insert race.",
  );
} finally {
  await removeInsertRaceBarrier();
  await cleanFixtures();
}
