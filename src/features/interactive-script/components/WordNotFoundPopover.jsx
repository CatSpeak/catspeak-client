import React, { useState } from "react"
import {
  X,
  SearchX,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Divider from "@/shared/components/ui/Divider"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { cn } from "@/lib/utils"
import { toast } from "@/shared/utils/toastBridge"

const DEFAULT_SUGGESTED_LANGUAGES = [
  { id: "vi", label: "Tiếng Việt", code: "vi" },
  { id: "zh", label: "Tiếng Trung", code: "zh" },
  { id: "ja", label: "Tiếng Nhật", code: "ja" },
  { id: "en", label: "Tiếng Anh", code: "en" },
]

const CONTRIBUTION_TYPE_OPTIONS = [
  { value: "definition", label: "Định nghĩa thông thường" },
  { value: "context", label: "Thuật ngữ / Văn cảnh đặc biệt" },
  { value: "example", label: "Ví dụ câu minh họa" },
]

const WordNotFoundPopover = ({
  word = "that",
  suggestedLanguages = DEFAULT_SUGGESTED_LANGUAGES,
  onSelectLanguage,
  onSubmitContribution,
  onClose,
  dictionaryUrl,
  className = "",
  style,
}) => {
  const [isContributing, setIsContributing] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [contributionMeaning, setContributionMeaning] = useState("")
  const [contributionType, setContributionType] = useState("definition")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasInputError, setHasInputError] = useState(false)

  const handleOpenExternalDictionary = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const targetUrl =
      dictionaryUrl ||
      `https://en.wiktionary.org/wiki/${encodeURIComponent(word?.toLowerCase() || "")}`
    window.open(targetUrl, "_blank", "noopener,noreferrer")
  }

  const handleSubmitContributionForm = (e) => {
    e.preventDefault()
    if (!contributionMeaning.trim()) {
      setHasInputError(true)
      toast.warning("Vui lòng nhập định nghĩa của từ.")
      return
    }

    setHasInputError(false)
    setIsSubmitting(true)
    setTimeout(() => {
      const selectedTypeLabel =
        CONTRIBUTION_TYPE_OPTIONS.find((opt) => opt.value === contributionType)?.label ||
        contributionType

      onSubmitContribution?.({
        word,
        meaning: contributionMeaning.trim(),
        type: selectedTypeLabel,
      })
      toast.success("Cảm ơn bạn đã đóng góp định nghĩa!")
      setIsSubmitting(false)
      setIsContributing(false)
      setContributionMeaning("")
      setHasInputError(false)
    }, 400)
  }

  const selectedTypeLabel =
    CONTRIBUTION_TYPE_OPTIONS.find((opt) => opt.value === contributionType)?.label ||
    "Định nghĩa thông thường"

  return (
    <FluentAnimation direction="up" distance={10} duration={0.2} exit>
      <div
        className={cn(
          "relative w-full max-w-[520px] sm:w-[520px] bg-white rounded-3xl shadow-faq-card border border-border p-3 sm:p-4 select-none z-50 transition-all",
          className
        )}
        style={style}
      >
        {/* Header: Tên từ + Nút Đóng */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-[#1F2937] tracking-tight truncate leading-tight">
            {word}
          </h3>

          <IconButton
            onClick={onClose}
            size="xs"
            variant="ghost"
            title="Đóng popup"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Nội dung chính hoặc Form đóng góp */}
        {!isContributing ? (
          <div className="flex flex-col gap-4 py-2">
            {/* Thông báo trạng thái không tìm thấy */}
            <div className="flex items-start gap-3">
              <IconButton
                size="md"
                variant="secondary"
                innerClassName="!rounded-2xl !bg-amber-50 !border !border-amber-100/80 !text-amber-600"
              >
                <SearchX className="w-5 h-5 stroke-[2.2]" />
              </IconButton>

              <div className="flex flex-col gap-1">
                <h4 className="text-base sm:text-base font-semibold text-[#374151] leading-snug">
                  Không tìm thấy định nghĩa cho từ này.
                </h4>
                <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                  Hệ thống chưa có dữ liệu giải nghĩa cho từ đơn này trong từ điển hiện tại.
                </p>
              </div>
            </div>

            {/* Gợi ý thử ngôn ngữ khác */}
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-medium text-[#6B7280]">
                Thử ngôn ngữ khác:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {suggestedLanguages.map((lang) => (
                  <PillButton
                    key={lang.id || lang.label}
                    variant="secondary"
                    roundedClass="rounded-full"
                    onClick={() => onSelectLanguage?.(lang)}
                    className="!h-auto shrink-0"
                  >
                    <span className="text-xs sm:text-sm font-medium text-[#374151]">
                      {lang.label}
                    </span>
                  </PillButton>
                ))}
              </div>
            </div>

            {/* Footer: Đóng góp định nghĩa + Tra cứu từ điển mở */}
            <div className="flex flex-col gap-3 pt-1">
              <Divider className="bg-[#F3F4F6]" />
              <div className="flex items-center justify-between gap-3">
                <PillButton
                  variant="secondary-no-outline"
                  onClick={() => setIsContributing(true)}
                  startIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                  textColor="#990011"
                  className="!h-auto !p-0"
                >
                  Đóng góp định nghĩa
                </PillButton>

                <PillButton
                  variant="secondary-no-outline"
                  onClick={handleOpenExternalDictionary}
                  endIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  textColor="#6B7280"
                  className="!h-auto !p-0"
                >
                  Tra cứu trên từ điển mở
                </PillButton>
              </div>
            </div>
          </div>
        ) : (
          /* Form đóng góp định nghĩa inline sử dụng các Shared Component */
          <form
            noValidate
            onSubmit={handleSubmitContributionForm}
            className="flex flex-col gap-3 py-2 animate-fadeIn"
          >
            <div className="flex items-center gap-1.5 text-sm font-semibold text-cath-red-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đóng góp định nghĩa mới</span>
            </div>

            {/* Dropdown loại đóng góp */}
            <div className="flex flex-col gap-1 relative">
              <span className="text-sm font-medium text-[#374151]">
                Loại đóng góp:
              </span>
              <div
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm font-medium text-[#374151] bg-slate-50/70 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-300 transition-colors cursor-pointer select-none"
              >
                <span>{selectedTypeLabel}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200",
                    isDropdownOpen && "rotate-180 text-cath-red-700"
                  )}
                />
              </div>

              {/* Menu danh sách lựa chọn dạng Inline trong cây DOM của Popover */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-30 max-h-44 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1 animate-fadeIn">
                  {CONTRIBUTION_TYPE_OPTIONS.map((opt) => {
                    const isSelected = contributionType === opt.value
                    return (
                      <div
                        key={opt.value}
                        onClick={(e) => {
                          e.stopPropagation()
                          setContributionType(opt.value)
                          setIsDropdownOpen(false)
                        }}
                        className={cn(
                          "px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between cursor-pointer transition-colors",
                          isSelected
                            ? "bg-rose-50 text-cath-red-700 font-semibold"
                            : "text-[#374151] hover:bg-slate-50 hover:text-cath-red-700"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-cath-red-700 stroke-[2.5]" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* TextInput đa dòng cho nghĩa bạn biết */}
            <span className="text-sm font-medium text-[#374151]">
              Nghĩa bạn biết:
            </span>
            <TextInput
              error={hasInputError}
              multiline
              rows={2}
              value={contributionMeaning}
              onChange={(e) => {
                setContributionMeaning(e.target.value)
                if (hasInputError && e.target.value.trim()) {
                  setHasInputError(false)
                }
              }}
              placeholder="Nhập định nghĩa hoặc giải thích cho từ này..."
              variant="rounded-xl"
              labelClassName="text-[#374151] font-medium"
              className="!text-xs sm:!text-sm !h-auto !py-2.5 !px-3 text-[#374151]"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <PillButton
                type="button"
                variant="secondary-no-outline"
                onClick={() => {
                  setIsContributing(false)
                  setContributionMeaning("")
                  setHasInputError(false)
                }}
                roundedClass="rounded-xl"
                className="!h-9 text-xs"
              >
                <span>Hủy</span>
              </PillButton>

              <PillButton
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                startIcon={<Send className="w-3.5 h-3.5" />}
                roundedClass="rounded-xl"
                className="!h-9 text-xs"
              >
                <span>{isSubmitting ? "Đang gửi..." : "Gửi đóng góp"}</span>
              </PillButton>
            </div>
          </form>
        )}
      </div>
    </FluentAnimation>
  )
}

export default WordNotFoundPopover
