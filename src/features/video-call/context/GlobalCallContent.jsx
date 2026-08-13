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
import { ConnectionState, RoomEvent } from "livekit-client"
import { toast } from "react-hot-toast"
import { Clock } from "lucide-react"

import Modal from "@/shared/components/ui/Modal"
import { leaveCall } from "@/store/slices/videoCallSlice"
import { useVideoCallSignaling } from "@/features/video-call/hooks/useVideoCallSignaling"

import { useVideoCall } from "@/features/video-call/hooks/useVideoCall"
import { useScreenShare } from "@/features/video-call/hooks/useScreenShare"
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
import {
  getNavigate,
  getLocation,
} from "@/features/video-call/hooks/useNavigateRef"
import RoomClosingWarningModal from "@/features/video-call/components/RoomClosingWarningModal"
import { useRoomLifecycle } from "@/features/video-call/hooks/useRoomLifecycle.jsx"
import { useChatManager } from "@/features/video-call/hooks/useChatManager"
import { useSubtitleControls } from "@/features/video-call/hooks/useSubtitleControls"
import { useDeviceSelection } from "@/features/rooms/hooks/useDeviceSelection"
import {
  getRoomSetting,
  setRoomSetting,
  ROOM_SETTING_KEYS,
} from "@/features/video-call/utils/roomSettingHelpers"
import RoomSettingsModal from "@/features/video-call/components/settings/RoomSettingsModal"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"

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
  panelState,
}) => {
  const { t, language } = useLanguage()
  const { isInCall, isPiP, callInfo } = useSelector((s) => s.videoCall)
  const { roomData, user } = callInfo ?? {}
  const currentRoomId = callInfo?.roomId || roomData?.id
  const isAISession = callInfo?.isAISession ?? false

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
  const [hideEmptyTiles, setHideEmptyTiles] = useState(() => {
    try {
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
    }
  })

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
  const screenShareState = useScreenShare()
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

  // ── Join/Leave Audio ──
  useParticipantAudioEffect(participants, currentRoomId)

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

        if (data.action === "MUTE_ALL" && !isHost) {
          if (localParticipant) {
            localParticipant.setMicrophoneEnabled(false)
            toast.error(
              pl.hostMutedAll ||
                "Host đã tắt tiếng tất cả mọi người trong phòng.",
            )
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

        if (data.action === "TOGGLE_JOIN_SOUND") {
          setRoomSetting(
            currentRoomId,
            ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND,
            data.enabled,
          )
          window.dispatchEvent(new Event("catspeak_join_leave_sound_changed"))
          toast.info(
            data.enabled
              ? pl.hostEnabledJoinSound ||
                  "Host đã BẬT âm thanh khi có người vào/ra phòng."
              : pl.hostDisabledJoinSound ||
                  "Host đã TẮT âm thanh khi có người vào/ra phòng.",
          )
          return
        }

        if (data.action === "TOGGLE_MEMBER_RECORDING") {
          setRoomSetting(
            currentRoomId,
            ROOM_SETTING_KEYS.MEMBER_RECORDING,
            data.allowed,
          )
          window.dispatchEvent(
            new Event("catspeak_member_recording_allowed_changed"),
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

        if (data.action === "REQUEST_ROOM_SETTINGS_SYNC") {
          if (
            isHost &&
            localParticipant &&
            lkRoom?.state === ConnectionState.Connected
          ) {
            try {
              const syncPayload = new TextEncoder().encode(
                JSON.stringify({
                  action: "SYNC_ROOM_SETTINGS",
                  settings: {
                    joinLeaveSound: getRoomSetting(
                      currentRoomId,
                      ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND,
                    ),
                    memberRecording: getRoomSetting(
                      currentRoomId,
                      ROOM_SETTING_KEYS.MEMBER_RECORDING,
                    ),
                    memberPrivateAi: getRoomSetting(
                      currentRoomId,
                      ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI,
                    ),
                  },
                  targetIdentity: participant?.identity,
                }),
              )
              localParticipant
                .publishData(syncPayload, {
                  topic: "moderation",
                  reliable: true,
                })
                .catch(() => {})
            } catch (err) {
              console.error(
                "Error responding to REQUEST_ROOM_SETTINGS_SYNC:",
                err,
              )
            }
          }
          return
        }

        if (data.action === "SYNC_ROOM_SETTINGS") {
          const isTargetMe =
            !data.targetIdentity ||
            String(data.targetIdentity) === String(localParticipant?.identity)
          if (isTargetMe && data.settings) {
            if (data.settings.joinLeaveSound !== undefined) {
              setRoomSetting(
                currentRoomId,
                ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND,
                data.settings.joinLeaveSound,
              )
              window.dispatchEvent(
                new Event("catspeak_join_leave_sound_changed"),
              )
            }
            if (data.settings.memberRecording !== undefined) {
              setRoomSetting(
                currentRoomId,
                ROOM_SETTING_KEYS.MEMBER_RECORDING,
                data.settings.memberRecording,
              )
              window.dispatchEvent(
                new Event("catspeak_member_recording_allowed_changed"),
              )
            }
            if (data.settings.memberPrivateAi !== undefined) {
              setRoomSetting(
                currentRoomId,
                ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI,
                data.settings.memberPrivateAi,
              )
              window.dispatchEvent(
                new Event("catspeak_member_private_ai_allowed_changed"),
              )
            }
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
          if (data.trackKind === "audio" && localParticipant) {
            localParticipant.setMicrophoneEnabled(false)
            toast.error(pl.hostMutedMic || "Host đã tắt mic của bạn.")
          } else if (data.trackKind === "video" && localParticipant) {
            localParticipant.setCameraEnabled(false)
            toast.error(pl.hostMutedCam || "Host đã tắt camera của bạn.")
          } else if (
            (data.trackKind === "screen" ||
              data.trackKind === "screen_share") &&
            localParticipant
          ) {
            localParticipant.setScreenShareEnabled(false)
            toast.error(
              pl.hostStoppedScreen || "Host đã dừng chia sẻ màn hình của bạn.",
            )
          }
        }
      } catch (err) {
        console.error("[Moderation] Error parsing moderation payload:", err)
      }
    }

    const handleParticipantJoined = (participant) => {
      const isHost = isRoomHost(roomData, user?.accountId)
      if (
        isHost &&
        localParticipant &&
        lkRoom?.state === ConnectionState.Connected
      ) {
        try {
          const syncPayload = new TextEncoder().encode(
            JSON.stringify({
              action: "SYNC_ROOM_SETTINGS",
              settings: {
                joinLeaveSound: getRoomSetting(
                  currentRoomId,
                  ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND,
                ),
                memberRecording: getRoomSetting(
                  currentRoomId,
                  ROOM_SETTING_KEYS.MEMBER_RECORDING,
                ),
                memberPrivateAi: getRoomSetting(
                  currentRoomId,
                  ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI,
                ),
              },
              targetIdentity: participant.identity,
            }),
          )
          localParticipant
            .publishData(syncPayload, { topic: "moderation", reliable: true })
            .catch(() => {})
        } catch (err) {
          console.error("Error syncing room settings to new participant:", err)
        }
      }

      try {
        const isSoundEnabled = getRoomSetting(
          currentRoomId,
          ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND,
        )
        if (!isSoundEnabled) return

        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return
        const ctx = new AudioContext()
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(523.25, now)
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15)
        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.3)
      } catch (e) {
        // autoplay restriction fallback
      }
    }

    // Request settings sync from Host on join if not Host
    if (
      lkRoom?.state === ConnectionState.Connected &&
      localParticipant &&
      !isRoomHost(roomData, user?.accountId)
    ) {
      try {
        const reqPayload = new TextEncoder().encode(
          JSON.stringify({ action: "REQUEST_ROOM_SETTINGS_SYNC" }),
        )
        localParticipant
          .publishData(reqPayload, { topic: "moderation", reliable: true })
          .catch(() => {})
      } catch (e) {
        // ignore
      }
    }

    lkRoom.on(RoomEvent.DataReceived, handleModerationData)
    lkRoom.on(RoomEvent.ParticipantConnected, handleParticipantJoined)
    return () => {
      lkRoom.off(RoomEvent.DataReceived, handleModerationData)
      lkRoom.off(RoomEvent.ParticipantConnected, handleParticipantJoined)
    }
  }, [lkRoom, localParticipant, user?.accountId, roomData, actions])

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
    id: callInfo?.roomId,
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
    </ContextProvider>
  )
}

export default GlobalCallContent
