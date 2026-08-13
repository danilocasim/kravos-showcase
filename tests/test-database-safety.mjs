import pg from "pg";

const safeDatabaseName = /^paw_polish_(?:test|task\d+|ci)_/;

/** Refuses destructive integration fixtures unless explicitly aimed at a test DB. */
export const assertSafeTestDatabase = async (connectionString) => {
  if (process.env.ALLOW_DESTRUCTIVE_TEST_DATABASE !== "1") {
    throw new Error(
      "Set ALLOW_DESTRUCTIVE_TEST_DATABASE=1 to run destructive database integration tests.",
    );
  }

  const connection = new pg.Client({ connectionString });
  await connection.connect();
  try {
    const { rows } = await connection.query("select current_database() as name");
    const databaseName = rows[0]?.name;
    if (typeof databaseName !== "string" || !safeDatabaseName.test(databaseName)) {
      throw new Error(
        "Refusing destructive database integration tests outside a paw_polish_test_/task*/ci_ database.",
      );
    }
  } finally {
    await connection.end();
  }
};
