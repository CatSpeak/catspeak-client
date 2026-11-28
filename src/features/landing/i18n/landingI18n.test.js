import { describe, expect, it } from "vitest"
import en from "./en"
import ja from "./ja"
import vi from "./vi"
import zh from "./zh"

const locales = { vi, en, zh, ja }

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

describe("ISS-48: landing i18n has the same shape in vi/en/zh/ja", () => {
  const sections = [
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
  ]

  it.each(sections)("%s has every key in all four languages", (section) => {
    const viKeys = flattenKeys(vi.landing[section])
    for (const lang of ["en", "zh", "ja"]) {
      const otherKeys = new Set(flattenKeys(locales[lang].landing[section]))
      const missing = viKeys.filter((key) => !otherKeys.has(key))
      expect(missing, `${lang}.landing.${section}`).toEqual([])
    }
  })

  it("keeps list lengths aligned across languages", () => {
    for (const section of sections) {
      const viValue = vi.landing[section]
      for (const lang of ["en", "zh", "ja"]) {
        const other = locales[lang].landing[section]
        for (const [key, value] of Object.entries(viValue)) {
          if (Array.isArray(value)) {
            expect(other[key], `${lang}.landing.${section}.${key}`).toHaveLength(
              value.length,
            )
          }
        }
      }
    }
  })
})

describe("ISS-48: Hero zh/ja no longer repeat the community word", () => {
  it("removes the duplicate 社区 from the zh hero", () => {
    expect(zh.landing.hero.titlePrefix).not.toContain("社区")
    expect(zh.landing.hero.titleHighlight).toBe("社区伙伴")
  })

  it("removes the duplicate コミュニティ/仲間 from the ja hero", () => {
    expect(ja.landing.hero.titlePrefix).not.toContain("コミュニティ")
    expect(ja.landing.hero.titleHighlight).toBe("コミュニティ")
    expect(ja.landing.hero.titleSuffix).not.toContain("仲間")
  })
})
