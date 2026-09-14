// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import { canViewBannedList } from "./roomAccess.js"

test("host can always view the banned list", () => {
  assert.equal(canViewBannedList({ isHost: true }), true)
})

test("co-host with remove_student can view the banned list", () => {
  assert.equal(
    canViewBannedList({
      isHost: false,
      coHost: { coHostAccountId: 5, permissions: ["remove_student"] },
      accountId: 5,
    }),
    true,
  )
})

test("co-host with mute_all can view the banned list", () => {
  assert.equal(
    canViewBannedList({
      isHost: false,
      coHost: { coHostAccountId: 5, permissions: ["mute_all"] },
      accountId: 5,
    }),
    true,
  )
})

test("co-host without moderation permission cannot view the banned list", () => {
  assert.equal(
    canViewBannedList({
      isHost: false,
      coHost: { coHostAccountId: 5, permissions: ["mic_toggle", "record"] },
      accountId: 5,
    }),
    false,
  )
})

test("a regular participant cannot view the banned list", () => {
  assert.equal(
    canViewBannedList({
      isHost: false,
      coHost: { coHostAccountId: 5, permissions: ["remove_student"] },
      accountId: 99,
    }),
    false,
  )
})

test("missing co-host or account id is denied", () => {
  assert.equal(canViewBannedList({}), false)
  assert.equal(
    canViewBannedList({ coHost: { coHostAccountId: 5, permissions: ["mute_all"] }, accountId: null }),
    false,
  )
})
