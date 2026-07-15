import vi from "./locales/vi"
import en from "./locales/en"
import zh from "./locales/zh"

import { billingTranslations } from "@/features/billing/i18n"
import { profileTranslations } from "@/features/profile/i18n"

// Helper to deeply merge multiple translation objects
const deepMerge = (...objects) => {
  return objects.reduce((target, source) => {
    if (!source) return target
    const result = { ...target }
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        result[key] = deepMerge(target[key], source[key])
      } else {
        result[key] = source[key]
      }
    }
    return result
  }, {})
}

export const translations = {
  vi: deepMerge(vi, billingTranslations.vi, profileTranslations.vi /*, authTranslations.vi, dashboardTranslations.vi */),
  en: deepMerge(en, billingTranslations.en, profileTranslations.en /*, authTranslations.en, dashboardTranslations.en */),
  zh: deepMerge(zh, billingTranslations.zh, profileTranslations.zh /*, authTranslations.zh, dashboardTranslations.zh */),
}

export const languageNames = {
  vi: "Tiếng Việt",
  en: "English",
  zh: "中文",
}

// Export default để backward compatibility
export default translations
