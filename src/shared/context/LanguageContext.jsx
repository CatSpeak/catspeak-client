import { createContext, useContext, useMemo, useState, useEffect } from "react"
import { translations, languageNames } from "@/shared/i18n"

const defaultContextValue = {
  language: "vi",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.vi || translations.en || {},
  languageName: languageNames.vi || "Tiếng Việt",
}

export const LanguageContext = createContext(defaultContextValue)

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("vi")

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () =>
        setLanguage((prev) => {
          const nextLang = { vi: "en", en: "zh", zh: "ja", ja: "vi" }
          return nextLang[prev] || "vi"
        }),
      t: translations[language] || translations.vi || {},
      languageName: languageNames[language] || "Tiếng Việt",
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
  return context || defaultContextValue
}
