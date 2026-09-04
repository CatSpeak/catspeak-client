// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  parseNewsFilter,
  serializeNewsFilter,
  applyNewsFilter,
} from "./newsFilters.js"

test("parseNewsFilter returns defaults for empty search", () => {
  assert.deepEqual(parseNewsFilter(""), {
    searchKeyword: "",
    sortBy: "createDate",
  })
})

test("parseNewsFilter reads q and sort from a search string", () => {
  assert.deepEqual(parseNewsFilter("?q=catspeak&sort=viewCount"), {
    searchKeyword: "catspeak",
    sortBy: "viewCount",
  })
})

test("parseNewsFilter handles missing q and sort", () => {
  assert.deepEqual(parseNewsFilter("?lang=en"), {
    searchKeyword: "",
    sortBy: "createDate",
  })
})

test("parseNewsFilter falls back to default sort for unknown value", () => {
  assert.deepEqual(parseNewsFilter("?q=hello&sort=bogus"), {
    searchKeyword: "hello",
    sortBy: "createDate",
  })
})

test("serializeNewsFilter omits empty keyword and default sort", () => {
  assert.equal(serializeNewsFilter({ searchKeyword: "", sortBy: "createDate" }), "")
})

test("serializeNewsFilter serializes keyword and non-default sort", () => {
  assert.equal(
    serializeNewsFilter({ searchKeyword: "catspeak", sortBy: "reactionCount" }),
    "?q=catspeak&sort=reactionCount",
  )
})

test("serializeNewsFilter serializes keyword only when sort is default", () => {
  assert.equal(
    serializeNewsFilter({ searchKeyword: "grammar", sortBy: "createDate" }),
    "?q=grammar",
  )
})

test("serializeNewsFilter encodes special characters", () => {
  assert.equal(
    serializeNewsFilter({ searchKeyword: "a&b=c", sortBy: "viewCount" }),
    "?q=a%26b%3Dc&sort=viewCount",
  )
})

test("serializeNewsFilter falls back to default sort for unknown value", () => {
  assert.equal(
    serializeNewsFilter({ searchKeyword: "x", sortBy: "bogus" }),
    "?q=x",
  )
})

test("applyNewsFilter preserves unrelated params", () => {
  const params = applyNewsFilter("?lang=en", { searchKeyword: "cat", sortBy: "viewCount" })
  assert.equal(params.toString(), "lang=en&q=cat&sort=viewCount")
})

test("applyNewsFilter clears q and sort when empty", () => {
  const params = applyNewsFilter("?q=cat&sort=viewCount&lang=en", {
    searchKeyword: "",
    sortBy: "createDate",
  })
  assert.equal(params.toString(), "lang=en")
})