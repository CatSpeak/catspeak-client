// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  CONNECTION_QUALITY_LOST,
  CONNECTION_QUALITY_POOR,
  EGRESS_PROFILE_FULL,
  EGRESS_PROFILE_STANDARD,
  MAX_FOREIGN_VIDEO_TILES,
  TRACK_SOURCE_CAMERA,
  TRACK_SOURCE_SCREEN_SHARE,
  VIDEO_QUALITY_LOW,
  isDomesticCountry,
  normalizeConnectionQuality,
  normalizeEgressProfile,
  resolveCallPolicy,
  resolveEffectiveSubscriptionPlan,
  resolveSubscriptionPlan,
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

const camera = (participantId, trackSid = `TR_${participantId}`) => ({
  trackSid,
  participantId,
  source: TRACK_SOURCE_CAMERA,
  isLocal: false,
})

const screenShare = (participantId, trackSid = `TR_SS_${participantId}`) => ({
  trackSid,
  participantId,
  source: TRACK_SOURCE_SCREEN_SHARE,
  isLocal: false,
})

const cameraSubscriptions = (plan) =>
  plan.filter(
    (decision) =>
      decision.source === TRACK_SOURCE_CAMERA && decision.subscribed,
  )

const decisionOf = (plan, trackSid) =>
  plan.find((decision) => decision.trackSid === trackSid)

test("standard plan subscribes active speaker and pinned camera tiles at LOW", () => {
  const publications = [
    camera("alice"),
    camera("bob"),
    camera("carol"),
    camera("dave"),
  ]

  const plan = resolveSubscriptionPlan(
    publications,
    "carol",
    "bob",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_STANDARD,
  )

  assert.deepEqual(
    cameraSubscriptions(plan)
      .map((decision) => decision.participantId)
      .sort(),
    ["bob", "carol"],
  )
  assert.equal(decisionOf(plan, "TR_bob").quality, VIDEO_QUALITY_LOW)
  assert.equal(decisionOf(plan, "TR_carol").quality, VIDEO_QUALITY_LOW)

  const alice = decisionOf(plan, "TR_alice")
  assert.equal(alice.subscribed, false)
  assert.equal(alice.quality, null)
})

test("standard plan recomputes when the active speaker changes", () => {
  const publications = [camera("alice"), camera("bob"), camera("carol")]

  const before = resolveSubscriptionPlan(
    publications,
    "alice",
    "carol",
    2,
    EGRESS_PROFILE_STANDARD,
  )
  assert.deepEqual(
    cameraSubscriptions(before)
      .map((decision) => decision.participantId)
      .sort(),
    ["alice", "carol"],
  )

  const after = resolveSubscriptionPlan(
    publications,
    "bob",
    "carol",
    2,
    EGRESS_PROFILE_STANDARD,
  )
  assert.deepEqual(
    cameraSubscriptions(after)
      .map((decision) => decision.participantId)
      .sort(),
    ["bob", "carol"],
  )
  assert.equal(decisionOf(after, "TR_alice").subscribed, false)
  assert.equal(decisionOf(after, "TR_bob").quality, VIDEO_QUALITY_LOW)
})

test("standard plan recomputes when the pinned participant changes", () => {
  const publications = [camera("alice"), camera("bob"), camera("carol")]

  const before = resolveSubscriptionPlan(
    publications,
    "carol",
    "alice",
    2,
    EGRESS_PROFILE_STANDARD,
  )
  assert.deepEqual(
    cameraSubscriptions(before)
      .map((decision) => decision.participantId)
      .sort(),
    ["alice", "carol"],
  )

  const after = resolveSubscriptionPlan(
    publications,
    "carol",
    "bob",
    2,
    EGRESS_PROFILE_STANDARD,
  )
  assert.deepEqual(
    cameraSubscriptions(after)
      .map((decision) => decision.participantId)
      .sort(),
    ["bob", "carol"],
  )
  assert.equal(decisionOf(after, "TR_alice").subscribed, false)
})

test("standard plan never exceeds the camera tile cap", () => {
  const publications = [
    camera("alice"),
    camera("bob"),
    camera("carol"),
    camera("dave"),
  ]

  const capped = resolveSubscriptionPlan(
    publications,
    "carol",
    "bob",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_STANDARD,
  )
  assert.equal(cameraSubscriptions(capped).length, MAX_FOREIGN_VIDEO_TILES)

  const defaulted = resolveSubscriptionPlan(
    publications,
    "carol",
    "bob",
    null,
    EGRESS_PROFILE_STANDARD,
  )
  assert.equal(cameraSubscriptions(defaulted).length, MAX_FOREIGN_VIDEO_TILES)

  const pinnedOnly = resolveSubscriptionPlan(
    publications,
    "carol",
    "bob",
    1,
    EGRESS_PROFILE_STANDARD,
  )
  assert.deepEqual(
    cameraSubscriptions(pinnedOnly).map((decision) => decision.participantId),
    ["bob"],
  )

  const sameTile = resolveSubscriptionPlan(
    publications,
    "carol",
    "carol",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_STANDARD,
  )
  assert.equal(cameraSubscriptions(sameTile).length, 1)
})

