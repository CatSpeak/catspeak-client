import React from "react"
import { useParams } from "react-router-dom"
import { LiveMessages } from "@/features/stories"
// Normalize URL lang codes to canonical backend values
const LANG_TO_COMMUNITY = {
  vi: "Vietnamese",
  vn: "Vietnamese",
  vietnam: "Vietnamese",
  vietnamese: "Vietnamese",
  en: "English",
  eng: "English",
  english: "English",
  zh: "Chinese",
  cn: "Chinese",
  china: "Chinese",
  chinese: "Chinese",
  ja: "Japanese",
  jp: "Japanese",
  japan: "Japanese",
  japanese: "Japanese",
}

const MailPage = () => {
  const { lang } = useParams()

  // Resolve the language community from URL param
  const languageCommunity = LANG_TO_COMMUNITY[lang?.toLowerCase()] || undefined

  return (
    <div className="w-full">
      <LiveMessages languageCommunity={languageCommunity} />
    </div>
  )
}

export default MailPage
