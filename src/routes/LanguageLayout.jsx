import { useEffect } from "react"
import { useParams, Navigate, Outlet } from "react-router-dom"
import { useGlobalPresence } from "@/shared/context/GlobalPresenceContext"

const SUPPORTED_LANGUAGES = ["en", "zh", "vi"]

const LanguageLayout = () => {
  const { lang } = useParams()
  const { setPresenceLanguage } = useGlobalPresence()

  useEffect(() => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setPresenceLanguage(lang)
    }
  }, [lang, setPresenceLanguage])

  // Validate language
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    return <Navigate to="/en" replace />
  }

  // Pass language down via Outlet context
  return <Outlet context={{ lang }} />
}

export default LanguageLayout
