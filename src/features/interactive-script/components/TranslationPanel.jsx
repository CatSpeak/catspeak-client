import React, { useState } from "react"
import { Globe, AlertCircle, ChevronDown, Check, Flag } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { DEFAULT_LANGUAGE_PAIRS } from "../mock/mockVocabulary"
import { PillButton } from "@/shared/components/ui/buttons"

const REPORT_REASONS = [
  { value: "Dịch sai nghĩa", label: "Dịch sai nghĩa" },
  { value: "Bản dịch không tự nhiên", label: "Bản dịch không tự nhiên" },
  { value: "Thiếu hoặc thừa từ", label: "Thiếu hoặc thừa từ" },
  { value: "Khác", label: "Lý do khác" },
]

const TranslationPanel = ({
  fullTranslation = {},
  featuredQuoteTranslation = "",
  languagePairs = DEFAULT_LANGUAGE_PAIRS,
  selectedLanguagePair = "en-vi",
  onLanguageChange,
  className = "",
}) => {
  const [currentLangPair, setCurrentLangPair] = useState(selectedLanguagePair)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState("Dịch sai nghĩa")
  const [reportText, setReportText] = useState("")
  const [reportSent, setReportSent] = useState(false)

  const translationData =
    fullTranslation[currentLangPair] ||
    fullTranslation["en-vi"] || {
      body: "Chưa có bản dịch cho ngôn ngữ này.",
      highlightedMatches: [],
    }

  const handleLangSelect = (newLang) => {
    setCurrentLangPair(newLang)
    onLanguageChange?.(newLang)
  }

  const handleSendReport = (e) => {
    e.preventDefault()
    setReportSent(true)
    setTimeout(() => {
      setShowReportForm(false)
      setReportSent(false)
      setReportText("")
    }, 1800)
  }

  // Render text bản dịch với các từ nổi bật được highlight đỏ
  const renderFormattedBody = () => {
    const { body = "", highlightedMatches = [] } = translationData
    if (!highlightedMatches || highlightedMatches.length === 0) {
      return <span>{body}</span>
    }

    // Tạo regex an toàn để match các từ cần highlight
    const pattern = new RegExp(`(${highlightedMatches.join("|")})`, "gi")
    const parts = body.split(pattern)

    return parts.map((part, idx) => {
      const isMatch = highlightedMatches.some(
        (m) => m.toLowerCase() === part.toLowerCase()
      )
      if (isMatch) {
        return (
          <strong key={idx} className="font-semibold text-cath-red-700">
            {part}
          </strong>
        )
      }
      return <span key={idx}>{part}</span>
    })
  }

  const currentLangLabel =
    languagePairs.find((p) => p.value === currentLangPair)?.label ||
    "Tiếng Anh → Tiếng Việt"

  return (
    <FluentAnimation direction="down" distance={10} duration={0.2} exit>
      <div
        className={`w-full bg-[#fff9f9] rounded-2xl border border-[#FECACA] p-4 sm:p-5 shadow-sm text-slate-800 my-3 select-none transition-all ${className}`}
      >
        {/* Header Panel */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#FECACA]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] uppercase">
            <Globe className="w-5 h-5 text-cath-red-700 shrink-0" />
            <span>BẢN DỊCH CẢ ĐOẠN VĂN</span>
          </div>

          <div className="shrink-0">
            <Dropdown
              options={languagePairs}
              value={currentLangPair}
              onChange={handleLangSelect}
              dropdownClassName="min-w-[210px]"
              roundedClass="rounded-xl"
              trigger={
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium text-[#6B7280] bg-white border border-[#FECACA] rounded-lg transition-colors cursor-pointer">
                  <span>{currentLangLabel}</span>
                  <ChevronDown className="w-5 h-5 text-[#6B7280]" />
                </div>
              }
            />
          </div>
        </div>

        {/* Body Bản dịch */}
        <div className="py-2 text-sm sm:text-base text-[#1E293B]">
          {renderFormattedBody()}
        </div>

        {/* Câu nổi bật dịch */}
        {featuredQuoteTranslation && (
          <p className="text-sm sm:text-base font-medium italic text-[#334155]">
            &ldquo;{featuredQuoteTranslation}&rdquo;
          </p>
        )}

        {/* Footer Panel */}
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-[#64748B] mt-2 border-t border-[#FECACA]">
          <div className="flex items-center gap-1 h-12">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
            <span>Bản dịch AI mang tính chất tham khảo</span>
          </div>

          {!showReportForm && (
            <PillButton
              onClick={() => setShowReportForm(true)}
              variant="secondary-no-outline"
              startIcon={<Flag className="w-5 h-5 text-red-700 shrink-0" />}
            >
              Báo dịch chưa chuẩn
            </PillButton>
          )}
        </div>

        {/* Inline Report Form */}
        {showReportForm && (
          <form
            onSubmit={handleSendReport}
            className="mt-3 pt-3 border-t border-border flex flex-col gap-2.5 rounded-xl animate-fadeIn"
          >
            <div className="flex items-center justify-between text-base font-semibold text-slate-800">
              <span>Góp ý bản dịch chưa chuẩn:</span>
            </div>

            {reportSent ? (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium py-2">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Cảm ơn bạn đã đóng góp ý kiến!</span>
              </div>
            ) : (
              <>
                <Dropdown
                  options={REPORT_REASONS}
                  value={reportReason}
                  onChange={setReportReason}
                  dropdownClassName="w-full"
                  roundedClass="rounded-xl"
                />
                <TextInput
                  multiline
                  rows={3}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Nhập góp ý bản dịch chính xác hơn..."
                  variant="rounded-xl"
                />

                <div className="flex gap-2 justify-end">
                  <PillButton
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    variant="outline"
                  >
                    Hủy
                  </PillButton>
                  <PillButton
                    type="submit"
                    variant="primary"
                  >
                    Gửi góp ý
                  </PillButton>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </FluentAnimation>
  )
}

export default TranslationPanel
