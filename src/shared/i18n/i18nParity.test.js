import { describe, expect, it } from "vitest"
import { landingTranslations } from "@/features/landing/i18n"
import { aiTutorTranslations } from "@/features/ai-tutor/i18n"
import { materialsTranslations } from "@/features/materials/i18n"
import enAuth from "@/shared/i18n/locales/en/pages/auth"
import enCatSpeak from "@/shared/i18n/locales/en/pages/catSpeak"
import enCommon from "@/shared/i18n/locales/en/common"
import enFooter from "@/shared/i18n/locales/en/components/footer"
import enPlanUsage from "@/shared/i18n/locales/en/pages/planUsage"
import enPolicy from "@/shared/i18n/locales/en/pages/policy"
import jaAuth from "@/shared/i18n/locales/ja/pages/auth"
import jaCatSpeak from "@/shared/i18n/locales/ja/pages/catSpeak"
import jaCommon from "@/shared/i18n/locales/ja/common"
import jaFooter from "@/shared/i18n/locales/ja/components/footer"
import jaPlanUsage from "@/shared/i18n/locales/ja/pages/planUsage"
import jaPolicy from "@/shared/i18n/locales/ja/pages/policy"
import viAuth from "@/shared/i18n/locales/vi/pages/auth"
import viCatSpeak from "@/shared/i18n/locales/vi/pages/catSpeak"
import viCommon from "@/shared/i18n/locales/vi/common"
import viFooter from "@/shared/i18n/locales/vi/components/footer"
import viPlanUsage from "@/shared/i18n/locales/vi/pages/planUsage"
import viPolicy from "@/shared/i18n/locales/vi/pages/policy"
import zhAuth from "@/shared/i18n/locales/zh/pages/auth"
import zhCatSpeak from "@/shared/i18n/locales/zh/pages/catSpeak"
import zhCommon from "@/shared/i18n/locales/zh/common"
import zhFooter from "@/shared/i18n/locales/zh/components/footer"
import zhPlanUsage from "@/shared/i18n/locales/zh/pages/planUsage"
import zhPolicy from "@/shared/i18n/locales/zh/pages/policy"

const dicts = {
  footer: { vi: viFooter, en: enFooter, zh: zhFooter, ja: jaFooter },
  auth: { vi: viAuth, en: enAuth, zh: zhAuth, ja: jaAuth },
  policy: { vi: viPolicy, en: enPolicy, zh: zhPolicy, ja: jaPolicy },
  planUsage: {
    vi: viPlanUsage,
    en: enPlanUsage,
    zh: zhPlanUsage,
    ja: jaPlanUsage,
  },
  common: { vi: viCommon, en: enCommon, zh: zhCommon, ja: jaCommon },
  catSpeak: {
    vi: viCatSpeak,
    en: enCatSpeak,
    zh: zhCatSpeak,
    ja: jaCatSpeak,
  },
  materials: materialsTranslations,
  landing: landingTranslations,
  aiTutor: aiTutorTranslations,
}

const flattenKeys = (value, prefix = "") => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenKeys(item, `${prefix}[${index}]`),
    )
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenKeys(child, prefix ? `${prefix}.${key}` : key),
    )
  }
  return [prefix]
}

const missingKeys = (reference, other) => {
  const otherKeys = new Set(flattenKeys(other))
  return flattenKeys(reference).filter((key) => !otherKeys.has(key))
}

const assertParity = (label, path) => {
  const reference = path ? dicts[label].vi[path] : dicts[label].vi
  for (const lang of ["en", "zh", "ja"]) {
    const other = path ? dicts[label][lang][path] : dicts[label][lang]
    expect(missingKeys(reference, other), `${lang}.${label}.${path}`).toEqual(
      [],
    )
  }
}

describe("ISS-11/35/48/69/75: i18n keys exist in vi, en, zh and ja", () => {
  it("footer dictionary is complete in every language", () => {
    assertParity("footer")
  })

  it("ai-tutor dictionary is complete in every language", () => {
    assertParity("aiTutor")
  })

  it.each([
    "trust",
    "achievements",
    "learningBarriers",
    "solution",
    "coreFeatures",
    "howItWorks",
    "targetAudience",
    "methodComparison",
    "contactSection",
    "contactForm",
    "partnerNetwork",
    "hero",
  ])("landing.%s is complete", (section) => {
    assertParity("landing", section)
  })

  it.each([
    "verifyEmailTitle",
    "verifyEmailOtpSubtitle",
    "emailVerifiedTitle",
    "emailVerifiedSubtitle",
    "backToHome",
    "verifying",
    "validationEmailRequired",
    "validationOtpLength",
    "verifyOtpFailed",
    "otpResentSuccess",
    "sendOtpFailed",
    "otpLabel",
    "otpPlaceholder",
    "emailLabel",
    "verifyOtpButton",
    "resendOtp",
  ])("auth.%s is translated", (key) => {
    for (const lang of ["vi", "en", "zh", "ja"]) {
      expect(dicts.auth[lang][key], `${lang}.auth.${key}`).toBeTruthy()
    }
  })

  it("policy.backToTop is translated", () => {
    for (const lang of ["vi", "en", "zh", "ja"]) {
      expect(dicts.policy[lang].backToTop, `${lang}.policy.backToTop`).toBeTruthy()
    }
  })

  it("planUsage tab and error labels are translated", () => {
    for (const lang of ["vi", "en", "zh", "ja"]) {
      expect(dicts.planUsage[lang].tabUsage, `${lang}.tabUsage`).toBeTruthy()
      expect(dicts.planUsage[lang].errorTitle, `${lang}.errorTitle`).toBeTruthy()
    }
  })

  it("common.organization and comingSoon CTA keys are translated", () => {
    for (const lang of ["vi", "en", "zh", "ja"]) {
      const common = dicts.common[lang]
      expect(common.organization.badge, `${lang}.organization.badge`).toBeTruthy()
      expect(common.organization.title, `${lang}.organization.title`).toBeTruthy()
      expect(
        common.organization.description,
        `${lang}.organization.description`,
      ).toBeTruthy()
      expect(
        common.comingSoon.faqCta,
        `${lang}.comingSoon.faqCta`,
      ).toBeTruthy()
      expect(
        common.comingSoon.goToDashboard,
        `${lang}.comingSoon.goToDashboard`,
      ).toBeTruthy()
    }
  })

  it("reels detail save/saved labels are translated", () => {
    const expected = {
      vi: ["Lưu", "Đã lưu"],
      en: ["Save", "Saved"],
      zh: ["保存", "已保存"],
      ja: ["保存", "保存済み"],
    }
    for (const lang of ["vi", "en", "zh", "ja"]) {
      const detail = dicts.catSpeak[lang].reels.detail
      expect([detail.save, detail.saved], `${lang}.reels.detail`).toEqual(
        expected[lang],
      )
    }
  })

  it("materials upload labels are translated", () => {
    for (const lang of ["vi", "en", "zh", "ja"]) {
      expect(
        dicts.materials[lang].materials.upload,
        `${lang}.materials.upload`,
      ).toBeTruthy()
      expect(
        dicts.materials[lang].materials.publicShareOnUpload,
        `${lang}.materials.publicShareOnUpload`,
      ).toBeTruthy()
    }
  })
})
