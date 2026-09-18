import test from "node:test" // eslint-disable-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import { getVisibleStripParticipants } from "./stripParticipants.js"

const localCamOn = {
  identity: "user-1",
  isLocal: true,
  isCameraEnabled: true,
}
const remoteCamOff = {
  identity: "user-2",
  isLocal: false,
  isCameraEnabled: false,
}

test("2-user room shows BOTH users even when the remote camera is off", () => {
  const visible = getVisibleStripParticipants([localCamOn, remoteCamOff])
  assert.deepEqual(
    visible.map((p) => p.identity),
    ["user-1", "user-2"],
  )
})

test("strip still caps at the limit", () => {
  const many = Array.from({ length: 10 }, (_, i) => ({
    identity: `user-${i + 1}`,
    isLocal: i === 0,
    isCameraEnabled: true,
  }))
  assert.equal(getVisibleStripParticipants(many).length, 6)
})

test("empty room renders nothing", () => {
  assert.deepEqual(getVisibleStripParticipants([]), [])
  assert.deepEqual(getVisibleStripParticipants(null), [])
})
