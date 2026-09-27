import React, { useState } from "react"
import { Plus } from "lucide-react"
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import { QUICK_REACTIONS } from "../../utils/reactionUtils"

/**
 * FloatingReactionsBar — quick floating pill containing 6 popular reaction emojis
 * and an expand button to open the full EmojiPickerWrapper.
 *
 * @param {function} onReact - Callback when an emoji is chosen: (emoji: string) => void
 * @param {boolean}  isOwn - Whether message is sent by current user
 */
const FloatingReactionsBar = ({ onReact, isOwn = false }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const handleSelectEmoji = (emoji) => {
    if (onReact) {
      onReact(emoji)
    }
    setIsPickerOpen(false)
  }

  return (
    <div
      className={`absolute -top-9 z-20 flex items-center gap-0.5 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xs px-2 py-1 rounded-full shadow-md border border-border/60 transition-all duration-150 ${
        isOwn ? "right-0" : "left-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onReact && onReact(emoji)}
          className="text-base p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-700/60 hover:scale-125 active:scale-95 transition-transform duration-150 leading-none select-none"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}

      {/* Full Emoji Picker button */}
      <Popover
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        placement="top"
        trigger={
          <button
            type="button"
            className="flex items-center justify-center w-6 h-6 rounded-full text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-700/60 hover:scale-110 active:scale-95 transition-all ml-0.5"
            title="More reactions"
          >
            <Plus size={15} />
          </button>
        }
        content={() => (
          <div className="z-50">
            <EmojiPickerWrapper
              onSelect={handleSelectEmoji}
              width="300px"
              height="350px"
            />
          </div>
        )}
      />
    </div>
  )
}

export default React.memo(FloatingReactionsBar)
