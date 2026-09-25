// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"
import { WARM_EVERY_MS, shouldWarm, warmKindsFor } from "./moderationWarmup.js"

test("giao diện tiếng Trung xin thêm model tiếng Trung", () => {
  assert.deepEqual(warmKindsFor("zh"), ["text", "text-zh"])
  assert.deepEqual(warmKindsFor("vi"), ["text"])
  assert.deepEqual(warmKindsFor(undefined), ["text"])
})

test("mỗi 10 phút tối đa một lần", () => {
  assert.equal(shouldWarm(0, 1000), true)
  assert.equal(shouldWarm(1000, 1000 + WARM_EVERY_MS - 1), false)
  assert.equal(shouldWarm(1000, 1000 + WARM_EVERY_MS), true)
})
