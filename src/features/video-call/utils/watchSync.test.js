import test from "node:test" // eslint-disable-line import/no-unresolved
// The repository's alias-only import resolver does not recognize this built-in subpath.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  WATCH_SYNC_TOPIC,
  SYNC_HEARTBEAT_INTERVAL_MS,
  SYNC_DRIFT_THRESHOLD_S,
  parseWatchSyncMessage,
  buildWatchSyncMessage,
  extrapolatePosition,
  shouldSilentSeek,
} from "./watchSync.js"

test("contract constants match the PRD", () => {
  assert.equal(WATCH_SYNC_TOPIC, "watch-sync")
  assert.equal(SYNC_HEARTBEAT_INTERVAL_MS, 5000)
  assert.equal(SYNC_DRIFT_THRESHOLD_S, 1.5)
})

test("parse accepts a load command from DataChannel bytes", () => {
  const bytes = new TextEncoder().encode(
    JSON.stringify({ t: "load", videoId: "dQw4w9WgXcQ", title: "Never" }),
  )
  assert.deepEqual(parseWatchSyncMessage(bytes), {
    type: "load",
    videoId: "dQw4w9WgXcQ",
    title: "Never",
  })
})

test("parse accepts a play command with position + atTs", () => {
  const msg = parseWatchSyncMessage(
    JSON.stringify({ t: "play", position: 12.5, atTs: 1700000000000 }),
  )
  assert.deepEqual(msg, {
    type: "play",
    position: 12.5,
    atTs: 1700000000000,
  })
})

test("parse accepts heartbeat sync with playing flag", () => {
  const msg = parseWatchSyncMessage({
    t: "sync",
    position: 30,
    playing: true,
    atTs: 1700000000000,
  })
  assert.deepEqual(msg, {
    type: "sync",
    position: 30,
    playing: true,
    atTs: 1700000000000,
  })
})

test("parse accepts stop with no fields", () => {
  assert.deepEqual(parseWatchSyncMessage(JSON.stringify({ t: "stop" })), {
    type: "stop",
  })
})

test("parse rejects unknown types, garbage and shapes", () => {
  assert.equal(parseWatchSyncMessage(JSON.stringify({ t: "dance" })), null)
  assert.equal(parseWatchSyncMessage("not json{{"), null)
  assert.equal(parseWatchSyncMessage(null), null)
  assert.equal(parseWatchSyncMessage(undefined), null)
  assert.equal(parseWatchSyncMessage(JSON.stringify({ t: "play" })), null)
  assert.equal(
    parseWatchSyncMessage(JSON.stringify({ t: "play", position: -3 })),
    null,
  )
  assert.equal(
    parseWatchSyncMessage(JSON.stringify({ t: "load", videoId: "" })),
    null,
  )
  assert.equal(
    parseWatchSyncMessage(JSON.stringify({ t: "sync", position: 1 })),
    null,
  )
})

test("build round-trips through parse", () => {
  const wire = buildWatchSyncMessage("seek", { position: 42.25, atTs: 99 })
  assert.equal(typeof wire, "string")
  assert.deepEqual(parseWatchSyncMessage(wire), {
    type: "seek",
    position: 42.25,
    atTs: 99,
  })
})

test("build rejects unknown types", () => {
  assert.throws(() => buildWatchSyncMessage("dance", {}))
})

test("extrapolatePosition compensates sender-to-receiver latency", () => {
  // Sender pressed play at t=1000ms @10s; 1500ms later the viewer is at ~11.5s.
  assert.equal(extrapolatePosition(10, 1000, 2500), 11.5)
})

test("extrapolatePosition clamps clock skew to zero elapsed", () => {
  assert.equal(extrapolatePosition(10, 5000, 2500), 10)
})

test("extrapolatePosition without atTs returns position as-is", () => {
  assert.equal(extrapolatePosition(10, null, 2500), 10)
  assert.equal(extrapolatePosition(10, undefined, 2500), 10)
})

test("shouldSilentSeek only fires past the 1.5s threshold", () => {
  assert.equal(shouldSilentSeek(10, 11.5), false)
  assert.equal(shouldSilentSeek(10, 11.51), true)
  assert.equal(shouldSilentSeek(11.6, 10), true)
  assert.equal(shouldSilentSeek(10, 10.2), false)
})
