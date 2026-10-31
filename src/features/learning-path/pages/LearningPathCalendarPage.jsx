import React, { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import dayjs from "dayjs"
import {
  AlertCircle,
  RotateCcw,
  X,
} from "lucide-react"
import { toast } from "@/shared/utils/toastBridge"
import {
  useGetCalendarQuery,
  useLaunchSessionMutation,
  useChangeLevelMutation,
} from "../api/learningPathApi"
import { findCardByDay } from "../utils/learningPathUtils"

import CycleProgressBar from "../components/CycleProgressBar"
import FiveCardCalendar from "../components/FiveCardCalendar"
import TodayTabView from "../components/TodayTabView"
import ReminderBanner from "../components/ReminderBanner"
import FreeQuotaBanner from "../components/FreeQuotaBanner"
import SessionPreviewModal from "../components/SessionPreviewModal"
import QuotaLockedModal from "../components/QuotaLockedModal"
import CycleSummaryModal from "../components/CycleSummaryModal"
import LevelChangedModal from "../components/LevelChangedModal"
import ComingSoonPage from "./ComingSoonPage"

const CalendarLoadingSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 flex flex-col gap-6 animate-pulse">
    {/* Tab toggle skeleton */}
    <div className="h-10 w-44 bg-gray-200 dark:bg-gray-800 rounded-xl" />

    {/* Header Skeleton */}
    <div className="w-full h-36 rounded-2xl bg-gray-200 dark:bg-gray-800" />

    {/* 3 Metric cards skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>

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

  // Navigation tabs: 'cycle' (Chu kỳ) vs 'today' (Hôm nay) - Figma screen 10
  const [activeTab, setActiveTab] = useState("cycle")

  // Reminder banner state - Figma screen 09
  const [isReminderDismissed, setIsReminderDismissed] = useState(false)

  // Floating error state - Figma screen 15
  const [launchErrorMessage, setLaunchErrorMessage] = useState(null)
  const [lastFailedCardId, setLastFailedCardId] = useState(null)

  // Skipped cards state - Figma screen 14
  const [skippedCardIds, setSkippedCardIds] = useState(new Set())

  // Modals state
  const [selectedCardForPreview, setSelectedCardForPreview] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isQuotaLockedOpen, setIsQuotaLockedOpen] = useState(false)
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)
  const [hasDismissedSummary, setHasDismissedSummary] = useState(false)

  // Deep link from the placement profile roadmap (`?day=N`). The URL is
  // cleaned right away, so the day is captured once and kept until the
  // preview/quota modal is closed.
  const [searchParams, setSearchParams] = useSearchParams()
  const [requestedDay, setRequestedDay] = useState(() => searchParams.get("day"))

  // API hooks
  const {
    data: calendarData,
    isLoading,
    isFetching,
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

  // Process cards with skipped state
  const processedCards = (calendarData?.cards || []).map((card) => {
    if (skippedCardIds.has(card.cardId)) {
      return { ...card, status: "Skipped", isSkipped: true }
    }
    return card
  })

  // Resolve the deep-linked day against the loaded calendar
  const deepLinkCard = requestedDay
    ? findCardByDay(processedCards, requestedDay)
    : null
  const deepLinkQuotaLocked = Boolean(
    deepLinkCard &&
      (deepLinkCard.status === "QuotaLocked" || deepLinkCard.isQuotaLocked),
  )
  const deepLinkPreviewOpen = Boolean(deepLinkCard) && !deepLinkQuotaLocked

  // Drop only the `day` param, so closing the modal does not reopen it
  useEffect(() => {
    if (!requestedDay) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete("day")
        return next
      },
      { replace: true },
    )
  }, [requestedDay, setSearchParams])

  // Detect whether cycle starts tomorrow
  const startsTomorrow = Boolean(
    calendarData?.startsTomorrow ||
      (calendarData?.startDate &&
        dayjs(calendarData.startDate).isAfter(dayjs(), "day")),
  )

  // Find today's card for reminder banner
  const todayCard = processedCards.find(
    (c) => c.isToday || c.status === "Scheduled",
  )
  const missedCount = processedCards.filter((c) => c.status === "Missed").length
  const showReminder =
    !isReminderDismissed &&
    todayCard &&
    todayCard.status !== "Completed" &&
    todayCard.status !== "Skipped"

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

  // Skip card handler - Figma screen 14
  const handleSkipCard = (card) => {
    setSkippedCardIds((prev) => new Set([...prev, card.cardId]))
    toast.info("Đã bỏ qua buổi học hôm nay.")
  }

  // Session Launch Execution
  const handleLaunchSessionExecution = async (cardId) => {
    try {
      setLaunchErrorMessage(null)
      const result = await launchSession(cardId).unwrap()
      setIsPreviewOpen(false)
      setRequestedDay(null)

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
        setRequestedDay(null)
        setIsQuotaLockedOpen(true)
      } else {
        // Show floating bottom toast as requested in Figma screen 15 (lp01e-error-states)
        setLastFailedCardId(cardId)
        setLaunchErrorMessage(
          err?.data?.message ||
            "Phòng luyện nói không mở được — thử lại?",
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
  if (isLoading && !calendarData) {
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
  if (isError && !calendarData) {
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
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 flex flex-col gap-6 relative">
      {/* Figma screen 16: Floating loading pill if fetching in background */}
      {isFetching && !isLoading && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#18181B] text-white px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Đang tải lộ trình...</span>
        </div>
      )}

      {/* Top Tab Bar: [ Chu kỳ ] vs [ Hôm nay ] - Figma screen 10 */}
      <div className="flex items-center justify-between">
        <div className="inline-flex p-1 bg-gray-100 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("cycle")}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "cycle"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Chu kỳ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "today"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Hôm nay
          </button>
        </div>

        {/* Level badge / change level trigger */}
        <button
          type="button"
          onClick={() => setIsLevelModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs transition-all cursor-pointer"
        >
          <span>{calendarData?.hskLevel || "HSK 2"}</span>
          <span className="text-gray-400 font-normal">· Đổi trình độ</span>
        </button>
      </div>

      {/* Reminder Banner - Figma screen 09 */}
      {showReminder && (
        <ReminderBanner
          topicTitle={todayCard?.topicTitle || "Gọi món ăn"}
          missedCount={missedCount}
          maxMissed={3}
          onDismiss={() => setIsReminderDismissed(true)}
        />
      )}

      {/* TAB 1: Chu kỳ (Calendar & 3 stats) */}
      {activeTab === "cycle" && (
        <>
          {/* 1. Cycle Progress Bar & 3 Stats Cards */}
          <CycleProgressBar
            cycleNumber={calendarData?.cycleId || 1}
            hskLevel={calendarData?.hskLevel || "HSK 2"}
            completedSessions={calendarData?.completedSessions ?? 0}
            totalSessions={calendarData?.totalSessions ?? 5}
            averageScore={calendarData?.averageScore}
            streak={calendarData?.streak ?? 5}
            startsTomorrow={startsTomorrow}
            onOpenLevelModal={() => setIsLevelModalOpen(true)}
          />

          {/* 2. Five-Card Calendar Header */}
          <div className="flex flex-col text-left mt-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Buổi học trong chu kỳ
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Bấm vào buổi để vào học · Học sớm hoặc học bù trong chu kỳ
            </p>
          </div>

          {/* 3. Five-Card Calendar Grid / Carousel */}
          <FiveCardCalendar
            cards={processedCards}
            onSelectCard={handleSelectCard}
            onLaunchCard={handleLaunchCard}
            onSkipCard={handleSkipCard}
            isLaunching={isLaunching}
            startsTomorrow={startsTomorrow}
          />
        </>
      )}

      {/* TAB 2: Hôm nay (Figma screen 10) */}
      {activeTab === "today" && (
        <TodayTabView
          cards={processedCards}
          hskLevel={calendarData?.hskLevel || "HSK 2"}
          onLaunchCard={handleLaunchCard}
          onSelectCard={handleSelectCard}
          onSkipCard={handleSkipCard}
          isLaunching={isLaunching}
        />
      )}

      {/* Bottom Free Quota Banner - Figma screen 01 & 11 */}
      <FreeQuotaBanner
        quota={calendarData?.quota}
        lang={currentLang}
      />

      {/* Modals */}
      {/* lp02: Session Preview Modal */}
      <SessionPreviewModal
        cardId={deepLinkPreviewOpen ? deepLinkCard.cardId : selectedCardForPreview}
        isOpen={isPreviewOpen || deepLinkPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setSelectedCardForPreview(null)
          setRequestedDay(null)
        }}
        onLaunchSession={handleLaunchSessionExecution}
        isLaunching={isLaunching}
      />

      {/* lp03: Quota Locked Modal */}
      <QuotaLockedModal
        isOpen={isQuotaLockedOpen || deepLinkQuotaLocked}
        onClose={() => {
          setIsQuotaLockedOpen(false)
          setRequestedDay(null)
        }}
        topicTitle={
          (deepLinkQuotaLocked ? deepLinkCard?.topicTitle : null) ||
          todayCard?.topicTitle ||
          processedCards.find((c) => c.cardId === selectedCardForPreview)?.topicTitle ||
          "Buổi học"
        }
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

      {/* Figma screen 15: Floating error toast on launch failure */}
      {launchErrorMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#18181B] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 text-xs sm:text-sm animate-slideUp">
          <span>{launchErrorMessage}</span>
          <button
            type="button"
            onClick={() => {
              const retryId = lastFailedCardId
              setLaunchErrorMessage(null)
              if (retryId) handleLaunchSessionExecution(retryId)
            }}
            className="bg-white text-gray-900 font-bold px-3 py-1 rounded-full text-xs hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Thử lại
          </button>
          <button
            type="button"
            onClick={() => setLaunchErrorMessage(null)}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default LearningPathCalendarPage
