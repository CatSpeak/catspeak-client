import { useMemo } from "react"

/**
 * Parses a LiveKit participant metadata JSON string.
 * Returns an empty object on failure.
 */
export const parseMetadata = (metadata) => {
  if (!metadata) return {}
  try {
    return JSON.parse(metadata)
  } catch {
    return {}
  }
}

// Set to false (or set MOCK_PARTICIPANTS to []) when done testing to disable completely
const ENABLE_MOCK_PARTICIPANTS = true

export const MOCK_PARTICIPANTS = ENABLE_MOCK_PARTICIPANTS
  ? Array.from({ length: 100 }, (_, i) => ({
      identity: `mock-user-${i + 1}`,
      name: `Mock Participant ${i + 1}`,
      isLocal: false,
      isMicrophoneEnabled: i % 2 === 0,
      isCameraEnabled: false,
      isScreenShareEnabled: false,
      metadata: "{}",
      getTrackPublication: () => null,
      on: () => {},
      off: () => {},
    }))
  : []

/**
 * Deduplicates and sorts the participant list.
 *
 * - Local participant is always first (unless someone has a raised hand).
 * - Hand-raised participants are sorted to the top, ordered by raise time.
 * - Also derives `isHandRaised` for the local user.
 *
 * @param {Array} allParticipants - All participants from useParticipants()
 * @param {object|null} localParticipant - From useLocalParticipant()
 */
export const useParticipantList = (allParticipants, localParticipant) => {
  const participants = useMemo(() => {
    const seenIdentities = new Set()
    const list = []

    if (localParticipant) {
      seenIdentities.add(localParticipant.identity)
      list.push(localParticipant)
    }

    allParticipants.forEach((p) => {
      if (p.identity === localParticipant?.identity) return
      if (seenIdentities.has(p.identity)) return
      // Filter out the STT agent — check both metadata flag and identity prefix
      // (identity prefix is the fallback for when metadata hasn't been set yet)
      const meta = parseMetadata(p.metadata)
      const isAgent =
        meta.is_stt_agent === true || p.identity?.startsWith("agent-")

      if (isAgent) return

      seenIdentities.add(p.identity)
      list.push(p)
    })

    // Append mock participants for layout testing
    MOCK_PARTICIPANTS.forEach((mockP) => {
      if (!seenIdentities.has(mockP.identity)) {
        seenIdentities.add(mockP.identity)
        list.push(mockP)
      }
    })

    // Sort: raised hands first (by time), active speakers (top left), then local user, then others
    list.sort((a, b) => {
      const metaA = parseMetadata(a.metadata)
      const metaB = parseMetadata(b.metadata)

      const aRaised = metaA.handRaised === true
      const bRaised = metaB.handRaised === true

      if (aRaised && !bRaised) return -1
      if (!aRaised && bRaised) return 1

      if (aRaised && bRaised) {
        const timeA = metaA.handRaisedAt || 0
        const timeB = metaB.handRaisedAt || 0
        return timeA - timeB // Ascending
      }

      // Currently speaking participants sort to top left
      const aSpeaking = a.isSpeaking === true
      const bSpeaking = b.isSpeaking === true

      if (aSpeaking && !bSpeaking) return -1
      if (!aSpeaking && bSpeaking) return 1

      // Both not raised and not speaking, keep local user first
      if (a.isLocal && !b.isLocal) return -1
      if (!a.isLocal && b.isLocal) return 1

      return 0
    })

    return list
  }, [allParticipants, localParticipant])

  const isHandRaised = useMemo(() => {
    const localMeta = parseMetadata(localParticipant?.metadata)
    return localMeta.handRaised === true
  }, [localParticipant?.metadata])

  return { participants, isHandRaised }
}
