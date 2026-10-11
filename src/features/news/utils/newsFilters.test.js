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
    topicIds: [],
  })
})

test("parseNewsFilter reads q, sort, and topicIds from a search string", () => {
  assert.deepEqual(parseNewsFilter("?q=catspeak&sort=viewCount&topicIds=1,2,3"), {
    searchKeyword: "catspeak",
    sortBy: "viewCount",
    topicIds: [1, 2, 3],
  })
})

test("parseNewsFilter handles missing q, sort, and topicIds", () => {
  assert.deepEqual(parseNewsFilter("?lang=en"), {
    searchKeyword: "",
    sortBy: "createDate",
    topicIds: [],
  })
})

test("parseNewsFilter falls back to default sort for unknown value", () => {
  assert.deepEqual(parseNewsFilter("?q=hello&sort=bogus"), {
    searchKeyword: "hello",
    sortBy: "createDate",
    topicIds: [],
  })
})

test("serializeNewsFilter omits empty keyword and default sort", () => {
  assert.equal(serializeNewsFilter({ searchKeyword: "", sortBy: "createDate", topicIds: [] }), "")
})

test("serializeNewsFilter serializes keyword, non-default sort, and topicIds", () => {
  assert.equal(
    serializeNewsFilter({ searchKeyword: "catspeak", sortBy: "reactionCount", topicIds: [1, 2] }),
    "?q=catspeak&sort=reactionCount&topicIds=1%2C2",
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
  const params = applyNewsFilter("?lang=en", { searchKeyword: "cat", sortBy: "viewCount", topicIds: [5] })
  assert.equal(params.toString(), "lang=en&q=cat&sort=viewCount&topicIds=5")
})

test("applyNewsFilter clears q, sort, and topicIds when empty", () => {
  const params = applyNewsFilter("?q=cat&sort=viewCount&topicIds=5&lang=en", {
    searchKeyword: "",
    sortBy: "createDate",
    topicIds: [],
  })
  assert.equal(params.toString(), "lang=en")
})