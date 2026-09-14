import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { selectCurrentToken } from "@/store/slices/authSlice"
import {
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  useConnectionState,
  RoomAudioRenderer,
} from "@livekit/components-react"
import { ConnectionState, RoomEvent, Track, VideoPresets } from "livekit-client"
import { toast } from "react-hot-toast"
import { Clock } from "lucide-react"

import Modal from "@/shared/components/ui/Modal"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { leaveCall } from "@/store/slices/videoCallSlice"
import { useVideoCallSignaling } from "@/features/video-call/hooks/useVideoCallSignaling"

import { useVideoCall } from "@/features/video-call/hooks/useVideoCall"
import { useScreenShare } from "@/features/video-call/hooks/useScreenShare"
import { useWatchTogether } from "@/features/video-call/hooks/useWatchTogether"
import { useRecording } from "@/features/video-call/hooks/useRecording"
import { useVideoChatSignalR } from "@/features/video-call/hooks/useVideoChatSignalR"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useCallActions } from "@/features/video-call/hooks/useCallActions"
import {
  useParticipantList,
  parseMetadata,
} from "@/features/video-call/hooks/useParticipantList"
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils"
import { useGetRecordingsBySessionQuery } from "@/store/api/recordingsApi"
import { useParticipantAudioEffect } from "@/features/video-call/hooks/useParticipantAudioEffect"
import { useSubscriptionPolicy } from "@/features/video-call/hooks/useSubscriptionPolicy"
import {
  getNavigate,
  getLocation,
} from "@/features/video-call/hooks/useNavigateRef"
import RoomClosingWarningModal from "@/features/video-call/components/RoomClosingWarningModal"
import { useRoomLifecycle } from "@/features/video-call/hooks/useRoomLifecycle.jsx"
import { roomsApi } from "@/store/api/roomsApi"
import {
  useGetRoomCoHostQuery,
  useGetRoomStateQuery,
  useGetRoomParticipantsQuery,
} from "@/store/api/roomsApi"
import {
  normalizeCoHost,
} from "@/features/co-host/constants"
import { useChatManager } from "@/features/video-call/hooks/useChatManager"
import { useSubtitleControls } from "@/features/video-call/hooks/useSubtitleControls"
import { useDeviceSelection } from "@/features/rooms/hooks/useDeviceSelection"
import {
  setRoomSetting,
  ROOM_SETTING_KEYS,
} from "@/features/video-call/utils/roomSettingHelpers"
import RoomSettingsModal from "@/features/video-call/components/settings/RoomSettingsModal"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { resolveCallPolicy } from "@/features/video-call/utils/callPolicy"
import { buildRoomOptions } from "@/features/video-call/utils/roomOptions"

/**
 * Rendered inside <LiveKitRoom> when a call is active.
 *
 * Orchestrates LiveKit hooks, extracted action hooks, and composes
 * the context value that both the full call page and PiP widget consume.
 *
 * @param {{ children: React.ReactNode, ContextProvider: React.Provider }} props
 */
