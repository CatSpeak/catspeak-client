import { useRef, useCallback } from "react"

/**
 * Custom hook to encapsulate typing status debouncing logic.
 */
export default function useTypingDebounce({ onStartTyping, onStopTyping }) {
  const typingTimerRef = useRef(null)
  const isTypingRef = useRef(false)

  const stopTypingImmediately = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = null
    }
    if (isTypingRef.current) {
      isTypingRef.current = false
      onStopTyping?.()
    }
  }, [onStopTyping])

  const handleTypingActivity = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      onStartTyping?.()
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false
      onStopTyping?.()
      typingTimerRef.current = null
    }, 2500)
  }, [onStartTyping, onStopTyping])

  return {
    handleTypingActivity,
    stopTypingImmediately,
  }
}
