import React, { Suspense } from "react"

// Lazy load the emoji-picker-react component to optimize initial bundle size/chunking
const EmojiPicker = React.lazy(() => import("emoji-picker-react"))

/**
 * Reusable, themed wrapper for the emoji picker.
 *
 * CSS variables are overridden to align the picker style with CatSpeak's
 * primary red (#990011) color palette, rounded borders, and light/neutral backgrounds.
 *
 * @param {function} onSelect - Callback when an emoji is clicked. Returns the emoji string.
 * @param {string}   width    - Width of the picker (default: '320px')
 * @param {string}   height   - Height of the picker (default: '380px')
 * @param {object}   props    - Additional props passed to the emoji-picker-react component
 */
const EmojiPickerWrapper = ({
  onSelect,
  width = "320px",
  height = "380px",
  ...props
}) => {
  const handleEmojiClick = (emojiData, event) => {
    if (onSelect) {
      onSelect(emojiData.emoji)
    }
  }

  return (
    <div
      className="catspeak-emoji-picker-container shadow-lg border border-[#E5E5E5] rounded-xl overflow-hidden bg-white"
      style={{
        width,
        height,
      }}
    >
      <Suspense
        fallback={
          <div
            className="flex items-center justify-center bg-white"
            style={{ width, height }}
          >
            <div className="w-8 h-8 border-4 border-t-[#990011] border-r-transparent border-b-[#990011] border-l-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          width="100%"
          height="100%"
          emojiStyle="native"
          lazyLoadEmojis={true}
          autoFocusSearch={false}
          previewConfig={{
            showPreview: true,
            defaultEmoji: "😺",
            defaultCaption: "Cat Speak Emoji",
          }}
          {...props}
        />
      </Suspense>
    </div>
  )
}

export default EmojiPickerWrapper
