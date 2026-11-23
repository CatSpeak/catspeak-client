import test from "node:test" // eslint-disable-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import { getWatchMediaUnitClass } from "./watchMediaLayout.js"

test("media unit centers vertically on mobile (letterbox, not top-void)", () => {
  assert.ok(getWatchMediaUnitClass().includes("m-auto"))
})

test("media unit resets to top-aligned on desktop", () => {
  assert.ok(getWatchMediaUnitClass().includes("md:m-0"))
})
