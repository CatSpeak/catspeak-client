import { createContext, useContext, useMemo, useState } from "react"
import { translations, languageNames } from "@/shared/i18n"

const defaultContextValue = {
  language: "vi",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.vi || translations.en || {},
  languageName: languageNames.vi || "Tiếng Việt",
}

const LanguageContext = createContext(defaultContextValue)

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
