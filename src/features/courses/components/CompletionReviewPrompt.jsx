import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Trophy, Share2, X, Calendar } from "lucide-react"
import { selectIsAuthenticated } from "@/store/slices/authSlice"
import { useGetPendingReviewQuery } from "@/store/api/reviewApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import Modal from "@/shared/components/ui/Modal"

/**
 * Returns true once, when `isAuthenticated` transitions false→true (a real login).
 * The state update is scheduled outside the effect body to satisfy the
 * react-hooks/set-state-in-effect rule.
 */
const useDidAuthenticate = (isAuthenticated) => {
  const [justAuthenticated, setJustAuthenticated] = useState(false)
  const prevRef = useRef(isAuthenticated)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = isAuthenticated
    if (isAuthenticated && !prev) {
      const id = window.setTimeout(() => setJustAuthenticated(true), 0)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [isAuthenticated])

  return justAuthenticated
}

/**
 * Shows the completion popup once per real login (auth transition false→true),
 * prompting the student to review their most recent unreviewed completed class.
 * "Chia sẻ ngay" is intentionally a no-op in this build (out of scope).
 */
const CompletionReviewPrompt = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const justAuthenticated = useDidAuthenticate(isAuthenticated)
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  const popupT = t?.profile?.review?.popup || {}
  const rv = t?.profile?.review || {}

  const { data: pending } = useGetPendingReviewQuery(undefined, {
    skip: !justAuthenticated || dismissed,
  })

  const show = Boolean(justAuthenticated && pending && !dismissed)

  const close = () => {
    setDismissed(true)
  }

  const goReview = () => {
    if (!pending) return
    close()
    navigate(`/workspace/learning/class/${pending.classId}/review`)
  }

  const formatDateStr = (value) => {
    if (!value) return "—"
    return formatDate ? formatDate(String(value)) : String(value)
  }

  return (
    <Modal
      open={show}
      showCloseButton={false}
      fullScreenOnMobile={false}
      className="max-w-[448px] rounded-2xl !p-8"
    >
      <div className="relative flex flex-col items-center text-center">
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute -right-2 -top-2 text-gray-400 transition hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFEDD5]">
          <Trophy size={32} className="text-[#F97316]" />
        </div>

        <h2 className="mt-4 text-xl font-bold leading-6 text-gray-900">
          {popupT.titlePrefix || "Chúc mừng bạn đã hoàn thành"}{" "}
          {pending?.courseName || pending?.className}
        </h2>
        <p className="mt-2 max-w-[340px] text-sm text-gray-500">
          {popupT.subtitle ||
            "Bạn có thể chia sẻ thành tích này lên trang cá nhân như một chứng thực hoàn thành khóa học."}
        </p>

        <div className="mt-4 w-full rounded-xl bg-[#F9FAFB] p-4 text-left ring-1 ring-gray-100">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEE2E2] text-xs font-bold text-[#B10A0A]">
              {(pending?.studentName || "S").slice(0, 2).toUpperCase()}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {pending?.studentName}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm text-gray-500">
              {rv.completedDate || "Ngày hoàn thành"}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
              <Calendar size={14} className="text-gray-400" />
              {formatDateStr(pending?.completedAtUtc)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={close}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            {popupT.later || "Để sau"}
          </button>
          <button
            type="button"
            onClick={goReview}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            {popupT.review || "Đánh giá"}
          </button>
          <button
            type="button"
            onClick={close}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B10A0A] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#870003]"
          >
            <Share2 size={16} />
            {popupT.share || "Chia sẻ ngay"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default CompletionReviewPrompt
