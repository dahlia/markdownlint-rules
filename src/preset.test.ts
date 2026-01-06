/**
 * Tests for the recommended configuration preset.
 *
 * @module
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import preset from "./preset.ts";

describe("preset", () => {
  test("disables MD051 to avoid conflicts with documentation generators", () => {
    assert.equal(
      preset.MD051,
      false,
      "MD051 should be disabled to avoid false positives with documentation generators",
    );
  });
});