const GlobalCallContent = ({
  children,
  ContextProvider,
  receiveSystemMsgs,
  setReceiveSystemMsgs,
  showAiSuggestions,
  setShowAiSuggestions,
  joinLeaveSound,
  setJoinLeaveSound,
  panelState,
}) => {
  const { t, language } = useLanguage()
  const dispatch = useDispatch()
  const { isInCall, isPiP, callInfo } = useSelector((s) => s.videoCall)
  const { roomData, user } = callInfo ?? {}
  // Class rooms keep "class-{id}" as the URL roomId but carry the numeric
  // cath-api room id separately (callInfo.apiRoomId). Every room-governance
  // call and the SignalR room group must use the numeric id.
  const urlRoomId = callInfo?.roomId || roomData?.id
  const apiRoomId = callInfo?.apiRoomId ?? (Number(urlRoomId) > 0 ? Number(urlRoomId) : null)
  const currentRoomId = apiRoomId ?? urlRoomId
  const isAISession = callInfo?.isAISession ?? false

  // ── Ticket 02: chat/voice restriction state ──
  // Fetched on join (and refreshed when moderation changes) so late joiners see
  // the correct state; packet events layer optimistic overrides on top.
  const [restrictionOverrides, setRestrictionOverrides] = useState({})
  const { data: participantsRestrictionData } = useGetRoomParticipantsQuery(
    currentRoomId,
    { skip: !currentRoomId },
  )

  const applyRestrictionOverride = useCallback((accountId, patch) => {
    if (accountId == null || accountId === "") return
    const key = String(accountId)
    setRestrictionOverrides((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), ...patch },
    }))
  }, [])

  const restrictionByAccountId = React.useMemo(() => {
    const map = {}
    const list = Array.isArray(participantsRestrictionData)
      ? participantsRestrictionData
      : Array.isArray(participantsRestrictionData?.data)
        ? participantsRestrictionData.data
        : []
    list.forEach((p) => {
      if (p?.accountId == null) return
      map[String(p.accountId)] = {
        isChatRestricted: !!p.isChatRestricted,
        isVoiceRestricted: !!p.isVoiceRestricted,
      }
    })
    Object.entries(restrictionOverrides).forEach(([id, patch]) => {
      map[id] = {
        isChatRestricted: false,
        isVoiceRestricted: false,
        ...(map[id] || {}),
        ...patch,
      }
    })
    return map
  }, [participantsRestrictionData, restrictionOverrides])

  const localRestriction = restrictionByAccountId[String(user?.accountId)] || {
    isChatRestricted: false,
    isVoiceRestricted: false,
  }

  // ── UI state ──
  const [showCC, setShowCC] = useState(false)
  const [showRoomSubtitles, setShowRoomSubtitles] = useState(false)
  const [subtitleSelectedLanguage, setSubtitleSelectedLanguage] = useState(null)
  const [beautyOptions, setBeautyOptions] = useState({
    smoothing: 0,
    brightness: 0,
    warmth: 0,
    colorFilter: 0,
    faceSlim: 0,
    eyeEnlarge: 0,
    eyeBrighten: 0,
    teethWhiten: 0,
  })
  const [layoutMode, setLayoutMode] = useState(() => {
    try {
      const saved = localStorage.getItem("catspeak_video_layout_settings")
      if (saved) {
        const parsed = JSON.parse(saved)
        const validModes = ["auto", "grid", "spotlight", "sidebar"]
        if (parsed.layoutMode && validModes.includes(parsed.layoutMode)) {
          return parsed.layoutMode
        }
      }
    } catch {
      /* ignore */
    }
    return "auto"
  })
  const [maxTiles, setMaxTiles] = useState(() => {
    try {
      const saved = localStorage.getItem("catspeak_video_layout_settings")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.maxTiles) {
          const val = Number(parsed.maxTiles)
          if (!isNaN(val) && val >= 4 && val <= 49) {
            return val
          }
        }
      }
    } catch {
      /* ignore */
    }
    return 16
  })
  const [hideEmptyTiles, setHideEmptyTiles] = useState(() => {    try {
      const saved = localStorage.getItem("catspeak_video_layout_settings")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.hideEmptyTiles === "boolean")
          return parsed.hideEmptyTiles
      }
    } catch {
      /* ignore */
    }
    return false
  })

  useEffect(() => {
    try {
      const settings = { layoutMode, maxTiles, hideEmptyTiles }
      localStorage.setItem(
        "catspeak_video_layout_settings",
        JSON.stringify(settings),
      )
    } catch (e) {
      console.error("Failed to save layout settings", e)
    }
  }, [layoutMode, maxTiles, hideEmptyTiles])

  // Ticket 02: participant the user pinned (spotlight) for the capped profile
  const [pinnedParticipantId, setPinnedParticipantId] = useState(null)

  // ── LiveKit hooks & Device Selection ──
  let lkRoom = null
  try {
    lkRoom = useRoomContext()
  } catch {
    lkRoom = null
  }

  const deviceSelection = useDeviceSelection()
  const [showRoomSettings, setShowRoomSettings] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState("audio-video")

  const allParticipants = useParticipants()
  const localPart = useLocalParticipant()
  const localParticipant = localPart?.localParticipant ?? null

  // Ticket 04 (egress): live high-quality state. Initialised from the token
  // and kept in sync from the RoomState cache (single store) + moderation channel.
  const [roomHighQuality, setRoomHighQuality] = useState(
    callInfo?.highQuality ?? false,
  )
  const roomHighQualityRef = useRef(roomHighQuality)
  useEffect(() => {
    roomHighQualityRef.current = roomHighQuality
  }, [roomHighQuality])

  const callPolicy = React.useMemo(
    () => resolveCallPolicy(callInfo?.egressProfile, roomHighQuality),
    [callInfo?.egressProfile, roomHighQuality],
  )

  // Ticket 02: cap remote video subscriptions for standard (foreign) profiles
  useSubscriptionPolicy({
    room: lkRoom,
    egressProfile: callInfo?.egressProfile,
    highQuality: roomHighQuality,
    pinnedParticipantId,
  })

  // Ticket 04 (egress): apply the live high-quality state to the local
  // publisher without a rejoin. LiveKit reads the room capture/publish
  // defaults when a camera track is created, so keep them in sync too and
  // restart an already-live camera track at the new target resolution.
  useEffect(() => {
    if (!lkRoom || !localParticipant) return

    const preset = VideoPresets[callPolicy.publish.cameraPreset]
    if (!preset?.resolution) return

    const { videoCaptureDefaults, publishDefaults } =
      buildRoomOptions(callPolicy)
    lkRoom.options.videoCaptureDefaults.resolution =
      videoCaptureDefaults.resolution
    if (publishDefaults.videoSimulcastLayers) {
      lkRoom.options.publishDefaults.videoSimulcastLayers =
        publishDefaults.videoSimulcastLayers
    } else {
      delete lkRoom.options.publishDefaults.videoSimulcastLayers
    }

    const publication = localParticipant.getTrackPublication(Track.Source.Camera)
    const track = publication?.videoTrack
    if (!track?.restartTrack || publication?.isMuted) return

    const settings = track.mediaStreamTrack?.getSettings?.()
    if (
      settings?.width === preset.resolution.width &&
      settings?.height === preset.resolution.height
    ) {
      return
    }
    track.restartTrack({ resolution: preset.resolution }).catch(() => {})
  }, [lkRoom, localParticipant, callPolicy])

  // Ticket 02: voice restriction forces the mic off and keeps it off — the
  // participant can still hear others. The ControlBar also blocks re-enabling.
  useEffect(() => {
    if (localRestriction.isVoiceRestricted && localParticipant) {
      try {
        localParticipant.setMicrophoneEnabled(false)
      } catch {
        /* ignore */
      }
    }
  }, [localRestriction.isVoiceRestricted, localParticipant])

  // Refresh hardware device list & sync active devices with LiveKit when settings modal opens
  useEffect(() => {
    if (!lkRoom) return

    const syncActiveDevices = async () => {
      try {
        deviceSelection.refreshDevices?.()

        const activeMic =
          (await lkRoom.getActiveDevice?.("audioinput")) ||
          localParticipant
            ?.getTrackPublication?.("microphone")
            ?.track?.mediaStreamTrack?.getSettings()?.deviceId

        const activeSpeaker = await lkRoom.getActiveDevice?.("audiooutput")

        const activeCam =
          (await lkRoom.getActiveDevice?.("videoinput")) ||
          localParticipant
            ?.getTrackPublication?.("camera")
            ?.track?.mediaStreamTrack?.getSettings()?.deviceId

        if (activeMic && activeMic !== deviceSelection.selectedMic) {
          deviceSelection.setSelectedMic(activeMic)
        }
        if (
          activeSpeaker &&
          activeSpeaker !== deviceSelection.selectedSpeaker
        ) {
          deviceSelection.setSelectedSpeaker(activeSpeaker)
        }
        if (activeCam && activeCam !== deviceSelection.selectedCamera) {
          deviceSelection.setSelectedCamera(activeCam)
        }
      } catch (err) {
        console.warn("[GlobalCallContent] Sync active devices warning:", err)
      }
    }

    if (showRoomSettings) {
      syncActiveDevices()
    }
  }, [lkRoom, showRoomSettings, localParticipant])

  const connectionState = useConnectionState()
  const isConnected = connectionState === ConnectionState.Connected

  // Automatically start WebAudio context if iOS Safari requires audio unlock upon connection
  useEffect(() => {
    if (lkRoom && isConnected && lkRoom.canPlayAudio === false) {
      lkRoom.startAudio().catch((err) => {
        console.warn("[GlobalCallContent] startAudio warning on connect:", err)
      })
    }
  }, [lkRoom, isConnected])

  // Only perform explicit device switching when room is connected and settings modal is active
  useEffect(() => {
    if (
      lkRoom &&
      isConnected &&
      showRoomSettings &&
      deviceSelection?.selectedMic &&
      deviceSelection.selectedMic !== "default" &&
      deviceSelection.selectedMic !== ""
    ) {
      lkRoom
        .switchActiveDevice("audioinput", deviceSelection.selectedMic)
        .catch((err) => {
          console.error(
            "[GlobalCallContent] Failed to switch audio input:",
            err,
          )
        })
    }
  }, [lkRoom, isConnected, showRoomSettings, deviceSelection?.selectedMic])

  useEffect(() => {
    if (
      lkRoom &&
      isConnected &&
      showRoomSettings &&
      deviceSelection?.selectedSpeaker &&
      deviceSelection.selectedSpeaker !== "default" &&
      deviceSelection.selectedSpeaker !== ""
    ) {
      lkRoom
        .switchActiveDevice("audiooutput", deviceSelection.selectedSpeaker)
        .catch((err) => {
          console.error(
            "[GlobalCallContent] Failed to switch audio output:",
            err,
          )
        })
    }
  }, [lkRoom, isConnected, showRoomSettings, deviceSelection?.selectedSpeaker])

  useEffect(() => {
    if (
      lkRoom &&
      isConnected &&
      showRoomSettings &&
      deviceSelection?.selectedCamera &&
      deviceSelection.selectedCamera !== "default" &&
      deviceSelection.selectedCamera !== ""
    ) {
      lkRoom
        .switchActiveDevice("videoinput", deviceSelection.selectedCamera)
        .catch((err) => {
          console.error(
            "[GlobalCallContent] Failed to switch video input:",
            err,
          )
        })
    }
  }, [lkRoom, isConnected, showRoomSettings, deviceSelection?.selectedCamera])

  // ── Synchronized Recording States ──
  const sessionId =
    callInfo?.sessionId || parseMetadata(localParticipant?.metadata)?.sessionId
  const token = useSelector(selectCurrentToken)

  const [isRecording, setIsRecording] = useState(false)
  const [egressId, setEgressId] = useState(null)
  const [startedByAccountId, setStartedByAccountId] = useState(null)

  const { data: sessionRecordings } = useGetRecordingsBySessionQuery(
    sessionId,
    {
      skip: !sessionId,
    },
  )

  // Initialize recording state from active recordings on mount/refresh
  useEffect(() => {
    if (sessionRecordings && sessionRecordings.length > 0) {
      const activeRec = sessionRecordings.find(
        (r) => r.status === "started" || r.status === "active",
      )
      if (activeRec) {
        console.log(
          "[GlobalCallContent] Found active recording on load:",
          activeRec,
        )
        setIsRecording(true)
        setEgressId(activeRec.egressId)
        setStartedByAccountId(activeRec.startedByAccountId)
      } else {
        // No active recording, check if there are completed or partially completed recordings in this session
        // that we haven't notified the user about yet.
        const finishedRec = sessionRecordings.find(
          (r) => r.status === "completed" || r.status === "Partial Completed",
        )
        if (finishedRec) {
          const toastKey = `toast-notified-finished-${finishedRec.recordingId}`
          if (!sessionStorage.getItem(toastKey)) {
            sessionStorage.setItem(toastKey, "true")
            if (finishedRec.status === "completed") {
              toast.success(
                t.recordings?.actions?.stopSuccess ||
                  "Recording trước đó đã được lưu thành công trong My Workspace.",
                { duration: 6000 },
              )
            } else if (finishedRec.status === "Partial Completed") {
              toast.error(
                t.recordings?.storage?.warningLimitReached ||
                  "Recording trước đó đã dừng và được lưu một phần.",
                { duration: 6000 },
              )
            }
          }
        }
      }
    }
  }, [sessionRecordings, t])

  useVideoChatSignalR(sessionId, token, (event, data) => {
    if (event === "RoomSettingsChanged") {
      // Ticket 01: single store = RTK Query cache. Patch the room state in
      // place so every client (incl. late joiners) reflects policy instantly.
      const settings = data?.settings
      if (settings && currentRoomId) {
        dispatch(
          roomsApi.util.updateQueryData(
            "getRoomState",
            currentRoomId,
            (draft) => {
              if (!draft?.settings) return
              draft.settings = { ...draft.settings, ...settings }
            },
          ),
        )
      }
      return
    }
    if (event === "CoHostChanged") {
      // Ticket 03: host changed the co-host slice mid-session. Apply it to the
      // state store (and the co-host query used by the 12-code gates) at once.
      const coHost = data?.coHost ?? null
      if (currentRoomId) {
        const myAccountId = user?.accountId
        dispatch(
          roomsApi.util.updateQueryData(
            "getRoomState",
            currentRoomId,
            (draft) => {
              draft.coHost = coHost
                ? {
                    accountId: coHost.accountId,
                    permissions: coHost.permissions ?? [],
                    isCoHost:
                      String(coHost.accountId) === String(myAccountId),
                  }
                : null
            },
          ),
        )
        dispatch(
          roomsApi.util.updateQueryData(
            "getRoomCoHost",
            currentRoomId,
            () =>
              coHost
                ? {
                    coHostAccountId: coHost.accountId,
                    permissions: coHost.permissions ?? [],
                  }
                : null,
          ),
        )
      }
      return
    }
    if (event === "WaitingQueueChanged") {
      // Ticket 04: real-time queue update (no 10s polling). Refetch the
      // WaitingQueue cache for host/co-host.
      if (currentRoomId) {
        dispatch(
          roomsApi.util.invalidateTags([
            { type: "WaitingQueue", id: currentRoomId },
          ]),
        )
      }
      return
    }
    if (event === "ParticipantRestrictionChanged") {
      // Ticket 05: room-scoped chat/voice restriction changed. Patch the
      // participant-list cache in place (no reload) so badges and the chat
      // input react immediately; late joiners read the same table on join.
      const restriction = data?.restriction
      if (restriction?.accountId != null && currentRoomId) {
        dispatch(
          roomsApi.util.updateQueryData(
            "getRoomParticipants",
            currentRoomId,
            (draft) => {
              const list = Array.isArray(draft)
                ? draft
                : Array.isArray(draft?.data)
                  ? draft.data
                  : null
              if (!list) return
              const item = list.find(
                (p) => String(p.accountId) === String(restriction.accountId),
              )
              if (item) {
                item.isChatRestricted = !!restriction.isChatRestricted
                item.isVoiceRestricted = !!restriction.isVoiceRestricted
              } else {
                list.push({
                  accountId: restriction.accountId,
                  isChatRestricted: !!restriction.isChatRestricted,
                  isVoiceRestricted: !!restriction.isVoiceRestricted,
                })
              }
            },
          ),
        )
      }

      const isTarget =
        restriction?.accountId != null &&
        String(restriction.accountId) === String(user?.accountId)
      // A voice-restricted user's mic is forced off and cannot be re-enabled.
      if (
        restriction?.isVoiceRestricted === true &&
        isTarget &&
        localParticipant
      ) {
        try {
          localParticipant.setMicrophoneEnabled(false)
        } catch {
          /* ignore */
        }
      }
      if (isTarget) {
        const pl = t.rooms?.videoCall?.participantList || {}
        if (restriction?.isVoiceRestricted) {
          toast.error(
            pl.hostRestrictedVoice || "Bạn đã bị Host hạn chế bật mic.",
          )
        } else if (restriction?.isChatRestricted) {
          toast.error(
            pl.hostRestrictedChat ||
              "Bạn đã bị Host hạn chế gửi tin nhắn chat.",
          )
        } else {
          toast.info(
            pl.hostUnrestrictedChat || "Host đã gỡ hạn chế cho bạn.",
          )
        }
      }
      return
    }
    if (event === "RecordingStatusChanged") {
      const isActive = data.status === "started" || data.status === "active"
      setIsRecording(isActive)
      setEgressId(isActive ? data.egressId : null)
      setStartedByAccountId(isActive ? data.startedByAccountId : null)

      if (data.status === "Partial Completed") {
        if (data.reason === "storage_exceeded") {
          toast.error(
            t.recordings?.storage?.warningLimitReached ||
              "Recording đã tự động dừng do vượt quá dung lượng lưu trữ. File recording đã được lưu một phần.",
            { duration: 6000 },
          )
        } else if (data.reason === "reconnect_timeout") {
          toast.error(
            t.recordings?.errors?.interrupted ||
              "Recording trước đó đã bị gián đoạn. File recording đã được lưu một phần.",
            { duration: 6000 },
          )
        }
      }
    } else if (event === "RecordingWarning") {
      toast.error(
        t.recordings?.storage?.warningAlmostFull ||
          "Dung lượng lưu trữ sắp đầy. Recording có thể tự động dừng nếu vượt quá giới hạn.",
        { icon: "⚠️", duration: 6000 },
      )
    } else if (event === "MediaEnded") {
      toast.info(
        t?.rooms?.videoCall?.watchTogether?.ended ||
          "Video chung đã kết thúc.",
        { duration: 5000 },
      )
      // The media ingress participant leaves the room; the spotlight auto-hides
      // once the track is gone, and the media status query re-fetches.
    }
  }, currentRoomId)

  const prevConnectionState = useRef(connectionState)
  useEffect(() => {
    if (isRecording) {
      if (connectionState === ConnectionState.Reconnecting) {
        toast.error(
          t.recordings?.errors?.disconnected ||
            "Kết nối bị gián đoạn. Recording tạm dừng...",
          { id: "rec-disconnect", duration: 99999 },
        )
      } else if (
        connectionState === ConnectionState.Connected &&
        prevConnectionState.current === ConnectionState.Reconnecting
      ) {
        toast.dismiss("rec-disconnect")
        toast.success(
          t.recordings?.actions?.reconnected ||
            "Kết nối đã được khôi phục. Recording tiếp tục.",
          { duration: 3000 },
        )
      }
    }
    prevConnectionState.current = connectionState
  }, [connectionState, isRecording, t])

  const videoCallState = useVideoCall(t)
  const isHostUser = isRoomHost(roomData, user?.accountId)
  // Ticket 05: co-host + server policies for share/record gates.
  const { data: liveCoHostData } = useGetRoomCoHostQuery(currentRoomId, {
    skip: !currentRoomId,
  })
  const liveCoHost = normalizeCoHost(liveCoHostData)
  // Ticket 02: student-share + member-recording gates come from the room-state
  // cache (single store) instead of standalone policy GETs.
  const { data: roomStateData } = useGetRoomStateQuery(currentRoomId, {
    skip: !currentRoomId,
  })
  const roomStateSettings =
    (roomStateData?.data ?? roomStateData)?.settings ?? {}
  const allowStudentShare = roomStateSettings.allowStudentShare ?? true
  const allowMemberRecording = roomStateSettings.allowMemberRecording ?? true

  // Ticket 03: high-quality room policy now comes from the RoomState cache.
  const serverHighQuality = roomStateSettings.highQuality
  useEffect(() => {
    if (serverHighQuality !== undefined) {
      setRoomHighQuality(serverHighQuality === true)
    }
  }, [serverHighQuality])

  const screenShareState = useScreenShare({
    roomData,
    user,
    isHost: isHostUser,
    coHost: liveCoHost,
    allowStudentShare,
    t,
  })
  const watchTogether = useWatchTogether({
    sessionId,
    isHost: isHostUser,
    t,
  })
  const recordingState = useRecording(lkRoom, {
    isRecording,
    setIsRecording,
    egressId,
    setEgressId,
    startedByAccountId,
    setStartedByAccountId,
    sessionId,
    roomId: currentRoomId,
    isHost: isRoomHost(roomData, user?.accountId),
    accountId: user?.accountId,
    coHost: liveCoHost,
    allowMemberRecording,
  })

  const subtitleControls = useSubtitleControls({
    sessionId,
    room: roomData,
    setShowRoomSubtitles,
    setSubtitleSelectedLanguage,
  })

  // Audio is handled by <RoomAudioRenderer /> in the JSX below.

  // ── Participants ──
  const { participants, isHandRaised } = useParticipantList(
    allParticipants,
    localParticipant,
  )

  // ── Join/Leave Audio (personal preference, off by default) ──
  useParticipantAudioEffect(participants, joinLeaveSound)

  const localMetadata = (() => {
    if (!localParticipant?.metadata) return {}
    try {
      return JSON.parse(localParticipant.metadata)
    } catch {
      return {}
    }
  })()

  const currentUserId = user?.accountId

  // ── Chat Manager ──
  const {
    chatSend,
    chatMessages,
    combinedAiMessages,
    addOptimisticAiMessage,
    updateAiInteraction,
    isCurrentUserPrompting,
    startNewThread,
    continueThread,
    getConversationThread,
    chatPublicAi,
    chatPrivateAi,
    unreadRoomChat,
    setUnreadRoomChat,
    unreadAiChat,
    setUnreadAiChat,
  } = useChatManager({
    lkRoom,
    receiveSystemMsgs,
    currentUserId,
    participants,
    panelState,
  })

  // ── Action handlers ──
  const actions = useCallActions({
    t,
    language,
    isPiP,
    callInfo,
    toggleAudioFn: videoCallState.toggleAudio,
    toggleVideoFn: videoCallState.toggleVideo,
    leaveMeetingFn: videoCallState.leaveMeeting,
    screenShareState,
    chatSend,
    setActiveSidePanel: panelState.setActiveSidePanel,
  })

  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showWatchTogether, setShowWatchTogether] = useState(false)
  const promptLeaveCall = () => {
    if (isPiP) {
      actions.returnToCall()
    }
    setShowLeaveModal(true)
  }

  const cancelLeaveCall = () => {
    setShowLeaveModal(false)
  }

  // ── Moderation Listener (Real-Time Kick & Mute) ──
  useEffect(() => {
    if (!lkRoom) return

    const handleModerationData = (payload, participant, kind, topic) => {
      if (topic !== "moderation") return

      try {
        const decoded = new TextDecoder().decode(payload)
        const data = JSON.parse(decoded)
        const currentAccId =
          user?.accountId != null ? String(user.accountId) : null
        const localIdent =
          localParticipant?.identity != null
            ? String(localParticipant.identity)
            : null

        const isTarget =
          (data.targetId != null && String(data.targetId) === currentAccId) ||
          (data.targetIdentity != null &&
            String(data.targetIdentity) === localIdent)

        const pl = t.rooms?.videoCall?.participantList || {}
        const isHost = isRoomHost(roomData, user?.accountId)

        // Ticket 02: mute-all từ host hoặc co-host có mute_all.
        // Không tự mute (khong tu khoa) + host không bị co-host mute.
        if (data.action === "MUTE_ALL") {
          const senderIsMe =
            (data.senderId != null && String(data.senderId) === currentAccId) ||
            (data.senderIdentity != null &&
              String(data.senderIdentity) === localIdent)
          if (!senderIsMe && !isHost && localParticipant) {
            localParticipant.setMicrophoneEnabled(false)
            toast.error(
              pl.hostMutedAll ||
                "Host đã tắt tiếng tất cả mọi người trong phòng."
            )
          }
          return
        }

        // Ticket 03: room-scope "tắt camera toàn bộ" (camera_toggle).
        if (data.action === "CAMERA_OFF_ALL") {
          const senderIsMe =
            (data.senderId != null && String(data.senderId) === currentAccId) ||
            (data.senderIdentity != null &&
              String(data.senderIdentity) === localIdent)
          if (!senderIsMe && !isHost && localParticipant) {
            localParticipant.setCameraEnabled(false)
            toast.error(
              pl.hostCameraOffAll ||
                "Host đã tắt camera tất cả mọi người trong phòng."
            )
          }
          return
        }

        if (data.action === "SELF_UNMUTE_POLICY") {
          toast.info(
            data.allow
              ? (pl.selfUnmuteOn || "Host đã cho phép học viên tự bật mic.")
              : (pl.selfUnmuteOff || "Host đã tắt quyền học viên tự bật mic.")
          )
          return
        }

        // Ticket 02: self-camera gate changed — state arrives via the server
        // RoomSettingsChanged push; this data-channel event is just a toast.
        if (data.action === "SELF_CAMERA_POLICY") {
          toast.info(
            data.allow
              ? (pl.selfCameraOn || "Host đã cho phép học viên tự bật camera.")
              : (pl.selfCameraOff || "Host đã tắt quyền học viên tự bật camera.")
          )
          return
        }

        // Ticket 02: student share gate changed — patch the room-state cache
        // (single store). Students with an active share keep it; new starts
        // are gated.
        if (data.action === "STUDENT_SHARE_POLICY") {
          dispatch(
            roomsApi.util.updateQueryData(
              "getRoomState",
              currentRoomId,
              (draft) => {
                if (!draft?.settings) return
                draft.settings = {
                  ...draft.settings,
                  allowStudentShare: data.allow !== false,
                }
              }
            )
          )
          toast.info(
            data.allow
              ? (pl.studentShareOn || "Host đã cho phép học viên chia sẻ màn hình.")
              : (pl.studentShareOff || "Host đã tắt quyền học viên chia sẻ màn hình.")
          )
          return
        }

        // Ticket 02: member recording gate changed — patch the room-state
        // cache (single store) + toast.
        if (data.action === "MEMBER_RECORDING_POLICY") {
          dispatch(
            roomsApi.util.updateQueryData(
              "getRoomState",
              currentRoomId,
              (draft) => {
                if (!draft?.settings) return
                draft.settings = {
                  ...draft.settings,
                  allowMemberRecording: data.allow !== false,
                }
              }
            )
          )
          toast.info(
            data.allow !== false
              ? (pl.hostAllowedRecording ||
                  "Host đã CHO PHÉP thành viên ghi hình cuộc họp.")
              : (pl.hostDisabledRecording ||
                  "Host đã TẮT quyền ghi hình cuộc họp đối với thành viên.")
          )
          return
        }

        // Ticket 04 (egress): high-quality room policy changed live — apply
        // immediately (publish 720p; the foreign tile cap still wins).
        if (data.action === "HIGH_QUALITY_POLICY") {
          const enabled = data.enabled === true
          setRoomHighQuality(enabled)
          // Ticket 03: high-quality now lives in the room-state cache.
          dispatch(
            roomsApi.util.updateQueryData(
              "getRoomState",
              currentRoomId,
              (draft) => {
                if (!draft?.settings) return
                draft.settings = { ...draft.settings, highQuality: enabled }
              }
            )
          )
          toast.info(
            enabled
              ? (pl.hostHighQualityOn ||
                  "Host đã bật chế độ chất lượng cao cho phòng.")
              : (pl.hostHighQualityOff ||
                  "Host đã tắt chế độ chất lượng cao cho phòng.")
          )
          return
        }

        // Ticket 04: room lock changed — patch the room-state cache + toast.
        if (data.action === "ROOM_LOCK_CHANGED") {
          const locked = data.locked === true
          dispatch(
            roomsApi.util.updateQueryData(
              "getRoomState",
              currentRoomId,
              (draft) => {
                if (!draft?.settings) return
                draft.settings = { ...draft.settings, roomLocked: locked }
              }
            )
          )
          toast.info(
            locked
              ? (pl.hostLockedRoom ||
                  "Host đã khóa phòng. Người mới không thể tham gia.")
              : (pl.hostUnlockedRoom || "Host đã mở khóa phòng.")
          )
          return
        }

        // Ticket 04: host/co-host ended the live for everyone —
        // drop the LiveKit room and land on the end screen (rejoin
        // creates a brand-new session; room/class state untouched).
        if (data.action === "ROOM_ENDED") {
          toast.error(pl.hostEndedSession || "Host đã kết thúc buổi live.", {
            duration: 5000,
          })
          try {
            lkRoom?.disconnect()
          } catch {
            /* ignore disconnect errors */
          }
          dispatch(leaveCall())
          const nav = getNavigate()
          const loc = getLocation()
          if (nav && loc && loc.pathname.includes("/meet/")) {
            nav(loc.pathname, {
              replace: true,
              state: { callEnded: true, reason: "ended" },
            })
          }
          return
        }

        if (data.action === "LOWER_ALL_HANDS") {
          if (localParticipant) {
            safeSetLiveKitMetadata(localParticipant, {
              handRaised: false,
              handRaisedAt: 0,
            })
          }
          actions.setIsHandRaised?.(false)
          toast.info(
            pl.hostLoweredAllHands || "Host đã hạ tất cả các tay xuống.",
          )
          return
        }

        // Ticket 02: legacy local toggle — member recording now lives in the
        // room-state cache, so patch it there (no localStorage).
        if (data.action === "TOGGLE_MEMBER_RECORDING") {
          dispatch(
            roomsApi.util.updateQueryData(
              "getRoomState",
              currentRoomId,
              (draft) => {
                if (!draft?.settings) return
                draft.settings = {
                  ...draft.settings,
                  allowMemberRecording: data.allowed !== false,
                }
              }
            )
          )
          toast.info(
            data.allowed
              ? pl.hostAllowedRecording ||
                  "Host đã CHO PHÉP thành viên ghi hình cuộc họp."
              : pl.hostDisabledRecording ||
                  "Host đã TẮT quyền ghi hình cuộc họp đối với thành viên.",
          )
          if (!isHost && !data.allowed && isRecording) {
            recordingState.handleToggleRecording?.()
          }
          return
        }

        if (data.action === "TOGGLE_MEMBER_PRIVATE_AI") {
          setRoomSetting(
            currentRoomId,
            ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI,
            data.allowed,
          )
          window.dispatchEvent(
            new Event("catspeak_member_private_ai_allowed_changed"),
          )
          toast.info(
            data.allowed
              ? pl.hostAllowedPrivateAi ||
                  "Host đã CHO PHÉP thành viên sử dụng AI Chat riêng tư."
              : pl.hostDisabledPrivateAi ||
                  "Host đã TẮT quyền sử dụng AI Chat riêng tư đối với thành viên.",
          )
          return
        }

        // Ticket 02: chat/voice restriction sync (applies to every target so
        // the participant list badge updates too).
        if (
          data.action === "CHAT_RESTRICTED" ||
          data.action === "CHAT_UNRESTRICTED"
        ) {
          const restricted = data.action === "CHAT_RESTRICTED"
          applyRestrictionOverride(data.targetId, {
            isChatRestricted: restricted,
          })
          if (isTarget) {
            toast.error(
              restricted
                ? (pl.hostRestrictedChat ||
                    "Bạn đã bị Host hạn chế gửi tin nhắn chat.")
                : (pl.hostUnrestrictedChat ||
                    "Host đã gỡ hạn chế chat cho bạn.")
            )
          }
          return
        }

        if (
          data.action === "VOICE_RESTRICTED" ||
          data.action === "VOICE_UNRESTRICTED"
        ) {
          const restricted = data.action === "VOICE_RESTRICTED"
          applyRestrictionOverride(data.targetId, {
            isVoiceRestricted: restricted,
          })
          if (restricted && isTarget && localParticipant) {
            try {
              localParticipant.setMicrophoneEnabled(false)
            } catch {
              /* ignore */
            }
          }
          if (isTarget) {
            toast.error(
              restricted
                ? (pl.hostRestrictedVoice ||
                    "Bạn đã bị Host hạn chế bật mic.")
                : (pl.hostUnrestrictedVoice ||
                    "Host đã gỡ hạn chế mic cho bạn.")
            )
          }
          return
        }

        if (data.action === "RESTRICT_VOICE_ALL") {
          const senderIsMe =
            (data.senderId != null && String(data.senderId) === currentAccId) ||
            (data.senderIdentity != null &&
              String(data.senderIdentity) === localIdent)
          const ids = Array.isArray(data.restrictedAccountIds)
            ? data.restrictedAccountIds
            : null
          if (ids && ids.length > 0) {
            setRestrictionOverrides((prev) => {
              const next = { ...prev }
              ids.forEach((accountId) => {
                const key = String(accountId)
                next[key] = { ...(next[key] || {}), isVoiceRestricted: true }
              })
              return next
            })
          }
          const shouldRestrictSelf =
            !senderIsMe &&
            !isHost &&
            (ids == null || ids.some((x) => String(x) === currentAccId))
          if (shouldRestrictSelf) {
            applyRestrictionOverride(currentAccId, {
              isVoiceRestricted: true,
            })
            toast.error(
              pl.hostRestrictedVoiceAll ||
                "Host đã hạn chế quyền bật mic của tất cả mọi người."
            )
          }
          return
        }

        if (!isTarget) return

        if (data.action === "KICK_PARTICIPANT") {
          toast.error(pl.kickedByHost || "Bạn đã bị Host mời ra khỏi phòng.", {
            duration: 5000,
          })
          actions.handleLeaveSession()
        } else if (data.action === "MUTE_PARTICIPANT") {
          // Ticket 02: host/co-host mute (muted=true) hoặc bật giùm (muted=false).
          // Bật giùm luôn được phép kể cả khi gate tự bật mic đang tắt.
          const shouldMute = data.muted !== false
          if (data.trackKind === "audio" && localParticipant) {
            localParticipant.setMicrophoneEnabled(!shouldMute)
            toast.error(
              shouldMute
                ? (pl.hostMutedMic || "Host đã tắt mic của bạn.")
                : (pl.hostUnmutedMic || "Host đã bật mic của bạn.")
            )
          } else if (data.trackKind === "video" && localParticipant) {
            localParticipant.setCameraEnabled(!shouldMute)
            toast.error(
              shouldMute
                ? (pl.hostMutedCam || "Host đã tắt camera của bạn.")
                : (pl.hostUnmutedCam || "Host đã bật camera của bạn.")
            )
          } else if (
            (data.trackKind === "screen" ||
              data.trackKind === "screen_share") &&
            localParticipant
          ) {
            if (shouldMute) {
              localParticipant.setScreenShareEnabled(false)
              toast.error(
                pl.hostStoppedScreen || "Host đã dừng chia sẻ màn hình của bạn."
              )
            }
          }
        }
      } catch (err) {
        console.error("[Moderation] Error parsing moderation payload:", err)
      }
    }

    // Ticket 01: the settings handshake is gone — policy now arrives via the
    // GET /rooms/{id}/state snapshot + SignalR RoomSettingsChanged.
    lkRoom.on(RoomEvent.DataReceived, handleModerationData)
    return () => {
      lkRoom.off(RoomEvent.DataReceived, handleModerationData)
    }
  }, [
    lkRoom,
    localParticipant,
    user?.accountId,
    roomData,
    actions,
    applyRestrictionOverride,
  ])

  // ── Room Lifecycle ──
  const activeSessionId = callInfo?.sessionId || localMetadata?.sessionId
  const { closingRemainingSeconds } = useRoomLifecycle({
    lkRoom,
    activeSessionId,
    language,
    t,
  })

  // ── Context value ──
  const value = {
    // Call lifecycle
    isInCall,
    isPiP,
    enterPiP: actions.enterPiP,
    exitPiP: actions.exitPiP,
    returnToCall: actions.returnToCall,
    isPiPSupported: actions.isPiPSupported,
    showLeaveModal,
    promptLeaveCall,
    cancelLeaveCall,

    // Session
    id: currentRoomId,
    sessionId: callInfo?.sessionId || localMetadata?.sessionId,
    closingRemainingSeconds,
    navigate: getNavigate(),
    location: getLocation(),
    room: roomData,
    lkRoom,
    lkRoomName: lkRoom?.name,
    sessionError: null,

    // User
    user,
    currentUserId: user?.accountId,

    // Participants
    localParticipant,
    participants,
    isHandRaised,

    // Ticket 02: moderation restriction state
    restrictionByAccountId,
    isChatRestricted: localRestriction.isChatRestricted,
    isVoiceRestricted: localRestriction.isVoiceRestricted,

    // Media state
    micOn: videoCallState.micOn,
    cameraOn: videoCallState.cameraOn,
    isConnected,
    isTogglingMic: videoCallState.isTogglingMic,
    isTogglingCam: videoCallState.isTogglingCam,

    // Beauty
    beautyOptions,
    setBeautyOptions,
    switchBeauty: videoCallState.switchBeauty,
    processorStatus: videoCallState.processorStatus,

    // UI panels
    ...panelState,
    showTroubleshoot: panelState.showTroubleshoot,
    setShowTroubleshoot: panelState.setShowTroubleshoot,
    unreadRoomChat,
    setUnreadRoomChat,
    unreadAiChat,
    setUnreadAiChat,
    showCC,
    setShowCC,
    isAISession,
    isHost: isRoomHost(roomData, user),

    // Room subtitles
    showRoomSubtitles,
    setShowRoomSubtitles,
    subtitleSelectedLanguage,
    setSubtitleSelectedLanguage,
    isSubtitleActive: subtitleControls.isSubtitleActive,
    isStartingSubtitles: subtitleControls.isStarting,
    isStoppingSubtitles: subtitleControls.isStopping,
    subtitleSupportedLangs: subtitleControls.subtitleSupportedLangs,
    startSubtitles: subtitleControls.startSubtitles,
    stopSubtitles: subtitleControls.stopSubtitles,

    // Chat
    messages: chatMessages,
    aiMessages: combinedAiMessages,
    addOptimisticAiMessage,
    chatPublicAi,
    chatPrivateAi,
    receiveSystemMsgs,
    setReceiveSystemMsgs,
    showAiSuggestions,
    setShowAiSuggestions,
    joinLeaveSound,
    setJoinLeaveSound,
    updateAiInteraction,
    isCurrentUserPrompting,
    startNewThread,
    continueThread,
    getConversationThread,

    // Actions
    handleToggleMic: actions.handleToggleMic,
    handleToggleCam: actions.handleToggleCam,
    handleSendMessage: actions.handleSendMessage,
    handleLeaveSession: actions.handleLeaveSession,
    handleCopyLink: actions.handleCopyLink,

    // Screen share
    screenShareOn: screenShareState.screenShareOn,
    screenShareTrackRef: screenShareState.screenShareTrackRef,
    screenShareTracks: screenShareState.screenShareTracks,
    screenSharePresenterId: screenShareState.presenterId,
    isLocalScreenShare: screenShareState.isLocalScreenShare,
    presenterDisplayName: screenShareState.presenterDisplayName,
    handleToggleScreenShare: actions.handleToggleScreenShare,
    isTogglingScreenShare: screenShareState.isTogglingScreenShare,
    canShareScreen: screenShareState.canShareScreen,
    // Watch together (YouTube)
    mediaActive: watchTogether.isMediaActive,
    mediaParticipant: watchTogether.mediaParticipant,
    mediaTrackRef: watchTogether.mediaTrackRef,
    mediaTitle: watchTogether.mediaTitle,
    isMediaHost: watchTogether.isMediaHost,
    isStartingMedia: watchTogether.isStarting,
    isStoppingMedia: watchTogether.isStopping,
    startMedia: watchTogether.startMedia,
    stopMedia: watchTogether.stopMedia,
    showWatchTogether,
    setShowWatchTogether,
    // Recording
    isRecording: isRecording,
    isTogglingRecording: recordingState.isTogglingRecording,
    handleToggleRecording: recordingState.handleToggleRecording,
    showStopModal: recordingState.showStopModal,
    confirmStopRecording: recordingState.confirmStopRecording,
    cancelStopRecording: recordingState.cancelStopRecording,
    egressId: egressId,
    startedByAccountId: startedByAccountId,
    layoutMode,
    setLayoutMode,
    pinnedParticipantId,
    setPinnedParticipantId,
    // Ticket 04 (egress): live high-quality room policy
    roomHighQuality,
    setRoomHighQuality,
    maxTiles,
    setMaxTiles,
    hideEmptyTiles,
    setHideEmptyTiles,

    deviceSelection,
    showRoomSettings,
    setShowRoomSettings,
    activeSettingsTab,
    setActiveSettingsTab,
  }

  return (
    <ContextProvider value={value}>
      <RoomAudioRenderer />
      {children}
      <RoomClosingWarningModal
        remainingSeconds={closingRemainingSeconds}
        t={t}
      />
      <RoomSettingsModal
        open={showRoomSettings}
        onClose={() => setShowRoomSettings(false)}
        initialTab={activeSettingsTab}
      />
      <ConfirmationModal
        open={screenShareState.showTakeoverModal}
        onClose={() => screenShareState.setShowTakeoverModal(false)}
        onConfirm={screenShareState.confirmTakeoverScreenShare}
        title={
          t.rooms?.videoCall?.screenShare?.takeoverTitle ||
          "Chia sẻ màn hình thay thế?"
        }
        message={
          typeof t.rooms?.videoCall?.screenShare?.takeoverMessage === "string"
            ? t.rooms.videoCall.screenShare.takeoverMessage.replace(
                "{{name}}",
                screenShareState.presenterDisplayName,
              )
            : `${screenShareState.presenterDisplayName} đang chia sẻ màn hình. Bắt đầu chia sẻ màn hình mới sẽ dừng phần trình bày của ${screenShareState.presenterDisplayName}.`
        }
        confirmText={
          t.rooms?.videoCall?.screenShare?.takeoverConfirm || "Chia sẻ thay thế"
        }
        confirmVariant="primary"
        isPending={screenShareState.isTogglingScreenShare}
      />
    </ContextProvider>
  )
}

export default GlobalCallContent
