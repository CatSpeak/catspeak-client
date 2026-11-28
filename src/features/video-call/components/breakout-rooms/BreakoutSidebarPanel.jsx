import React, { useEffect } from "react"
import { Loader2, X } from "lucide-react"
import { useSelector } from "react-redux"
import { useGetBreakoutStatusQuery } from "@/store/api/roomsApi"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isBreakoutSupported } from "@/features/video-call/utils/roomTypeHelpers"
import { useLanguage } from "@/shared/context/LanguageContext"

import BreakoutSetupView from "./setup/BreakoutSetupView"
import BreakoutActiveView from "./active/BreakoutActiveView"
import BreakoutStudentView from "./student/BreakoutStudentView"

const BreakoutSidebarPanel = ({ sessionId, onClose }) => {
  const { t } = useLanguage()

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
  }, [sessionId, liveParticipants.length, refetchStatus])

  useEffect(() => {
    if (statusError) {
      console.error("Lỗi tải dữ liệu phòng họp nhóm:", statusError)
    }
  }, [statusError])

  // Host Return to Main Room
  // (removed unused local handler; the active view owns the return action)

  // Parse LiveKit metadata helper
  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const allLiveStudents = React.useMemo(() => {
    return liveParticipants.map((p) => {
      const meta = parseMetadata(p.metadata)
      const parsedId = Number(p.identity)
      const accountId =
        meta.accountId ||
        (!isNaN(parsedId) && parsedId > 0 ? parsedId : null) ||
        (p.isLocal ? Number(callInfo?.user?.accountId) : null)

      return {
        accountId,
        username: p.name || meta.name || meta.username || p.identity,
        identity: p.identity,
        avatarUrl: meta.avatarImageUrl || meta.avatarUrl,
        participant: p,
      }
    })
  }, [liveParticipants, callInfo?.user?.accountId])

  const students = React.useMemo(() => {
    return allLiveStudents.filter(
      (s) => s.accountId && String(s.accountId) !== String(roomCreatorId),
    )
  }, [allLiveStudents, roomCreatorId])

  const isStarted = status?.isBreakoutActive

  if (!isBreakoutSupported(callInfo?.roomData?.roomType)) {
    return null
  }

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white">
      {/* Sidebar Panel Header */}
      <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A]">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-black dark:text-white text-base font-semibold m-0 truncate">
            {isStarted
              ? t?.rooms?.breakoutRooms?.panelTitleActive || "Phòng thảo luận"
              : t?.rooms?.breakoutRooms?.panelTitleSetup || "Phòng họp nhóm"}
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title={t?.common?.close || "Đóng"}
            aria-label={t?.common?.close || "Đóng"}
            className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 dark:text-[#AAAAAA] hover:bg-neutral-200 dark:hover:bg-[#3D3D3D]"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* View router */}
      {isLoadingStatus ? (
        <div className="flex h-full flex-col items-center justify-center p-6 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-primary2 mb-2" />
          <p className="text-xs font-semibold">
            {t?.rooms?.breakoutRooms?.loadingConfig ||
              "Đang tải cấu hình chia phòng..."}
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
            roomCreatorId={roomCreatorId}
            allLiveStudents={allLiveStudents}
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
