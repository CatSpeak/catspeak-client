import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  RotateCcw,
  Compass,
} from "lucide-react"
import { toast } from "@/shared/utils/toastBridge"
import {
  useGetCalendarQuery,
  useLaunchSessionMutation,
  useChangeLevelMutation,
} from "../api/learningPathApi"

import CycleProgressBar from "../components/CycleProgressBar"
import FiveCardCalendar from "../components/FiveCardCalendar"
import SessionPreviewModal from "../components/SessionPreviewModal"
import QuotaLockedModal from "../components/QuotaLockedModal"
import CycleSummaryModal from "../components/CycleSummaryModal"
import LevelChangedModal from "../components/LevelChangedModal"
import ComingSoonPage from "./ComingSoonPage"

const CalendarLoadingSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 flex flex-col gap-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="w-full h-36 rounded-2xl bg-gray-200 dark:bg-gray-800" />

    {/* Section title skeleton */}
    <div className="flex items-center justify-between">
      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-md" />
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-md" />
    </div>

    {/* 5 Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 p-5 flex flex-col justify-between"
        >
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded-md" />
            <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-md" />
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md" />
          </div>
          <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
        </div>
      ))}
    </div>
  </div>
)

const LearningPathCalendarPage = () => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const currentLang = lang || "zh"

  // Modals state
  const [selectedCardForPreview, setSelectedCardForPreview] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isQuotaLockedOpen, setIsQuotaLockedOpen] = useState(false)
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)
  const [hasDismissedSummary, setHasDismissedSummary] = useState(false)

  // API hooks
  const {
    data: calendarData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCalendarQuery(undefined, {
    pollingInterval: 120000,
  })

  const isSummaryModalOpen = Boolean(
    calendarData?.summaryModal && !hasDismissedSummary,
  )

  const handleCloseSummary = () => {
    setHasDismissedSummary(true)
  }

  const [launchSession, { isLoading: isLaunching }] = useLaunchSessionMutation()
  const [changeLevel, { isLoading: isChangingLevel }] = useChangeLevelMutation()

  // If level is ComingSoon (HSK 4-6) or status is ComingSoon (2)
  const isComingSoon =
    calendarData?.status === "ComingSoon" ||
    calendarData?.status === 2 ||
    error?.data?.errorCode === "E_LP_001"

  // Level change handler
  const handleConfirmLevelChange = async (newLevel) => {
    try {
      await changeLevel({ newLevel }).unwrap()
      toast.success(`Đã chuyển sang trình độ ${newLevel}!`)
      setIsLevelModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(
        err?.data?.message || "Không thể đổi trình độ. Vui lòng thử lại sau.",
      )
    }
  }

  // Card click / selection
  const handleSelectCard = (card) => {
    if (card.status === "QuotaLocked" || card.isQuotaLocked) {
      setIsQuotaLockedOpen(true)
      return
    }

    setSelectedCardForPreview(card.cardId)
    setIsPreviewOpen(true)
  }

  // Session Launch Execution
  const handleLaunchSessionExecution = async (cardId) => {
    try {
      const result = await launchSession(cardId).unwrap()
      setIsPreviewOpen(false)

      if (result.roomId || result.roomName) {
        toast.success("Đang kết nối vào phòng luyện nói...")
        const targetRoomId = result.roomId || result.roomName
        const queryParams = new URLSearchParams({
          token: result.token || "",
          sessionId: result.sessionId || "",
          cardId: String(result.cardId || cardId),
          topicId: String(result.topicId || ""),
          isLearningPath: "true",
        }).toString()

        navigate(`/${currentLang}/meet/${targetRoomId}?${queryParams}`, {
          state: {
            fromQueue: true,
            isAISession: true,
            isLearningPath: true,
            cardId: result.cardId || cardId,
            topicId: result.topicId,
            sessionId: result.sessionId,
            livekitToken: result.token,
            livekitServerUrl: result.liveKitUrl,
          },
        })
      }
    } catch (err) {
      const isQuotaError =
        err?.status === 403 ||
        err?.data?.errorCode === "E_LP_003" ||
        err?.data?.message?.toLowerCase().includes("quota")

      if (isQuotaError) {
        setIsPreviewOpen(false)
        setIsQuotaLockedOpen(true)
      } else {
        toast.error(
          err?.data?.message ||
            "Buổi học tạm thời không mở được. Vui lòng thử lại sau.",
        )
      }
    }
  }

  const handleLaunchCard = (card) => {
    if (card.status === "QuotaLocked" || card.isQuotaLocked) {
      setIsQuotaLockedOpen(true)
      return
    }
    handleLaunchSessionExecution(card.cardId)
  }

  // Skeleton state
  if (isLoading) {
    return <CalendarLoadingSkeleton />
  }

  // Coming Soon state
  if (isComingSoon) {
    return (
      <ComingSoonPage
        hskLevel={calendarData?.hskLevel || "HSK 4"}
        onChangeLevel={handleConfirmLevelChange}
        onOpenLevelModal={() => setIsLevelModalOpen(true)}
        isChangingLevel={isChangingLevel}
      />
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Không thể tải lộ trình học
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {error?.data?.message ||
            "Hệ thống đang gặp trục trặc khi kết nối dữ liệu. Bạn vui lòng thử lại nhé."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cath-red-700 hover:bg-cath-red-800 shadow-md transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 flex flex-col gap-6">
      {/* 1. Cycle Progress Bar */}
      <CycleProgressBar
        hskLevel={calendarData?.hskLevel || "HSK 2"}
        startDate={calendarData?.startDate}
        endDate={calendarData?.endDate}
        completedSessions={calendarData?.completedSessions ?? 0}
        totalSessions={calendarData?.totalSessions ?? 5}
        averageScore={calendarData?.averageScore}
        streak={calendarData?.streak ?? 0}
        quota={calendarData?.quota}
        onOpenLevelModal={() => setIsLevelModalOpen(true)}
      />

      {/* 2. Five-Card Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cath-red-700 dark:text-cath-red-400" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Lịch học chu kỳ 5 ngày
          </h2>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Còn {calendarData?.remainingDays ?? 0} ngày
        </div>
      </div>

      {/* 3. Five-Card Calendar Grid / Carousel */}
      <FiveCardCalendar
        cards={calendarData?.cards || []}
        onSelectCard={handleSelectCard}
        onLaunchCard={handleLaunchCard}
        isLaunching={isLaunching}
      />

      {/* 4. Modals */}
      {/* lp02: Session Preview Modal */}
      <SessionPreviewModal
        cardId={selectedCardForPreview}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setSelectedCardForPreview(null)
        }}
        onLaunchSession={handleLaunchSessionExecution}
        isLaunching={isLaunching}
      />

      {/* lp03: Quota Locked Modal */}
      <QuotaLockedModal
        isOpen={isQuotaLockedOpen}
        onClose={() => setIsQuotaLockedOpen(false)}
        quotaInfo={calendarData?.quota}
      />

      {/* lp04: Cycle Summary Modal */}
      <CycleSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={handleCloseSummary}
        summary={calendarData?.summaryModal}
        onStartNewCycle={() => {
          handleCloseSummary()
          refetch()
        }}
      />

      {/* lp06: Level Changed Modal */}
      <LevelChangedModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        currentLevel={calendarData?.hskLevel || "HSK 2"}
        onConfirmLevelChange={handleConfirmLevelChange}
        isLoading={isChangingLevel}
      />
    </div>
  )
}

export default LearningPathCalendarPage
