#!/usr/bin/env bash
set -euo pipefail

: "${TEST_DATABASE_URL:?Set TEST_DATABASE_URL to a disposable development/test database.}"
: "${ALLOW_DESTRUCTIVE_TEST_DATABASE:?Set ALLOW_DESTRUCTIVE_TEST_DATABASE=1 for disposable database tests.}"

node scripts/assert-test-database.mjs

for test_file in supabase/tests/[0-9][0-9][0-9]_*.sql; do
  psql --set=ON_ERROR_STOP=1 --dbname="$TEST_DATABASE_URL" --file="$test_file"
done

node tests/appointment-concurrency.integration.mjs
