import { useState, useCallback } from "react"

export const useInteractiveScript = (scriptsPool) => {
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [showHint, setShowHint] = useState(() => {
    return localStorage.getItem("catspeak_script_hint_seen") !== "true"
  })
  const [showTranslation, setShowTranslation] = useState(false)
  const [activePopoverKey, setActivePopoverKey] = useState(null)

  const currentScript = scriptsPool[currentScriptIndex] || scriptsPool[0]

  const handleShuffleScript = useCallback(() => {
    if (scriptsPool.length <= 1) return

    setIsFading(true)
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * scriptsPool.length)
      if (nextIndex === currentScriptIndex) {
        nextIndex = (currentScriptIndex + 1) % scriptsPool.length
      }
      setCurrentScriptIndex(nextIndex)
      setShowTranslation(false)
      setIsFading(false)
    }, 150)
  }, [scriptsPool, currentScriptIndex])

  /** Ẩn hint khi user click lần đầu vào từ */
  const dismissHint = useCallback(() => {
    if (showHint) {
      setShowHint(false)
      localStorage.setItem("catspeak_script_hint_seen", "true")
    }
  }, [showHint])

  /** Tra cứu dữ liệu từ vựng cho một segment / từ */
  const resolveVocabData = useCallback((segment, wordToken = null) => {
    const clickedText = wordToken || segment.text.trim()
    // Sử dụng Unicode flag /gu và \p{L} để giữ lại các ký tự có dấu (Tiếng Việt) hoặc chữ Hán/Nhật
    const vocabKey = segment.vocabKey || clickedText.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")

    if (currentScript.dictionary?.[vocabKey]) {
      return currentScript.dictionary[vocabKey]
    }

    return {
      word: clickedText,
      notFound: true,
    }
  }, [currentScript])

  const toggleTranslation = useCallback(() => {
    setShowTranslation(prev => !prev)
  }, [])

  const togglePopover = useCallback((popoverKey, isOpen) => {
    if (isOpen) {
      setActivePopoverKey(popoverKey)
      dismissHint()
    } else {
      setActivePopoverKey((prev) => prev === popoverKey ? null : prev)
    }
  }, [dismissHint])

  return {
    currentScript,
    isFading,
    showHint,
    showTranslation,
    activePopoverKey,
    handleShuffleScript,
    dismissHint,
    resolveVocabData,
    toggleTranslation,
    togglePopover,
  }
}
