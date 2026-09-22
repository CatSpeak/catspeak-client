import React from "react"
import {
  Volume2,
  X,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Layers,
  Plus,
  Check,
  ChevronDown,
} from "lucide-react"

import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import Dropdown from "@/shared/components/ui/Dropdown"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { cn } from "@/lib/utils"
import { MOCK_WORD_LOOKUP_DATA } from "../mock/mockVocabulary"
import { LANGUAGE_PAIR_KEYS } from "../constants"
import WordNotFoundPopover from "./WordNotFoundPopover"
import { useLanguage } from "@/shared/context/LanguageContext"

const WordLookupPopover = ({
  data = MOCK_WORD_LOOKUP_DATA,
  selectedLanguagePair = "en-vi",
  isSaved = false,
  showAllExamples = false,
  onSave,
  onClose,
  onPronounce,
  onLanguageChange,
  onSelectRelatedWord,
  onViewMoreExamples,
  onSubmitContribution,
  className = "",
  style = {},
}) => {
  const { t } = useLanguage()

  const languagePairs = LANGUAGE_PAIR_KEYS.map((key) => ({
    value: key,
    label: t.widget?.langPairs?.[key] || key
  }))

  if (data?.notFound || !data?.meaning) {
    return (
      <WordNotFoundPopover
        word={data?.word || "that"}
        onClose={onClose}
        onSelectLanguage={onLanguageChange}
        onSubmitContribution={onSubmitContribution}
        className={className}
        style={style}
      />
    )
  }

  const {
    word,
    type,
    ipa,
    meaning,
    meaningSecondary,
    instructorNote,
    examples = [],
    relatedWords = [],
  } = data || {}

  const currentLangLabel =
    languagePairs.find((p) => p.value === selectedLanguagePair)?.label ||
    (t.widget?.lookup?.langPlaceholder || "Tiếng Anh -> Tiếng Việt")

  return (
    <FluentAnimation direction="up" distance={10} duration={0.2} exit>
      <div
        className={cn(
          "relative w-full max-w-[480px] sm:w-[480px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 sm:p-6 text-slate-800 font-sans select-none z-50",
          className
        )}
        style={style}
      >
        <div className="flex flex-col gap-2 pb-3.5 border-b border-slate-100/80">
          {/* Dòng 1: Tên từ + Badge Loại từ + Nút Đóng */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-wrap min-w-0">
              <h3 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight truncate leading-tight">
                {word}
              </h3>
              {type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-cath-red-700 border border-rose-100 shrink-0">
                  {type}
                </span>
              )}
            </div>

            <IconButton
              onClick={onClose}
              size="xs"
              variant="ghost"
              title={t.widget?.lookup?.closeBtn || "Đóng popup"}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
            >
              <X className="w-4 h-4" />
            </IconButton>
          </div>

          {/* Dòng 2: Phiên âm IPA + Nút Loa + Dropdown Ngôn ngữ */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-2">
              {ipa && (
                <span className="text-sm font-semibold text-cath-red-700 tracking-wide font-mono">
                  {ipa}
                </span>
              )}
              <IconButton
                onClick={onPronounce}
                size="xs"
                variant="cathRed"
                title={t.widget?.lookup?.listenBtn || "Nghe phát âm"}

              >
                <Volume2 className="w-4 h-4" />
              </IconButton>
            </div>

            {/* Language Switcher Dropdown */}
            <div className="shrink-0">
              <Dropdown
                options={languagePairs}
                value={selectedLanguagePair}
                onChange={onLanguageChange}
                dropdownClassName="min-w-[210px]"
                roundedClass="rounded-xl"
                trigger={
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
                    <span>{currentLangLabel}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 py-3.5 text-sm">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.widget?.lookup?.meaning || "NGHĨA"}</span>
            </div>
            <div className="mt-1 text-[15px] font-medium text-slate-800 leading-snug">
              {meaning}{" "}
              {meaningSecondary && (
                <span className="font-semibold text-cath-red-700">
                  {meaningSecondary}
                </span>
              )}
            </div>
          </div>

          {instructorNote && (
            <div className="rounded-2xl bg-[#FFFBF3] border border-amber-200/70 p-3.5 transition-all">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-amber-800 uppercase">
                <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t.widget?.lookup?.instructorNote || "GIẢI THÍCH CHI TIẾT (GIẢNG VIÊN CAT SPEAK)"}</span>
              </div>
              <p className="mt-1.5 text-xs sm:text-[13px] text-amber-950/85 leading-relaxed font-normal">
                {instructorNote}
              </p>
            </div>
          )}

          {examples && examples.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.widget?.lookup?.example || "VÍ DỤ"}</span>
              </div>
              <div className="flex flex-col gap-2">
                {/* Ví dụ đầu tiên (mặc định) */}
                <div className="bg-slate-50/90 border-l-[3px] border-cath-red-700 rounded-r-xl p-3 text-xs sm:text-[13px] text-slate-700 italic leading-relaxed">
                  &ldquo;{examples[0]}&rdquo;
                </div>

                {/* Các ví dụ bổ sung khi showAllExamples = true */}
                {showAllExamples &&
                  examples.slice(1).map((ex, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/90 border-l-[3px] border-cath-red-400 rounded-r-xl p-3 text-xs sm:text-[13px] text-slate-700 italic leading-relaxed transition-all"
                    >
                      &ldquo;{ex}&rdquo;
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Mục: Từ liên quan */}
          {relatedWords && relatedWords.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="text-xs text-slate-500 font-medium shrink-0">
                {t.widget?.lookup?.relatedWords || "Từ liên quan:"}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {relatedWords.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onSelectRelatedWord?.(item)}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium text-cath-red-700 bg-rose-50/80 hover:bg-rose-100 hover:text-cath-red-900 border border-rose-100/80 transition-colors cursor-pointer active:scale-95"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          {/* Nút 1: Thêm vào sổ từ / Đã lưu */}
          <PillButton
            onClick={onSave}
            variant={isSaved ? "secondary" : "primary"}
            bgColor={isSaved ? "#059669" : undefined}
            textColor={isSaved ? "#ffffff" : undefined}
            startIcon={
              isSaved ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              )
            }
            roundedClass="rounded-xl"
            className="flex-1 h-10"
          >
            <span>{isSaved ? (t.widget?.lookup?.saved || "Đã lưu vào sổ") : (t.widget?.lookup?.save || "Thêm vào sổ từ")}</span>
          </PillButton>

          {/* Nút 2: Xem thêm ví dụ  */}
          <PillButton
            onClick={onViewMoreExamples}
            variant="secondary"
            startIcon={<Layers className="w-3.5 h-3.5 text-slate-500" />}
            roundedClass="rounded-xl"
            className="h-10 shrink-0"
          >
            <span>
              {showAllExamples ? (t.widget?.lookup?.collapseExamples || "Thu gọn ví dụ") : (t.widget?.lookup?.moreExamples || "Xem thêm ví dụ")}
            </span>
          </PillButton>
        </div>
      </div>
    </FluentAnimation>
  )
}

export default WordLookupPopover