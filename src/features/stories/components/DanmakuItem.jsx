import React from "react";
import { BubbleButton } from "@/shared/components/ui/buttons";
import styles from "../styles/danmaku.module.css";
import colors from "@/shared/utils/colors";

/**
 * A single floating danmaku message pill.
 *
 * @param {Object} props
 * @param {Object} props.story - Story data with _top, _duration, _delay, isOwn
 * @param {(story: Object) => void} props.onClick
 */
const DanmakuItem = ({ story, onClick }) => {
  const DANMAKU_THEMES = [
    {
      bg: "bg-[#FFF2EA]",
      text: "text-[#B34700]",
    },
    {
      bg: "bg-[#FFEAED]",
      text: "text-[#990011]",
    },
    {
      bg: "bg-[#FFF9CC]",
      text: "text-[#E2B60A]",
    },
    {
      bg: "bg-[#B2FFD6]",
      text: "text-[#34CE56]",
    },
    {
      bg: "bg-[#E8F2FF]",
      text: "text-[#1D7DFD]",
    },
    {
      bg: "bg-[#F6F2FF]",
      text: "text-[#6D49BF]",
    },
    {
      bg: "bg-[#FFFBFC]",
      text: "text-[#4D373A]",
    },
  ];

  const themeIndex = (story.storyId || 0) % DANMAKU_THEMES.length;
  const theme = DANMAKU_THEMES[themeIndex];

  return (
    <BubbleButton
      as="div"
      onClick={() => onClick(story)}
      className={`${styles.item} group relative inline-block rounded-2xl p-4 text-sm font-semibold text-white shadow cursor-pointer transition-colors ${
        story.isOwn
          ? "bg-blue-600 hover:bg-blue-700"
          : `${theme.bg} ${theme.text}`
      }`}
      style={{
        top: story._top,
        animationDuration: `${story._duration}s`,
        animationDelay: `${story._delay}s`,
      }}
      bubbleColor={story.isOwn ? "#2563eb" : colors.primaryRed}
    >
      <span className="line-clamp-3 break-words">{story.storyContent}</span>
    </BubbleButton>
  );
};

export default DanmakuItem;
