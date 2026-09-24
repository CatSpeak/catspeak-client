import React, { useState, useEffect } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/shared/components/ui/Modal"
import { useSubmitTeacherReportMutation } from "@/store/api/teacherReportApi"

const REPORT_CATEGORIES = [
  {
    value: "InappropriateVideo",
    label: "Video giới thiệu không phù hợp / phản cảm",
  },
  {
    value: "MisleadingProfile",
    label: "Hồ sơ / Bằng cấp không đúng thực tế",
  },
  {
    value: "OffensiveBehavior",
    label: "Hành vi xúc phạm / thiếu chuẩn mực",
  },
  {
    value: "Other",
    label: "Lý do khác",
  },
]

const TeacherReportModal = ({
  isOpen,
  onClose,
  teacherAccountId,
  teacherName,
}) => {
  const [category, setCategory] = useState("InappropriateVideo")
  const [description, setDescription] = useState("")
  const [validationError, setValidationError] = useState("")

  const [submitTeacherReport, { isLoading }] = useSubmitTeacherReportMutation()

  const handleReset = () => {
    setCategory("InappropriateVideo")
    setDescription("")
    setValidationError("")
  }

  const handleClose = () => {
    if (isLoading) return
    handleReset()
    onClose?.()
  }

  useEffect(() => {
    if (!isOpen) {
      handleReset()
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = description.trim()
    if (trimmed.length < 10) {
      setValidationError("Mô tả vi phạm phải có tối thiểu 10 ký tự.")
      return
    }
    setValidationError("")

    try {
      await submitTeacherReport({
        teacherAccountId,
        category,
        description: trimmed,
      }).unwrap()

      toast.success(
        "Báo cáo của bạn đã được gửi thành công. Ban quản trị sẽ kiểm duyệt sớm.",
      )
      handleReset()
      onClose?.()
    } catch (err) {
      if (err?.status === 409) {
        toast.error("Bạn đã có một báo cáo đang chờ xử lý cho giảng viên này.")
      } else {
        toast.error(
          err?.data?.message || "Không thể gửi báo cáo. Vui lòng thử lại sau.",
        )
      }
    }
  }

  return (
    <Modal
      open={isOpen}
      isOpen={isOpen}
      onClose={handleClose}
      title={`Báo cáo giảng viên ${teacherName || ""}`}
      fullScreenOnMobile={false}
      className="md:max-w-lg w-full flex flex-col"
      headerClassName="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white"
      bodyClassName="p-4 sm:p-6 flex-1 overflow-y-auto bg-white"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Category selector */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="report-category"
            className="text-xs font-bold text-slate-700"
          >
            Lý do báo cáo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="report-category"
              name="category"
              aria-label="Lý do báo cáo"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 appearance-none pl-3.5 pr-9 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] cursor-pointer"
            >
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Description textarea */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="report-description"
              className="text-xs font-bold text-slate-700"
            >
              Mô tả chi tiết vi phạm <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-[11px] font-medium tabular-nums ${
                description.trim().length > 0 && description.trim().length < 10
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {description.length}/1000
            </span>
          </div>
          <textarea
            id="report-description"
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (validationError) setValidationError("")
            }}
            disabled={isLoading}
            placeholder="Mô tả chi tiết vi phạm (tối thiểu 10 ký tự)..."
            className={`w-full resize-none rounded-xl border p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors ${
              validationError
                ? "border-red-400 focus:border-red-500 ring-1 ring-red-400"
                : "border-slate-200 focus:border-[#990011] focus:ring-1 focus:ring-[#990011]"
            }`}
          />
          {validationError && (
            <p className="text-xs text-red-600">{validationError}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={description.trim().length < 10 || isLoading}
            className="px-5 py-2.5 rounded-xl bg-[#990011] text-white hover:bg-[#80000e] transition-colors font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <span>Gửi báo cáo</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TeacherReportModal
