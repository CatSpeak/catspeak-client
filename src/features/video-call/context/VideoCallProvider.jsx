import React, { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-hot-toast"
import { useGetProfileQuery } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useGetLivekitTokenMutation } from "@/store/api/livekitApi"
import {
  useGetRoomByIdQuery,
  WaitingScreen,
  useMediaPreview,
  useDeviceSelection,
} from "@/features/rooms"
import { useVerifyJoinRoomMutation } from "@/store/api/roomsApi"
import {
  useGetClassDetailQuery,
  useGetStudentClassDetailQuery,
  useJoinClassRoomMutation,
  useJoinStudentClassRoomMutation
} from "@/store/api/coursesApi"
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

  // AI sessions are flagged via navigation state (set in RoomsPage).
  const isAISession = location.state?.isAISession === true

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
  const { data: userData, isLoading: isLoadingUser } = useGetUserProfileQuery()
  const user = userData?.data ?? null

  const isClassRoom = roomId && roomId.startsWith("class-")
  const classId = isClassRoom ? roomId.replace("class-", "") : null

  const isTeacher = user ? !!user.isTeacher : false

  // --- Class room detail ---
  const {
    data: teacherClassResponse,
    isLoading: isLoadingTeacherClass,
    error: teacherClassError,
  } = useGetClassDetailQuery(classId, {
    skip: !isClassRoom || !user || !isTeacher,
  })

  const {
    data: studentClassResponse,
    isLoading: isLoadingStudentClass,
    error: studentClassError,
  } = useGetStudentClassDetailQuery(classId, {
    skip: !isClassRoom || !user || isTeacher,
  })

  const classResponse = isTeacher ? teacherClassResponse : studentClassResponse
  const isLoadingClass = isTeacher ? isLoadingTeacherClass : isLoadingStudentClass
  const classError = isTeacher ? teacherClassError : studentClassError
  const classData = classResponse?.data || classResponse

  // --- Room data (fetched by roomId from URL) ---
  const isRoomQuerySkipped = !roomId || !user || isClassRoom
  const {
    data: rawRoom,
    isLoading: isLoadingRoom,
    error: roomError,
  } = useGetRoomByIdQuery(roomId, {
    skip: isRoomQuerySkipped,
  })

  // Map class details to the room structure expected by video call features
  const room = useMemo(() => {
    if (isClassRoom) {
      if (!classData) return null
      return {
        id: roomId,
        name: classData.name || classData.title || "Untitled Class",
        topic: classData.courseName || classData.courseTitle || "Classroom Session",
        privacy: "Public",
        hasPassword: false,
        maxParticipants: classData.slots || 10,
        currentParticipantCount: classData.studentCount || 0,
        isClassRoom: true,
        classId: classId,
      }
    }
    return rawRoom?.data || rawRoom
  }, [isClassRoom, classData, rawRoom, roomId, classId])

  const isLoadingRoomData = isClassRoom ? isLoadingClass : isLoadingRoom
  const errorRoomData = isClassRoom ? classError : roomError

  // --- Device Selection ---
  const deviceSelection = useDeviceSelection()

  // --- Media Preview (for waiting screen) ---
  const {
    micOn,
    cameraOn,
    localStream,
    toggleMic: hookToggleMic,
    toggleCamera: hookToggleCamera,
  } = useMediaPreview({
    audioDeviceId: deviceSelection.selectedMic,
    videoDeviceId: deviceSelection.selectedCamera,
  })

  const toggleMic = async () => {
    await hookToggleMic()
  }

  const toggleCamera = async () => {
    await hookToggleCamera()
  }

  // --- LiveKit token mutation ---
  const [getLivekitToken] = useGetLivekitTokenMutation()
  const [joinClassRoom] = useJoinClassRoomMutation()
  const [joinStudentClassRoom] = useJoinStudentClassRoomMutation()

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
      isLoadingRoomData ||
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
      ; (async () => {
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
  }, [room, user, isLoadingRoomData, isLoadingUser, fromQueue, roomId])

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
      let token, serverUrl, sessionId

      if (isClassRoom) {
        // Fetch LiveKit token using the appropriate endpoint based on user role
        const tokenRes = isTeacher
          ? await joinClassRoom(classId).unwrap()
          : await joinStudentClassRoom(classId).unwrap()
        token = tokenRes?.token
        serverUrl = tokenRes?.serverUrl
        sessionId = tokenRes?.sessionId
      } else {
        // Fetch LiveKit token to validate connectivity and join
        const livekitTokenBody = {
          roomId: Number(roomId),
        }
        const tokenRes = await getLivekitToken(livekitTokenBody).unwrap()
        token = tokenRes?.participantToken
        serverUrl = tokenRes?.serverUrl
        sessionId = tokenRes?.sessionId
      }

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
          isAISession,
        }),
      )
    } catch (err) {
      console.error("[VideoCall] LiveKit token fetch failed:", err)
      let errorMsg = t.rooms?.videoCall?.provider?.tokenError || "Failed to connect to video service. Please try again."

      if (isClassRoom && err?.status) {
        const status = err.status
        const errorBody = err.data?.message || err.data

        if (status === 404 || errorBody === "CLASS_NOT_FOUND") {
          errorMsg = language === "vi"
            ? "Lớp học không tồn tại hoặc đã kết thúc."
            : "Class not found or has finished."
        } else if (status === 403) {
          if (errorBody === "NO_ACTIVE_SESSION") {
            errorMsg = language === "vi"
              ? "Không có buổi học nào đang diễn ra. Bạn chỉ có thể vào lớp từ 5 phút trước giờ học cho đến khi buổi học kết thúc."
              : "No active session. You can only join from 5 minutes before start time until the end of the session."
          } else {
            errorMsg = language === "vi"
              ? "Không phải lớp học của bạn."
              : "Access denied. This is not your class."
          }
        } else if (status === 400 || errorBody === "ROOM_NOT_CREATED") {
          errorMsg = language === "vi"
            ? "Lớp học ảo chưa được tạo. Vui lòng liên hệ hỗ trợ."
            : "Virtual classroom was not created. Please contact support."
        }
      }

      toast.error(errorMsg, { duration: 5000 })
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
  if (isLoadingUser || isLoadingRoomData || (!isClassRoom && isRoomQuerySkipped)) {
    return <div className="h-screen w-full bg-white"></div>
  }

  // Room not found
  if (errorRoomData || !room) {
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
          deviceSelection={deviceSelection}
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
