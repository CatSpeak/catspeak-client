// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import { resolveItemLayout } from "./catalogLayout.js"

test("grid mode renders every item as a grid card", () => {
  assert.equal(resolveItemLayout({ isClassItem: false }, "grid"), "grid")
  assert.equal(resolveItemLayout({ isClassItem: true }, "grid"), "grid")
})

test("list mode renders courses as list rows", () => {
  assert.equal(resolveItemLayout({ isClassItem: false }, "list"), "list")
})

test("list mode ALSO renders standalone classes as list rows", () => {
  assert.equal(resolveItemLayout({ isClassItem: true }, "list"), "list")
})
