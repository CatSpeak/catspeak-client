import React from "react"
import { BubbleButton } from "@/shared/components/ui/buttons"
import styles from "../styles/danmaku.module.css"
import colors from "@/shared/utils/colors"

/**
 * A single floating danmaku message pill.
 *
 * @param {Object} props
 * @param {Object} props.story - Story data with _top, _duration, _delay, isOwn
 * @param {(story: Object) => void} props.onClick
 */
const DanmakuItem = ({ story, onClick }) => {
  return (
    <BubbleButton
      as="div"
      onClick={() => onClick(story)}
      className={`${styles.item} group relative inline-block rounded-2xl px-3 py-2 text-sm font-semibold text-white shadow cursor-pointer transition-colors ${
        story.isOwn
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-cath-red-700 hover:bg-[#7a000e]"
      }`}
      style={{
        top: story._top,
        animationDuration: `${story._duration}s`,
        animationDelay: `${story._delay}s`,
      }}
      bubbleColor={story.isOwn ? "#2563eb" : colors.primaryRed}
    >
      <span className="block">{story.storyContent}</span>
    </BubbleButton>
  )
}

export default DanmakuItem
