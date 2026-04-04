import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  useChat,
  useConnectionState,
} from "@livekit/components-react"
import { ConnectionState } from "livekit-client"
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
 * Renders inside LiveKitRoom. Owns all call-level state and actions,
 * then provides them via context.
 */
export const VideoCallContent = ({
  children,
  user,
  session,
  sessionError,
  room,
}) => {
  const { lang } = useParams()
  const sessionId = session?.sessionId
  const navigate = useNavigate()
  const location = useLocation()
  const { t, language } = useLanguage()

  // UI-only state
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  const [leaveSession] = useLeaveVideoSessionMutation()

  // Track whether we've already left the session
  const hasLeftRef = useRef(false)
  const isLeavingRef = useRef(false)

  const leaveSessionOnUnload = useCallback(() => {
    if (!sessionId || hasLeftRef.current) return
    hasLeftRef.current = true

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

  // Register beforeunload / pagehide to leave session
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

  // LiveKit room instance
  const lkRoom = useRoomContext()

  // LiveKit — all participants (local + remote)
  const allParticipants = useParticipants()
  const { localParticipant } = useLocalParticipant()

  // Connection state
  const connectionState = useConnectionState()
  const isConnected = connectionState === ConnectionState.Connected

  // Local mic/cam state + toggle actions
  const { micOn, cameraOn, toggleAudio, toggleVideo, leaveMeeting, isJoined } =
    useVideoCall(t)

  // Screen share state & actions
  const {
    screenShareOn,
    screenShareTrackRef,
    screenShareTracks,
    presenterId: screenSharePresenterId,
    isLocalScreenShare,
    toggleScreenShare,
    presenterDisplayName,
  } = useScreenShare()

  // Chat via LiveKit data channels
  const { chatMessages, send: chatSend } = useChat()

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

  const handleSendMessage = (text) => chatSend(text)

  const handleLeaveSession = async () => {
    hasLeftRef.current = true
    isLeavingRef.current = true
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

  // Build deduplicated participant list (local first)
  const seenIdentities = new Set()
  const participants = []

  if (localParticipant) {
    seenIdentities.add(localParticipant.identity)
    participants.push(localParticipant)
  }

  allParticipants.forEach((p) => {
    if (p.identity === localParticipant?.identity) return
    if (seenIdentities.has(p.identity)) return
    seenIdentities.add(p.identity)
    participants.push(p)
  })

  if (!isConnected) {
    // Don't show "Connecting..." when intentionally leaving
    if (isLeavingRef.current) return null
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
    localParticipant,
    session,
    room,
    sessionError,
    participants,
    messages: chatMessages,
    isConnected,
    handleToggleMic,
    handleToggleCam,
    handleSendMessage,
    handleLeaveSession,
    handleCopyLink,
    // Screen share
    screenShareOn,
    screenShareTrackRef,
    screenShareTracks,
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
