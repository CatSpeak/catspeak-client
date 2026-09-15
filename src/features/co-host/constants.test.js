import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  CO_HOST_ALL,
  CO_HOST_GROUPS,
  CO_HOST_PERMISSIONS,
  CO_HOST_PERMISSION_LABELS,
  CO_HOST_PERMISSION_LABELS_ROOM,
  CO_HOST_PERMISSION_META,
  CO_HOST_PERMISSION_HELPERS_ROOM,
  countByGroup,
} from "./constants.js"

const ALL_CODES = Object.values(CO_HOST_PERMISSIONS)

test("catalog has 19 unique codes shared with the backend", () => {
  assert.equal(ALL_CODES.length, 19)
  assert.equal(new Set(ALL_CODES).size, 19)
  assert.equal(CO_HOST_ALL.length, 19)
  assert.deepEqual([...CO_HOST_ALL].sort(), [...ALL_CODES].sort())
})

test("every code belongs to exactly one group and each group total is correct", () => {
  const grouped = CO_HOST_GROUPS.flatMap((g) => g.permissions)
  assert.equal(grouped.length, 19)
  assert.equal(new Set(grouped).size, 19)
  assert.deepEqual([...grouped].sort(), [...CO_HOST_ALL].sort())

  for (const g of CO_HOST_GROUPS) {
    assert.equal(g.total, g.permissions.length, `group ${g.id} total`)
  }
  const counts = countByGroup(CO_HOST_ALL)
  for (const g of CO_HOST_GROUPS) {
    assert.equal(counts[g.id], g.total, `countByGroup ${g.id}`)
  }
})

test("the split moderation codes are their own entries", () => {
  const moderation = CO_HOST_GROUPS.find((g) => g.id === "member_moderation")
  assert.ok(moderation, "member_moderation group exists")
  assert.deepEqual(moderation.permissions, [
    CO_HOST_PERMISSIONS.CAMERA_OFF_ALL,
    CO_HOST_PERMISSIONS.BLOCK_ALL_MICS,
    CO_HOST_PERMISSIONS.LOWER_ALL_HANDS,
    CO_HOST_PERMISSIONS.RESTRICT_CHAT,
    CO_HOST_PERMISSIONS.RESTRICT_VOICE,
    CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE,
  ])
  // allow_member_recording sits with the other recording/security codes.
  const security = CO_HOST_GROUPS.find((g) => g.id === "room_security")
  assert.ok(security.permissions.includes(CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING))
})

test("every code has a label, a helper and icon meta in both room types", () => {
  for (const code of CO_HOST_ALL) {
    assert.ok(CO_HOST_PERMISSION_LABELS[code], `class label ${code}`)
    assert.ok(CO_HOST_PERMISSION_LABELS_ROOM[code], `room label ${code}`)
    assert.ok(CO_HOST_PERMISSION_META[code], `meta ${code}`)
    assert.ok(CO_HOST_PERMISSION_META[code].helper, `class helper ${code}`)
    assert.ok(CO_HOST_PERMISSION_HELPERS_ROOM[code], `room helper ${code}`)
  }
})
