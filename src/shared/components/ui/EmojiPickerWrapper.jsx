import React, { Suspense } from "react"
import { useTheme } from "@/shared/context/ThemeContext"

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
  let isDark = false
  try {
    const themeCtx = useTheme()
    isDark = themeCtx?.isDark ?? false
  } catch {
    isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
  }

  const activeTheme = props.theme || (isDark ? "dark" : "light")
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
    "--epr-highlight-color": isDark ? "#FF0033" : "#990011",
    "--epr-category-icon-active-color": isDark ? "#FF0033" : "#990011",
    "--epr-focus-bg-color": isDark ? "#3b1114" : "#fce8e6",
    "--epr-hover-bg-color": isDark ? "#272727" : "#f9f9f9",
    "--epr-bg-color": isDark ? "#1A1A1A" : "#ffffff",
    "--epr-search-input-bg-color": isDark ? "#272727" : "#f5f5f5",
    "--epr-search-input-bg-color-active": isDark ? "#333333" : "#ffffff",
    "--epr-picker-border-radius": "12px",





    "--epr-picker-border-color": isDark ? "#3F3F3F" : "#e5e5e5",

  }

  return (
    <div
      className={`catspeak-emoji-picker-container shadow-lg border border-[#E5E5E5] dark:border-[#3F3F3F] rounded-xl overflow-hidden bg-white dark:bg-[#1A1A1A] max-w-[calc(100vw-16px)] max-h-[calc(100vh-24px)] [&_.epr-preview]:!hidden [&_.epr-footer]:!hidden [&_.epr-category-nav]:overflow-x-auto [&_.epr-category-nav]:scrollbar-none ${className}`}
      style={containerStyle}
    >
      <Suspense
        fallback={
          <div
            className="flex items-center justify-center bg-white dark:bg-[#1A1A1A]"
            style={{
              width: `min(${numericWidth}px, calc(100vw - 16px))`,
              height: `min(${numericHeight}px, calc(100vh - 24px))`,
            }}
          >
            <div className="w-8 h-8 border-4 border-t-[#990011] dark:border-t-red-500 border-r-transparent border-b-[#990011] dark:border-b-red-500 border-l-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <EmojiPicker
          theme={activeTheme}
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
