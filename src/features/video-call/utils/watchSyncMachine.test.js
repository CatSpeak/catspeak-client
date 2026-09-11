import test from "node:test" // eslint-disable-line import/no-unresolved
// The repository's alias-only import resolver does not recognize this built-in subpath.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  createWatchSyncState,
  applyWatchSyncMessage,
  tapToSync,
  reportPlayerError,
} from "./watchSyncMachine.js"

const NOW = 1_000_000

test("load cues the video and stages position zero", () => {
  const { state, effects } = applyWatchSyncMessage(
    createWatchSyncState(),
    { type: "load", videoId: "abc123", title: "A video" },
    NOW,
    null,
  )
  assert.equal(state.status, "ready")
  assert.equal(state.videoId, "abc123")
  assert.equal(state.title, "A video")
  assert.deepEqual(effects, [{ type: "load", videoId: "abc123", title: "A video" }])
})

test("play applies immediately with latency compensation once interacted", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state
  s = tapToSync(s).state

  // Sender pressed play at NOW-2000 @10s → viewer lands at ~12s.
  const { effects } = applyWatchSyncMessage(
    s,
    { type: "play", position: 10, atTs: NOW - 2000 },
    NOW,
    0,
  )
  assert.deepEqual(effects, [{ type: "play", position: 12 }])
})

test("commands stage (no player touch) before the viewer taps to sync", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state

  const played = applyWatchSyncMessage(
    s,
    { type: "play", position: 10, atTs: NOW },
    NOW,
    0,
  )
  assert.deepEqual(played.effects, [])
  assert.equal(played.state.stagedPlaying, true)
  assert.equal(played.state.stagedPosition, 10)
})

test("tap to sync seeks to the staged target and matches play state", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state
  s = applyWatchSyncMessage(s, { type: "play", position: 10, atTs: NOW }, NOW, 0).state

  const { state, effects } = tapToSync(s)
  assert.equal(state.hasInteracted, true)
  assert.deepEqual(effects, [
    { type: "seek", position: 10 },
    { type: "play", position: 10 },
  ])
})

test("tap to sync with staged pause holds the frame instead of playing", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state
  s = applyWatchSyncMessage(s, { type: "pause", position: 7, atTs: NOW }, NOW, 0).state

  const { effects } = tapToSync(s)
  assert.deepEqual(effects, [
    { type: "seek", position: 7 },
    { type: "pause", position: 7 },
  ])
})

test("pause freezes exactly (no latency compensation)", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state
  s = tapToSync(s).state

  const { effects } = applyWatchSyncMessage(
    s,
    { type: "pause", position: 20, atTs: NOW - 5000 },
    NOW,
    25,
  )
  assert.deepEqual(effects, [{ type: "pause", position: 20 }])
})

test("heartbeat past the drift threshold seeks silently", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state
  s = tapToSync(s).state

  // Host plays @30s, viewer lags at 25s → silent catch-up seek to ~30s.
  const { effects } = applyWatchSyncMessage(
    s,
    { type: "sync", position: 30, playing: true, atTs: NOW },
    NOW,
    25,
  )
  assert.deepEqual(effects, [{ type: "seek", position: 30, silent: true }])
})

test("heartbeat inside the threshold leaves the player alone", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state
  s = tapToSync(s).state

  const { effects } = applyWatchSyncMessage(
    s,
    { type: "sync", position: 30, playing: true, atTs: NOW },
    NOW,
    29.2,
  )
  assert.deepEqual(effects, [])
})

test("heartbeat updates the staged target before interaction", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state

  const next = applyWatchSyncMessage(
    s,
    { type: "sync", position: 44, playing: true, atTs: NOW },
    NOW,
    null,
  )
  assert.deepEqual(next.effects, [])
  assert.equal(next.state.stagedPosition, 44)

  const tapped = tapToSync(next.state)
  assert.deepEqual(tapped.effects, [
    { type: "seek", position: 44 },
    { type: "play", position: 44 },
  ])
})

test("stop resets to idle with a stop effect", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state
  s = tapToSync(s).state

  const { state, effects } = applyWatchSyncMessage(s, { type: "stop" }, NOW, 10)
  assert.equal(state.status, "idle")
  assert.equal(state.videoId, null)
  assert.deepEqual(effects, [{ type: "stop" }])
})

test("unknown/null messages are ignored without touching state", () => {
  const s = createWatchSyncState()
  assert.deepEqual(applyWatchSyncMessage(s, null, NOW, null).effects, [])
  assert.deepEqual(
    applyWatchSyncMessage(s, { type: "dance" }, NOW, null).effects,
    [],
  )
  assert.equal(applyWatchSyncMessage(s, null, NOW, null).state, s)
})

test("player errors 101/150 surface an embed-blocked card", () => {
  let s = createWatchSyncState()
  s = applyWatchSyncMessage(s, { type: "load", videoId: "v", title: null }, NOW, null).state

  const { state, effects } = reportPlayerError(s, 101)
  assert.equal(state.status, "error")
  assert.equal(state.error.kind, "embed-blocked")
  assert.deepEqual(effects, [])

  const other = reportPlayerError(s, 150)
  assert.equal(other.state.error.kind, "embed-blocked")
})

test("other player errors surface a distinct playback-error card", () => {
  const s = createWatchSyncState()
  const { state } = reportPlayerError(s, 2)
  assert.equal(state.status, "error")
  assert.equal(state.error.kind, "playback-error")
})
