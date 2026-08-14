import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Star, Calendar, Clock, CheckCircle2, Award, X } from "lucide-react"
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

const UNKNOWN = "—"

const StarRating = ({ value, onChange, size = "sm" }) => {
  const sizes = { sm: "h-5 w-5", md: "h-7 w-7", lg: "h-8 w-8" }
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          aria-label={`${star} star`}
          className={`${onChange ? "cursor-pointer" : "cursor-default"} transition-transform ${onChange ? "hover:scale-110" : ""}`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
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
  const overallLabel = rv.ratingLabel?.[String(overallDisplay)] || ""

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
      setRewardPoints(result?.rewardPoints ?? 0)
      setShowSuccess(true)
    } catch {
      setErrorMessage(rv.submitError || "Không thể gửi đánh giá. Vui lòng thử lại.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-primaryBg">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !context) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-primaryBg p-6">
        <p className="text-gray-500">{rv.errorLoading || "Đã xảy ra lỗi khi tải thông tin đánh giá."}</p>
        <button
          type="button"
          onClick={() => navigate("/workspace/profile")}
          className="rounded-lg bg-[#B10A0A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#870003]"
        >
          {rv.goBack || "Về trang cá nhân"}
        </button>
      </div>
    )
  }

  if (alreadyReviewed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-primaryBg p-6">
        <CheckCircle2 size={48} className="text-green-500" />
        <p className="text-lg font-semibold text-gray-800">
          {rv.alreadyReviewed || "Bạn đã đánh giá lớp học này"}
        </p>
        <button
          type="button"
          onClick={() => navigate("/workspace/profile")}
          className="rounded-lg bg-[#B10A0A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#870003]"
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

  return (
    <div className="flex min-h-screen items-start justify-center bg-primaryBg p-4 py-10 sm:p-8">
      <div className="w-full max-w-[768px] rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        {/* Header card */}
        <div className="rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5C6AC4] text-lg font-bold text-white">
              {(context.courseName || context.className || "C").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-gray-900">
                {context.courseName || context.className}
              </h2>
              {context.courseId ? (
                <p className="text-sm text-gray-500">
                  {rv.classTag || "Lớp: "}
                  {context.className}
                </p>
              ) : null}
              {context.language ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {context.language}
                  {Array.isArray(context.levels) && context.levels.length > 0
                    ? ` · ${context.levels.join(" · ")}`
                    : ""}
                </p>
              ) : null}
              <div className="mt-2 flex items-center gap-2.5">
                <Avatar
                  src={getSafeMediaUrl(context.teacher?.avatarImageUrl)}
                  name={context.teacher?.name}
                  size={32}
                />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-gray-900">
                    {context.teacher?.name || UNKNOWN}
                  </p>
                  <p className="text-xs text-gray-500">
                    {rv.teacher || "Giảng viên"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={15} className="text-gray-400" />
              <span className="text-gray-500">
                {rv.completedDate || "Hoàn thành ngày"}:
              </span>
              <span className="font-semibold text-gray-900">
                {formatDisplayDate(context.completedAtUtc)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={15} className="text-gray-400" />
              <span className="text-gray-500">{rv.duration || "Thời lượng"}:</span>
              <span className="font-semibold text-gray-900">
                {context.totalSessions} {rv.sessions || "buổi học"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: detailed ratings */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B10A0A] text-sm font-bold text-white">
              1
            </span>
            <h3 className="text-base font-bold text-gray-900">
              {rv.detailRating || "Đánh giá chi tiết"}
            </h3>
          </div>
          <div className="mt-4 space-y-4 pl-0 sm:pl-9">
            {ratingRows.map((row) => (
              <div
                key={row.key}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-sm font-medium text-gray-800">
                  {row.label}
                </span>
                <div className="flex items-center gap-3">
                  <StarRating
                    value={scores[row.key]}
                    onChange={(v) =>
                      setScores((prev) => ({ ...prev, [row.key]: v }))
                    }
                  />
                  <span
                    className={`w-12 text-right text-sm font-medium ${
                      scores[row.key] >= 4 ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {rv.ratingLabel?.[String(scores[row.key])] || ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="my-6 border-t border-gray-100" />

        {/* Section 2: comment */}
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B10A0A] text-sm font-bold text-white">
              2
            </span>
            <h3 className="text-base font-bold text-gray-900">
              {rv.shareExperience || "Chia sẻ trải nghiệm của bạn"}{" "}
              <span className="font-medium text-gray-500">
                {rv.optional || "(không bắt buộc)"}
              </span>
            </h3>
          </div>
          <div className="relative mt-4 sm:ml-9">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder={
                rv.commentPlaceholder ||
                "Bạn thích điều gì ở khóa học này? Điều gì có thể cải thiện?"
              }
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-700 outline-none transition focus:border-[#B10A0A]/50 focus:ring-2 focus:ring-[#B10A0A]/10"
            />
            <span className="absolute bottom-3 right-4 text-xs text-gray-400">
              {comment.length}/500
            </span>
          </div>
        </div>

        {/* Overall rating */}
        <div className="mt-6 sm:ml-9">
          <h3 className="text-base font-bold text-gray-900">
            {rv.overallRating || "Đánh giá tổng quan"}
          </h3>
          <div className="mt-2 flex items-center gap-4">
            <StarRating value={overall} size="lg" />
            <span className="text-sm font-medium text-gray-600">
              {overall > 0 ? overallLabel : ""}
            </span>
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {rv.back || "Quay lại"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="rounded-lg bg-[#B10A0A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#870003] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "..."
              : rv.submit || "Gửi đánh giá"}
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
      <Modal open={showSuccess} showCloseButton={false} fullScreenOnMobile={false} className="max-w-[480px] rounded-xl !p-0">
        <div className="relative p-8 text-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => navigate("/workspace/profile")}
            className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
          >
            <X size={18} />
          </button>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6F4EA]">
            <CheckCircle2 size={44} className="text-green-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {rv.successTitle || "Đánh giá thành công!"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
            {rv.successMessage ||
              "Cảm ơn bạn đã chia sẻ trải nghiệm về khóa học. Đánh giá của bạn sẽ giúp cộng đồng học tốt hơn."}
          </p>

          {rewardPoints > 0 && (
            <div className="mt-6 flex items-center gap-3 rounded-lg bg-[#F8F9FA] p-4 text-left ring-1 ring-[#E5BDB8]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEB316]/20">
                <Award size={20} className="text-[#FEB316]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {rv.rewardTitle || "Phần thưởng"}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {rv.rewardReceived || "Bạn đã nhận được"}{" "}
                  <span className="text-[#FFBA3B]">{rewardPoints} Points</span>
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/workspace/profile")}
            className="mt-6 w-full rounded-lg bg-[#870003] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B10A0A]"
          >
            {rv.goBack || "Về trang cá nhân"}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default ReviewClassPage
