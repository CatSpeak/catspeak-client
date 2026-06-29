import React from "react"
import DanmakuItem from "./DanmakuItem"
import StoryCardItem from "./StoryCardItem"

/**
 * The danmaku stage container. Renders floating message pills inside
 * a bordered, overflow-hidden area that grows to fill available space.
 *
 * @param {Object} props
 * @param {Array} props.danmakuItems - Items with _idx, _top, _duration, _delay
 * @param {React.RefObject} props.stageRef - Ref for ResizeObserver
 * @param {(story: Object) => void} props.onItemClick
 * @param {"grid"|"float"} [props.displayMode="float"]
 */
const DanmakuStage = ({
  danmakuItems,
  stageRef,
  onItemClick,
  displayMode = "float",
}) => {
  if (displayMode === "grid") {
    return (
      <div
        ref={stageRef}
        className="relative w-full flex-1 min-h-0 overflow-y-auto rounded-xl border border-[#C6C6C6] p-3"
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
          {danmakuItems.map((story) => (
            <StoryCardItem
              key={story._idx}
              story={story}
              onClick={() => onItemClick(story)}
              className="w-full max-w-none max-h-none"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={stageRef}
      className="relative w-full flex-1 min-h-0 overflow-hidden rounded-xl border border-[#C6C6C6]"
    >
      {danmakuItems.map((story) => (
        <DanmakuItem
          key={story._idx}
          story={story}
          onClick={onItemClick}
        />
      ))}
    </div>
  )
}

export default DanmakuStage
