import React, { useState, useEffect } from "react"
import { Calendar, Filter, X, RotateCcw, Check } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"

const NewsAdvancedFilterModal = ({
  open,
  onClose,
  initialFilters = {},
  onApply,
}) => {
  const { t } = useLanguage()

  const mediaTypeOptions = [
    { id: 1, label: t.news?.mediaImage || "Hình ảnh", value: 1 },
    { id: 2, label: t.news?.mediaVideo || "Video", value: 2 },
    { id: 3, label: t.news?.mediaDocument || "Tài liệu / Tệp", value: 3 },
    { id: 4, label: t.news?.mediaLink || "Liên kết", value: 4 },
  ]

  const sortOptions = [
    { id: "createDate", label: t.news?.filters?.newest || "Mới nhất" },
    { id: "viewCount", label: t.news?.filters?.mostViewed || "Xem nhiều nhất" },
    { id: "reactionCount", label: t.news?.filters?.mostReactions || "Tương tác nhiều" },
  ]

  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [hasComments, setHasComments] = useState(false)
  const [hasMedia, setHasMedia] = useState(false)
  const [mediaTypes, setMediaTypes] = useState([])
  const [sortBy, setSortBy] = useState("createDate")

  // Sync state when opened with initialFilters
  useEffect(() => {
    if (open) {
      setFromDate(initialFilters.fromDate || "")
      setToDate(initialFilters.toDate || "")
      setHasComments(Boolean(initialFilters.hasComments))
      setHasMedia(Boolean(initialFilters.hasMedia))
      setMediaTypes(
        Array.isArray(initialFilters.mediaTypes) ? initialFilters.mediaTypes : [],
      )
      setSortBy(initialFilters.sortBy || "createDate")
    }
  }, [open, initialFilters])

  // Quick date presets
  const handlePresetDate = (type) => {
    const now = new Date()
    const format = (d) => d.toISOString().split("T")[0]

    if (type === "all") {
      setFromDate("")
      setToDate("")
      return
    }

    if (type === "7days") {
      const past = new Date()
      past.setDate(now.getDate() - 7)
      setFromDate(format(past))
      setToDate(format(now))
      return
    }

    if (type === "month") {
      const past = new Date(now.getFullYear(), now.getMonth(), 1)
      setFromDate(format(past))
      setToDate(format(now))
      return
    }

    if (type === "year") {
      const past = new Date(now.getFullYear(), 0, 1)
      setFromDate(format(past))
      setToDate(format(now))
      return
    }
  }

  const toggleMediaType = (typeVal) => {
    setMediaTypes((prev) => {
      if (prev.includes(typeVal)) {
        return prev.filter((item) => item !== typeVal)
      } else {
        return [...prev, typeVal]
      }
    })
  }

  const handleReset = () => {
    setFromDate("")
    setToDate("")
    setHasComments(false)
    setHasMedia(false)
    setMediaTypes([])
    setSortBy("createDate")
  }

  const handleApplyFilters = () => {
    onApply({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      hasComments: hasComments ? true : undefined,
      hasMedia: hasMedia ? true : undefined,
      mediaTypes: mediaTypes.length > 0 ? mediaTypes : undefined,
      sortBy,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-neutral-100">
          <Filter className="w-4 h-4 text-cath-red-700 dark:text-rose-400" />
          <span>{t.news?.advancedFiltersTitle || "Bộ lọc nâng cao"}</span>
        </div>
      }
      showCloseButton={true}
      fullScreenOnMobile={false}
      className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-neutral-800"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.news?.reset || "Thiết lập lại"}
          </button>
          <div className="flex gap-2">
            <PillButton variant="secondary" onClick={onClose} size="sm">
              {t.news?.close || "Đóng"}
            </PillButton>
            <PillButton variant="primary" onClick={handleApplyFilters} size="sm">
              {t.news?.apply || "Áp dụng"}
            </PillButton>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Date Filter Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {t.news?.publishTime || "Thời gian đăng"}
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handlePresetDate("all")}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                !fromDate && !toDate
                  ? "bg-rose-50 dark:bg-rose-950/40 border-cath-red-700 text-cath-red-700 font-semibold"
                  : "border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-50"
              }`}
            >
              {t.news?.allTime || "Tất cả"}
            </button>
            <button
              type="button"
              onClick={() => handlePresetDate("7days")}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 transition-colors"
            >
              {t.news?.past7Days || "7 ngày qua"}
            </button>
            <button
              type="button"
              onClick={() => handlePresetDate("month")}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 transition-colors"
            >
              {t.news?.thisMonth || "Tháng này"}
            </button>
            <button
              type="button"
              onClick={() => handlePresetDate("year")}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 transition-colors"
            >
              {t.news?.thisYear || "Năm nay"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <span className="text-[11px] text-slate-600 dark:text-neutral-400 block mb-0.5">
                {t.news?.fromDate || "Từ ngày:"}
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 focus:outline-hidden focus:border-cath-red-700"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-600 dark:text-neutral-400 block mb-0.5">
                {t.news?.toDate || "Đến ngày:"}
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 focus:outline-hidden focus:border-cath-red-700"
              />
            </div>
          </div>
        </div>

        {/* Content Criteria */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-neutral-300">
            {t.news?.postContentFilter || "Nội dung bài viết"}
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={hasComments}
                onChange={(e) => setHasComments(e.target.checked)}
                className="w-4 h-4 rounded-sm text-cath-red-700 accent-cath-red-700 cursor-pointer"
              />
              <span>{t.news?.onlyWithComments || "Chỉ hiển thị bài viết có bình luận"}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={hasMedia}
                onChange={(e) => setHasMedia(e.target.checked)}
                className="w-4 h-4 rounded-sm text-cath-red-700 accent-cath-red-700 cursor-pointer"
              />
              <span>{t.news?.hasMediaAttachment || "Có tệp đính kèm / đa phương tiện"}</span>
            </label>
          </div>
        </div>

        {/* Media Types Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-neutral-300">
            {t.news?.mediaTypes || "Loại phương tiện"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {mediaTypeOptions.map((opt) => {
              const isChecked = mediaTypes.includes(opt.value)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleMediaType(opt.value)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                    isChecked
                      ? "bg-rose-50 dark:bg-rose-950/30 border-cath-red-700 text-cath-red-700 font-semibold"
                      : "border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isChecked && <Check className="w-3.5 h-3.5 text-cath-red-700" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sort By */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-neutral-300">
            {t.news?.sortBy || "Sắp xếp theo"}
          </label>
          <div className="flex items-center gap-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={`flex-1 py-1.5 text-xs rounded-lg border text-center transition-colors ${
                  sortBy === opt.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white font-semibold"
                    : "border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default NewsAdvancedFilterModal
