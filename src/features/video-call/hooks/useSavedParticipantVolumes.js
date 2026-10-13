import { useEffect } from "react"
import { ParticipantEvent } from "livekit-client"
import { applySavedParticipantVolume } from "@/features/video-call/utils/participantVolumePreferences"

/**
 * Automatically applies saved participant volume levels from localStorage
 * whenever remote participants join the call or subscribe audio tracks.
 *
 * @param {Array} participants - List of all participants (from useParticipants())
 * @param {string|number|null} myAccountId - Current user account ID for preference scoping
 */
export const useSavedParticipantVolumes = (participants, myAccountId) => {
  useEffect(() => {
    if (!participants || participants.length === 0) return

    const cleanups = []

    participants.forEach((participant) => {
      if (!participant || participant.isLocal) return

      // Apply saved volume immediately if stored
      applySavedParticipantVolume(participant, myAccountId)

      // Re-apply when a new audio track is subscribed
      const handleTrackSubscribed = (track) => {
        if (track?.kind === "audio") {
          applySavedParticipantVolume(participant, myAccountId)
        }
      }

      if (typeof participant.on === "function") {
        participant.on(ParticipantEvent.TrackSubscribed, handleTrackSubscribed)
        cleanups.push(() => {
          if (typeof participant.off === "function") {
            participant.off(ParticipantEvent.TrackSubscribed, handleTrackSubscribed)
          }
        })
      }
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [participants, myAccountId])
}
