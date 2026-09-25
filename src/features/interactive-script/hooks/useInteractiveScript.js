import { useState, useCallback, useMemo, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useGetRandomScriptQuery } from "@/store/api/interactiveScriptApi"
import { useLanguage } from "@/shared/context/LanguageContext"

const langMap = {
  vi: "Vietnamese",
  en: "English",
  zh: "Chinese",
  ja: "Japanese"
}

export const useInteractiveScript = () => {
  const { lang } = useParams()
  const language = lang || localStorage.getItem("communityLanguage") || "en"
  const languageCommunity = langMap[language] || "English"
  const [currentScriptId, setCurrentScriptId] = useState(null)
  
  const { data: apiScript, isFetching: isFading, refetch } = useGetRandomScriptQuery({
    languageCommunity,
    currentScriptId
  })

  const [showHint, setShowHint] = useState(() => {
    return localStorage.getItem("catspeak_script_hint_seen") !== "true"
  })
  const [showTranslation, setShowTranslation] = useState(false)
  const [activePopoverKey, setActivePopoverKey] = useState(null)
  
  const { language: appLanguage } = useLanguage()

  const [selectedLanguagePair, setSelectedLanguagePair] = useState(() => {
    const saved = localStorage.getItem("catspeak_lang_pair")
    const currentLang = language
    
    if (saved && saved.startsWith(`${currentLang}-`)) {
      // If we saved an explicit choice for this community, use it, unless they just changed app language
      // Actually, we'll let useEffect handle app language changes
      return saved
    }
    
    // Default targets based on community and app language
    const target = currentLang === appLanguage ? (currentLang === 'en' ? 'vi' : 'en') : appLanguage
    return `${currentLang}-${target}`
  })

  // When app language changes, automatically update the target language to match it
  // (unless the app language is the same as the community language)
  useEffect(() => {
    if (appLanguage !== language) {
      const newPair = `${language}-${appLanguage}`;
      setSelectedLanguagePair(newPair);
      localStorage.setItem("catspeak_lang_pair", newPair);
    }
  }, [appLanguage, language])

  const currentScript = useMemo(() => {
    if (!apiScript) return { id: 0, title: "", contentSegments: [] }

    // Parse content segments based on highlights
    let segments = []
    let content = apiScript.content || ""
    
    if (apiScript.highlights && apiScript.highlights.length > 0) {
      const phrases = apiScript.highlights.map(h => h.phrase)
      // Create a regex to split by highlights
      // Escape special characters in phrases
      const escapedPhrases = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      const regex = new RegExp(`(${escapedPhrases.join("|")})`, "gi")
      
      const parts = content.split(regex)
      parts.forEach(part => {
        if (!part) return
        const isMatch = phrases.some(p => p.toLowerCase() === part.toLowerCase())
        if (isMatch) {
          segments.push({ text: part, isHighlighted: true })
        } else {
          segments.push({ text: part, isHighlighted: false })
        }
      })
    } else {
      segments = [{ text: content, isHighlighted: false }]
    }

    return {
      id: apiScript.id,
      topic: languageCommunity,
      title: apiScript.title,
      allowTranslation: apiScript.isParagraphTranslationEnabled,
      contentSegments: segments,
      featuredQuote: apiScript.highlightPhrase,
    }
  }, [apiScript, languageCommunity])

  const handleShuffleScript = useCallback(() => {
    if (currentScript?.id) {
      setCurrentScriptId(currentScript.id)
    }
    refetch()
    setShowTranslation(false)
  }, [currentScript, refetch])

  const dismissHint = useCallback(() => {
    if (showHint) {
      setShowHint(false)
      localStorage.setItem("catspeak_script_hint_seen", "true")
    }
  }, [showHint])

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

  const handleLanguageChange = useCallback((lang) => {
    setSelectedLanguagePair(lang)
    localStorage.setItem("catspeak_lang_pair", lang)
  }, [])

  return {
    currentScript,
    isFading,
    showHint,
    showTranslation,
    activePopoverKey,
    selectedLanguagePair,
    handleShuffleScript,
    dismissHint,
    toggleTranslation,
    togglePopover,
    handleLanguageChange,
  }
}
