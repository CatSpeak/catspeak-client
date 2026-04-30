import { useCallback, useState } from "react"
import {
  useRoomContext,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react"
import { Track } from "livekit-client"

/**
 * Encapsulates screen-share state & actions using LiveKit.
 *
 * - Detects active screen shares via useTracks(ScreenShare)
 * - Toggle via room.localParticipant.setScreenShareEnabled()
 */
export const useScreenShare = () => {
  const room = useRoomContext()
  const { isScreenShareEnabled } = useLocalParticipant()

  // Subscribe to both video and audio screen share tracks.
  // Audio tracks are handled automatically by <RoomAudioRenderer />.
  const allScreenShareTracks = useTracks([
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
  ])

  // Expose only video tracks for rendering ScreenShareTile components
  const screenShareTracks = allScreenShareTracks.filter(
    (t) => t.source === Track.Source.ScreenShare,
  )

  // Find the first active screen share (legacy support)
  const screenShareTrackRef =
    screenShareTracks.length > 0 ? screenShareTracks[0] : null

  const presenter = screenShareTrackRef?.participant ?? null
  const isLocalScreenShare = isScreenShareEnabled
  const screenShareOn = screenShareTracks.length > 0

  const [isTogglingScreenShare, setIsTogglingScreenShare] = useState(false)

  const toggleScreenShare = useCallback(async () => {
    if (isTogglingScreenShare) return
    setIsTogglingScreenShare(true)
    try {
      await room.localParticipant.setScreenShareEnabled(
        !isScreenShareEnabled,
        { audio: true },
      )
    } finally {
      setIsTogglingScreenShare(false)
    }
  }, [room, isScreenShareEnabled, isTogglingScreenShare])

  return {
    screenShareOn,
    screenShareTrackRef, // Keep for backward compatibility/quick access
    screenShareTracks,   // Expose all tracks
    presenterId: presenter?.identity ?? null,
    isLocalScreenShare,
    isTogglingScreenShare,
    toggleScreenShare,
    presenterDisplayName: presenter?.name ?? null,
  }
}
