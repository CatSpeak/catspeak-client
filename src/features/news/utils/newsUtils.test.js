import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import { isPostInCommunity } from "./newsUtils.js"

test("isPostInCommunity matches only the selected community", () => {
  assert.equal(
    isPostInCommunity({ languageCommunity: "Japanese" }, "Japanese"),
    true,
  )
  assert.equal(
    isPostInCommunity({ languageCommunity: "English" }, "Japanese"),
    false,
  )
})

test("isPostInCommunity excludes posts shared with all or without a community", () => {
  assert.equal(isPostInCommunity({ languageCommunity: "All" }, "Japanese"), false)
  assert.equal(isPostInCommunity({}, "Japanese"), false)
})

test("isPostInCommunity ignores case and surrounding whitespace", () => {
  assert.equal(
    isPostInCommunity({ languageCommunity: " japanese " }, "Japanese"),
    true,
  )
})
