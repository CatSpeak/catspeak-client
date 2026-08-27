import { useEffect } from "react"
import { useParams, Navigate, Outlet } from "react-router-dom"
import { useGlobalPresence } from "@/shared/context/GlobalPresenceContext"

const DEFAULT_SUPPORTED_LANGUAGES = ["zh", "en", "ja"]

const LanguageLayout = ({ supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES }) => {
  const { lang } = useParams()
  const { setPresenceLanguage } = useGlobalPresence()

  useEffect(() => {
    if (supportedLanguages.includes(lang)) {
      setPresenceLanguage(lang)
    }
  }, [lang, supportedLanguages, setPresenceLanguage])

  // Validate language - always default to zh community if invalid or broken
  if (!supportedLanguages.includes(lang)) {
    return <Navigate to="/zh/community" replace />
  }

  // Pass language down via Outlet context
  return <Outlet context={{ lang }} />
}

export default LanguageLayout
