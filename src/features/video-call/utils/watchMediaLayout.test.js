import { test } from "vitest"

import assert from "@/shared/test-utils/nodeAssertStrict"

import { getWatchMediaUnitClass } from "./watchMediaLayout.js"

test("media unit centers vertically on mobile (letterbox, not top-void)", () => {
  assert.ok(getWatchMediaUnitClass().includes("m-auto"))
})

test("media unit resets to top-aligned on desktop", () => {
  assert.ok(getWatchMediaUnitClass().includes("md:m-0"))
})
