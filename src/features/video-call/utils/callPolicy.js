export const EGRESS_PROFILE_STANDARD = "standard"
export const EGRESS_PROFILE_FULL = "full"

export const MAX_FOREIGN_VIDEO_TILES = 2

export const TRACK_SOURCE_CAMERA = "camera"
export const TRACK_SOURCE_SCREEN_SHARE = "screen_share"
export const VIDEO_QUALITY_LOW = "low"

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

  const cappedParticipantIds = []
  if (isStandard) {
    const cap =
      Number.isInteger(maxTiles) && maxTiles > 0
        ? maxTiles
        : MAX_FOREIGN_VIDEO_TILES

    for (const candidate of [pinnedId, activeSpeakerId]) {
      if (typeof candidate !== "string" || !candidate) continue
      if (cappedParticipantIds.includes(candidate)) continue
      if (cappedParticipantIds.length >= cap) break
      cappedParticipantIds.push(candidate)
    }
  }

  return list.map((publication) => {
    const decision = {
      trackSid: publication.trackSid,
      participantId: publication.participantId,
      source: publication.source,
      subscribed: true,
      quality: null,
    }

    if (!isStandard || publication.isLocal) return decision

    if (publication.source === TRACK_SOURCE_SCREEN_SHARE) {
      return { ...decision, quality: VIDEO_QUALITY_LOW }
    }

    if (publication.source !== TRACK_SOURCE_CAMERA) return decision

    decision.subscribed = cappedParticipantIds.includes(
      publication.participantId,
    )
    if (decision.subscribed) decision.quality = VIDEO_QUALITY_LOW

    return decision
  })
}
