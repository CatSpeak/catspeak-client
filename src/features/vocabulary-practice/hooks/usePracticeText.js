import { useLanguage } from "@/shared/context/LanguageContext"
import vi from "../i18n/vi"

/** Bản dịch của Practice; thiếu khoá nào thì lấy tiếng Việt. */
const usePracticeText = () => {
  const { t, language } = useLanguage()
  const p = t?.vocabularyPractice
  return { p: p ? { ...vi, ...p, reminder: { ...vi.reminder, ...p.reminder } } : vi, language: language || "vi" }
}

export default usePracticeText