test("standard plan keeps screen shares and audio fully subscribed", () => {
  const publications = [
    camera("alice"),
    screenShare("bob"),
    {
      trackSid: "TR_mic_alice",
      participantId: "alice",
      source: "microphone",
      isLocal: false,
    },
  ]

  const plan = resolveSubscriptionPlan(
    publications,
    "alice",
    null,
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_STANDARD,
  )

  const screen = decisionOf(plan, "TR_SS_bob")
  assert.equal(screen.subscribed, true)
  assert.equal(screen.quality, VIDEO_QUALITY_LOW)

  const mic = decisionOf(plan, "TR_mic_alice")
  assert.equal(mic.subscribed, true)
  assert.equal(mic.quality, null)
})

test("standard plan leaves the local self-view publication untouched", () => {
  const publications = [
    {
      trackSid: "TR_local_cam",
      participantId: "me",
      source: TRACK_SOURCE_CAMERA,
      isLocal: true,
    },
    camera("alice"),
    camera("bob"),
  ]

  const plan = resolveSubscriptionPlan(
    publications,
    "alice",
    null,
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_STANDARD,
  )

  const local = decisionOf(plan, "TR_local_cam")
  assert.equal(local.subscribed, true)
  assert.equal(local.quality, null)
})

test("standard plan ignores unknown speaker and pinned identities", () => {
  const publications = [camera("alice"), camera("bob")]

  const plan = resolveSubscriptionPlan(
    publications,
    "ghost",
    "nobody",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_STANDARD,
  )

  assert.equal(cameraSubscriptions(plan).length, 0)
})

test("missing, unknown or empty country/profile keeps the full grid", () => {
  const publications = [
    camera("alice"),
    camera("bob"),
    screenShare("carol"),
  ]

  for (const profile of [
    undefined,
    null,
    "",
    "bogus",
    EGRESS_PROFILE_FULL,
  ]) {
    const plan = resolveSubscriptionPlan(
      publications,
      "alice",
      "bob",
      null,
      profile,
    )
    assert.ok(
      plan.every(
        (decision) => decision.subscribed === true && decision.quality === null,
      ),
      `profile ${String(profile)} should keep every publication subscribed`,
    )
  }

  const emptyCountryPolicy = resolveCallPolicy("", undefined, false)
  assert.equal(emptyCountryPolicy.egressProfile, EGRESS_PROFILE_FULL)
  assert.equal(emptyCountryPolicy.subscribe.maxVideoTiles, null)

  const plan = resolveSubscriptionPlan(
    publications,
    "alice",
    "bob",
    emptyCountryPolicy.subscribe.maxVideoTiles,
    emptyCountryPolicy.egressProfile,
  )
  assert.equal(cameraSubscriptions(plan).length, 2)
})

const microphone = (participantId, trackSid = `TR_mic_${participantId}`) => ({
  trackSid,
  participantId,
  source: "microphone",
  isLocal: false,
})

test("subscription plan flags essential tiles independently of the profile", () => {
  const publications = [
    camera("alice"),
    camera("bob"),
    camera("carol"),
    screenShare("dave"),
    microphone("alice"),
  ]

  const standard = resolveSubscriptionPlan(
    publications,
    "alice",
    "bob",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_STANDARD,
  )
  assert.equal(decisionOf(standard, "TR_alice").essential, true)
  assert.equal(decisionOf(standard, "TR_bob").essential, true)
  assert.equal(decisionOf(standard, "TR_carol").essential, false)
  assert.equal(decisionOf(standard, "TR_SS_dave").essential, true)
  assert.equal(decisionOf(standard, "TR_mic_alice").essential, true)

  const full = resolveSubscriptionPlan(
    publications,
    "alice",
    "bob",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_FULL,
  )
  assert.equal(decisionOf(full, "TR_alice").essential, true)
  assert.equal(decisionOf(full, "TR_bob").essential, true)
  assert.equal(decisionOf(full, "TR_carol").essential, false)
  assert.equal(decisionOf(full, "TR_SS_dave").essential, true)
  assert.equal(decisionOf(full, "TR_carol").subscribed, true)
})

test("normalizeConnectionQuality lowercases and trims unknown values", () => {
  assert.equal(normalizeConnectionQuality("POOR"), CONNECTION_QUALITY_POOR)
  assert.equal(normalizeConnectionQuality(" Lost "), CONNECTION_QUALITY_LOST)
  assert.equal(normalizeConnectionQuality(undefined), "")
  assert.equal(normalizeConnectionQuality(null), "")
  assert.equal(normalizeConnectionQuality("bogus"), "bogus")
})

test("effective plan is the base plan while the connection is not degraded", () => {
  const publications = [
    camera("alice"),
    camera("bob"),
    camera("carol"),
    screenShare("dave"),
    microphone("alice"),
  ]
  const base = resolveSubscriptionPlan(
    publications,
    "alice",
    "bob",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_STANDARD,
  )
  const snapshot = JSON.parse(JSON.stringify(base))

  for (const quality of ["excellent", "good", "unknown", undefined, null, ""]) {
    assert.deepEqual(resolveEffectiveSubscriptionPlan(quality, base), base)
  }

  assert.deepEqual(base, snapshot, "base plan must not be mutated")
})

