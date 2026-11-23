import { useEffect } from "react"
import { useParams, useLocation, Navigate, Outlet } from "react-router-dom"
import { useGlobalPresence } from "@/shared/context/GlobalPresenceContext"

const DEFAULT_SUPPORTED_LANGUAGES = ["zh", "en", "ja"]
const LEGACY_LANG_ALIASES = new Set(["vi", "vn"])

const LanguageLayout = ({ supportedLanguages = DEFAULT_SUPPORTED_LANGUAGES }) => {
  const { lang } = useParams()
  const location = useLocation()
  const { setPresenceLanguage } = useGlobalPresence()

  useEffect(() => {
    if (supportedLanguages.includes(lang)) {
      setPresenceLanguage(lang)
    }
  }, [lang, supportedLanguages, setPresenceLanguage])

  // Validate language - always default to zh community if invalid or broken
  if (!supportedLanguages.includes(lang)) {
    // Keep old shared links working: /vn/... and /vi/... map to the Chinese community.
    if (lang && LEGACY_LANG_ALIASES.has(lang.toLowerCase())) {
      const fallbackLang = supportedLanguages[0] || "zh"
      const restPath = location.pathname.slice(lang.length + 1)
      if (restPath && restPath !== "/") {
        return (
          <Navigate
            to={`/${fallbackLang}${restPath}${location.search}${location.hash}`}
            replace
          />
        )
      }
    }
    return <Navigate to="/zh/community" replace />
  }

  // Pass language down via Outlet context
  return <Outlet context={{ lang }} />
}

export default LanguageLayout
