import maleAvatar from "@/shared/assets/images/avatars/Artboard 1.svg"
import femaleAvatar from "@/shared/assets/images/avatars/Artboard 2.svg"

export const LANGUAGE_CODE_MAP = {
  english: "en",
  en: "en",
  eng: "en",
  "tiếng anh": "en",
  "tieng anh": "en",
  vietnamese: "vi",
  vi: "vi",
  vie: "vi",
  "tiếng việt": "vi",
  "tieng viet": "vi",
  chinese: "zh",
  zh: "zh",
  chi: "zh",
  zho: "zh",
  "中文": "zh",
  "tiếng trung": "zh",
  "tieng trung": "zh",
  "tiếng hoa": "zh",
  "tieng hoa": "zh",
  japanese: "ja",
  ja: "ja",
  jp: "ja",
  jpn: "ja",
  "tiếng nhật": "ja",
  "tieng nhat": "ja",
  korean: "ko",
  ko: "ko",
  kor: "ko",
  "tiếng hàn": "ko",
  "tieng han": "ko",
  french: "fr",
  fr: "fr",
  fra: "fr",
  "tiếng pháp": "fr",
  "tieng phap": "fr",
  german: "de",
  de: "de",
  deu: "de",
  "tiếng đức": "de",
  "tieng duc": "de",
  spanish: "es",
  es: "es",
  spa: "es",
  "tiếng tây ban nha": "es",
  "tieng tay ban nha": "es",
  russian: "ru",
  ru: "ru",
  rus: "ru",
  "tiếng nga": "ru",
  "tieng nga": "ru",
  italian: "it",
  it: "it",
  ita: "it",
  "tiếng ý": "it",
  "tieng y": "it",
  thai: "th",
  th: "th",
  tha: "th",
  "tiếng thái": "th",
  "tieng thai": "th",
  portuguese: "pt",
  pt: "pt",
  por: "pt",
}

export const LANGUAGE_MAP = {
  english: "Anh",
  en: "Anh",
  eng: "Anh",
  "tiếng anh": "Anh",
  "tieng anh": "Anh",
  vietnamese: "Việt",
  vi: "Việt",
  vie: "Việt",
  "tiếng việt": "Việt",
  "tieng viet": "Việt",
  chinese: "Trung",
  zh: "Trung",
  chi: "Trung",
  zho: "Trung",
  "中文": "Trung",
  "tiếng trung": "Trung",
  "tieng trung": "Trung",
  "tiếng hoa": "Trung",
  "tieng hoa": "Trung",
  japanese: "Nhật",
  ja: "Nhật",
  jp: "Nhật",
  jpn: "Nhật",
  "tiếng nhật": "Nhật",
  "tieng nhat": "Nhật",
  korean: "Hàn",
  ko: "Hàn",
  kor: "Hàn",
  "tiếng hàn": "Hàn",
  "tieng han": "Hàn",
  french: "Pháp",
  fr: "Pháp",
  fra: "Pháp",
  "tiếng pháp": "Pháp",
  "tieng phap": "Pháp",
  german: "Đức",
  de: "Đức",
  deu: "Đức",
  "tiếng đức": "Đức",
  "tieng duc": "Đức",
  spanish: "Tây Ban Nha",
  es: "Tây Ban Nha",
  spa: "Tây Ban Nha",
  "tiếng tây ban nha": "Tây Ban Nha",
  "tieng tay ban nha": "Tây Ban Nha",
  russian: "Nga",
  ru: "Nga",
  rus: "Nga",
  "tiếng nga": "Nga",
  "tieng nga": "Nga",
  italian: "Ý",
  it: "Ý",
  ita: "Ý",
  "tiếng ý": "Ý",
  "tieng y": "Ý",
  thai: "Thái",
  th: "Thái",
  tha: "Thái",
  "tiếng thái": "Thái",
  "tieng thai": "Thái",
}

export const getFallbackAvatarByGender = (gender) => {
  if (gender === null || gender === undefined || gender === "") {
    return null
  }
  const normalized = String(gender).toLowerCase().trim()
  if (
    normalized === "female" ||
    normalized === "f" ||
    normalized === "nữ" ||
    normalized === "nu" ||
    normalized === "woman" ||
    normalized === "girl" ||
    normalized === "1"
  ) {
    return femaleAvatar // Artboard 2.svg (Nữ)
  }
  if (
    normalized === "male" ||
    normalized === "m" ||
    normalized === "nam" ||
    normalized === "man" ||
    normalized === "boy" ||
    normalized === "0"
  ) {
    return maleAvatar // Artboard 1.svg (Nam)
  }
  return null
}

export const getLocalizedLanguageName = (rawLang, t, language = "vi") => {
  if (!rawLang) return ""
  const str = String(rawLang).trim()
  const lower = str.toLowerCase()
  const langCode = LANGUAGE_CODE_MAP[lower]

  if (langCode && t?.landing?.leadingTeam?.languages?.[langCode]) {
    return t.landing.leadingTeam.languages[langCode]
  }
  // LANGUAGE_MAP is Vietnamese-only; only use for vi UI to avoid mixed language (e.g., "Giảng viên tiếng 英語")
  if (language === "vi" && LANGUAGE_MAP[lower]) {
    return LANGUAGE_MAP[lower]
  }
  if (lower.startsWith("tiếng ")) {
    const after = str.slice(6).trim()
    return after.charAt(0).toUpperCase() + after.slice(1)
  }
  if (lower.startsWith("tieng ")) {
    const after = str.slice(6).trim()
    return after.charAt(0).toUpperCase() + after.slice(1)
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const parseLanguages = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const getInstructorRole = (languages, t, language = "vi") => {
  const defaultRole =
    t?.landing?.leadingTeam?.defaultRole || "Giảng viên CatSpeak"

  if (!languages || languages.length === 0) return defaultRole

  const names = languages
    .map((l) => {
      const raw = typeof l === "object" ? l.language || l.name : l
      return getLocalizedLanguageName(raw, t, language)
    })
    .filter(Boolean)

  const uniqueNames = [...new Set(names)]
  if (uniqueNames.length === 0) return defaultRole

  if (language === "en") {
    return `${uniqueNames.join(", ")} Instructor`
  }
  if (language === "zh") {
    return `${uniqueNames.join("、")}导师`
  }
  if (language === "ja") {
    return `${uniqueNames.join("、")}講師`
  }
  return `Giảng viên tiếng ${uniqueNames.join(", ")}`
}

