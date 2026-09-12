import test from "node:test" // eslint-disable-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  buildWatchPlayerVars,
  shouldShowCenterPlay,
  WATCH_CC_STORAGE_KEY,
  readWatchCcEnabled,
  writeWatchCcEnabled,
  applyWatchCcPreference,
  getWatchCaptionTracks,
} from "./watchPlayerVars.js"

test("watch player stays fully chromeless (toolbar is the only control surface)", () => {
  assert.deepEqual(buildWatchPlayerVars("https://staging.catspeak.com.vn"), {
    rel: 0,
    playsinline: 1,
    modestbranding: 1,
    enablejsapi: 1,
    controls: 0,
    disablekb: 1,
    fs: 0,
    iv_load_policy: 3,
    origin: "https://staging.catspeak.com.vn",
  })
})

test("host sees a center play button when not playing (replaces the dead native triangle)", () => {
  const host = { isHost: true }
  for (const s of [-1, 0, 2, 5]) {
    assert.equal(shouldShowCenterPlay(s, host), true, `state ${s} should show`)
  }
  for (const s of [1, 3, null, undefined]) {
    assert.equal(shouldShowCenterPlay(s, host), false, `state ${s} must hide`)
  }
})

test("center play never shows for viewers, errors, or pre-tap gate", () => {
  assert.equal(shouldShowCenterPlay(2, { isHost: false }), false)
  assert.equal(shouldShowCenterPlay(2, { isHost: true, hasError: true }), false)
  assert.equal(
    shouldShowCenterPlay(2, { isHost: true, needsTapToSync: true }),
    false,
  )
})

const memoryStorage = (initial = {}) => {
  const store = { ...initial }
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v)
    },
    removeItem: (k) => {
      delete store[k]
    },
    _store: store,
  }
}

test("CC defaults to OFF and round-trips through storage (Q8=A)", () => {
  assert.equal(readWatchCcEnabled(memoryStorage()), false)
  const storage = memoryStorage()
  writeWatchCcEnabled(true, storage)
  assert.equal(storage._store[WATCH_CC_STORAGE_KEY], "1")
  assert.equal(readWatchCcEnabled(storage), true)
  writeWatchCcEnabled(false, storage)
  assert.equal(readWatchCcEnabled(storage), false)
})

test("CC preference applies via captions module (load/unload only)", () => {
  const calls = []
  const player = {
    loadModule: (m) => calls.push(["load", m]),
    unloadModule: (m) => calls.push(["unload", m]),
  }
  assert.equal(applyWatchCcPreference(player, true), true)
  assert.equal(applyWatchCcPreference(player, false), true)
  assert.deepEqual(calls, [
    ["load", "captions"],
    ["unload", "captions"],
  ])
  assert.equal(applyWatchCcPreference(null, true), false)
})

test("caption tracks: empty disables, unknown keeps button enabled (Q9=A)", () => {
  assert.deepEqual(
    getWatchCaptionTracks({ getOption: () => [{ languageCode: "vi" }] }).length,
    1,
  )
  assert.deepEqual(getWatchCaptionTracks({ getOption: () => [] }), [])
  assert.equal(getWatchCaptionTracks({ getOption: () => undefined }), null)
  assert.equal(getWatchCaptionTracks(null), null)
})
