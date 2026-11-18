import React, { useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Shuffle, Languages, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { M3_MOTION } from "@/shared/constants/motion"
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
  const prefersReducedMotion = useReducedMotion()

  const {
    currentScript,
    isFading,
    showHint,
    showTranslation,
    activePopoverKey,
    selectedLanguagePair,
    handleShuffleScript,
    dismissHint,
    toggleTranslation,
    togglePopover,
    handleLanguageChange,
  } = useInteractiveScript(scriptsPool)

  const translationVariants = {
    initial: {
      opacity: 0,
      height: 0,
      marginTop: -16,
    },
    animate: {
      opacity: 1,
      height: "auto",
      marginTop: 0,
      transition: {
        height: prefersReducedMotion
          ? { duration: 0 }
          : M3_MOTION.standard.spatial.fast,
        marginTop: prefersReducedMotion
          ? { duration: 0 }
          : M3_MOTION.standard.spatial.fast,
        opacity: M3_MOTION.standard.effects.fast,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: -16,
      transition: {
        height: prefersReducedMotion
          ? { duration: 0 }
          : M3_MOTION.standard.spatial.fast,
        marginTop: prefersReducedMotion
          ? { duration: 0 }
          : M3_MOTION.standard.spatial.fast,
        opacity: M3_MOTION.standard.effects.fast,
      },
    },
  }

  const getLocale = (lang) => {
    if (lang === "Japanese") return "ja-JP"
    if (lang === "Chinese") return "zh-CN"
    if (lang === "Vietnamese") return "vi-VN"
    return "en-US"
  }

  const segmenter = useMemo(() => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      return new Intl.Segmenter(getLocale(currentScript?.language), {
        granularity: "word",
      })
    }
    return null
  }, [currentScript?.language])

  const renderTitle = (title) => {
    const titleStr = title || t.rooms?.welcome?.title || "Happy Halloween"
    const firstSpaceIndex = titleStr.indexOf(" ")

    if (firstSpaceIndex !== -1) {
      const firstPart = titleStr.slice(0, firstSpaceIndex)
      const secondPart = titleStr.slice(firstSpaceIndex + 1)
      return (
        <span className="inline-flex flex-wrap gap-2">
          <span>{firstPart}</span>
          <span className="text-cath-red-700 dark:text-red-400">
            {secondPart}
          </span>
        </span>
      )
    }
    return titleStr
  }

  /** Tạo content cho Popover – nhận hàm close từ shared Popover */
  const buildPopoverContent = (wordText) => (close) => (
    <WordLookupPopover
      wordText={wordText}
      scriptId={currentScript.id}
      selectedLanguagePair={selectedLanguagePair}
      onClose={close}
      onSave={(vocab) => onSaveWord?.(vocab)}
      onLanguageChange={handleLanguageChange}
      onSubmitContribution={(contribution) => {
        console.log("Submitted vocabulary contribution:", contribution)
      }}
      onSelectRelatedWord={(relWord) => {
        close()
      }}
    />
  )

  // Render các từ trong segment (phân tách từ thường hoặc giữ nguyên cụm từ highlight)
  const renderSegment = (segment, sIdx) => {
    const prevSeg = currentScript?.contentSegments?.[sIdx - 1]
    const nextSeg = currentScript?.contentSegments?.[sIdx + 1]

    if (segment.isHighlighted) {
      const popoverKey = `seg-${sIdx}`
      const isActive = activePopoverKey === popoverKey

      const isFollowedByPunctuation =
        nextSeg && /^[\p{P}\p{S}]/u.test(nextSeg.text?.trimStart() || "")
      const isPrecededByPunctuation =
        prevSeg && /[“(\[‘'"`]$/u.test(prevSeg.text?.trimEnd() || "")

      return (
        <Popover
          key={popoverKey}
          placement="bottom-left"
          animationType="unroll"
          className="!inline"
          triggerClassName="inline"
          onOpenChange={(open) => togglePopover(popoverKey, open)}
          trigger={
            <span
              className={cn(
                "font-bold text-cath-red-700 dark:text-red-400 cursor-pointer transition-colors rounded py-0.5 inline",
                isPrecededByPunctuation ? "pl-0" : "pl-1",
                isFollowedByPunctuation ? "pr-0" : "pr-1",
                "hover:bg-rose-100/70 dark:hover:bg-rose-950/40",
                isActive &&
                  "ring-1 ring-inset ring-[#990011]/80 dark:ring-red-400/80 bg-[#FFDAD6] dark:bg-rose-950/50",
                showTranslation &&
                  "bg-cath-red-50/80 dark:bg-rose-950/40 ring-1 ring-cath-red-200 dark:ring-rose-900/50",
              )}
            >
              {segment.text}
            </span>
          }
          content={buildPopoverContent(segment.text)}
        />
      )
    }

    const pieces = segmenter
      ? Array.from(segmenter.segment(segment.text))
      : segment.text.split(/(\s+)/).map((part) => ({
          segment: part,
          isWordLike: !/^\s+$/.test(part),
        }))

    return (
      <span key={`seg-${sIdx}`}>
        {pieces.map((piece, pIdx) => {
          if (!piece.isWordLike) {
            return (
              <span key={`p-${sIdx}-${pIdx}`}>{piece.segment}</span>
            )
          }

          const chunk = piece.segment
          // Loại bỏ dấu câu cho từ sạch để gọi API
          const cleanWord = chunk.replace(/[\p{P}\p{S}]/gu, "").trim()

          if (!cleanWord) {
            return (
              <span key={`p-${sIdx}-${pIdx}`}>{chunk}</span>
            )
          }

          const popoverKey = `w-${sIdx}-${pIdx}`
          const isActive = activePopoverKey === popoverKey

          const nextPiece = pieces[pIdx + 1]
          const prevPiece = pieces[pIdx - 1]
          const isFollowedByPunctuation =
            (nextPiece &&
              !nextPiece.isWordLike &&
              /^[\p{P}\p{S}]/u.test(nextPiece.segment)) ||
            (!nextPiece &&
              nextSeg &&
              /^[\p{P}\p{S}]/u.test(nextSeg.text?.trimStart() || ""))
          const isPrecededByPunctuation =
            (prevPiece &&
              !prevPiece.isWordLike &&
              /^[“(\[‘'"`]/u.test(prevPiece.segment)) ||
            (!prevPiece &&
              prevSeg &&
              /[“(\[‘'"`]$/u.test(prevSeg.text?.trimEnd() || ""))

          return (
            <Popover
              key={popoverKey}
              placement="bottom-left"
              animationType="unroll"
              className="!inline"
              triggerClassName="inline"
              onOpenChange={(open) => togglePopover(popoverKey, open)}
              trigger={
                <span
                  className={cn(
                    "cursor-pointer transition-colors rounded py-0.5 inline",
                    isPrecededByPunctuation ? "pl-0" : "pl-0.5",
                    isFollowedByPunctuation ? "pr-0" : "pr-0.5",
                    "hover:bg-slate-100 dark:hover:bg-[#272727] hover:text-slate-900 dark:hover:text-white",
                    isActive &&
                      "ring-1 ring-inset ring-[#990011]/80 dark:ring-red-400/80 bg-[#FFDAD6] dark:bg-rose-950/50",
                  )}
                >
                  {chunk}
                </span>
              }
              content={buildPopoverContent(cleanWord)}
            />
          )
        })}
      </span>
    )
  }

  return (
    <motion.div
      layout="position"
      transition={
        prefersReducedMotion ? { duration: 0 } : M3_MOTION.standard.spatial.fast
      }
      className={cn(
        "relative w-full flex flex-col gap-4 select-none",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold bg-[#FFDAD6] dark:bg-[#370006] text-cath-red-700 dark:text-red-400 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentScript.topic}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
              transition={{
                y: prefersReducedMotion
                  ? { duration: 0 }
                  : M3_MOTION.standard.spatial.fast,
                opacity: M3_MOTION.standard.effects.fast,
              }}
            >
              {currentScript.topic}
            </motion.span>
          </AnimatePresence>
        </span>

        <IconButton
          onClick={handleShuffleScript}
          disabled={isFading}
          variant="secondary"
          title={t.widget?.shuffleTopic || "Đổi chủ đề ngẫu nhiên"}
        >
          <Shuffle />
        </IconButton>

        {currentScript.allowTranslation && (
          <IconButton
            onClick={toggleTranslation}
            variant={showTranslation ? "primary" : "secondary"}
            title={t.widget?.translateFull || "Dịch cả đoạn văn"}
          >
            <Languages />
          </IconButton>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.h1
          key={`title-${currentScript?.id}`}
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            layout: prefersReducedMotion
              ? { duration: 0 }
              : M3_MOTION.standard.spatial.fast,
            opacity: M3_MOTION.standard.effects.fast,
          }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white w-full break-words"
        >
          {renderTitle(currentScript?.title)}
        </motion.h1>
      </AnimatePresence>

      <motion.div
        layout="position"
        transition={
          prefersReducedMotion ? { duration: 0 } : M3_MOTION.standard.spatial.fast
        }
        className="flex items-center gap-2 text-sm"
      >
        <Lightbulb className="w-5 h-5 text-[#F59E0B] shrink-0" size={20} />
        <span className="text-[#6B7280] dark:text-[#AAAAAA]">
          {t.widget?.hint ||
            "Nhấn vào từ bất kỳ để xem nghĩa và lưu vào danh sách học tập cá nhân"}
        </span>
      </motion.div>

      <motion.div
        layout="position"
        transition={
          prefersReducedMotion ? { duration: 0 } : M3_MOTION.standard.spatial.fast
        }
        className="w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`script-body-${currentScript?.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: M3_MOTION.standard.effects.fast,
            }}
            className="flex flex-col gap-3 py-0.5"
          >
            <div className="relative text-base text-gray-800 dark:text-gray-200 leading-relaxed">
              {currentScript?.contentSegments?.map((seg, idx) =>
                renderSegment(seg, idx),
              )}
            </div>

            {currentScript?.featuredQuote && (
              <p className="text-gray-500 dark:text-[#AAAAAA] text-base font-bold italic">
                &ldquo;{currentScript.featuredQuote}&rdquo;
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showTranslation && (
          <motion.div
            layout="position"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={translationVariants}
            className="overflow-hidden"
          >
            <TranslationPanel
              scriptId={currentScript.id}
              selectedLanguagePair={selectedLanguagePair}
              onLanguageChange={handleLanguageChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default InteractiveScriptWidget
