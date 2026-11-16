import React from "react"
import { AlertCircle } from "lucide-react"
import { BubbleButton } from "@/shared/components/ui/buttons"
import styles from "../styles/danmaku.module.css"
import colors from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * A single floating danmaku message pill with glassmorphism effect.
 *
 * @param {Object} props
 * @param {Object} props.story - Story data with _top, _duration, _delay, isOwn
 * @param {(story: Object) => void} props.onClick
 */
const DanmakuItem = ({ story, onClick }) => {
  const { t } = useLanguage()
  const DANMAKU_THEMES = [
    {
      bg: "bg-[#FFF2EA]/60 dark:bg-amber-950/30",
      bgHover: "hover:bg-[#FFF2EA]/80 dark:hover:bg-amber-950/50",
      text: "text-[#B34700] dark:text-amber-300",
      border: "border-[#FFF2EA]/40 dark:border-amber-700/30",
    },
    {
      bg: "bg-[#FFEAED]/60 dark:bg-rose-950/30",
      bgHover: "hover:bg-[#FFEAED]/80 dark:hover:bg-rose-950/50",
      text: "text-[#990011] dark:text-red-400",
      border: "border-[#FFEAED]/40 dark:border-red-500/30",
    },
    {
      bg: "bg-[#FFF9CC]/60 dark:bg-yellow-950/30",
      bgHover: "hover:bg-[#FFF9CC]/80 dark:hover:bg-yellow-950/50",
      text: "text-[#E2B60A] dark:text-yellow-300",
      border: "border-[#FFF9CC]/40 dark:border-yellow-600/30",
    },
    {
      bg: "bg-[#B2FFD6]/60 dark:bg-emerald-950/30",
      bgHover: "hover:bg-[#B2FFD6]/80 dark:hover:bg-emerald-950/50",
      text: "text-[#34CE56] dark:text-emerald-300",
      border: "border-[#B2FFD6]/40 dark:border-emerald-600/30",
    },
    {
      bg: "bg-[#E8F2FF]/60 dark:bg-sky-950/30",
      bgHover: "hover:bg-[#E8F2FF]/80 dark:hover:bg-sky-950/50",
      text: "text-[#1D7DFD] dark:text-sky-300",
      border: "border-[#E8F2FF]/40 dark:border-sky-600/30",
    },
    {
      bg: "bg-[#F6F2FF]/60 dark:bg-purple-950/30",
      bgHover: "hover:bg-[#F6F2FF]/80 dark:hover:bg-purple-950/50",
      text: "text-[#6D49BF] dark:text-purple-300",
      border: "border-[#F6F2FF]/40 dark:border-purple-600/30",
    },
  ]

  const themeIndex = (story.storyId || 0) % DANMAKU_THEMES.length
  const theme = DANMAKU_THEMES[themeIndex]

  const isOwn = story.isOwn
  const textColorClass = isOwn ? "text-white" : theme.text
  const bgClass = isOwn ? "bg-blue-600/60 dark:bg-blue-600/40" : theme.bg
  const bgHoverClass = isOwn ? "hover:bg-blue-600/80 dark:hover:bg-blue-600/60" : theme.bgHover
  const borderClass = isOwn ? "border-blue-400/30 dark:border-blue-400/40" : theme.border

  return (
    <BubbleButton
      as="div"
      onClick={() => onClick(story)}
      className={`${styles.item} group relative inline-block rounded-2xl px-3 py-2 text-base ${textColorClass} cursor-pointer transition-colors duration-300 border backdrop-blur-sm ${bgClass} ${bgHoverClass} ${borderClass} hover:border-opacity-50`}
      style={{
        top: story._top,
        animationDuration: `${story._duration}s`,
        animationDelay: `${story._delay}s`,
      }}
      bubbleColor={isOwn ? "#2563eb" : colors.primaryRed}
    >
      {story.isReported && (
        <span
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md z-10"
          title={t.catSpeak?.reportedTooltip || t.catSpeak?.reportedWarning || "Bị báo cáo"}
        >
          <AlertCircle size={13} strokeWidth={2.5} />
        </span>
      )}
      <span className="line-clamp-3 break-words">{story.storyContent}</span>
    </BubbleButton>
  )
}

export default DanmakuItem
