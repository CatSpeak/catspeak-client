/** Identity prefix for the media-ingress participant (set server-side). */
export const MEDIA_AGENT_PREFIX = "media-agent-"

/** Metadata key the server stamps on media participants. */
export const MEDIA_METADATA_TYPE = "media"

const parseMetadata = (metadata) => {
  if (!metadata) return {}
  try {
    return JSON.parse(metadata)
  } catch {
    return {}
  }
}

/**
 * Returns true if the participant is the shared-media (watch-together)
 * ingress agent, so it can be filtered from the real participant list and
 * shown as a dedicated media spotlight instead.
 */
export const isMediaParticipant = (participant) => {
  if (!participant) return false
  const identity = participant?.identity || ""
  if (identity.startsWith(MEDIA_AGENT_PREFIX)) return true
  const meta = parseMetadata(participant.metadata)
  return meta?.type === MEDIA_METADATA_TYPE
}
