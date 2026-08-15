import { useMemo, useRef } from "react"

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
const ENABLE_MOCK_PARTICIPANTS = false

export const MOCK_PARTICIPANTS = ENABLE_MOCK_PARTICIPANTS
  ? Array.from({ length: 100 }, (_, i) => ({
      identity: `mock-user-${i + 1}`,
      name: `Mock Participant ${i + 1}`,
      isLocal: false,
      isMicrophoneEnabled: i % 2 === 0,
      isCameraEnabled: i < 10,
      isMockCamera: i < 10,
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
 * - Hand-raised participants are sorted to the top, ordered by raise time.
 * - Recent speakers stay at the top (sticky LRU order) without popping back when speech stops.
 * - Local participant comes next if no recent speech.
 * - Also derives `isHandRaised` for the local user.
 *
 * @param {Array} allParticipants - All participants from useParticipants()
 * @param {object|null} localParticipant - From useLocalParticipant()
 */
export const useParticipantList = (allParticipants, localParticipant) => {
  const lastSpokeRef = useRef(new Map())

  const participants = useMemo(() => {
    const seenIdentities = new Set()
    const list = []

    const processParticipant = (p) => {
      if (!p || seenIdentities.has(p.identity)) return
      // Filter out STT agent — check both metadata flag and identity prefix
      const meta = parseMetadata(p.metadata)
      const isAgent =
        meta.is_stt_agent === true || p.identity?.startsWith("agent-")

      if (isAgent) return

      seenIdentities.add(p.identity)
      list.push(p)

      // Update timestamp if currently speaking (sticky speaker order)
      if (p.isSpeaking === true) {
        lastSpokeRef.current.set(p.identity, Date.now())
      }
    }

    if (localParticipant) {
      processParticipant(localParticipant)
    }

    allParticipants.forEach((p) => {
      if (p.identity === localParticipant?.identity) return
      processParticipant(p)
    })

    // Append mock participants for layout testing
    MOCK_PARTICIPANTS.forEach((mockP) => {
      processParticipant(mockP)
    })

    // Clean up identities of left participants from lastSpokeRef map
    for (const id of lastSpokeRef.current.keys()) {
      if (!seenIdentities.has(id)) {
        lastSpokeRef.current.delete(id)
      }
    }

    // Sort: raised hands first (by time), then local user, then others
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

      // Keep local user first if neither has hand raised
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
