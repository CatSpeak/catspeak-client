import test from "node:test" // eslint-disable-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import { buildWatchPlayerVars, shouldShowCenterPlay } from "./watchPlayerVars.js"

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
