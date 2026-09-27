// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  getExploreTeachersTotal,
  formatActiveClassesText,
  getTeacherSlugOrId,
} from "./teacherUtils.js"

test("getTeacherSlugOrId falls back to accountId when slug is null and id is absent", () => {
  // Real /explore/teachers list item shape: { accountId: 148, slug: null, ... }
  assert.equal(getTeacherSlugOrId({ accountId: 148, slug: null }), 148)
})

test("getTeacherSlugOrId prefers slug, then id", () => {
  assert.equal(getTeacherSlugOrId({ slug: "nguyen-binh", id: 9, accountId: 1 }), "nguyen-binh")
  assert.equal(getTeacherSlugOrId({ slug: null, id: 9, accountId: 1 }), 9)
  assert.equal(getTeacherSlugOrId({ slug: null }), undefined)
})

test("getExploreTeachersTotal reads backend pagination.total", () => {
  assert.equal(
    getExploreTeachersTotal({ data: [], pagination: { page: 1, pageSize: 6, total: 42, totalPages: 7 } }),
    42,
  )
})

test("getExploreTeachersTotal falls back to data.total, else 0", () => {
  assert.equal(getExploreTeachersTotal({ total: 3 }), 3)
  assert.equal(getExploreTeachersTotal(undefined), 0)
  assert.equal(getExploreTeachersTotal({}), 0)
  assert.equal(getExploreTeachersTotal({ pagination: {} }), 0)
})

test("formatActiveClassesText shows zero-state text when no active classes", () => {
  assert.equal(formatActiveClassesText(0), "Không có lớp đang mở")
  assert.equal(formatActiveClassesText(undefined), "Không có lớp đang mở")
  assert.equal(formatActiveClassesText(1), "1 lớp đang mở")
  assert.equal(formatActiveClassesText("3"), "3 lớp đang mở")
})
