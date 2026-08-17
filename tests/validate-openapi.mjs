import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import SwaggerParser from "@apidevtools/swagger-parser";

const contractPath = new URL("../doc/openapi.v1.json", import.meta.url);
const contract = JSON.parse(await readFile(contractPath, "utf8"));

await SwaggerParser.validate(contract);

const expectedOperations = [
  ["/api/v1/services", "get"],
  ["/api/v1/groomers", "get"],
  ["/api/v1/pets", "get"],
  ["/api/v1/pets", "post"],
  ["/api/v1/pets/{petId}", "patch"],
  ["/api/v1/pets/{petId}", "delete"],
  ["/api/v1/availability/search", "post"],
  ["/api/v1/appointments", "get"],
  ["/api/v1/appointments", "post"],
  ["/api/v1/appointments/{appointmentId}/reschedule", "post"],
  ["/api/v1/appointments/{appointmentId}/cancel", "post"],
];

const kravosOperations = [
  ["/api/v1/integrations/kravos/catalog", "post"],
  ["/api/v1/integrations/kravos/customers/resolve", "post"],
  ["/api/v1/integrations/kravos/customers/context", "post"],
  ["/api/v1/integrations/kravos/booking/options", "post"],
  ["/api/v1/integrations/kravos/booking/confirm", "post"],
  ["/api/v1/integrations/kravos/booking/reschedule", "post"],
  ["/api/v1/integrations/kravos/availability/search", "post"],
  ["/api/v1/integrations/kravos/appointments/create", "post"],
  ["/api/v1/integrations/kravos/appointments/reschedule", "post"],
  ["/api/v1/integrations/kravos/appointments/cancel", "post"],
];

const assertOperation = (path, method) => {
  const operation = contract.paths[path]?.[method];
  assert.ok(operation, `Missing ${method.toUpperCase()} ${path}.`);
  assert.deepEqual(
    operation.security,
    [{ SupabaseSession: [] }],
    `${method.toUpperCase()} ${path} must require the documented session.`,
  );
  assert.ok(operation.responses["401"], `${method.toUpperCase()} ${path} lacks 401.`);
  assert.ok(operation.responses["500"], `${method.toUpperCase()} ${path} lacks 500.`);
};

for (const [path, method] of expectedOperations) {
  assertOperation(path, method);
}

for (const [path, method] of kravosOperations) {
  const operation = contract.paths[path]?.[method];
  assert.ok(operation, `Missing ${method.toUpperCase()} ${path}.`);
  assert.deepEqual(operation.security, [
    { SupabaseSession: [] },
    { KravosBearer: [] },
    ...(path.includes("/booking/") ? [{ DemoConciergeMarker: [] }] : []),
  ]);
  assert.ok(operation.responses["401"], `${method.toUpperCase()} ${path} lacks 401.`);
  assert.ok(operation.responses["422"], `${method.toUpperCase()} ${path} lacks 422.`);
  assert.ok(operation.responses["500"], `${method.toUpperCase()} ${path} lacks 500.`);
}

for (const [path, method] of expectedOperations.filter(
  ([path, method]) => path.includes("{") || method === "post",
)) {
  assert.ok(
    contract.paths[path][method].responses["422"],
    `${method.toUpperCase()} ${path} lacks 422 validation response.`,
  );
}

for (const path of Object.keys(contract.paths)) {
  assert.ok(path.startsWith("/api/v1/"), `Only v1 paths are allowed: ${path}`);
}

console.log(
  `Validated ${contract.info.title} ${contract.info.version}: ${expectedOperations.length + kravosOperations.length} operations.`,
);
