import React, { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-hot-toast"
import { useGetProfileQuery } from "@/features/auth"
import { useGetLivekitTokenMutation } from "@/store/api/livekitApi"
import {
  useGetRoomByIdQuery,
  WaitingScreen,
  useMediaPreview,
} from "@/features/rooms"
import { useVerifyJoinRoomMutation } from "@/store/api/roomsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { enterCall, setPiP, leaveCall } from "@/store/slices/videoCallSlice"
import { detectWebView } from "@/shared/utils/isWebView"
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal"
import VideoCallLoading from "../components/VideoCallLoading"
import RoomNotFoundScreen from "../components/RoomNotFoundScreen"
import WebViewBlockScreen from "../components/WebViewBlockScreen"
import PasswordScreen from "../components/PasswordScreen"

/**
 * Phases:
 *  - "verifying"         : Checking if user has access to a private room
 *  - "password-required" : Private room, no grant — user must enter password
 *  - "waiting"           : Room loaded, showing WaitingScreen with media preview
 *  - "joining"           : User clicked "Join Now", fetching LiveKit token
 *  - "in-call"           : Token acquired, delegated to GlobalVideoCallProvider
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

  const { isInCall, callInfo } = useSelector((s) => s.videoCall)

  // ── WebView gate (must be before any conditional hooks) ──
  const webview = useMemo(() => detectWebView(), [])

  // Detect if user arrived from queue match
  const fromQueue = location.state?.fromQueue === true

  // Phase state machine — skip waiting if from queue
  const [phase, setPhase] = useState(fromQueue ? "joining" : "verifying")
  const [initMicOn, setInitMicOn] = useState(false)
  const [initCamOn, setInitCamOn] = useState(false)

  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [pendingJoinArgs, setPendingJoinArgs] = useState(null)

  // Password verification state
  const [passwordError, setPasswordError] = useState("")
  const [verifyJoinRoom, { isLoading: isVerifying }] =
    useVerifyJoinRoomMutation()

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

  // --- LiveKit token mutation ---
  const [getLivekitToken] = useGetLivekitTokenMutation()

  // Room full check
  const currentParticipantCount = room?.currentParticipantCount ?? 0
  const maxParticipants = room?.maxParticipants ?? null
  const isRoomFull =
    maxParticipants !== null && currentParticipantCount >= maxParticipants

  // --- Cleanup media preview tracks when transitioning to in-call ---
  const cleanupMediaPreview = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
  }, [localStream])

  // ── Privacy verification: run once when room data is available ──
  const verifyTriggered = useRef(false)
  useEffect(() => {
    if (
      verifyTriggered.current ||
      !room ||
      !user ||
      isLoadingRoom ||
      isLoadingUser ||
      fromQueue // Queue-matched users skip password check
    ) {
      return
    }

    // Public rooms or rooms without a password — skip verification
    if (room.privacy !== "Private" || !room.hasPassword) {
      verifyTriggered.current = true
      setPhase("waiting")
      return
    }

    // Private room — silent check for existing grant
    verifyTriggered.current = true
    ;(async () => {
      try {
        const result = await verifyJoinRoom({ roomId: Number(roomId) }).unwrap()
        if (result.authorized) {
          setPhase("waiting")
        }
      } catch {
        // 403 = no grant yet → show password screen
        setPhase("password-required")
      }
    })()
  }, [room, user, isLoadingRoom, isLoadingUser, fromQueue, roomId])

  // ── Handle password submission from PasswordScreen ──
  const handlePasswordSubmit = async (password) => {
    setPasswordError("")
    try {
      const result = await verifyJoinRoom({
        roomId: Number(roomId),
        password,
      }).unwrap()

      if (result.authorized) {
        setPhase("waiting")
      }
    } catch (err) {
      const status = err?.status
      const message = err?.data?.message || err?.data

      if (status === 403) {
        // If the backend says unauthorized, it means the password was incorrect.
        setPasswordError(t.rooms.passwordScreen.incorrectPassword)
      } else if (status === 404) {
        setPasswordError(t.rooms.passwordScreen.roomNotFound)
      } else {
        setPasswordError(t.rooms.passwordScreen.genericError)
      }
    }
  }

  const handleConfirmSwitch = () => {
    setShowSwitchModal(false)
    handleJoinClick({ ...pendingJoinArgs, confirmedSwitch: true })
  }

  const handleCancelSwitch = () => {
    setShowSwitchModal(false)
    if (pendingJoinArgs?.isAutoJoin && callInfo?.callPath) {
      navigate(callInfo.callPath)
    }
    setPendingJoinArgs(null)
  }

  // --- Handle "Join Now" click ---
  const handleJoinClick = async ({
    skipRoomFullCheck = false,
    confirmedSwitch = false,
    isAutoJoin = false,
  } = {}) => {
    // If we are already in a different call, show switch modal
    if (isInCall && !confirmedSwitch) {
      setShowSwitchModal(true)
      setPendingJoinArgs({ skipRoomFullCheck, isAutoJoin })
      return
    }

    // If switching from another call, cleanly leave it first
    if (isInCall && confirmedSwitch) {
      dispatch(leaveCall())
    }

    // Room full check (moved from deleted useJoinVideoSession hook)
    if (isRoomFull && !skipRoomFullCheck) {
      toast.error(t.rooms.waitingScreen.roomFull)
      return
    }

    setPhase("joining")

    try {
      // Fetch LiveKit token to validate connectivity and join
      const livekitTokenBody = {
        roomId: Number(roomId),
        participantName: user.username,
      }
      const tokenRes = await getLivekitToken(livekitTokenBody).unwrap()

      const token = tokenRes?.participantToken
      const serverUrl = tokenRes?.serverUrl
      const sessionId = tokenRes?.sessionId
      if (!token || typeof token !== "string") {
        throw new Error("Invalid LiveKit token received from backend")
      }

      // Stop preview tracks before entering the call
      cleanupMediaPreview()

      setInitMicOn(micOn)
      setInitCamOn(cameraOn)

      // Set phase to in-call
      setPhase("in-call")

      // Build the call path for PiP return navigation
      const callPath = `/${lang || language}/meet/${roomId}`

      // Dispatch to global provider — this triggers LiveKitRoom rendering
      dispatch(
        enterCall({
          livekitToken: token,
          livekitServerUrl: serverUrl,
          roomId,
          sessionId,
          callPath,
          roomData: room,
          user,
          initMicOn: micOn,
          initCamOn: cameraOn,
        }),
      )
    } catch (err) {
      console.error("[VideoCall] LiveKit token fetch failed:", err)
      toast.error(
        t.rooms.videoCall.provider.tokenError ??
          "Failed to connect to video service. Please try again.",
      )
      setPhase("waiting")
    }
  }

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
      handleJoinClick({ skipRoomFullCheck: true, isAutoJoin: true })
    }
  }, [fromQueue, user, room, isLoadingUser, isLoadingRoom])

  // ========================================
  //  RENDER: Guards & phase-based rendering
  // ========================================

  const switchModal = (
    <SwitchCallModal
      open={showSwitchModal}
      onCancel={handleCancelSwitch}
      onConfirm={handleConfirmSwitch}
    />
  )

  // WebView block — must come first
  if (webview.isWebView) {
    return <WebViewBlockScreen appName={webview.appName} />
  }

  // Loading room data
  if (isLoadingUser || isLoadingRoom || isRoomQuerySkipped) {
    return <div className="h-screen w-full bg-white"></div>
  }

  // Room not found
  if (roomError || !room) {
    return <RoomNotFoundScreen />
  }

  // ---- PHASE: VERIFYING (silent check for private room grant) ----
  if (phase === "verifying") {
    return <div className="h-screen w-full bg-gray-50"></div>
  }

  // ---- PHASE: PASSWORD REQUIRED ----
  if (phase === "password-required") {
    return (
      <PasswordScreen
        room={room}
        error={passwordError}
        isLoading={isVerifying}
        onSubmit={handlePasswordSubmit}
      />
    )
  }

  // ---- PHASE: WAITING ----
  if (phase === "waiting") {
    const displaySession = {
      name: room.name,
      roomName: room.name,
      topic: room.topic,
      requiredLevel: room.requiredLevel,
      participants: [],
    }

    return (
      <>
        {switchModal}
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
      </>
    )
  }

  // ---- PHASE: JOINING ----
  if (phase === "joining") {
    return (
      <>
        {switchModal}
        <VideoCallLoading
          message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
        />
      </>
    )
  }

  // ---- PHASE: IN-CALL ----
  // The global provider is now rendering LiveKitRoom.
  // Just render children — they get context from GlobalCallContent.
  return <>{children}</>
}
