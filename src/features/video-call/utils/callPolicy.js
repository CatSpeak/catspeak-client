export const EGRESS_PROFILE_STANDARD = "standard"
export const EGRESS_PROFILE_FULL = "full"

export const MAX_FOREIGN_VIDEO_TILES = 2

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
