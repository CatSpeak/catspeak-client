export const COURSE_FORM_LANGUAGES = [
  {
    id: 1,
    name: "English",
    levels: ["A1", "A2", "B1", "B2", "C1", "C2"].map((name, index) => ({ id: index + 1, name })),
  },
  {
    id: 2,
    name: "Chinese",
    levels: ["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6", "HSK 7", "HSK 8", "HSK 9"].map((name, index) => ({ id: index + 1, name })),
  },
  {
    id: 3,
    name: "Vietnamese",
    levels: ["A1", "A2", "B1", "B2"].map((name, index) => ({ id: index + 1, name })),
  },
  {
    id: 4,
    name: "Japanese",
    levels: ["N5", "N4", "N3", "N2", "N1"].map((name, index) => ({ id: index + 1, name })),
  },
]

export const DEFAULT_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
  .map((name, index) => ({ id: index + 1, name }))

/**
 * Return the level options for a given language name.
 * Looks up COURSE_FORM_LANGUAGES first, then falls back to DEFAULT_LEVELS.
 */
export function getLevelsForLanguage(langName) {
  const norm = (langName || "").trim().toLowerCase()
  if (!norm) return DEFAULT_LEVELS

  const matched = COURSE_FORM_LANGUAGES.find(
    (l) => (l.name || "").trim().toLowerCase() === norm
  )
  if (matched) return matched.levels

  if (norm.includes("chinese") || norm.includes("zh") || norm.includes("trung")) {
    return COURSE_FORM_LANGUAGES.find((l) => l.name === "Chinese")?.levels || DEFAULT_LEVELS
  }

  if (norm === "ja" || norm.includes("japan") || norm.includes("nhật") || norm.includes("nhat")) {
    return COURSE_FORM_LANGUAGES.find((l) => l.name === "Japanese")?.levels || DEFAULT_LEVELS
  }

  return DEFAULT_LEVELS
}

export const DEFAULT_CLASS_FEE_TIERS = [
  { minSlots: 1, maxSlots: 6, openingFee: 0, commissionRate: 10 },
  { minSlots: 7, maxSlots: 20, openingFee: 200000, commissionRate: 12 },
  { minSlots: 21, maxSlots: 50, openingFee: 500000, commissionRate: 15 },
  { minSlots: 51, maxSlots: Infinity, openingFee: 0, commissionRate: 20 },
]

export const getLocalizedLanguageName = (langName, t) => {
  if (!langName) return ""
  const key = String(langName).trim().toLowerCase()
  const langMap = t?.courses?.student?.languages || {}
  const canonicalName = {
    en: "English",
    english: "English",
    zh: "Chinese",
    chinese: "Chinese",
    vi: "Vietnamese",
    vietnamese: "Vietnamese",
    ja: "Japanese",
    japanese: "Japanese",
  }[key]
  if (canonicalName && langMap[canonicalName]) return langMap[canonicalName]
  return langName
}

/**
 * Safely parse raw languagesTeach data from an instructor profile.
 * Supports:
 *  - Array of objects: [{ language: "English", level: "B2" }, ...]
 *  - Array of strings: ["English", "Chinese"]
 *  - JSON string representing either of the above
 *  - Comma-separated string: "English, Chinese"
 */
export function extractInstructorLanguages(profile) {
  if (!profile) return []
  const raw =
    profile.languagesTeach ||
    profile.LanguagesTeach ||
    profile.data?.languagesTeach ||
    profile.data?.LanguagesTeach
  if (!raw) return []

  let parsed = raw
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        parsed = JSON.parse(trimmed)
      } catch {
        parsed = trimmed.split(",").map((s) => s.trim()).filter(Boolean)
      }
    } else {
      parsed = trimmed.split(",").map((s) => s.trim()).filter(Boolean)
    }
  }

  if (!Array.isArray(parsed)) {
    if (typeof parsed === "string") {
      parsed = [parsed]
    } else if (typeof parsed === "object" && parsed !== null) {
      parsed = [parsed]
    } else {
      return []
    }
  }

  const langNames = new Set()
  parsed.forEach((item) => {
    if (typeof item === "string" && item.trim()) {
      langNames.add(item.trim())
    } else if (typeof item === "object" && item !== null) {
      const name = item.language || item.Language || item.name || item.Name
      if (typeof name === "string" && name.trim()) {
        langNames.add(name.trim())
      }
    }
  })

  return Array.from(langNames)
}

/**
 * Filter COURSE_FORM_LANGUAGES based on taught languages in the instructor's profile.
 * If profile data is missing/empty, returns COURSE_FORM_LANGUAGES as fallback.
 */
export function getInstructorFormLanguages(profile) {
  const taughtLanguages = extractInstructorLanguages(profile)
  if (!taughtLanguages || taughtLanguages.length === 0) {
    return COURSE_FORM_LANGUAGES
  }

  // Legacy registration UI stored "中文" instead of "Chinese" — normalize so the
  // class form maps these teachers to the real Chinese language/level options.
  const LANGUAGE_ALIASES = { 中文: "Chinese" }

  const result = []
  const addedIds = new Set()

  taughtLanguages.forEach((taughtLang, idx) => {
    const normalizedTaught = (LANGUAGE_ALIASES[taughtLang.trim()] || taughtLang.trim()).toLowerCase()
    const matched = COURSE_FORM_LANGUAGES.find(
      (c) => (c.name || "").trim().toLowerCase() === normalizedTaught
    )

    if (matched) {
      if (!addedIds.has(matched.id)) {
        result.push(matched)
        addedIds.add(matched.id)
      }
    } else {
      const customId = `custom-${idx}-${taughtLang}`
      if (!addedIds.has(customId)) {
        result.push({
          id: customId,
          name: taughtLang,
          levels: DEFAULT_LEVELS,
        })
        addedIds.add(customId)
      }
    }
  })

  return result.length > 0 ? result : COURSE_FORM_LANGUAGES
}

