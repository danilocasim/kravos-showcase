import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, dirname } from "node:path";

/**
 * Reads connection details for the local Supabase stack.
 *
 * The end-to-end suite deliberately never reads `.env.local`: that file points at
 * whichever project the developer works against, and the suite creates and
 * deletes users. Values come from `supabase status` at run time instead, so no
 * key is written to a file, nothing needs to stay in sync, and a stopped stack
 * fails immediately with a clear message.
 */

export interface LocalSupabaseConfig {
  readonly apiUrl: string;
  readonly publishableKey: string;
  /** Local-only key used by fixtures to create test users. Never reaches the browser. */
  readonly serviceRoleKey: string;
  readonly databaseUrl: string;
}

/* Docker Desktop installs its CLI in one of these. We look for it explicitly
   because a different `docker` earlier on PATH shadows it on some machines, and
   the Supabase CLI then reports the database container as missing. */
const dockerCandidatePaths = [
  "/usr/local/bin/docker",
  "/Applications/Docker.app/Contents/Resources/bin/docker",
  `${process.env.HOME ?? ""}/.docker/bin/docker`,
];

const isRealDockerCli = (dockerPath: string): boolean => {
  try {
    execFileSync(dockerPath, ["version", "--format", "{{.Client.Version}}"], {
      stdio: ["ignore", "pipe", "ignore"],
    });

    return true;
  } catch {
    return false;
  }
};

/**
 * Builds a PATH where the real Docker CLI resolves first.
 *
 * @returns The current PATH, with Docker's directory prepended when one is found.
 */
const pathWithDocker = (): string => {
  const currentPath = process.env.PATH ?? "";
  const dockerPath = dockerCandidatePaths.find(
    (candidate) => existsSync(candidate) && isRealDockerCli(candidate),
  );

  return dockerPath === undefined
    ? currentPath
    : `${dirname(dockerPath)}${delimiter}${currentPath}`;
};

const parseEnvOutput = (output: string): Readonly<Record<string, string>> => {
  const values: Record<string, string> = {};

  for (const line of output.split("\n")) {
    const match = /^([A-Z0-9_]+)="?(.*?)"?$/.exec(line.trim());

    const name = match?.[1];
    const value = match?.[2];

    if (name !== undefined && value !== undefined) {
      values[name] = value;
    }
  }

  return values;
};

let cachedConfig: LocalSupabaseConfig | null = null;

/**
 * Returns the running local stack's URL and keys.
 *
 * @returns Connection details for the local Supabase stack.
 * @throws Error when the stack is not running or its output cannot be read.
 */
export const getLocalSupabaseConfig = (): LocalSupabaseConfig => {
  if (cachedConfig !== null) {
    return cachedConfig;
  }

  let output: string;

  try {
    output = execFileSync("supabase", ["status", "-o", "env"], {
      encoding: "utf8",
      env: { ...process.env, PATH: pathWithDocker() },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw new Error(
      "Could not read the local Supabase stack. Start it with `supabase start` " +
        "and make sure the Docker Desktop CLI resolves before any other program " +
        `named docker on your PATH. Underlying error: ${String(error)}`,
    );
  }

  const values = parseEnvOutput(output);
  const apiUrl = values.API_URL;
  const publishableKey = values.PUBLISHABLE_KEY;
  const serviceRoleKey = values.SERVICE_ROLE_KEY;
  const databaseUrl = values.DB_URL;

  if (
    apiUrl === undefined ||
    publishableKey === undefined ||
    serviceRoleKey === undefined ||
    databaseUrl === undefined
  ) {
    throw new Error(
      "The local Supabase stack did not report an API URL and keys. Run " +
        "`supabase start`, then `supabase status`, and check its output.",
    );
  }

  cachedConfig = { apiUrl, publishableKey, serviceRoleKey, databaseUrl };

  return cachedConfig;
};
