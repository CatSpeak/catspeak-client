import React, { useEffect, useRef, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { MeetingProvider } from "@videosdk.live/react-sdk"
import { useGetProfileQuery } from "@/features/auth"
import {
  useGetVideoSessionByIdQuery,
  useGetVideoSdkTokenMutation,
} from "@/store/api/videoSessionsApi"
import {
  useGetRoomByIdQuery,
  WaitingScreen,
  useMediaPreview,
  useJoinVideoSession,
} from "@/features/rooms"
import { meetingConfig } from "@/shared/utils/videoSdkConfig"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VideoCallContent } from "./VideoCallContext"
import VideoCallLoading from "../components/VideoCallLoading"
import RoomNotFoundScreen from "../components/RoomNotFoundScreen"
import SessionErrorScreen from "../components/SessionErrorScreen"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"

/**
 * Phases:
 *  - "waiting"  : Room loaded, showing WaitingScreen with media preview
 *  - "joining"  : User clicked "Join Now", creating/joining video session
 *  - "in-call"  : Session joined, SDK token acquired, MeetingProvider rendered
 */
export const VideoCallProvider = ({ children }) => {
  const { id: roomId } = useParams()
  const { t } = useLanguage()

  // Phase state machine
  const [phase, setPhase] = useState("waiting") // "waiting" | "joining" | "in-call"
  const [joinedSessionId, setJoinedSessionId] = useState(null)
  const [sdkToken, setSdkToken] = useState(null)
  const [initMicOn, setInitMicOn] = useState(false)
  const [initCamOn, setInitCamOn] = useState(false)
  const hasInitRef = useRef(false)

  // --- User data ---
  const { data: userData } = useGetProfileQuery()
  const user = userData?.data ?? null

  // --- Room data (fetched by roomId from URL) ---
  const {
    data: room,
    isLoading: isLoadingRoom,
    error: roomError,
  } = useGetRoomByIdQuery(roomId, {
    skip: !roomId || !user,
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

  // --- SDK token (fetched after session data is available) ---
  const [getVideoSdkToken] = useGetVideoSdkTokenMutation()

  useEffect(() => {
    if (phase !== "in-call" || !session || !user || hasInitRef.current) return

    const initMeeting = async () => {
      try {
        hasInitRef.current = true
        const res = await getVideoSdkToken({
          meetingId: session.videoSdkMeetingId,
          name: user.username,
        }).unwrap()

        const token = res?.token
        if (typeof token !== "string" || token.trim().split(".").length !== 3) {
          throw new Error("Invalid VideoSDK token received from backend")
        }

        setSdkToken(token)
      } catch (err) {
        console.error("[VideoCall] Meeting init failed:", err)
        hasInitRef.current = false
      }
    }

    initMeeting()
  }, [phase, session, user, getVideoSdkToken])

  // --- Cleanup media preview tracks when transitioning to in-call ---
  const cleanupMediaPreview = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
  }, [localStream])

  // --- Handle "Join Now" click ---
  const handleJoinClick = async () => {
    setPhase("joining")

    const result = await hookJoin({ isRoomFull, micOn, cameraOn })

    if (result) {
      // Stop preview tracks before entering the call
      cleanupMediaPreview()

      setInitMicOn(result.micOn)
      setInitCamOn(result.cameraOn)
      setJoinedSessionId(result.sessionId)
      setPhase("in-call")
    } else {
      // Join failed, go back to waiting
      setPhase("waiting")
    }
  }

  // ========================================
  //  RENDER: Guards & phase-based rendering
  // ========================================

  // Loading room data
  if (isLoadingRoom || isLoadingSessions) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-500">
        <LoadingSpinner text={t.rooms.waitingScreen.loading} />
      </div>
    )
  }

  // Room not found
  if (roomError || (!isLoadingRoom && !room)) {
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
  // Wait for session data
  if (isLoadingSession || !session) {
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    )
  }

  // Session error
  if (sessionError) {
    console.error("Failed to load session:", sessionError)
    return <SessionErrorScreen error={sessionError} />
  }

  // Wait for SDK token
  if (!sdkToken || !userData) {
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    )
  }

  return (
    <MeetingProvider
      config={{
        ...meetingConfig,
        meetingId: session.videoSdkMeetingId,
        micEnabled: initMicOn,
        webcamEnabled: initCamOn,
        name: user?.username || "Guest",
        metaData: {
          accountId: user?.accountId,
          username: user?.username,
        },
      }}
      token={sdkToken}
      joinWithoutUserInteraction={false}
    >
      <VideoCallContent
        user={user}
        session={session}
        sessionError={sessionError}
        sdkToken={sdkToken}
        room={room}
      >
        {children}
      </VideoCallContent>
    </MeetingProvider>
  )
}
