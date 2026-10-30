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
  className = "",
  ...props
}) => {
  const handleEmojiClick = (emojiData) => {
    if (onSelect) {
      onSelect(emojiData.emoji)
    }
  }

  // Parse numeric values if passed as string (e.g. "320px" -> 320)
  const numericWidth =
    typeof width === "number" ? width : parseInt(width, 10) || 320
  const numericHeight =
    typeof height === "number" ? height : parseInt(height, 10) || 380

  const containerStyle = {
    width: `min(${numericWidth}px, calc(100vw - 16px))`,
    height: `min(${numericHeight}px, calc(100vh - 24px))`,
    "--epr-highlight-color": "#990011",
    "--epr-category-icon-active-color": "#990011",
    "--epr-focus-bg-color": "#fce8e6",
    "--epr-hover-bg-color": "#f9f9f9",
    "--epr-picker-border-color": "#e5e5e5",
    "--epr-picker-border-radius": "12px",
    "--epr-search-input-bg-color": "#f5f5f5",
    "--epr-search-input-bg-color-active": "#ffffff",
  }

  return (
    <div
      className={`catspeak-emoji-picker-container shadow-lg border border-[#E5E5E5] rounded-xl overflow-hidden bg-white max-w-[calc(100vw-16px)] max-h-[calc(100vh-24px)] [&_.epr-preview]:!hidden [&_.epr-footer]:!hidden [&_.epr-category-nav]:overflow-x-auto [&_.epr-category-nav]:scrollbar-none ${className}`}
      style={containerStyle}
    >
      <Suspense
        fallback={
          <div
            className="flex items-center justify-center bg-white"
            style={{
              width: `min(${numericWidth}px, calc(100vw - 16px))`,
              height: `min(${numericHeight}px, calc(100vh - 24px))`,
            }}
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
            showPreview: false,
          }}
          {...props}
        />
      </Suspense>
    </div>
  )
}

export default EmojiPickerWrapper
