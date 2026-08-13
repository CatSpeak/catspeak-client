import React, { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useParams, useLocation, useNavigate, Navigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-hot-toast"
import { useAuth } from "@/features/auth"
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
  useJoinStudentClassRoomMutation,
} from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  enterCall,
  setPiP,
  leaveCall,
  enterBreakout,
} from "@/store/slices/videoCallSlice"
import { unlockAudioContext } from "@/shared/utils/audioUnlockUtils"
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal"
import {
  pingActiveCall,
  requestLeaveActiveCall,
} from "@/features/video-call/services/callBroadcastChannel"
import VideoCallLoading from "../components/VideoCallLoading"
import RoomNotFoundScreen from "../components/RoomNotFoundScreen"
import PasswordScreen from "../components/PasswordScreen"
import CallEndedScreen from "../components/CallEndedScreen"
import VideoCallErrorBoundary from "@/shared/components/VideoCallErrorBoundary"

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
    <VideoCallErrorBoundary>
      <VideoCallProviderInner roomId={roomId} lang={lang}>
        {children}
      </VideoCallProviderInner>
    </VideoCallErrorBoundary>
  )
}

// ─── Inner provider (only rendered for new calls, not returns) ──────────
const VideoCallProviderInner = ({ children, roomId, lang }) => {
  // 🧪 TEST LINE: Throw an error to trigger the error boundary
  // throw new Error("Simulated Video Call crash for testing ErrorBoundary!")

  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t, language } = useLanguage()

  const { isInCall, callInfo } = useSelector((s) => s.videoCall)

  // Detect if user arrived from queue match
  const fromQueue = location.state?.fromQueue === true

  // AI sessions are flagged via navigation state (set in RoomsPage).
  const isAISession = location.state?.isAISession === true

  // Phase state machine — skip waiting if from queue, or go to ended if returned from call
  const [phase, setPhase] = useState(
    location.state?.callEnded ? "ended" : fromQueue ? "joining" : "verifying",
  )

  // Sync phase if location.state updates after initial mount (e.g., when ending a call)
  // Sync phase if location.state updates after initial mount (e.g., when ending a call)
  useEffect(() => {
    if (location.state?.callEnded) {
      setPhase("ended")
    } else if (phase === "ended") {
      verifyTriggered.current = false
      setPhase(fromQueue ? "joining" : "verifying")
    }
  }, [location.state?.callEnded, phase, fromQueue])

  const [initMicOn, setInitMicOn] = useState(false)
  const [initCamOn, setInitCamOn] = useState(false)

  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [pendingJoinArgs, setPendingJoinArgs] = useState(null)

  // Password verification state
  const [passwordError, setPasswordError] = useState("")
  const [verifyJoinRoom, { isLoading: isVerifying }] =
    useVerifyJoinRoomMutation()

  const { isAuthenticated } = useAuth()

  // --- User data ---
  const { data: userData, isLoading: isLoadingUser } = useGetUserProfileQuery(
    undefined,
    { skip: !isAuthenticated },
  )
  const user = userData?.data ?? userData ?? null

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
  const isLoadingClass = isTeacher
    ? isLoadingTeacherClass
    : isLoadingStudentClass
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
        topic:
          classData.courseName || classData.courseTitle || "Classroom Session",
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
    lkVideoTrack,
    toggleMic: hookToggleMic,
    toggleCamera: hookToggleCamera,
    stopAllPreviewTracks,
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
    if (stopAllPreviewTracks) {
      stopAllPreviewTracks()
    } else if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
  }, [stopAllPreviewTracks, localStream])

  // ── Privacy verification: run once when room data is available ──
  const verifyTriggered = useRef(false)
  useEffect(() => {
    if (
      phase !== "verifying" ||
      verifyTriggered.current ||
      !room ||
      !user ||
      isLoadingRoomData ||
      isLoadingUser ||
      fromQueue // Queue-matched users skip password check
    ) {
      return
    }

    // Rooms without a password — skip verification
    if (!room.hasPassword) {
      verifyTriggered.current = true
      setPhase("waiting")
      return
    }

    // Private room — check for URL pwd param or existing grant
    verifyTriggered.current = true
    ;(async () => {
      try {
        const searchParams = new URLSearchParams(location.search)
        const pwdParam = searchParams.get("pwd")
        const payload = {
          roomId: Number(roomId),
          ...(pwdParam ? { password: pwdParam } : {}),
        }
        const result = await verifyJoinRoom(payload).unwrap()
        if (result.authorized) {
          setPhase("waiting")
        }
      } catch {
        // 403 = no grant yet → show password screen
        setPhase("password-required")
      }
    })()
  }, [room, user, isLoadingRoomData, isLoadingUser, fromQueue, roomId, location.search])

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
    // Synchronously unlock WebAudio AudioContext on user gesture for iOS Safari
    unlockAudioContext()

    // If we are already in a call (local or in another tab), show switch modal
    if (!confirmedSwitch) {
      const activeRemoteCall = await pingActiveCall()
      if (isInCall || activeRemoteCall) {
        setShowSwitchModal(true)
        setPendingJoinArgs({ skipRoomFullCheck, isAutoJoin })
        return
      }
    }

    // If switching from another call, cleanly leave it first (both locally and remote tabs)
    if (confirmedSwitch) {
      requestLeaveActiveCall()
      if (isInCall) {
        dispatch(leaveCall())
      }
    }

    // Room full check (moved from deleted useJoinVideoSession hook)
    if (isRoomFull && !skipRoomFullCheck) {
      toast.error(t.rooms.waitingScreen.roomFull)
      return
    }

    setPhase("joining")

    try {
      let token, serverUrl, sessionId, activeSubSessionId, activeSubSessionName

      if (isClassRoom) {
        // Fetch LiveKit token using the appropriate endpoint based on user role
        const tokenRes = isTeacher
          ? await joinClassRoom(classId).unwrap()
          : await joinStudentClassRoom(classId).unwrap()
        token = tokenRes?.token
        serverUrl = tokenRes?.serverUrl
        sessionId = tokenRes?.sessionId
        activeSubSessionId = tokenRes?.activeSubSessionId
        activeSubSessionName = tokenRes?.activeSubSessionName
      } else {
        // Fetch LiveKit token to validate connectivity and join
        const livekitTokenBody = {
          roomId: Number(roomId),
        }
        const tokenRes = await getLivekitToken(livekitTokenBody).unwrap()
        token = tokenRes?.participantToken
        serverUrl = tokenRes?.serverUrl
        sessionId = tokenRes?.sessionId
        activeSubSessionId = tokenRes?.activeSubSessionId
        activeSubSessionName = tokenRes?.activeSubSessionName
      }

      if (!token || typeof token !== "string") {
        throw new Error("Invalid LiveKit token received from backend")
      }

      console.log("[VideoCallProvider] LiveKit token fetched successfully:", {
        serverUrl,
        sessionId,
        tokenLength: token?.length,
        micOn,
        cameraOn,
      })

      // Stop preview tracks before entering the call & give iOS hardware 300ms to release
      cleanupMediaPreview()
      await new Promise((resolve) => setTimeout(resolve, 300))

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

      // Auto-restore breakout state if user was in a sub-room before refresh/reconnect
      if (activeSubSessionId) {
        dispatch(
          enterBreakout({
            subSessionId: activeSubSessionId,
            roomName: activeSubSessionName || "Phòng thảo luận",
            token,
          }),
        )
      }
    } catch (err) {
      console.error("[VideoCall] LiveKit token fetch failed:", err)
      const backendMessage = err?.data?.message || err?.data
      const isBanned =
        err?.status === 403 &&
        (typeof backendMessage === "string" &&
          (backendMessage.includes("cấm") ||
           backendMessage.includes("banned") ||
           backendMessage.includes("禁止")))

      let errorMsg = ""
      if (isBanned || (err?.status === 403 && !isClassRoom)) {
        errorMsg =
          t.rooms?.videoCall?.participantList?.bannedFromRoom ||
          (language === "en"
            ? "Your account has been banned from joining this room by the Host."
            : language === "zh"
            ? "您的账号已被 Host 禁止加入此房间。"
            : "Tài khoản của bạn đã bị cấm truy cập vào phòng này bởi Host.")
      } else if (isClassRoom && err?.status) {
        const status = err.status
        const errorBody = err.data?.message || err.data

        if (status === 404 || errorBody === "CLASS_NOT_FOUND") {
          errorMsg =
            language === "vi"
              ? "Lớp học không tồn tại hoặc đã kết thúc."
              : "Class not found or has finished."
        } else if (status === 403) {
          if (errorBody === "NO_ACTIVE_SESSION") {
            errorMsg =
              language === "vi"
                ? "Không có buổi học nào đang diễn ra. Bạn chỉ có thể vào lớp từ 5 phút trước giờ học cho đến khi buổi học kết thúc."
                : "No active session. You can only join from 5 minutes before start time until the end of the session."
          } else {
            errorMsg =
              language === "vi"
                ? "Không phải lớp học của bạn."
                : "Access denied. This is not your class."
          }
        } else if (status === 400 || errorBody === "ROOM_NOT_CREATED") {
          errorMsg =
            language === "vi"
              ? "Chưa đến giờ lớp học bắt đầu"
              : "It's not time for class yet."
        }
      } else if (typeof backendMessage === "string" && backendMessage.trim()) {
        errorMsg = backendMessage
      } else {
        errorMsg =
          t.rooms?.videoCall?.provider?.tokenError ||
          "Failed to connect to video service. Please try again."
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

  // Loading user data
  if (isLoadingUser) {
    return <VideoCallLoading message={t?.rooms?.waitingScreen?.loadingRoom || "Loading room..."} />
  }

  // User not authenticated
  if (!user) {
    return (
      <Navigate
        to="/"
        state={{
          requireLogin: true,
          redirectTo: location.pathname + location.search + location.hash,
        }}
        replace
      />
    )
  }

  // Loading room data
  if (
    isLoadingUser ||
    isLoadingRoomData ||
    (!isClassRoom && isRoomQuerySkipped)
  ) {
    return <VideoCallLoading message={t?.rooms?.waitingScreen?.loadingRoom || "Loading room..."} />
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
          lkVideoTrack={lkVideoTrack}
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

  // ---- PHASE: ENDED ----
  if (phase === "ended") {
    return (
      <>
        {switchModal}
        <CallEndedScreen />
      </>
    )
  }

  // ---- PHASE: IN-CALL ----
  // The global provider is now rendering LiveKitRoom.
  // Just render children — they get context from GlobalCallContent.
  return <>{children}</>
}
