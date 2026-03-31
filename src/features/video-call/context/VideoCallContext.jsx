import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk"
import { useVideoCall } from "@/features/video-call/hooks/useVideoCall"
import { useScreenShare } from "@/features/video-call/hooks/useScreenShare"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getCommunityPath } from "@/shared/utils/navigation"
import { useLeaveVideoSessionMutation } from "@/store/api/videoSessionsApi"
import { handleMediaError } from "@/shared/utils/mediaErrorUtils"
import VideoCallLoading from "../components/VideoCallLoading"

const VideoCallContext = createContext()

export const useVideoCallContext = () => {
  const context = useContext(VideoCallContext)
  if (!context)
    throw new Error("useVideoCallContext must be used within VideoCallProvider")
  return context
}

/**
 * Renders inside MeetingProvider. Owns all call-level state and actions,
 * then provides them via context.
 */
export const VideoCallContent = ({
  children,
  user,
  session,
  sessionError,
  sdkToken,
  room,
}) => {
  const { lang } = useParams()
  // session.sessionId is the actual session identifier for API calls.
  // The URL :id is now roomId, not sessionId.
  const sessionId = session?.sessionId
  const navigate = useNavigate()
  const location = useLocation()
  const { t, language } = useLanguage()

  // UI-only state
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  const [leaveSession] = useLeaveVideoSessionMutation()

  // Track whether we've already left the session (to avoid double-calls)
  const hasLeftRef = useRef(false)

  const leaveSessionOnUnload = useCallback(() => {
    if (!sessionId || hasLeftRef.current) return
    hasLeftRef.current = true

    // Use fetch with keepalive for reliable delivery during page unload
    // (sendBeacon only supports POST, but the leave API requires DELETE)
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api"
    const url = `${baseUrl}/video-sessions/${sessionId}/participants`
    const token = localStorage.getItem("token")

    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      keepalive: true,
    }).catch(() => {})
  }, [sessionId])

  // Register beforeunload / pagehide to leave session when tab/window closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      leaveSessionOnUnload()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("pagehide", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("pagehide", handleBeforeUnload)
    }
  }, [leaveSessionOnUnload])

  // SDK — participant list & connected state
  const { participants, localParticipant } = useMeeting()

  // Local mic/cam state + lifecycle (join/leave) + toggle actions
  const { micOn, cameraOn, toggleAudio, toggleVideo, leaveMeeting, isJoined } =
    useVideoCall(sdkToken, t)

  // Screen share state & actions
  const {
    screenShareOn,
    screenShareStream,
    presenterId: screenSharePresenterId,
    isLocalScreenShare,
    toggleScreenShare,
    presenterDisplayName,
  } = useScreenShare()

  // Chat via VideoSDK PubSub
  const { publish, messages } = usePubSub("CHAT", {})

  const handleToggleMic = async () => {
    try {
      await toggleAudio()
    } catch (err) {
      handleMediaError(err, "mic", t, { isToggle: true })
    }
  }

  const handleToggleCam = async () => {
    try {
      await toggleVideo()
    } catch (err) {
      handleMediaError(err, "camera", t, { isToggle: true })
    }
  }

  const handleToggleScreenShare = () => {
    try {
      toggleScreenShare()
    } catch (err) {
      console.error("[VideoCallContext] Screen share error:", err)
      toast.error(
        t?.rooms?.videoCall?.screenShare?.error ?? "Failed to share screen.",
      )
    }
  }

  const handleSendMessage = (text) => publish(text, { persist: true })

  const handleLeaveSession = async () => {
    hasLeftRef.current = true // prevent unload handler from double-firing
    if (sessionId) {
      try {
        await leaveSession(sessionId).unwrap()
      } catch (error) {
        console.error("Failed to leave session:", error)
      }
    }
    leaveMeeting()
    navigate(getCommunityPath(lang || language))
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  // Build a stable participant id list for VideoGrid.
  // Deduplication: if the same accountId joins on two tabs only show them once.
  const seenAccountIds = new Set()
  const participantIds = []

  if (localParticipant) {
    const aid = localParticipant.metaData?.accountId
    if (aid) seenAccountIds.add(String(aid))
    participantIds.push(localParticipant.id)
  }

  ;[...participants.values()].forEach((p) => {
    if (p.id === localParticipant?.id) return
    const aid = p.metaData?.accountId
    const key = aid ? String(aid) : `__sdk__${p.id}`
    if (seenAccountIds.has(key)) {
      console.warn(
        `[VideoCallContext] 🔄 Dedup: dropping participant ${p.id} ` +
          `(accountId=${aid}, displayName=${p.displayName}) — already seen`,
      )
      return
    }
    seenAccountIds.add(key)
    participantIds.push(p.id)
  })

  const isConnected = isJoined

  if (!isConnected) {
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    )
  }

  const value = {
    id: sessionId,
    navigate,
    location,
    micOn,
    cameraOn,
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    user,
    currentUserId: user?.accountId,
    localParticipantId: localParticipant?.id,
    session,
    room,
    sessionError,
    participantIds,
    messages,
    isConnected,
    handleToggleMic,
    handleToggleCam,
    handleSendMessage,
    handleLeaveSession,
    handleCopyLink,
    // Screen share
    screenShareOn,
    screenShareStream,
    screenSharePresenterId,
    isLocalScreenShare,
    presenterDisplayName,
    handleToggleScreenShare,
  }

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  )
}
