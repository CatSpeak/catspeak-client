// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  EGRESS_PROFILE_FULL,
  EGRESS_PROFILE_STANDARD,
  MAX_FOREIGN_VIDEO_TILES,
  isDomesticCountry,
  normalizeEgressProfile,
  resolveCallPolicy,
} from "./callPolicy.js"

test("standard profile caps publish and subscription settings", () => {
  const policy = resolveCallPolicy("Japan", "standard", false)

  assert.equal(policy.egressProfile, EGRESS_PROFILE_STANDARD)
  assert.equal(policy.isForeign, true)
  assert.equal(policy.adaptiveStream, true)
  assert.equal(policy.dynacast, true)
  assert.equal(policy.publish.cameraPreset, "h360")
  assert.deepEqual(policy.publish.simulcastPresets, ["h180", "h360"])
  assert.deepEqual(policy.publish.screenShareEncoding, {
    maxBitrate: 400000,
    maxFramerate: 15,
  })
  assert.equal(policy.subscribe.maxVideoTiles, MAX_FOREIGN_VIDEO_TILES)
  assert.equal(policy.subscribe.videoQuality, "low")
})

test("full profile keeps full-quality publish and subscription settings", () => {
  const policy = resolveCallPolicy("Vietnam", "full", false)

  assert.equal(policy.egressProfile, EGRESS_PROFILE_FULL)
  assert.equal(policy.isForeign, false)
  assert.equal(policy.publish.cameraPreset, "h720")
  assert.equal(policy.publish.simulcastPresets, null)
  assert.equal(policy.publish.screenShareEncoding, null)
  assert.equal(policy.subscribe.maxVideoTiles, null)
  assert.equal(policy.subscribe.videoQuality, null)
})

test("kill switch off (foreign country + full profile) removes all caps", () => {
  const policy = resolveCallPolicy("Japan", "full", true)

  assert.equal(policy.isForeign, true)
  assert.equal(policy.egressProfile, EGRESS_PROFILE_FULL)
  assert.equal(policy.publish.cameraPreset, "h720")
  assert.equal(policy.publish.simulcastPresets, null)
  assert.equal(policy.subscribe.maxVideoTiles, null)
})

test("high-quality flag never lifts the standard cap", () => {
  const foreign = resolveCallPolicy("Japan", "standard", true)
  assert.equal(foreign.highQuality, true)
  assert.equal(foreign.publish.cameraPreset, "h360")
  assert.equal(foreign.subscribe.maxVideoTiles, MAX_FOREIGN_VIDEO_TILES)

  const domestic = resolveCallPolicy("Vietnam", "standard", true)
  assert.equal(domestic.publish.cameraPreset, "h360")
  assert.equal(domestic.publish.simulcastPresets.length, 2)
})

test("missing or unknown egress profile falls back to full", () => {
  assert.equal(normalizeEgressProfile(undefined), "full")
  assert.equal(normalizeEgressProfile(null), "full")
  assert.equal(normalizeEgressProfile(""), "full")
  assert.equal(normalizeEgressProfile("bogus"), "full")
  assert.equal(normalizeEgressProfile("standard"), "standard")

  const policy = resolveCallPolicy("Japan", undefined, false)
  assert.equal(policy.egressProfile, EGRESS_PROFILE_FULL)
  assert.equal(policy.publish.cameraPreset, "h720")
})

test("empty or unknown country counts as domestic", () => {
  for (const country of [undefined, null, "", "   ", "Vietnam", "vietnam", "  VN  ", "Việt Nam"]) {
    assert.equal(isDomesticCountry(country), true)
  }

  for (const country of ["Japan", "Singapore", "United States"]) {
    assert.equal(isDomesticCountry(country), false)
  }

  assert.equal(resolveCallPolicy("", "standard", false).isForeign, false)
})
