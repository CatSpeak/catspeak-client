import { useState, useCallback } from "react"

/**
 * Custom hook to manage emoji picker state and logic.
 * Handles recently used emojis list stored in localStorage
 * and handles cursor-aware text insertion.
 */
export const useEmojiPicker = () => {
  const [recentEmojis, setRecentEmojis] = useState(() => {
    try {
      const stored = localStorage.getItem("catspeak_recent_emojis")
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.warn("Failed to load recent emojis from localStorage:", e)
      return []
    }
  })

  // Add emoji to recently used list
  const addRecent = useCallback((emoji) => {
    setRecentEmojis((prev) => {
      const filtered = prev.filter((item) => item !== emoji)
      const next = [emoji, ...filtered].slice(0, 32)
      try {
        localStorage.setItem("catspeak_recent_emojis", JSON.stringify(next))
      } catch (e) {
        console.warn("Failed to save recent emojis to localStorage:", e)
      }
      return next
    })
  }, [])

  // Insert emoji at the current cursor position in a textarea or input field
  const insertEmoji = useCallback((emoji, inputRefOrElement, value, onChange) => {
    const input = inputRefOrElement?.current || inputRefOrElement
    if (!input) return

    const start = input.selectionStart ?? value.length
    const end = input.selectionEnd ?? value.length
    const before = value.substring(0, start)
    const after = value.substring(end, value.length)
    const newValue = before + emoji + after

    onChange(newValue)

    // Wait for the DOM / state update to finish, then restore focus and cursor position
    setTimeout(() => {
      input.focus()
      const newCursorPos = start + emoji.length
      input.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [])

  return {
    recentEmojis,
    addRecent,
    insertEmoji,
  }
}

export default useEmojiPicker
