import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getLocalizedLanguageName } from "../data/courseFormOptions"

const LANGUAGE_STYLE_CONFIG = {
  ENGLISH: { bgClass: "bg-[#DBEAFE] dark:bg-blue-950/40", textClass: "text-[#1D4ED8] dark:text-blue-300" }, // Blue
  CHINESE: { bgClass: "bg-[#FEF3C7] dark:bg-amber-950/40", textClass: "text-[#B45309] dark:text-amber-300" }, // Amber/Yellow
  VIETNAMESE: { bgClass: "bg-[#DCFCE7] dark:bg-emerald-950/40", textClass: "text-[#15803D] dark:text-emerald-300" }, // Green
  JAPANESE: { bgClass: "bg-[#FCE7F3] dark:bg-pink-950/40", textClass: "text-[#BE185D] dark:text-pink-300" }, // Pink
  DEFAULT: { bgClass: "bg-[#F3F4F6] dark:bg-[#2A2A2A]", textClass: "text-[#4B5563] dark:text-gray-300" }, // Gray
}

const getCanonicalLanguage = (lang) => {
  if (!lang) return "DEFAULT"
  const l = String(lang).toUpperCase()
  if (l.includes("ENGLISH") || l === "EN") return "ENGLISH"
  if (l.includes("CHINESE") || l === "ZH") return "CHINESE"
  if (l.includes("VIETNAMESE") || l === "VI") return "VIETNAMESE"
  if (l.includes("JAPANESE") || l === "JA") return "JAPANESE"
  return "DEFAULT"
}

const CourseLanguagePill = ({ language, className = "" }) => {
  const { t } = useLanguage()

  if (!language) return null

  const canonical = getCanonicalLanguage(language)
  const config = LANGUAGE_STYLE_CONFIG[canonical] || LANGUAGE_STYLE_CONFIG.DEFAULT
  const localizedName = getLocalizedLanguageName(language, t) || language

  return (
    <span className={`h-6 inline-flex items-center justify-center whitespace-nowrap shrink-0 w-fit text-xs font-semibold px-2.5 rounded-full leading-none capitalize ${config.bgClass} ${config.textClass} ${className}`}>
      {localizedName}
    </span>
  )
}

export default CourseLanguagePill
