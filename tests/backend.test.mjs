import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("backend entrypoint and core API routes are present", async () => {
  for (const path of [
    "worker/index.ts",
    "app/api/products/route.ts",
    "app/api/orders/route.ts",
    "app/api/stock-movements/route.ts",
  ]) {
    await assert.doesNotReject(readFile(path));
  }
});
