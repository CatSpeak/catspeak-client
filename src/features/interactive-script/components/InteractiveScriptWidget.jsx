import React from "react"
import { Shuffle, Languages, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import Popover from "@/shared/components/ui/Popover"
import { MOCK_SCRIPTS_POOL } from "../mock/mockScripts"
import WordLookupPopover from "./WordLookupPopover"
import TranslationPanel from "./TranslationPanel"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useInteractiveScript } from "../hooks/useInteractiveScript"

const InteractiveScriptWidget = ({
  scriptsPool = MOCK_SCRIPTS_POOL,
  onSaveWord,
  className = "",
}) => {
  const { t } = useLanguage()

  const {
    currentScript,
    isFading,
    showHint,
    showTranslation,
    activePopoverKey,
    selectedLanguagePair,
    handleShuffleScript,
    dismissHint,
    resolveVocabData,
    toggleTranslation,
    togglePopover,
    handleLanguageChange,
  } = useInteractiveScript(scriptsPool)

  const renderTitle = (title) => {
    const titleStr = title || t.rooms?.welcome?.title || "Happy Halloween"
    const firstSpaceIndex = titleStr.indexOf(" ")

    if (firstSpaceIndex !== -1) {
      const firstPart = titleStr.slice(0, firstSpaceIndex)
      const secondPart = titleStr.slice(firstSpaceIndex + 1)
      return (
        <span className="inline-flex flex-wrap gap-2 md:gap-4">
          <span>{firstPart}</span>
          <span className="text-cath-red-700">{secondPart}</span>
        </span>
      )
    }
    return titleStr
  }

  /** Tạo content cho Popover – nhận hàm close từ shared Popover */
  const buildPopoverContent = (vocabData, sIdx, wIdx = null) => (close) => (
    <WordLookupPopover
      data={vocabData}
      selectedLanguagePair={selectedLanguagePair}
      onClose={close}
      onSave={(vocab) => onSaveWord?.(vocab)}
      onLanguageChange={handleLanguageChange}
      onSubmitContribution={(contribution) => {
        console.log("Submitted vocabulary contribution:", contribution)
      }}
      onSelectRelatedWord={(relWord) => {
        // Có thể mở rộng để tra cứu từ liên quan
        close()
      }}
    />
  )

  // Render các từ trong segment (phân tách từ thường hoặc giữ nguyên cụm từ highlight)
  const renderSegment = (segment, sIdx) => {
    if (segment.isHighlighted) {
      const vocabData = resolveVocabData(segment)
      const popoverKey = `seg-${sIdx}`
      const isActive = activePopoverKey === popoverKey
      return (
        <Popover
          key={popoverKey}
          placement="bottom-left"
          className="!inline mx-0.5"
          triggerClassName="inline"
          onOpenChange={(open) => togglePopover(popoverKey, open)}
          trigger={
            <span
              className={cn(
                "font-bold text-cath-red-700 cursor-pointer transition-all rounded px-1 py-0.5 inline-block",
                "hover:underline hover:decoration-dotted hover:decoration-cath-red-700 hover:bg-rose-50/60",
                isActive && "border border-[#990011]/80 bg-[#FFDAD6]"
              )}
            >
              {segment.text}
            </span>
          }
          content={buildPopoverContent(vocabData)}
        />
      )
    }

    // Từ thông thường: tách thành từng từ đơn để đều có thể click tra từ
    const words = segment.text.split(/(\s+)/)
    return (
      <span key={`seg-${sIdx}`}>
        {words.map((chunk, wIdx) => {
          const isSpace = /^\s+$/.test(chunk)
          if (isSpace || !chunk) {
            return chunk
          }

          // Sử dụng Regex hỗ trợ Unicode để loại bỏ tất cả dấu câu (Punctuation) và ký hiệu (Symbol)
          const cleanWord = chunk.replace(/[\p{P}\p{S}]/gu, "")
          const vocabData = resolveVocabData({ text: cleanWord, isHighlighted: false }, cleanWord)

          const popoverKey = `w-${sIdx}-${wIdx}`
          const isActive = activePopoverKey === popoverKey

          return (
            <Popover
              key={popoverKey}
              placement="bottom-left"
              className="!inline"
              triggerClassName="inline"
              onOpenChange={(open) => togglePopover(popoverKey, open)}
              trigger={
                <span
                  className={cn(
                    "cursor-pointer transition-all rounded px-0.5 py-0.5 inline-block",
                    "hover:underline hover:decoration-dotted hover:decoration-slate-400 ",
                    isActive && "border border-[#990011]/80 bg-[#FFDAD6]"
                  )}
                >
                  {chunk}
                </span>
              }
              content={buildPopoverContent(vocabData)}
            />
          )
        })}
      </span>
    )
  }

  return (
    <div
      className={cn(
        "relative w-full transition-opacity duration-150 select-none",
        isFading ? "opacity-0" : "opacity-100",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold bg-[#FFDAD6] text-cath-red-700">
          {currentScript.topic}
        </span>

        <IconButton
          onClick={handleShuffleScript}
          size="xs"
          variant="outline"
          title={t.widget?.shuffleTopic || "Đổi chủ đề ngẫu nhiên"}
        >
          <Shuffle className="w-3.5 h-3.5" />
        </IconButton>

        {currentScript.allowTranslation && (
          <IconButton
            onClick={toggleTranslation}
            size="xs"
            variant={showTranslation ? "primary" : "outline"}
            title={t.widget?.translateFull || "Dịch cả đoạn văn"}
          >
            <Languages className="w-3.5 h-3.5" />
          </IconButton>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight md:leading-relaxed w-full">
        {renderTitle(currentScript.title)}
      </h1>

      <div className="flex items-center gap-2 mt-2 text-sm">
        <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
        <span className="text-[#6B7280]">{t.widget?.hint || "Nhấn vào từ bất kỳ để xem nghĩa và lưu vào danh sách học tập cá nhân"}</span>
      </div>
      <div className="text-base md:text-lg mt-2 leading-relaxed font-sans">
        {currentScript.contentSegments?.map((seg, idx) => renderSegment(seg, idx))}
      </div>

      {currentScript.featuredQuote && (
        <p className="text-gray-500 text-xl md:text-2xl mt-2 font-bold italic">
          &ldquo;{currentScript.featuredQuote}&rdquo;
        </p>
      )}

      {showTranslation && (
        <TranslationPanel
          fullTranslation={currentScript.fullTranslation}
          featuredQuoteTranslation={currentScript.featuredQuoteTranslation}
          selectedLanguagePair={selectedLanguagePair}
          onLanguageChange={handleLanguageChange}
        />
      )}
    </div>
  )
}

export default InteractiveScriptWidget
