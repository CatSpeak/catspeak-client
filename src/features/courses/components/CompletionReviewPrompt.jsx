import React, { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { Share2, X, Trophy } from "lucide-react"
import Confetti from "react-confetti"
import { selectIsAuthenticated, selectCurrentUser } from "@/store/slices/authSlice"
import { useGetPendingReviewQuery } from "@/store/api/reviewApi"
import { getNavigate } from "@/features/video-call/hooks/useNavigateRef"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { copyShareLink } from "@/shared/utils/shareUtils"
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
  const { t } = useLanguage()
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
    if (formatDate) {
      const formatted = formatDate(String(value))
      if (formatted) return formatted
    }
    try {
      const d = new Date(value)
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return String(value)
    }
  }

  const courseDisplayName = pending?.courseName || pending?.className || "Khóa học"

  const displayName =
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.displayName ||
    currentUser?.username ||
    "Học viên"

  const userAvatarUrl =
    currentUser?.avatarUrl ||
    currentUser?.avatar ||
    currentUser?.profilePictureUrl

  const userInitials = useMemo(() => {
    if (!displayName) return "U"
    const parts = displayName.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    const p1 = parts[parts.length - 2][0]
    const p2 = parts[parts.length - 1][0]
    return (p1 + p2).toUpperCase()
  }, [displayName])

  const completionDate =
    pending?.completedAtUtc || pending?.completedAt || pending?.completionDate

  const completionDateStr = completionDate ? formatDateStr(completionDate) : "—"

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: courseDisplayName,
          text: `Tôi đã hoàn thành khóa học ${courseDisplayName} trên CatSpeak!`,
          url: profileUrl,
        })
        return
      } catch (err) {
        if (err.name === "AbortError") return
      }
    }
    await copyShareLink({
      url: profileUrl,
      successMessage: "Đã sao chép liên kết chứng nhận hoàn thành khóa học!",
    })
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
        className="max-w-[420px] w-full rounded-3xl border border-gray-100 shadow-2xl overflow-hidden bg-white mx-4"
      >
        <div className="relative p-6 sm:p-7 flex flex-col items-center text-center">
          {/* Close button */}
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Trophy Badge in soft peach/orange circle */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#ffedd5] flex items-center justify-center mb-4 sm:mb-5">
            <Trophy className="w-8 h-8 sm:w-9 sm:h-9 text-[#ea580c]" strokeWidth={2.2} />
          </div>

          {/* Title Header */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug tracking-tight text-center px-2">
            {popupT.titlePrefix || "Chúc mừng bạn đã hoàn thành"}
            <br />
            {courseDisplayName.endsWith("!") ? courseDisplayName : `${courseDisplayName}!`}
          </h2>

          {/* Subtitle */}
          <p className="mt-2 text-xs sm:text-[13px] text-gray-500 text-center max-w-[320px] mx-auto leading-relaxed px-1">
            {popupT.subtitle ||
              "Bạn có thể chia sẻ thành tích này lên trang cá nhân như một chứng thực hoàn thành khóa học."}
          </p>

          {/* User & Completion Info Card */}
          <div className="mt-5 w-full bg-[#f9fafb] border border-gray-100/90 rounded-2xl p-4 text-left">
            {/* User row */}
            <div className="flex items-center gap-3">
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#fee2e2] text-[#dc2626] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                  {userInitials}
                </div>
              )}
              <span className="font-semibold text-gray-900 text-sm sm:text-[15px] truncate">
                {displayName}
              </span>
            </div>

            {/* Divider line */}
            <div className="border-t border-gray-200/60 my-3.5" />

            {/* Completion date row */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">
                {popupT.completedDate || "Ngày hoàn thành"}
              </span>
              <span className="font-semibold text-gray-900">
                {completionDateStr}
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="mt-6 flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={close}
              className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs sm:text-sm text-center transition-all active:scale-[0.98] cursor-pointer shadow-sm"
            >
              {popupT.later || "Để sau"}
            </button>

            <button
              type="button"
              onClick={goReview}
              className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs sm:text-sm text-center transition-all active:scale-[0.98] cursor-pointer shadow-sm"
            >
              {popupT.review || "Đánh giá"}
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label={popupT.share || "Chia sẻ"}
              className="w-11 h-11 sm:w-11 sm:h-11 rounded-xl bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center shrink-0 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <Share2 size={18} className="text-white" />
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default CompletionReviewPrompt
