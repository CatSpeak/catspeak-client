import test from "node:test"
import assert from "node:assert/strict"
import { normalizeClassCreationParticipants } from "./classCreationParticipants.js"

test("creation selections reach checkout with numeric IDs and permissions", () => {
  assert.deepEqual(normalizeClassCreationParticipants({ invitedAccountIds: ["2", 3, 2], coHostAccountId: "3", coHostPermissions: ["share_screen", "record"] }), {
    invitedAccountIds: [2, 3], coHostAccountId: 3, coHostPermissions: ["share_screen", "record"],
  })
})
test("legacy creation without selections remains supported", () => {
  assert.deepEqual(normalizeClassCreationParticipants(), { invitedAccountIds: [], coHostAccountId: null, coHostPermissions: [] })
})
test("co-host has minimal screen sharing permission by default", () => {
  assert.deepEqual(normalizeClassCreationParticipants({ coHostAccountId: 3 }).coHostPermissions, ["share_screen"])
})
test("invalid selections cannot silently become empty options", () => {
  for (const data of [
    { invitedAccountIds: [0] }, { invitedAccountIds: [1.5] }, { invitedAccountIds: "2" },
    { invitedAccountIds: Array.from({ length: 51 }, (_, i) => i + 1) },
    { coHostAccountId: "invalid" }, { coHostAccountId: -1 },
    { coHostAccountId: 3, coHostPermissions: [] }, { coHostAccountId: 3, coHostPermissions: ["admin"] },
  ]) assert.throws(() => normalizeClassCreationParticipants(data))
})
