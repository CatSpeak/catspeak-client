import { createContext, useContext, useMemo, useState } from "react"
import { translations, languageNames } from "@/shared/i18n"

const LanguageContext = createContext(undefined)

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("vi")

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () =>
        setLanguage((prev) => {
          const nextLang = { vi: "en", en: "zh", zh: "vi" }
          return nextLang[prev] || "vi"
        }),
      t: translations[language],
      languageName: languageNames[language],
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
