import React from "react"
import { Plus } from "lucide-react"
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import { QUICK_REACTIONS } from "../../utils/reactionUtils"

/**
 * FloatingReactionsBar — popover pill containing 6 popular reaction emojis
 * and an expand button to open the full EmojiPickerWrapper.
 *
 * @param {function} onReact - Callback when an emoji is chosen: (emoji: string) => void
 * @param {function} onClose - Callback to close parent popover
 * @param {boolean}  isOwn - Whether message is sent by current user
 * @param {string}   className - Additional CSS classes
 */
const FloatingReactionsBar = ({
  onReact,
  onClose,
  isOwn = false,
  className = "",
}) => {
  const handleSelectEmoji = (emoji) => {
    if (onReact) {
      onReact(emoji)
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <div
      className={`flex items-center gap-0.5 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-lg border border-neutral-200/80 transition-all duration-150 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleSelectEmoji(emoji)}
          className="text-lg p-1 rounded-full hover:bg-neutral-100 hover:scale-125 active:scale-95 transition-transform duration-150 leading-none select-none cursor-pointer"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}

      {/* Full Emoji Picker button */}
      <Popover
        placement={isOwn ? "top-right" : "top-left"}
        trigger={
          <button
            type="button"
            className="flex items-center justify-center w-7 h-7 rounded-full text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 hover:scale-110 active:scale-95 transition-all ml-0.5 cursor-pointer"
            title="More reactions"
          >
            <Plus size={16} />
          </button>
        }
        content={(closePicker) => (
          <div className="z-50 shadow-2xl rounded-2xl overflow-hidden border border-neutral-200/80 bg-white">
            <EmojiPickerWrapper
              onSelect={(emoji) => {
                closePicker()
                handleSelectEmoji(emoji)
              }}
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
