import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, X, Layers, Plus, Check } from "lucide-react"

import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Dropdown from "@/shared/components/ui/Dropdown"
import Label from "@/shared/components/ui/Label"
import ChipFilter from "@/shared/components/ChipFilter"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import { M3_MOTION } from "@/shared/constants/motion"
import { cn } from "@/lib/utils"
import WordNotFoundPopover from "./WordNotFoundPopover"
import { parseExampleSentence } from "../utils/sentenceFormatter"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useLookupWordQuery,
  useContributeDefinitionMutation,
  useSaveVocabularyMutation,
} from "@/store/api/interactiveScriptApi"
import { toast } from "@/shared/utils/toastBridge"

const langCodeToName = {
  vi: "Vietnamese",
  en: "English",
  zh: "Chinese",
  ja: "Japanese",
}

const WordLookupPopover = ({
  wordText,
  scriptId,
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

  const sourceLangCode = selectedLanguagePair.split("-")[0] || "en"
  const ALL_LANGS = ["en", "vi", "zh", "ja"]
  const targetLangs = ALL_LANGS.filter((l) => l !== sourceLangCode)

  const langNames = {
    en: "Anh",
    vi: "Việt",
    zh: "Trung",
    ja: "Nhật",
  }

  const languagePairs = targetLangs.map((target) => {
    const key = `${sourceLangCode}-${target}`
    return {
      value: key,
      label:
        t.widget?.langPairs?.[key] ||
        `${langNames[sourceLangCode] || sourceLangCode} → ${langNames[target] || target}`,
    }
  })

  const targetLanguage =
    langCodeToName[selectedLanguagePair.split("-")[1]] || "Vietnamese"
  const sourceLanguage =
    langCodeToName[selectedLanguagePair.split("-")[0]] || "English"

  const { data: apiData, isFetching } = useLookupWordQuery(
    {
      word: wordText,
      sourceLanguage,
      targetLanguage,
      scriptId,
    },
    { skip: !wordText },
  )

  const [contributeMutation] = useContributeDefinitionMutation()
  const [saveVocabMutation] = useSaveVocabularyMutation()
  const [isSavedLocal, setIsSavedLocal] = useState(isSaved)

  const data = apiData
    ? {
        word: apiData.word || wordText,
        type: apiData.partOfSpeech,
        ipa: apiData.phonetic,
        meaning: apiData.meaning,
        examples: apiData.exampleSentence ? [apiData.exampleSentence] : [],
        relatedWords: apiData.relatedWords || [],
        instructorNote: apiData.teacherNote,
        notFound: !apiData.meaning,
        audioUrl: apiData.audioUrl,
      }
    : { notFound: true, word: wordText }

  const handleContribute = async (contribution) => {
    try {
      await contributeMutation({
        word: wordText,
        sourceLanguage,
        targetLanguage,
        scriptId,
        ...contribution,
      }).unwrap()
      toast.success(t.widget?.lookup?.contributeSuccess || "Góp ý đã được gửi!")
      onSubmitContribution?.(contribution)
    } catch (err) {
      toast.error(
        t.widget?.lookup?.contributeError || "Có lỗi xảy ra khi gửi góp ý.",
      )
    }
  }

  const handleSave = async () => {
    const newSaved = !isSavedLocal
    setIsSavedLocal(newSaved)
    if (newSaved) {
      try {
        await saveVocabMutation({
          word: data.word,
          meaning: data.meaning,
          phonetic: data.ipa,
          partOfSpeech: data.type,
          exampleSentence: data.examples?.[0] || "",
          language: sourceLanguage,
        }).unwrap()
        toast.success(
          t.widget?.lookup?.saveSuccess || "Đã lưu từ vào Sổ từ vựng!",
        )
      } catch (err) {
        toast.error(
          t.widget?.lookup?.saveError || "Không thể lưu từ. Vui lòng thử lại.",
        )
        setIsSavedLocal(false)
        return
      }
    }
    onSave?.(data)
  }

  const handlePronounce = () => {
    if (onPronounce) {
      onPronounce(data?.word || wordText)
      return
    }
    if (data?.audioUrl) {
      const audio = new Audio(data.audioUrl)
      audio.play().catch(console.error)
      return
    }
    if (data?.word) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(data.word)
        const localeMap = {
          English: "en-US",
          Vietnamese: "vi-VN",
          Chinese: "zh-CN",
          Japanese: "ja-JP",
        }
        utterance.lang = localeMap[sourceLanguage] || "en-US"
        window.speechSynthesis.speak(utterance)
      }
    }
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

  const isNotFound = !isFetching && (data?.notFound || !data?.meaning)

  return (
    <motion.div
      layout="position"
      transition={M3_MOTION.standard.spatial.fast}
      className={cn(
        "relative w-full max-w-[480px] sm:w-[480px] bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-slate-100 dark:border-[#3F3F3F] text-slate-800 dark:text-gray-100 z-50 flex flex-col overflow-hidden",
        className,
      )}
      style={style}
    >
      <AnimatePresence mode="wait">
        {isFetching ? (
          <motion.div
            key="fetching-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={M3_MOTION.standard.effects.fast}
            className="flex flex-col"
          >
            {/* Header: Title + Type Skeleton + Close Button */}
            <div className="h-16 pl-4 pr-1 flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0 pt-2 gap-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {wordText}
                </h3>
                <Skeleton className="h-4 w-16 rounded" />
              </div>

              <div className="shrink-0 pt-1">
                <IconButton
                  onClick={onClose}
                  variant="ghost"
                  title={t.widget?.lookup?.closeBtn || "Đóng popup"}
                >
                  <X />
                </IconButton>
              </div>
            </div>

            {/* Skeleton Body */}
            <div className="px-4 pb-4 flex flex-col gap-4">
              {/* Row 2 Skeleton: Audio left, IPA center, Dropdown right */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>

              {/* Meaning Skeleton */}
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-12 rounded" />
                <Skeleton className="h-5 w-4/5 rounded-md" />
              </div>

              {/* Example Skeleton */}
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-10 rounded" />
                <div className="flex flex-col gap-2 pl-4">
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <Skeleton className="h-3.5 w-3/5 rounded" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1 rounded-full" />
                <Skeleton className="h-10 flex-1 rounded-full" />
              </div>
            </div>
          </motion.div>
        ) : isNotFound ? (
          <motion.div
            key="not-found"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={M3_MOTION.standard.effects.fast}
          >
            <WordNotFoundPopover
              word={data?.word || wordText}
              onClose={onClose}
              onSelectLanguage={onLanguageChange}
              onSubmitContribution={handleContribute}
              hideHeader={false}
              className="!border-0 !shadow-none !rounded-none !bg-transparent"
            />
          </motion.div>
        ) : (
          <motion.div
            key={`content-${data?.word || wordText}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={M3_MOTION.standard.effects.fast}
            className="flex flex-col"
          >
            {/* Header (Row 1): Word + Part of Speech + Close */}
            <div className="h-16 pl-4 pr-1 flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0 pt-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {data?.word || wordText}
                </h3>
                {type && (
                  <span className="text-sm text-slate-500 dark:text-[#AAAAAA]">
                    {type}
                  </span>
                )}
              </div>

              <div className="shrink-0 pt-1">
                <IconButton
                  onClick={onClose}
                  variant="ghost"
                  title={t.widget?.lookup?.closeBtn || "Đóng popup"}
                >
                  <X />
                </IconButton>
              </div>
            </div>

            {/* Content Body */}
            <div className="px-4 pb-4 flex flex-col gap-4">
              {/* Row 2: Pronounce Audio + IPA + Dropdown Language */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <IconButton
                    onClick={handlePronounce}
                    variant="cathRed"
                    title={t.widget?.lookup?.listenBtn || "Nghe phát âm"}
                  >
                    <Volume2 />
                  </IconButton>
                  {ipa && (
                    <span className="text-base font-semibold text-cath-red-700 dark:text-[#FF0033] font-mono">
                      {ipa}
                    </span>
                  )}
                </div>

                {/* Language Switcher Dropdown */}
                <div className="shrink-0">
                  <Dropdown
                    options={languagePairs}
                    value={selectedLanguagePair}
                    onChange={(val) => onLanguageChange?.(val)}
                    fitContent
                    align="right"
                  />
                </div>
              </div>

              {/* Meaning Section */}
              <div>
                <Label as="div" className="mb-1">
                  {t.widget?.lookup?.meaning || "Nghĩa"}
                </Label>
                <div className="text-base text-slate-800 dark:text-gray-100">
                  {meaning}{" "}
                  {meaningSecondary && (
                    <span className="font-semibold text-cath-red-700 dark:text-red-400">
                      {meaningSecondary}
                    </span>
                  )}
                </div>
              </div>

              {/* Instructor Note Section */}
              {instructorNote && (
                <div>
                  <Label as="div" className="mb-1">
                    {t.widget?.lookup?.instructorNote ||
                      "Ghi chú từ giáo viên"}
                  </Label>
                  <p className="text-base text-slate-700 dark:text-gray-200">
                    {instructorNote}
                  </p>
                </div>
              )}

              {/* Examples Section */}
              {examples && examples.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label as="div">{t.widget?.lookup?.example || "Ví dụ"}</Label>

                  {/* Default first example */}
                  {(() => {
                    const { original, translation } = parseExampleSentence(
                      examples[0],
                    )
                    return (
                      <blockquote className="border-l-2 border-cath-red-700 dark:border-[#FF0033] pl-4 py-1 flex flex-col gap-2">
                        <span className="text-base text-slate-800 dark:text-gray-100 italic">
                          {original}
                        </span>
                        {translation && (
                          <span className="text-sm text-slate-500 dark:text-[#AAAAAA] not-italic">
                            {translation}
                          </span>
                        )}
                      </blockquote>
                    )
                  })()}

                  {/* Additional examples when showAllExamples = true */}
                  {showAllExamples &&
                    examples.slice(1).map((ex, idx) => {
                      const { original, translation } = parseExampleSentence(ex)
                      return (
                        <blockquote
                          key={idx}
                          className="border-l-2 border-cath-red-400 dark:border-[#FF0033]/70 pl-4 py-1 flex flex-col gap-2 transition-all"
                        >
                          <span className="text-base text-slate-800 dark:text-gray-100 italic">
                            {original}
                          </span>
                          {translation && (
                            <span className="text-sm text-slate-500 dark:text-[#AAAAAA] not-italic">
                              {translation}
                            </span>
                          )}
                        </blockquote>
                      )
                    })}
                </div>
              )}

              {/* Related Words Section */}
              {relatedWords && relatedWords.length > 0 && (
                <div>
                  <Label as="div" className="mb-1">
                    {t.widget?.lookup?.relatedWords || "Từ liên quan"}
                  </Label>
                  <ChipFilter
                    items={relatedWords}
                    onChange={(val) => onSelectRelatedWord?.(val)}
                    wrap={true}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Button 1: Save / Saved */}
                <PillButton
                  onClick={handleSave}
                  variant={isSavedLocal ? "secondary" : "primary"}
                  bgColor={isSavedLocal ? "#059669" : undefined}
                  textColor={isSavedLocal ? "#ffffff" : undefined}
                  startIcon={isSavedLocal ? <Check /> : <Plus />}
                  className="flex-1"
                >
                  <span>
                    {isSavedLocal
                      ? t.widget?.lookup?.saved || "Đã lưu vào sổ"
                      : t.widget?.lookup?.save || "Thêm vào sổ từ"}
                  </span>
                </PillButton>

                {/* Button 2: More / Collapse Examples */}
                <PillButton
                  onClick={onViewMoreExamples}
                  variant="secondary"
                  startIcon={<Layers />}
                  className="flex-1"
                >
                  <span>
                    {showAllExamples
                      ? t.widget?.lookup?.collapseExamples || "Thu gọn ví dụ"
                      : t.widget?.lookup?.moreExamples || "Xem thêm ví dụ"}
                  </span>
                </PillButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default WordLookupPopover
