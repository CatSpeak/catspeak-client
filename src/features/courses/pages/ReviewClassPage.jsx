import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Star, Calendar, Clock, Award, X, Check } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import {
  useGetReviewContextQuery,
  useCreateReviewMutation,
} from "@/store/api/reviewApi"
import Modal from "@/shared/components/ui/Modal"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Avatar from "@/shared/components/ui/Avatar"
import { getSafeMediaUrl } from "../utils/courseUtils"
import { getLocalizedLanguageName } from "../data/courseFormOptions"

const UNKNOWN = "—"

const StarRating = ({ value, onChange, size = "sm" }) => {
  const sizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7 sm:h-8 sm:w-8",
  }
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          aria-label={`${star} star`}
          className={`${onChange ? "cursor-pointer" : "cursor-default"} transition-transform ${onChange ? "hover:scale-115 active:scale-95" : ""
            }`}
        >
          <Star
            className={`${sizes[size]} transition-colors ${star <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-gray-300"
              }`}
            strokeWidth={1.8}
          />
        </button>
      ))}
    </div>
  )
}

const ReviewClassPage = () => {
  const { id } = useParams()
  const classId = Number(id)
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  const rv = t?.profile?.review || {}

  const { data: context, isLoading, isError } = useGetReviewContextQuery(classId)
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation()

  const [scores, setScores] = useState({ content: 0, teaching: 0, materials: 0 })
  const [comment, setComment] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [rewardPoints, setRewardPoints] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [thumbError, setThumbError] = useState(false)

  const canReview = context?.canReview === true
  const alreadyReviewed = context?.alreadyReviewed === true

  useEffect(() => {
    if (!isLoading && !isError && context && !canReview && !alreadyReviewed) {
      navigate("/workspace/profile", { replace: true })
    }
  }, [isLoading, isError, context, canReview, alreadyReviewed, navigate])

  const confirmLeave = () => {
    setShowLeaveConfirm(false)
    navigate("/workspace/profile")
  }

  const overall = useMemo(() => {
    const vals = [scores.content, scores.teaching, scores.materials].filter(
      (v) => v > 0,
    )
    if (vals.length === 0) return 0
    const raw = vals.reduce((a, b) => a + b, 0) / vals.length
    return Math.round(raw * 100) / 100
  }, [scores])

  const overallDisplay = Math.round(overall)
  const overallLabel =
    overallDisplay >= 4
      ? "Rất hài lòng"
      : rv.ratingLabel?.[String(overallDisplay)] || ""

  const formatDisplayDate = (value) => {
    if (!value) return UNKNOWN
    const text = String(value)
    const formatted = formatDate ? formatDate(text) : text
    return formatted || UNKNOWN
  }

  const handleSubmit = async () => {
    if (
      scores.content < 1 ||
      scores.teaching < 1 ||
      scores.materials < 1
    ) {
      setErrorMessage(rv.requiredRating || "Vui lòng chọn đánh giá cho tất cả các mục")
      return
    }
    setErrorMessage("")
    try {
      const result = await createReview({
        classId,
        body: {
          contentQualityScore: scores.content,
          teachingQualityScore: scores.teaching,
          materialsQualityScore: scores.materials,
          comment,
        },
      }).unwrap()
      const earned =
        result?.rewardPoints ??
        result?.data?.rewardPoints ??
        result?.pointsAwarded ??
        result?.data?.pointsAwarded ??
        result?.points ??
        0
      setRewardPoints(earned)
      setShowSuccess(true)
    } catch {
      setErrorMessage(rv.submitError || "Không thể gửi đánh giá. Vui lòng thử lại.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-[300px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !context) {
    return (
      <div className="flex flex-1 min-h-[300px] flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500">{rv.errorLoading || "Đã xảy ra lỗi khi tải thông tin đánh giá."}</p>
        <button
          type="button"
          onClick={() => navigate("/workspace/profile")}
          className="rounded-lg bg-[#990011] px-4 py-2 text-sm font-semibold text-white hover:bg-[#80000e]"
        >
          {rv.goBack || "Về trang cá nhân"}
        </button>
      </div>
    )
  }

  if (alreadyReviewed) {
    return (
      <div className="flex flex-1 min-h-[300px] flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center">
          <Check size={32} className="text-[#16a34a]" strokeWidth={3} />
        </div>
        <p className="text-lg font-semibold text-gray-800">
          {rv.alreadyReviewed || "Bạn đã đánh giá lớp học này"}
        </p>
        <button
          type="button"
          onClick={() => navigate("/workspace/profile")}
          className="rounded-lg bg-[#990011] px-4 py-2 text-sm font-semibold text-white hover:bg-[#80000e]"
        >
          {rv.goBack || "Về trang cá nhân"}
        </button>
      </div>
    )
  }

  const ratingRows = [
    { key: "content", label: rv.contentQuality || "Chất lượng nội dung" },
    { key: "teaching", label: rv.teachingQuality || "Chất lượng giảng dạy của giảng viên" },
    { key: "materials", label: rv.materialsQuality || "Tài liệu & học liệu" },
  ]

  const rawThumbnail =
    context?.thumbnailUrl ||
    context?.courseThumbnailUrl ||
    context?.classThumbnailUrl ||
    context?.imageUrl ||
    context?.coverImageUrl ||
    context?.course?.thumbnailUrl

  const classThumbnailUrl = getSafeMediaUrl(rawThumbnail)
  const initialLetter = (context.courseName || context.className || "C").charAt(0).toUpperCase()

  return (
    <div className="flex w-full flex-1 items-start justify-center py-1 sm:py-3">
      <div className="w-full max-w-[720px] rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-7 shadow-sm border border-gray-100/90">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 -mx-5 sm:-mx-7 px-5 sm:px-7 mb-5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {rv.title || "Đánh giá khóa học"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {rv.subtitle || "Chia sẻ trải nghiệm của bạn để giúp cộng đồng học tập tốt hơn."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowLeaveConfirm(true)}
            className="w-8.5 h-8.5 p-2 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition cursor-pointer shrink-0"
          >
            <X size={17} />
          </button>
        </div>

        {/* Course / Class Summary Card */}
        <div className="rounded-2xl border border-gray-100/90 bg-white p-4 sm:p-4.5 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-5">
            {/* Left: Thumbnail / Initial Letter Fallback + Course Name + Teacher */}
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
              {classThumbnailUrl && !thumbError ? (
                <div className="w-[84px] sm:w-[96px] h-[56px] sm:h-[64px] min-w-[84px] sm:min-w-[96px] rounded-xl sm:rounded-2xl overflow-hidden shrink-0 shadow-xs border border-gray-100 bg-gray-50">
                  <img
                    src={classThumbnailUrl}
                    alt={context.courseName || context.className || "Thumbnail"}
                    className="w-full h-full object-cover"
                    onError={() => setThumbError(true)}
                  />
                </div>
              ) : (
                <div className="w-[84px] sm:w-[96px] h-[56px] sm:h-[64px] min-w-[84px] sm:min-w-[96px] rounded-xl sm:rounded-2xl flex items-center justify-center bg-[#5C6AC4] text-lg sm:text-xl font-bold text-white shrink-0 shadow-xs">
                  {initialLetter}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug truncate">
                  {context.courseName || context.className}
                </h2>
                {context.className && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {rv.classTag || "Lớp: "}
                    {context.className}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Avatar
                    src={getSafeMediaUrl(context.teacher?.avatarImageUrl || context.teacher?.avatarUrl)}
                    name={context.teacher?.name}
                    size={26}
                  />
                  <div className="leading-tight">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {context.teacher?.name || UNKNOWN}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {rv.teacher || "Giảng viên"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Date & Duration */}
            <div className="flex sm:flex-col items-start justify-start gap-4 sm:gap-2.5 sm:border-l sm:border-gray-100 sm:pl-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
              <div className="flex items-start gap-2">
                <Calendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-none">
                    {rv.completedDate || "Hoàn thành ngày"}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 leading-tight">
                    {formatDisplayDate(context.completedAtUtc || context.completedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock size={15} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-none">
                    {rv.duration || "Thời lượng"}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 leading-tight">
                    {context.totalSessions ?? 24} {rv.sessions || "buổi học"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Detailed ratings */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-6 w-6 min-w-[24px] min-h-[24px] items-center justify-center rounded-full bg-[#990011] text-xs font-bold text-white shrink-0">
              1
            </span>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              {rv.detailRating || "Đánh giá chi tiết"}
            </h3>
          </div>

          <div className="space-y-2.5 pl-0 sm:pl-8">
            {ratingRows.map((row) => {
              const score = scores[row.key]
              const label = rv.ratingLabel?.[String(score)] || ""
              const isPositive = score >= 4
              const isNegative = score > 0 && score <= 2
              return (
                <div
                  key={row.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-0.5"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800">
                    {row.label}
                  </span>
                  <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto shrink-0">
                    <StarRating
                      value={score}
                      onChange={(v) =>
                        setScores((prev) => ({ ...prev, [row.key]: v }))
                      }
                    />
                    <span
                      className={`w-20 sm:w-24 text-right text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 ${isPositive
                        ? "text-[#10b981]"
                        : isNegative
                          ? "text-[#dc2626]"
                          : score > 0
                            ? "text-gray-600"
                            : "text-transparent"
                        }`}
                    >
                      {label || "—"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Section Divider */}
        <div className="border-t border-gray-100 my-5" />

        {/* Section 2: Comment experience */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-6 w-6 min-w-[24px] min-h-[24px] items-center justify-center rounded-full bg-[#990011] text-xs font-bold text-white shrink-0">
              2
            </span>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              {rv.shareExperience || "Chia sẻ trải nghiệm của bạn"}
            </h3>
          </div>

          <div className="pl-0 sm:pl-8">
            <div className="relative rounded-2xl border border-gray-200 bg-white p-3 sm:p-3.5 focus-within:border-gray-300 transition-colors">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder={
                  rv.commentPlaceholder ||
                  "Bạn thích điều gì ở khóa học này? Điều gì có thể cải thiện?"
                }
                rows={3}
                className="w-full resize-none border-none p-0 text-xs sm:text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              <div className="text-[11px] text-gray-400 text-right mt-1 select-none">
                {comment.length}/500
              </div>
            </div>

            {/* Overall rating */}
            <div className="mt-4">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                {rv.overallRating || "Đánh giá tổng quan"}
              </h4>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <StarRating value={overall} size="lg" />
                {overall > 0 && (
                  <span
                    className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs sm:text-sm font-semibold ${overall >= 4
                      ? "bg-[#d1fae5] text-[#059669]"
                      : overall <= 2
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {overallLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <p className="mt-3.5 rounded-xl bg-red-50 px-3.5 py-2 text-xs sm:text-sm text-red-600 border border-red-100">
            {errorMessage}
          </p>
        )}

        {/* Bottom Action Footer */}
        <div className="border-t border-gray-100 -mx-5 sm:-mx-7 mt-5 px-5 sm:px-7 pt-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="rounded-xl border border-gray-200 bg-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition active:scale-[0.98] cursor-pointer shadow-2xs"
          >
            {rv.back || "Quay lại"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="rounded-xl bg-[#990011] hover:bg-[#80000e] px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-semibold text-white transition active:scale-[0.98] cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "..." : rv.submit || "Gửi đánh giá"}
          </button>
        </div>
      </div>

      {/* Leave confirm modal */}
      <Modal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        showCloseButton={false}
        fullScreenOnMobile={false}
        className="max-w-sm rounded-2xl"
      >
        <div className="p-6 text-center">
          <p className="text-base font-semibold text-gray-900">
            {rv.leaveTitle || "Bạn có muốn rời khỏi trang?"}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(false)}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {rv.stay || "Ở lại"}
            </button>
            <button
              type="button"
              onClick={confirmLeave}
              className="rounded-lg bg-[#B10A0A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#870003]"
            >
              {rv.leave || "Rời khỏi"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Success modal */}
      <Modal
        open={showSuccess}
        showCloseButton={false}
        fullScreenOnMobile={false}
        bodyClassName="p-0 !mb-0"
        className="max-w-[420px] w-full rounded-3xl border border-gray-100 shadow-2xl overflow-hidden bg-white mx-4 !p-0"
      >
        <div className="relative p-6 sm:p-7 flex flex-col items-center text-center">
          {/* Close button */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => navigate("/workspace/profile")}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Success Check Badge */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#dcfce7] flex items-center justify-center mb-4 sm:mb-5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#16a34a] flex items-center justify-center text-white shadow-sm">
              <Check size={22} className="text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight text-center">
            {rv.successTitle || "Đánh giá thành công!"}
          </h2>

          {/* Subtitle */}
          <p className="mt-2 text-xs sm:text-[13px] text-gray-500 text-center max-w-[320px] mx-auto leading-relaxed px-1">
            {rv.successMessage ||
              "Cảm ơn bạn đã chia sẻ trải nghiệm về khóa học. Đánh giá của bạn sẽ giúp cộng đồng học tốt hơn."}
          </p>

          {/* Reward Info Card */}
          {rewardPoints > 0 && (
            <div className="mt-5 w-full bg-[#f9fafb] border border-[#f5d0ce] rounded-2xl p-4 text-left flex items-center gap-3.5">
              {/* Golden coin icon */}
              <div className="w-10 h-10 rounded-full bg-[#fef3c7] flex items-center justify-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#f59e0b] flex items-center justify-center text-white shadow-xs">
                  <Star size={13} className="fill-white text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">
                  {rv.rewardTitle || "Phần thưởng"}
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
                  {rv.rewardReceived || "Bạn đã nhận được"}{" "}
                  <span className="text-[#f59e0b] font-bold">
                    {rewardPoints ?? 0} Points
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Button to Profile */}
          <button
            type="button"
            onClick={() => navigate("/workspace/profile")}
            className="mt-6 w-full py-3 rounded-xl bg-[#870003] hover:bg-[#700002] text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            {rv.goBack || "Về trang cá nhân"}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default ReviewClassPage
