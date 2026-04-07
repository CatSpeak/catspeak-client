import React, { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-hot-toast"
import { useGetProfileQuery } from "@/features/auth"
import {
  useGetVideoSessionByIdQuery,
  useGetLivekitTokenMutation,
} from "@/store/api/videoSessionsApi"
import {
  useGetRoomByIdQuery,
  WaitingScreen,
  useMediaPreview,
  useJoinVideoSession,
} from "@/features/rooms"
import { useLanguage } from "@/shared/context/LanguageContext"
import { enterCall, setPiP } from "@/store/slices/videoCallSlice"
import { detectWebView } from "@/shared/utils/isWebView"
import VideoCallLoading from "../components/VideoCallLoading"
import RoomNotFoundScreen from "../components/RoomNotFoundScreen"
import WebViewBlockScreen from "../components/WebViewBlockScreen"
import SessionErrorScreen from "../components/SessionErrorScreen"

/**
 * Phases:
 *  - "waiting"  : Room loaded, showing WaitingScreen with media preview
 *  - "joining"  : User clicked "Join Now", creating/joining video session
 *  - "in-call"  : Session joined, delegated to GlobalVideoCallProvider
 */
export const VideoCallProvider = ({ children }) => {
  const { id: roomId, lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t, language } = useLanguage()

  // Check if there's already an active global call for this room
  const { isInCall, callInfo } = useSelector((s) => s.videoCall)
  const isReturningToCall =
    isInCall && callInfo?.roomId && String(callInfo.roomId) === String(roomId)

  // If returning to an active call, exit PiP and render children directly.
  // The global provider already has LiveKitRoom + context running.
  useEffect(() => {
    if (isReturningToCall) {
      dispatch(setPiP(false))
    }
  }, [isReturningToCall, dispatch])

  if (isReturningToCall) {
    return <>{children}</>
  }

  // Otherwise, render the normal waiting → joining → in-call flow
  return (
    <VideoCallProviderInner roomId={roomId} lang={lang}>
      {children}
    </VideoCallProviderInner>
  )
}

// ─── Inner provider (only rendered for new calls, not returns) ──────────
const VideoCallProviderInner = ({ children, roomId, lang }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t, language } = useLanguage()

  // ── WebView gate (must be before any conditional hooks) ──
  const webview = useMemo(() => detectWebView(), [])

  // Detect if user arrived from queue match
  const fromQueue = location.state?.fromQueue === true

  // Phase state machine — skip waiting if from queue
  const [phase, setPhase] = useState(fromQueue ? "joining" : "waiting")
  const [joinedSessionId, setJoinedSessionId] = useState(null)
  const [initMicOn, setInitMicOn] = useState(false)
  const [initCamOn, setInitCamOn] = useState(false)

  // --- User data ---
  const { data: userData, isLoading: isLoadingUser } = useGetProfileQuery()
  const user = userData?.data ?? null

  // --- Room data (fetched by roomId from URL) ---
  const isRoomQuerySkipped = !roomId || !user
  const {
    data: room,
    isLoading: isLoadingRoom,
    error: roomError,
  } = useGetRoomByIdQuery(roomId, {
    skip: isRoomQuerySkipped,
    pollingInterval: phase === "waiting" ? 15000 : undefined,
  })

  // --- Media Preview (for waiting screen) ---
  const {
    micOn,
    cameraOn,
    localStream,
    toggleMic: hookToggleMic,
    toggleCamera: hookToggleCamera,
  } = useMediaPreview()

  const toggleMic = async () => {
    await hookToggleMic()
  }

  const toggleCamera = async () => {
    await hookToggleCamera()
  }

  // --- Join/create session logic ---
  const {
    handleJoin: hookJoin,
    isLoadingSessions,
    activeSession,
    isJoining,
    isCreating,
  } = useJoinVideoSession({
    roomId,
    isAuthenticated: !!user,
  })

  // Room full check
  const currentParticipantCount = room?.currentParticipantCount ?? 0
  const maxParticipants = room?.maxParticipants ?? null
  const isRoomFull =
    maxParticipants !== null && currentParticipantCount >= maxParticipants

  // --- Session data (fetched after join) ---
  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useGetVideoSessionByIdQuery(joinedSessionId, {
    skip: !joinedSessionId,
  })

  // --- LiveKit token mutation ---
  const [getLivekitToken] = useGetLivekitTokenMutation()

  // --- Cleanup media preview tracks when transitioning to in-call ---
  const cleanupMediaPreview = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
  }, [localStream])

  // --- Handle "Join Now" click ---
  const handleJoinClick = async ({ skipRoomFullCheck = false } = {}) => {
    setPhase("joining")

    try {
      // 1. Fetch LiveKit token FIRST to validate connectivity
      const tokenRes = await getLivekitToken({
        meetingId: room.name,
        name: user.username,
      }).unwrap()

      const token = tokenRes?.token
      const serverUrl = tokenRes?.serverUrl
      if (!token || typeof token !== "string") {
        throw new Error("Invalid LiveKit token received from backend")
      }

      // 2. Token is valid → now create/join the backend session
      const result = await hookJoin({
        isRoomFull,
        micOn,
        cameraOn,
        skipRoomFullCheck,
      })

      if (result) {
        // Stop preview tracks before entering the call
        cleanupMediaPreview()

        setInitMicOn(result.micOn)
        setInitCamOn(result.cameraOn)
        setJoinedSessionId(result.sessionId)

        // Don't set phase to "in-call" yet — wait for session data to load
        // Then we dispatch enterCall to the global provider
        setPhase("in-call")

        // Build the call path for PiP return navigation
        const callPath = `/${lang || language}/meet/${roomId}`

        // Dispatch to global provider — this triggers LiveKitRoom rendering
        dispatch(
          enterCall({
            livekitToken: token,
            livekitServerUrl: serverUrl,
            roomId,
            sessionId: result.sessionId,
            callPath,
            roomData: room,
            sessionData: null, // Will be updated once session query resolves
            user,
            initMicOn: result.micOn,
            initCamOn: result.cameraOn,
          }),
        )
      } else {
        // Backend session join failed, go back to waiting
        setPhase("waiting")
      }
    } catch (err) {
      console.error("[VideoCall] LiveKit token fetch failed:", err)
      toast.error(
        t.rooms.videoCall.provider.tokenError ??
          "Failed to connect to video service. Please try again.",
      )
      setPhase("waiting")
    }
  }

  // --- Update global session data once it loads ---
  useEffect(() => {
    if (session && phase === "in-call") {
      dispatch(
        enterCall({
          livekitToken: undefined, // Don't overwrite — keep existing
          roomId,
          sessionId: session.sessionId,
          callPath: `/${lang || language}/meet/${roomId}`,
          roomData: room,
          sessionData: session,
          user,
          initMicOn,
          initCamOn,
        }),
      )
    }
  }, [session, phase])

  // --- Auto-join for queue-matched users (skip WaitingScreen) ---
  const autoJoinTriggered = useRef(false)
  useEffect(() => {
    if (
      fromQueue &&
      !autoJoinTriggered.current &&
      user &&
      room &&
      !isLoadingUser &&
      !isLoadingRoom
    ) {
      autoJoinTriggered.current = true
      // Clear fromQueue state to prevent re-trigger on page refresh
      navigate(location.pathname, { replace: true, state: {} })
      // Auto-join with mic/camera OFF, bypassing room-full check
      handleJoinClick({ skipRoomFullCheck: true })
    }
  }, [fromQueue, user, room, isLoadingUser, isLoadingRoom])

  // ========================================
  //  RENDER: Guards & phase-based rendering
  // ========================================

  // WebView block — must come first
  if (webview.isWebView) {
    return <WebViewBlockScreen appName={webview.appName} />
  }

  // Loading room data
  if (
    isLoadingUser ||
    isLoadingRoom ||
    isLoadingSessions ||
    isRoomQuerySkipped
  ) {
    return <div className="h-screen w-full bg-white"></div>
  }

  // Room not found
  if (roomError || !room) {
    return <RoomNotFoundScreen />
  }

  // ---- PHASE: WAITING ----
  if (phase === "waiting") {
    const displaySession = activeSession || {
      name: room.name,
      roomName: room.name,
      topic: room.topic,
      requiredLevel: room.requiredLevel,
      participants: [],
    }

    return (
      <WaitingScreen
        session={displaySession}
        room={room}
        participantCount={currentParticipantCount}
        user={user}
        micOn={micOn}
        cameraOn={cameraOn}
        localStream={localStream}
        onToggleMic={toggleMic}
        onToggleCam={toggleCamera}
        onJoin={handleJoinClick}
        isFull={isRoomFull}
        maxParticipants={maxParticipants}
      />
    )
  }

  // ---- PHASE: JOINING ----
  if (phase === "joining") {
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    )
  }

  // ---- PHASE: IN-CALL ----
  // The global provider is now rendering LiveKitRoom.
  // Just render children — they get context from GlobalCallContent.
  return <>{children}</>
}