test("POOR keeps essentials at LOW and drops non-essential video for every profile", () => {
  const publications = [
    camera("alice"),
    camera("bob"),
    camera("carol"),
    camera("dave"),
    screenShare("erin"),
    microphone("erin"),
  ]
  const base = resolveSubscriptionPlan(
    publications,
    "carol",
    "bob",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_FULL,
  )
  assert.equal(
    base.filter((decision) => decision.subscribed).length,
    publications.length,
  )

  const plan = resolveEffectiveSubscriptionPlan(
    CONNECTION_QUALITY_POOR,
    base,
  )

  for (const trackSid of ["TR_carol", "TR_bob", "TR_SS_erin"]) {
    const decision = decisionOf(plan, trackSid)
    assert.equal(decision.subscribed, true, `${trackSid} stays subscribed`)
    assert.equal(decision.quality, VIDEO_QUALITY_LOW, `${trackSid} is LOW`)
  }

  for (const trackSid of ["TR_alice", "TR_dave"]) {
    const decision = decisionOf(plan, trackSid)
    assert.equal(decision.subscribed, false, `${trackSid} is dropped`)
    assert.equal(decision.quality, null)
  }

  const mic = decisionOf(plan, "TR_mic_erin")
  assert.equal(mic.subscribed, true)
  assert.equal(mic.quality, null)
})

test("POOR keeps the standard subscription cap untouched", () => {
  const publications = [camera("alice"), camera("bob"), camera("carol")]
  const base = resolveSubscriptionPlan(
    publications,
    "carol",
    "bob",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_STANDARD,
  )

  const plan = resolveEffectiveSubscriptionPlan(
    CONNECTION_QUALITY_POOR,
    base,
  )
  assert.deepEqual(
    cameraSubscriptions(plan)
      .map((decision) => decision.participantId)
      .sort(),
    ["bob", "carol"],
  )
  assert.ok(
    cameraSubscriptions(plan).every(
      (decision) => decision.quality === VIDEO_QUALITY_LOW,
    ),
  )
  assert.equal(decisionOf(plan, "TR_alice").subscribed, false)
})

test("LOST switches every video subscription to audio-only", () => {
  const publications = [
    camera("alice"),
    camera("bob"),
    screenShare("carol"),
    microphone("carol"),
  ]
  const base = resolveSubscriptionPlan(
    publications,
    "alice",
    "bob",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_FULL,
  )

  const plan = resolveEffectiveSubscriptionPlan(
    CONNECTION_QUALITY_LOST,
    base,
  )

  for (const trackSid of ["TR_alice", "TR_bob", "TR_SS_carol"]) {
    const decision = decisionOf(plan, trackSid)
    assert.equal(decision.subscribed, false, `${trackSid} is dropped`)
    assert.equal(decision.quality, null)
  }

  const mic = decisionOf(plan, "TR_mic_carol")
  assert.equal(mic.subscribed, true)
  assert.equal(mic.quality, null)
})

test("audio-only recovers when the connection quality improves", () => {
  const publications = [
    camera("alice"),
    camera("bob"),
    camera("carol"),
    screenShare("dave"),
    microphone("alice"),
  ]
  const base = resolveSubscriptionPlan(
    publications,
    "alice",
    "bob",
    MAX_FOREIGN_VIDEO_TILES,
    EGRESS_PROFILE_FULL,
  )

  const lost = resolveEffectiveSubscriptionPlan(CONNECTION_QUALITY_LOST, base)
  assert.equal(cameraSubscriptions(lost).length, 0)

  const poor = resolveEffectiveSubscriptionPlan(CONNECTION_QUALITY_POOR, lost)
  assert.deepEqual(
    cameraSubscriptions(poor)
      .map((decision) => decision.participantId)
      .sort(),
    ["alice", "bob"],
  )
  assert.equal(decisionOf(poor, "TR_alice").quality, VIDEO_QUALITY_LOW)
  assert.equal(decisionOf(poor, "TR_SS_dave").subscribed, true)

  const recovered = resolveEffectiveSubscriptionPlan("excellent", base)
  assert.deepEqual(recovered, base)
  assert.equal(decisionOf(recovered, "TR_alice").subscribed, true)
  assert.equal(decisionOf(recovered, "TR_alice").quality, null)
  assert.equal(decisionOf(recovered, "TR_carol").subscribed, true)
  assert.equal(decisionOf(recovered, "TR_mic_alice").subscribed, true)
})

test("degenerate base plans resolve to an empty plan", () => {
  for (const base of [undefined, null, "bogus"]) {
    assert.deepEqual(
      resolveEffectiveSubscriptionPlan(CONNECTION_QUALITY_POOR, base),
      [],
    )
    assert.deepEqual(
      resolveEffectiveSubscriptionPlan(CONNECTION_QUALITY_LOST, base),
      [],
    )
  }
})
