import test from "node:test" // eslint-disable-line import/no-unresolved
// The repository's alias-only import resolver does not recognize this built-in subpath.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  HOST_TRACK_INTERVAL_MS,
  SEEK_JUMP_THRESHOLD_S,
  YT_PLAYER_STATE,
  buildCommandPayload,
  buildHeartbeatPayload,
  detectHostTransition,
  shouldRunHostSync,
  encodeSyncPayload,
} from "./hostSync.js"
import { parseWatchSyncMessage } from "./watchSync.js"

test("host cadence constants match the PRD", () => {
  assert.equal(HOST_TRACK_INTERVAL_MS, 500)
  assert.equal(SEEK_JUMP_THRESHOLD_S, 2)
})

test("play command carries position + atTs", () => {
  assert.deepEqual(buildCommandPayload("play", 12.5, 1000), {
    t: "play",
    position: 12.5,
    atTs: 1000,
  })
})

test("pause and seek commands carry position + atTs", () => {
  assert.deepEqual(buildCommandPayload("pause", 3, 1000), {
    t: "pause",
    position: 3,
    atTs: 1000,
  })
  assert.deepEqual(buildCommandPayload("seek", 44.25, 1000), {
    t: "seek",
    position: 44.25,
    atTs: 1000,
  })
})

test("command builder rejects unknown types and bad positions", () => {
  assert.throws(() => buildCommandPayload("dance", 1, 1))
  assert.throws(() => buildCommandPayload("play", -1, 1))
  assert.throws(() => buildCommandPayload("play", Number.NaN, 1))
})

test("heartbeat payload carries position, playing and atTs", () => {
  assert.deepEqual(buildHeartbeatPayload(30, true, 1000), {
    t: "sync",
    position: 30,
    playing: true,
    atTs: 1000,
  })
})

test("first sample only records (heartbeat covers the position)", () => {
  assert.equal(
    detectHostTransition(null, { ytState: YT_PLAYER_STATE.PLAYING, position: 5 }),
    null,
  )
})

test("paused-to-playing publishes play at the current position", () => {
  assert.deepEqual(
    detectHostTransition(
      { ytState: YT_PLAYER_STATE.PAUSED, position: 10 },
      { ytState: YT_PLAYER_STATE.PLAYING, position: 10.2 },
    ),
    { command: "play", position: 10.2 },
  )
})

test("playing-to-paused publishes pause exactly (no compensation)", () => {
  assert.deepEqual(
    detectHostTransition(
      { ytState: YT_PLAYER_STATE.PLAYING, position: 10 },
      { ytState: YT_PLAYER_STATE.PAUSED, position: 10.4 },
    ),
    { command: "pause", position: 10.4 },
  )
})

test("playing-to-ended freezes the frame with pause", () => {
  assert.deepEqual(
    detectHostTransition(
      { ytState: YT_PLAYER_STATE.PLAYING, position: 100 },
      { ytState: YT_PLAYER_STATE.ENDED, position: 120 },
    ),
    { command: "pause", position: 120 },
  )
})

test("position jump while playing publishes seek", () => {
  assert.deepEqual(
    detectHostTransition(
      { ytState: YT_PLAYER_STATE.PLAYING, position: 10 },
      { ytState: YT_PLAYER_STATE.PLAYING, position: 50 },
    ),
    { command: "seek", position: 50 },
  )
})

test("steady playback and buffering emit nothing", () => {
  const steady = detectHostTransition(
    { ytState: YT_PLAYER_STATE.PLAYING, position: 10 },
    { ytState: YT_PLAYER_STATE.PLAYING, position: 10.5 },
  )
  assert.equal(steady, null)
  const buffering = detectHostTransition(
    { ytState: YT_PLAYER_STATE.PLAYING, position: 10 },
    { ytState: YT_PLAYER_STATE.BUFFERING, position: 10 },
  )
  assert.equal(buffering, null)
  const recovered = detectHostTransition(
    { ytState: YT_PLAYER_STATE.BUFFERING, position: 10 },
    { ytState: YT_PLAYER_STATE.PLAYING, position: 11 },
  )
  assert.equal(recovered, null)
})

test("host sync runs only for the host while presenting", () => {
  assert.equal(shouldRunHostSync({ isHost: true, isActive: true }), true)
  assert.equal(shouldRunHostSync({ isHost: false, isActive: true }), false)
  assert.equal(shouldRunHostSync({ isHost: true, isActive: false }), false)
})

test("encoded payloads decode through the viewer contract", () => {
  const wire = encodeSyncPayload(buildCommandPayload("seek", 7.5, 1000))
  assert.ok(wire instanceof Uint8Array)
  assert.deepEqual(parseWatchSyncMessage(wire), {
    type: "seek",
    position: 7.5,
    atTs: 1000,
  })
})
