import { useCallback, useState, useMemo } from "react"
import {
  useRoomContext,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react"
import { Track } from "livekit-client"
import { toast } from "react-hot-toast"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { parseMetadata } from "@/features/video-call/hooks/useParticipantList"

/**
 * Encapsulates screen-share state & actions using LiveKit.
 *
 * - Detects active screen shares via useTracks(ScreenShare)
 * - Toggle via room.localParticipant.setScreenShareEnabled()
 */
// Toggle mock screen share for testing Takeover Modal & Layouts (set to false to disable)
const ENABLE_MOCK_SCREEN_SHARE = false

const MOCK_SCREEN_TRACKS = ENABLE_MOCK_SCREEN_SHARE
  ? [
      {
        source: Track.Source.ScreenShare,
        participant: {
          identity: "mock-presenter-1",
          name: "Mock Presenter",
          isLocal: false,
          metadata: "{}",
        },
        publication: {
          trackSid: "mock-screen-track-1",
          isMuted: false,
        },
        isMockScreen: true,
      },
    ]
  : []

export const useScreenShare = ({ roomData, user, isHost, t } = {}) => {
  const room = useRoomContext()
  const { isScreenShareEnabled } = useLocalParticipant()

  // Subscribe to both video and audio screen share tracks.
  // Audio tracks are handled automatically by <RoomAudioRenderer />.
  const allScreenShareTracks = useTracks([
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
  ])

  // Expose video tracks (hide mock screens if local user starts presenting)
  const realScreenShareTracks = allScreenShareTracks.filter(
    (t) => t.source === Track.Source.ScreenShare,
  )

  const screenShareTracks = isScreenShareEnabled
    ? realScreenShareTracks
    : [...realScreenShareTracks, ...MOCK_SCREEN_TRACKS]

  // Find the first active screen share (legacy support)
  const screenShareTrackRef =
    screenShareTracks.length > 0 ? screenShareTracks[0] : null

  const presenter = screenShareTrackRef?.participant ?? null
  const isLocalScreenShare = isScreenShareEnabled
  const screenShareOn = screenShareTracks.length > 0
  const presenterDisplayName = presenter?.name || presenter?.identity || "Participant"

  // Check if current active presenter is the Room Creator / Host (backend creatorId)
  const isPresenterHost = useMemo(() => {
    if (!presenter || !roomData) return false
    const meta = presenter.metadata ? parseMetadata(presenter.metadata) : {}
    const presenterAccountId = meta.accountId || presenter.identity
    return isRoomHost(roomData, presenterAccountId)
  }, [presenter, roomData])

  const [isTogglingScreenShare, setIsTogglingScreenShare] = useState(false)
  const [showTakeoverModal, setShowTakeoverModal] = useState(false)

  const startScreenShare = useCallback(async () => {
    setIsTogglingScreenShare(true)
    try {
      await room.localParticipant.setScreenShareEnabled(true, { audio: true })
    } finally {
      setIsTogglingScreenShare(false)
      setShowTakeoverModal(false)
    }
  }, [room])

  const stopScreenShare = useCallback(async () => {
    setIsTogglingScreenShare(true)
    try {
      await room.localParticipant.setScreenShareEnabled(false)
    } finally {
      setIsTogglingScreenShare(false)
    }
  }, [room])

  const toggleScreenShare = useCallback(async () => {
    if (isTogglingScreenShare) return

    // If local user is currently sharing, stop it directly
    if (isScreenShareEnabled) {
      await stopScreenShare()
      return
    }

    // If someone else is currently sharing screen
    if (screenShareOn && !isLocalScreenShare) {
      // Host Protection Rule: If presenter is the Room Creator / Host and local user is NOT the host, block takeover
      if (isPresenterHost && !isHost) {
        toast.error(
          t?.rooms?.videoCall?.screenShare?.hostProtected ||
            "Chủ phòng đang thuyết trình. Bạn không thể ghi đè màn hình của chủ phòng.",
        )
        return
      }

      setShowTakeoverModal(true)
      return
    }

    // Otherwise, start screen share directly
    await startScreenShare()
  }, [
    isTogglingScreenShare,
    isScreenShareEnabled,
    screenShareOn,
    isLocalScreenShare,
    isPresenterHost,
    isHost,
    t,
    stopScreenShare,
    startScreenShare,
  ])

  return {
    screenShareOn,
    screenShareTrackRef, // Keep for backward compatibility/quick access
    screenShareTracks,   // Expose all tracks
    presenterId: presenter?.identity ?? null,
    isLocalScreenShare,
    isTogglingScreenShare,
    toggleScreenShare,
    presenterDisplayName,
    showTakeoverModal,
    setShowTakeoverModal,
    confirmTakeoverScreenShare: startScreenShare,
  }
}
