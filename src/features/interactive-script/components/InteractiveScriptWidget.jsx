import React, { useState } from "react"
import { Shuffle, Languages, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import Popover from "@/shared/components/ui/Popover"
import { MOCK_SCRIPTS_POOL } from "../mock/mockScripts"
import WordLookupPopover from "./WordLookupPopover"
import TranslationPanel from "./TranslationPanel"
import { useLanguage } from "@/shared/context/LanguageContext"

const InteractiveScriptWidget = ({
  scriptsPool = MOCK_SCRIPTS_POOL,
  onSaveWord,
  className = "",
}) => {
  const { t } = useLanguage()
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [showHint, setShowHint] = useState(() => {
    return localStorage.getItem("catspeak_script_hint_seen") !== "true"
  })
  const [showTranslation, setShowTranslation] = useState(false)
  const [activePopoverKey, setActivePopoverKey] = useState(null)

  const currentScript = scriptsPool[currentScriptIndex] || scriptsPool[0]

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

  const handleShuffleScript = () => {
    if (scriptsPool.length <= 1) return

    setIsFading(true)
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * scriptsPool.length)
      if (nextIndex === currentScriptIndex) {
        nextIndex = (currentScriptIndex + 1) % scriptsPool.length
      }
      setCurrentScriptIndex(nextIndex)
      setShowTranslation(false)
      setIsFading(false)
    }, 150)
  }

  /** Ẩn hint khi user click lần đầu vào từ */
  const dismissHint = () => {
    if (showHint) {
      setShowHint(false)
      localStorage.setItem("catspeak_script_hint_seen", "true")
    }
  }

  /** Tra cứu dữ liệu từ vựng cho một segment / từ */
  const resolveVocabData = (segment, wordToken = null) => {
    const clickedText = wordToken || segment.text.trim()
    const vocabKey = segment.vocabKey || clickedText.toLowerCase().replace(/[^a-z0-9]/g, "")

    if (currentScript.dictionary?.[vocabKey]) {
      return currentScript.dictionary[vocabKey]
    }

    return {
      word: clickedText,
      notFound: true,
    }
  }

  /** Tạo content cho Popover – nhận hàm close từ shared Popover */
  const buildPopoverContent = (vocabData, sIdx, wIdx = null) => (close) => (
    <WordLookupPopover
      data={vocabData}
      onClose={close}
      onSave={(vocab) => onSaveWord?.(vocab)}
      onLanguageChange={(lang) => {
        // Xử lý đổi ngôn ngữ tra cứu
      }}
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
          onOpenChange={(open) => {
            if (open) {
              setActivePopoverKey(popoverKey)
              dismissHint()
            } else {
              setActivePopoverKey((prev) => prev === popoverKey ? null : prev)
            }
          }}
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

          const cleanWord = chunk.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "")
          const vocabData = resolveVocabData({ text: cleanWord, isHighlighted: false }, cleanWord)

          const popoverKey = `w-${sIdx}-${wIdx}`
          const isActive = activePopoverKey === popoverKey

          return (
            <Popover
              key={popoverKey}
              placement="bottom-left"
              className="!inline"
              triggerClassName="inline"
              onOpenChange={(open) => {
                if (open) {
                  setActivePopoverKey(popoverKey)
                  dismissHint()
                } else {
                  setActivePopoverKey((prev) => prev === popoverKey ? null : prev)
                }
              }}
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
          title="Đổi chủ đề ngẫu nhiên"
        >
          <Shuffle className="w-3.5 h-3.5" />
        </IconButton>

        {currentScript.allowTranslation && (
          <IconButton
            onClick={() => setShowTranslation((prev) => !prev)}
            size="xs"
            variant={showTranslation ? "primary" : "outline"}
            title="Dịch cả đoạn văn"
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
        <span className="text-[#6B7280]">Nhấn vào từ bất kỳ để xem nghĩa và lưu vào danh sách học tập cá nhân</span>
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
        />
      )}
    </div>
  )
}

export default InteractiveScriptWidget
