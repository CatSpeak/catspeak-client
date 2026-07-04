import React from "react";
import { BubbleButton } from "@/shared/components/ui/buttons";
import styles from "../styles/danmaku.module.css";
import colors from "@/shared/utils/colors";

/**
 * A single floating danmaku message pill with glassmorphism effect.
 *
 * @param {Object} props
 * @param {Object} props.story - Story data with _top, _duration, _delay, isOwn
 * @param {(story: Object) => void} props.onClick
 */
const DanmakuItem = ({ story, onClick }) => {
  const DANMAKU_THEMES = [
    {
      bg: "bg-[#FFF2EA]/60",
      bgHover: "bg-[#FFF2EA]/80",
      text: "text-[#B34700]",
      border: "border-[#FFF2EA]/40",
    },
    {
      bg: "bg-[#FFEAED]/60",
      bgHover: "bg-[#FFEAED]/80",
      text: "text-[#990011]",
      border: "border-[#FFEAED]/40",
    },
    {
      bg: "bg-[#FFF9CC]/60",
      bgHover: "bg-[#FFF9CC]/80",
      text: "text-[#E2B60A]",
      border: "border-[#FFF9CC]/40",
    },
    {
      bg: "bg-[#B2FFD6]/60",
      bgHover: "bg-[#B2FFD6]/80",
      text: "text-[#34CE56]",
      border: "border-[#B2FFD6]/40",
    },
    {
      bg: "bg-[#E8F2FF]/60",
      bgHover: "bg-[#E8F2FF]/80",
      text: "text-[#1D7DFD]",
      border: "border-[#E8F2FF]/40",
    },
    {
      bg: "bg-[#F6F2FF]/60",
      bgHover: "bg-[#F6F2FF]/80",
      text: "text-[#6D49BF]",
      border: "border-[#F6F2FF]/40",
    },
    {
      bg: "bg-[#FFFBFC]/60",
      bgHover: "bg-[#FFFBFC]/80",
      text: "text-[#4D373A]",
      border: "border-[#FFFBFC]/40",
    },
  ];

  const themeIndex = (story.storyId || 0) % DANMAKU_THEMES.length;
  const theme = DANMAKU_THEMES[themeIndex];

  const isOwn = story.isOwn;
  const textColorClass = isOwn ? "text-white" : theme.text ;
  const bgClass = isOwn ? "bg-blue-600/60" : theme.bg ;
  const bgHoverClass = isOwn ? "hover:bg-blue-600/80" : theme.bgHover;
  const borderClass = isOwn ? "border-blue-400/30" : theme.border;

  return (
    <BubbleButton
      as="div"
      onClick={() => onClick(story)}
      className={`${styles.item} group relative inline-block rounded-2xl p-4 text-sm font-semibold ${textColorClass} cursor-pointer transition-colors duration-300 border backdrop-blur-sm ${bgClass} ${bgHoverClass} ${borderClass} hover:border-opacity-50`}
      style={{
        top: story._top,
        animationDuration: `${story._duration}s`,
        animationDelay: `${story._delay}s`,
      }}
      bubbleColor={isOwn ? "#2563eb" : colors.primaryRed}
    >
      <span className="line-clamp-3 break-words">{story.storyContent}</span>
    </BubbleButton>
  );
};

export default DanmakuItem;
