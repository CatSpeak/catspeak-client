import React, { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { Share2, X, Star } from "lucide-react"
import Confetti from "react-confetti"
import awardIcon from "@/shared/assets/images/award.svg"
import { selectIsAuthenticated, selectCurrentUser } from "@/store/slices/authSlice"
import { useGetPendingReviewQuery } from "@/store/api/reviewApi"
import { getNavigate } from "@/features/video-call/hooks/useNavigateRef"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import Modal from "@/shared/components/ui/Modal"

const getStorageKey = (userId) => {
  return userId ? `catspeak_dismissed_reviews_${userId}` : "catspeak_dismissed_reviews"
}

const getDismissedReviews = (userId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const isReviewPromptDismissed = (userId, classId) => {
  if (!classId) return false
  const dismissedMap = getDismissedReviews(userId)
  return Boolean(dismissedMap[classId])
}

const markReviewPromptDismissed = (userId, classId) => {
  if (!classId) return
  try {
    const key = getStorageKey(userId)
    const dismissedMap = getDismissedReviews(userId)
    dismissedMap[classId] = Date.now()
    localStorage.setItem(key, JSON.stringify(dismissedMap))
  } catch (e) {
    console.error("Failed to save dismissed review prompt to localStorage", e)
  }
}

/** Hook to obtain viewport dimensions for responsive full-screen confetti */
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 600,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return size
}

const CompletionReviewPrompt = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrentUser)
  const [dismissed, setDismissed] = useState(false)
  const { t, language } = useLanguage()
  const { formatDate } = useTimezone()
  const windowSize = useWindowSize()
  const popupT = t?.profile?.review?.popup || {}

  const userId =
    currentUser?.id ||
    currentUser?.userId ||
    currentUser?.accountId ||
    currentUser?._id ||
    "user"

  const { data: pending } = useGetPendingReviewQuery(undefined, {
    skip: !isAuthenticated || dismissed,
  })

  const pendingClassId = pending?.classId || pending?.id

  // Has this specific class's completion already been shown & dismissed
  // in a previous session? Re-checked whenever the pending class changes.
  const isAlreadyDismissedInStorage = useMemo(() => {
    if (!pendingClassId) return false
    return isReviewPromptDismissed(userId, pendingClassId)
  }, [pendingClassId, userId])

  const show = Boolean(
    isAuthenticated && pending && !dismissed && !isAlreadyDismissedInStorage
  )

  // Single write path: storage is only touched when the user actually
  // closes the modal, never merely because the data arrived.
  const close = () => {
    setDismissed(true)
    if (pendingClassId) {
      markReviewPromptDismissed(userId, pendingClassId)
    }
  }

  const goReview = () => {
    if (!pending) return
    close()
    getNavigate()?.(`/workspace/learning/class/${pending.classId}/review`)
  }

  const formatDateStr = (value) => {
    if (!value) return "—"
    return formatDate ? formatDate(String(value)) : String(value)
  }

  const courseDisplayName = pending?.courseName || pending?.className || "Khóa học"

  const getCompletedSubtitle = () => {
    if (!pending?.completedAtUtc) {
      return (
        popupT.subtitle ||
        "Bạn có thể chia sẻ thành tích này lên trang cá nhân như một chứng thực hoàn thành khóa học."
      )
    }
    const dateFormatted = formatDateStr(pending.completedAtUtc)
    if (language === "en") {
      return `You completed this course on ${dateFormatted}.`
    }
    if (language === "zh") {
      return `您已于 ${dateFormatted} 完成此课程。`
    }
    return `Bạn đã hoàn thành khóa học này vào ngày ${dateFormatted}.`
  }

  return (
    <>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[1400] overflow-hidden">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={85}
            gravity={0.22}
            colors={["#990011", "#c00015", "#f59e0b", "#f97316", "#10b981", "#fbbf24"]}
          />
        </div>
      )}

      <Modal
        open={show}
        onClose={close}
        showCloseButton={false}
        fullScreenOnMobile={false}
        bodyClassName="p-0 !mb-0"
        className="max-w-[460px] w-full rounded-2xl border border-gray-200/80 shadow-2xl overflow-hidden bg-white mx-4"
      >
        <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Close button */}
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Award Graphic inside framed container */}
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-24 h-24 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center p-3 shadow-inner">
              <img
                src={awardIcon}
                alt="Award"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Title Header with Separate Lines */}
          <div className="w-full">
            <p className="text-sm font-medium text-gray-500">
              {popupT.titlePrefix || "Chúc mừng bạn đã hoàn thành"}
            </p>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug break-words px-2">
              {courseDisplayName}
            </h2>
          </div>

          {/* Subtitle with Completion Date */}
          <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed px-1">
            {getCompletedSubtitle()}
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={goReview}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#990011] hover:bg-[#80000e] text-white font-semibold py-3 px-4 text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
            >
              <Star size={16} className="fill-amber-300 text-amber-300" />
              <span>{popupT.review || "Đánh giá ngay"}</span>
            </button>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={close}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium py-2.5 px-3 text-xs sm:text-sm transition-all active:scale-[0.99] cursor-pointer"
              >
                <Share2 size={15} className="text-gray-500" />
                <span>{popupT.share || "Chia sẻ ngay"}</span>
              </button>

              <button
                type="button"
                onClick={close}
                className="flex items-center justify-center rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {popupT.later || "Để sau"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default CompletionReviewPrompt
