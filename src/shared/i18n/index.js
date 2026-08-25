import vi from "./locales/vi"
import en from "./locales/en"
import zh from "./locales/zh"
import ja from "./locales/ja"

import { billingTranslations } from "@/features/billing/i18n"
import { profileTranslations } from "@/features/profile/i18n"
import { chatTranslations } from "@/features/chat/i18n"
import { websitesTranslations } from "@/features/websites/i18n"
import { newsTranslations } from "@/features/news/i18n"
import { bankAccountsTranslations } from "@/features/bank-accounts/i18n"
import { refundTranslations } from "@/features/refunds/i18n"
import { materialsTranslations } from "@/features/materials/i18n"
import { landingTranslations } from "@/features/landing/i18n"
import { voucherTranslations } from "@/features/vouchers/i18n"
import { bugReportTranslations } from "@/features/bug-report/i18n"

const isObject = (item) =>
  Boolean(item && typeof item === "object" && !Array.isArray(item))

// Helper to deeply merge multiple translation objects safely
const deepMerge = (...objects) => {
  return objects.reduce((target, source) => {
    if (!source) return target
    const result = { ...target }
    for (const key of Object.keys(source)) {
      if (
        isObject(source[key]) &&
        Object.prototype.hasOwnProperty.call(result, key) &&
        isObject(result[key])
      ) {
        result[key] = deepMerge(result[key], source[key])
      } else {
        result[key] = source[key]
      }
    }
    return result
  }, {})
}

export const translations = {
  vi: deepMerge(
    vi,
    billingTranslations.vi,
    profileTranslations.vi,
    chatTranslations.vi,
    websitesTranslations.vi,
    newsTranslations.vi,
    bankAccountsTranslations.vi,
    refundTranslations.vi,
    materialsTranslations.vi,
    landingTranslations.vi,
    voucherTranslations.vi,
    bugReportTranslations.vi,
  ),
  en: deepMerge(
    en,
    billingTranslations.en,
    profileTranslations.en,
    chatTranslations.en,
    websitesTranslations.en,
    newsTranslations.en,
    bankAccountsTranslations.en,
    refundTranslations.en,
    materialsTranslations.en,
    landingTranslations.en,
    voucherTranslations.en,
    bugReportTranslations.en,
  ),
  zh: deepMerge(
    zh,
    billingTranslations.zh,
    profileTranslations.zh,
    chatTranslations.zh,
    websitesTranslations.zh,
    newsTranslations.zh,
    bankAccountsTranslations.zh,
    refundTranslations.zh,
    materialsTranslations.zh,
    landingTranslations.zh,
    voucherTranslations.zh,
    bugReportTranslations.zh,
  ),
  ja: deepMerge(
    ja,
    billingTranslations.ja,
    profileTranslations.ja,
    chatTranslations.ja,
    websitesTranslations.ja,
    newsTranslations.ja,
    bankAccountsTranslations.ja,
    refundTranslations.ja,
    materialsTranslations.ja,
    landingTranslations.ja,
    voucherTranslations.ja,
  ),
}

export const languageNames = {
  vi: "Tiếng Việt",
  en: "English",
  zh: "中文",
  ja: "日本語",
}

// Export default để backward compatibility
export default translations
