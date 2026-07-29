export const COURSE_FORM_LANGUAGES = [
  {
    id: 1,
    name: "English",
    levels: ["A1", "A2", "B1", "B2", "C1", "C2"].map((name, index) => ({ id: index + 1, name })),
  },
  {
    id: 2,
    name: "Chinese",
    levels: ["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"].map((name, index) => ({ id: index + 1, name })),
  },
  {
    id: 3,
    name: "Vietnamese",
    levels: ["A1", "A2", "B1", "B2"].map((name, index) => ({ id: index + 1, name })),
  },
]

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
  if (key === "english") return langMap.English || "English"
  if (key === "chinese") return langMap.Chinese || "Chinese"
  if (key === "vietnamese") return langMap.Vietnamese || "Vietnamese"
  if (key === "japanese") return langMap.Japanese || "Japanese"
  return langName
}
