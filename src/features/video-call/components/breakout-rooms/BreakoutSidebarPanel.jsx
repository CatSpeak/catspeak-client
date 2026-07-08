import React, { useState, useEffect } from "react"
import { LogOut, Clock, Loader2, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import {
  useGetBreakoutStatusQuery,
  useJoinBreakoutRoomMutation,
} from "@/store/api/roomsApi"
import { exitBreakout, updateLivekitToken } from "@/store/slices/videoCallSlice"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"

import BreakoutSetupView from "./setup/BreakoutSetupView"
import BreakoutActiveView from "./active/BreakoutActiveView"
import BreakoutStudentView from "./student/BreakoutStudentView"

const BreakoutSidebarPanel = ({ sessionId, onClose }) => {
  const dispatch = useDispatch()

  const { isBreakoutActive, callInfo } = useSelector((s) => s.videoCall)
  const { participants: liveParticipants } = useVideoCallContext()

  const currentSubSessionId = callInfo?.sessionId
  const roomCreatorId = callInfo?.roomData?.creatorId
  const currentUserId = callInfo?.user?.accountId
  const isHost = Boolean(
    currentUserId &&
    roomCreatorId &&
    String(currentUserId) === String(roomCreatorId),
  )

  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useGetBreakoutStatusQuery(sessionId, {
    skip: !sessionId,
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (sessionId) {
      refetchStatus()
    }
  }, [sessionId, refetchStatus])

  const [joinBreakoutRoom] = useJoinBreakoutRoomMutation()

  useEffect(() => {
    if (statusError) {
      console.error("Lỗi tải dữ liệu phòng họp nhóm:", statusError)
    }
  }, [statusError])

  // Host Return to Main Room
  const handleHostLeave = async () => {
    try {
      const res = await joinBreakoutRoom({
        sessionId,
        subSessionId: sessionId,
      }).unwrap()
      dispatch(exitBreakout())
      dispatch(updateLivekitToken(res.token))
      toast.success("Đã quay trở lại phòng chính.")
    } catch (err) {
      console.error(err)
      toast.error("Lỗi quay trở lại phòng chính.")
    }
  }

  // Parse LiveKit metadata helper
  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const allLiveStudents = liveParticipants.map((p) => {
    const meta = parseMetadata(p.metadata)
    return {
      accountId:
        meta.accountId ||
        (p.isLocal ? Number(callInfo?.user?.accountId) : null),
      username: p.name || meta.name || p.identity,
      identity: p.identity,
      avatarUrl: meta.avatarUrl,
      participant: p,
    }
  })

  const students = allLiveStudents.filter(
    (s) => s.accountId && String(s.accountId) !== String(roomCreatorId),
  )

  // Timer logic
  const [countdownSeconds, setCountdownSeconds] = useState(null)

  useEffect(() => {
    if (
      status?.isBreakoutActive &&
      status?.remainingSeconds !== null &&
      status?.remainingSeconds !== undefined
    ) {
      setCountdownSeconds(status.remainingSeconds)
    } else {
      setCountdownSeconds(null)
    }
  }, [status?.isBreakoutActive, status?.remainingSeconds])

  const isTimerRunning = countdownSeconds !== null && countdownSeconds > 0

  useEffect(() => {
    if (!isTimerRunning) return
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimerRunning])

  const formatTimer = (seconds) => {
    if (seconds === null || seconds < 0) return ""
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const isStarted = status?.isBreakoutActive

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Sidebar Panel Header */}
      <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] bg-white">
        <div className="flex items-center gap-2">
          <h3 className="text-black text-sm font-semibold m-0">
            {isStarted ? "Phòng thảo luận" : "Phòng họp nhóm"}
          </h3>
          {isStarted && countdownSeconds !== null && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              <Clock className="h-3 w-3 text-slate-500" />
              {formatTimer(countdownSeconds)}
            </div>
          )}
        </div>
      </div>

      {/* View router */}
      {isLoadingStatus ? (
        <div className="flex h-full flex-col items-center justify-center p-6 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-primary2 mb-2" />
          <p className="text-xs font-semibold">
            Đang tải cấu hình chia phòng...
          </p>
        </div>
      ) : isHost ? (
        isStarted ? (
          <BreakoutActiveView
            sessionId={sessionId}
            status={status}
            refetchStatus={refetchStatus}
            isHost={isHost}
            currentSubSessionId={currentSubSessionId}
            roomCreatorId={roomCreatorId}
            allLiveStudents={allLiveStudents}
          />
        ) : (
          <BreakoutSetupView
            sessionId={sessionId}
            students={students}
            status={status}
            refetchStatus={refetchStatus}
          />
        )
      ) : (
        <BreakoutStudentView
          sessionId={sessionId}
          status={status}
          isBreakoutActive={isBreakoutActive}
          currentSubSessionId={currentSubSessionId}
          callInfo={callInfo}
          refetchStatus={refetchStatus}
          allLiveStudents={allLiveStudents}
        />
      )}
    </div>
  )
}

export default BreakoutSidebarPanel
