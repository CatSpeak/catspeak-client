export const EGRESS_PROFILE_STANDARD = "standard"
export const EGRESS_PROFILE_FULL = "full"

export const MAX_FOREIGN_VIDEO_TILES = 2

export const TRACK_SOURCE_CAMERA = "camera"
export const TRACK_SOURCE_SCREEN_SHARE = "screen_share"
export const VIDEO_QUALITY_LOW = "low"

export const CONNECTION_QUALITY_POOR = "poor"
export const CONNECTION_QUALITY_LOST = "lost"

const DOMESTIC_COUNTRY_VALUES = new Set(["vietnam", "vn", "việt nam"])

export function normalizeEgressProfile(egressProfile) {
  return egressProfile === EGRESS_PROFILE_STANDARD
    ? EGRESS_PROFILE_STANDARD
    : EGRESS_PROFILE_FULL
}

export function isDomesticCountry(country) {
  if (typeof country !== "string") return true
  const normalized = country.trim().toLowerCase()
  if (!normalized) return true
  return DOMESTIC_COUNTRY_VALUES.has(normalized)
}

export function resolveCallPolicy(country, egressProfile, highQuality = false) {
  const profile = normalizeEgressProfile(egressProfile)
  const capped = profile === EGRESS_PROFILE_STANDARD

  return {
    egressProfile: profile,
    isForeign: !isDomesticCountry(country),
    highQuality: Boolean(highQuality),
    adaptiveStream: true,
    dynacast: true,
    publish: {
      cameraPreset: capped ? "h360" : "h720",
      simulcastPresets: capped ? ["h180", "h360"] : null,
      screenShareEncoding: capped
        ? { maxBitrate: 400000, maxFramerate: 15 }
        : null,
    },
    subscribe: {
      maxVideoTiles: capped ? MAX_FOREIGN_VIDEO_TILES : null,
      videoQuality: capped ? "low" : null,
    },
  }
}

export function resolveSubscriptionPlan(
  publications,
  activeSpeakerId,
  pinnedId,
  maxTiles,
  profile,
) {
  const list = Array.isArray(publications) ? publications : []
  const isStandard = normalizeEgressProfile(profile) === EGRESS_PROFILE_STANDARD

  const essentialParticipantIds = []
  const cap =
    Number.isInteger(maxTiles) && maxTiles > 0
      ? maxTiles
      : MAX_FOREIGN_VIDEO_TILES

  for (const candidate of [pinnedId, activeSpeakerId]) {
    if (typeof candidate !== "string" || !candidate) continue
    if (essentialParticipantIds.includes(candidate)) continue
    if (essentialParticipantIds.length >= cap) break
    essentialParticipantIds.push(candidate)
  }

  return list.map((publication) => {
    const decision = {
      trackSid: publication.trackSid,
      participantId: publication.participantId,
      source: publication.source,
      essential: true,
      subscribed: true,
      quality: null,
    }

    if (publication.isLocal) return decision

    if (publication.source === TRACK_SOURCE_SCREEN_SHARE) {
      return isStandard ? { ...decision, quality: VIDEO_QUALITY_LOW } : decision
    }

    if (publication.source !== TRACK_SOURCE_CAMERA) return decision

    decision.essential = essentialParticipantIds.includes(
      publication.participantId,
    )

    if (isStandard) {
      decision.subscribed = decision.essential
      if (decision.subscribed) decision.quality = VIDEO_QUALITY_LOW
    }

    return decision
  })
}

export function normalizeConnectionQuality(connectionQuality) {
  if (typeof connectionQuality !== "string") return ""
  return connectionQuality.trim().toLowerCase()
}

const isVideoDecision = (decision) =>
  decision !== null &&
  typeof decision === "object" &&
  (decision.source === TRACK_SOURCE_CAMERA ||
    decision.source === TRACK_SOURCE_SCREEN_SHARE)

/**
 * Applies the local connection-quality fallback on top of a subscription plan.
 *
 * POOR drops non-essential video (the plan's `essential` tiles — active
 * speaker, pinned camera and screen share — are kept) and lowers whatever
 * remains to LOW. LOST switches to audio-only. Any other quality (including
 * unknown) returns the base plan untouched, which is also how subscriptions
 * recover automatically once the network improves.
 */
export function resolveEffectiveSubscriptionPlan(connectionQuality, basePlan) {
  const plan = Array.isArray(basePlan) ? basePlan : []
  const quality = normalizeConnectionQuality(connectionQuality)

  if (
    quality !== CONNECTION_QUALITY_POOR &&
    quality !== CONNECTION_QUALITY_LOST
  ) {
    return plan
  }

  const audioOnly = quality === CONNECTION_QUALITY_LOST

  return plan.map((decision) => {
    if (!isVideoDecision(decision)) return decision

    if (audioOnly || !decision.essential) {
      if (!decision.subscribed && !decision.quality) return decision
      return { ...decision, subscribed: false, quality: null }
    }

    if (decision.subscribed && decision.quality === VIDEO_QUALITY_LOW) {
      return decision
    }

    return { ...decision, subscribed: true, quality: VIDEO_QUALITY_LOW }
  })
}
