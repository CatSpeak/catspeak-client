import { useCallback, useState, useMemo, useRef } from "react"
import {
  useRoomContext,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react"
import { Track } from "livekit-client"
import { toast } from "react-hot-toast"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { parseMetadata } from "@/features/video-call/hooks/useParticipantList"
import { isCatspeakDesktop } from "@/features/video-call/utils/desktopBridge"
import {
  loadDesktopScreenSources,
  screenShareSelectionMetadata,
  shouldRequestDesktopShareAudio,
  toSelectSourcePayload,
} from "@/features/video-call/utils/desktopScreenShare"
import {
  isCoHostUser,
  hasCoHostPermission,
  CO_HOST_PERMISSIONS,
} from "@/features/co-host/constants"

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

export const useScreenShare = ({
  roomData,
  user,
  isHost,
  coHost = null,
  allowStudentShare = true,
  t,
} = {}) => {
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

  // Desktop (Electron) screen picker. The browser flow never opens it.
  const desktopBridge =
    typeof window !== "undefined" ? window.catspeakDesktop : undefined
  const isDesktopApp = isCatspeakDesktop({ bridge: desktopBridge })
  const hasDesktopScreenPicker = Boolean(
    isDesktopApp &&
      desktopBridge &&
      typeof desktopBridge.getScreenSources === "function",
  )
  const [showScreenPicker, setShowScreenPicker] = useState(false)
  const [screenSources, setScreenSources] = useState([])
  const [screenPermission, setScreenPermission] = useState(null)
  const [isLoadingScreenSources, setIsLoadingScreenSources] = useState(false)
  const [screenPickerError, setScreenPickerError] = useState(null)
  const [screenShareSelection, setScreenShareSelection] = useState(null)
  const isStartingScreenShareRef = useRef(false)

  const clearScreenShareSelection = useCallback(() => {
    setScreenShareSelection(null)
  }, [])

  const loadScreenSources = useCallback(async () => {
    setIsLoadingScreenSources(true)
    setScreenPickerError(null)

    const result = await loadDesktopScreenSources(desktopBridge)
    if (result.ok) {
      setScreenSources(result.sources)
      setScreenPermission(result.permission)
    } else {
      setScreenSources([])
      setScreenPermission(null)
      setScreenPickerError(result.error)
    }

    setIsLoadingScreenSources(false)
  }, [desktopBridge])

  const openScreenPicker = useCallback(() => {
    setShowScreenPicker(true)
    setShowTakeoverModal(false)
    loadScreenSources()
  }, [loadScreenSources])

  const closeScreenPicker = useCallback(() => {
    setShowScreenPicker(false)
    setScreenSources([])
    setScreenPermission(null)
    setScreenPickerError(null)
    setIsLoadingScreenSources(false)

    // Cancel must drop any pending selection in the main process.
    if (desktopBridge && typeof desktopBridge.clearScreenSource === "function") {
      Promise.resolve(desktopBridge.clearScreenSource()).catch(() => {})
    }
  }, [desktopBridge])

  const openScreenPermissionSettings = useCallback(async () => {
    if (
      !desktopBridge ||
      typeof desktopBridge.openScreenPermissionSettings !== "function"
    ) {
      return
    }

    try {
      await desktopBridge.openScreenPermissionSettings()
    } catch {
      // The modal keeps the manual System Settings instructions visible.
    }
  }, [desktopBridge])

  const confirmScreenPicker = useCallback(
    async (source) => {
      if (isStartingScreenShareRef.current) return

      // The desktop display-media handler deliberately omits audio on macOS;
      // asking LiveKit for it there can reject the whole share.
      const requestAudio = shouldRequestDesktopShareAudio(desktopBridge?.platform)
      const payload = toSelectSourcePayload(source, { audio: requestAudio })
      if (!payload) {
        setScreenPickerError("INVALID_SOURCE")
        return
      }

      isStartingScreenShareRef.current = true
      setIsTogglingScreenShare(true)
      setScreenPickerError(null)

      try {
        if (
          !desktopBridge ||
          typeof desktopBridge.selectScreenSource !== "function"
        ) {
          setScreenPickerError("BRIDGE_UNAVAILABLE")
          return
        }

        const selection = await desktopBridge.selectScreenSource(payload)
        if (!selection || selection.ok !== true) {
          setScreenPickerError(selection?.error || "SELECT_FAILED")
          return
        }

        await room.localParticipant.setScreenShareEnabled(true, {
          audio: requestAudio,
        })

        const metadata = screenShareSelectionMetadata(source)
        setScreenShareSelection(metadata)
        setShowScreenPicker(false)
        setScreenSources([])
        setScreenPermission(null)
        setShowTakeoverModal(false)
      } catch {
        // Never leave the picker spinning or a pending main-process selection.
        setScreenPickerError("SCREEN_SHARE_FAILED")
        try {
          await desktopBridge?.clearScreenSource?.()
        } catch {
          // Best effort; the handler also consumes/clears on the next request.
        }
      } finally {
        isStartingScreenShareRef.current = false
        setIsTogglingScreenShare(false)
      }
    },
    [desktopBridge, room],
  )

  // Ticket 06 (G7): co-host screen-share capability follows share_screen.
  // Host and students are unaffected (server-side grant is authoritative).
  const isSelfCoHost = isCoHostUser(coHost, user?.accountId)
  const canShareScreen =
    !isSelfCoHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.SHARE_SCREEN)

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
      clearScreenShareSelection()
      if (
        desktopBridge &&
        typeof desktopBridge.clearScreenSource === "function"
      ) {
        Promise.resolve(desktopBridge.clearScreenSource()).catch(() => {})
      }
    }
  }, [clearScreenShareSelection, desktopBridge, room])

  // Desktop opens the picker; the browser keeps its native getDisplayMedia
  // flow byte-for-byte. A desktop build without the bridge falls back to the
  // browser flow instead of opening an unusable modal.
  const beginScreenShare = useCallback(async () => {
    if (hasDesktopScreenPicker) {
      openScreenPicker()
      return
    }

    await startScreenShare()
  }, [hasDesktopScreenPicker, openScreenPicker, startScreenShare])

  const toggleScreenShare = useCallback(async () => {
    if (isTogglingScreenShare) return

    // If local user is currently sharing, stop it directly
    if (isScreenShareEnabled) {
      await stopScreenShare()
      return
    }

    // Ticket 05: self-share gate — host bypasses; co-host needs
    // share_screen; students share by default while the student-share
    // gate is open (host/co-host always bypass that gate).
    if (!isHost && !canShareScreen) {
      toast.error(
        t?.rooms?.videoCall?.participantList?.shareDeniedNoPerm ||
          "Bạn không có quyền chia sẻ màn hình."
      )
      return
    } else if (!isHost && !isSelfCoHost && !allowStudentShare) {
      toast.error(
        t?.rooms?.videoCall?.participantList?.studentShareBlocked ||
          "Host đã tắt quyền chia sẻ màn hình của học viên."
      )
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
    await beginScreenShare()
  }, [
    isTogglingScreenShare,
    isScreenShareEnabled,
    screenShareOn,
    isLocalScreenShare,
    isPresenterHost,
    isHost,
    isSelfCoHost,
    canShareScreen,
    allowStudentShare,
    t,
    stopScreenShare,
    beginScreenShare,
  ])

  return {
    screenShareOn,
    screenShareTrackRef, // Keep for backward compatibility/quick access
    screenShareTracks,   // Expose all tracks
    presenterId: presenter?.identity ?? null,
    isLocalScreenShare,
    isTogglingScreenShare,
    canShareScreen,
    toggleScreenShare,
    presenterDisplayName,
    showTakeoverModal,
    setShowTakeoverModal,
    confirmTakeoverScreenShare: beginScreenShare,
    // Desktop picker (ticket 08). Ticket 09 reads the full-display metadata to
    // decide whether to show the OS overlay.
    showScreenPicker,
    screenSources,
    screenPermission,
    isLoadingScreenSources,
    screenPickerError,
    screenShareSelection,
    closeScreenPicker,
    confirmScreenPicker,
    refreshScreenSources: loadScreenSources,
    openScreenPermissionSettings,
  }
}
