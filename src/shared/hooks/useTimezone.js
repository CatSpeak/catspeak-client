import { useSelector } from "react-redux"
import { getBrowserTimeZone } from "@/shared/constants/timezones"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  getDisplayLocale,
  getUserLocale,
  formatInTimeZone,
  formatRelativeTime,
  convertTimeStrToTz,
} from "@/shared/utils/dateUtils"

export const useTimezone = () => {
  const user = useSelector((state) => state.auth?.user)
  const { language } = useLanguage()
  const userTimeZone = user?.timeZone || getBrowserTimeZone()
  const locale = getDisplayLocale(language) || getUserLocale()

  const formatDate = (date) =>
    formatInTimeZone(date, userTimeZone, { year: "numeric", month: "2-digit", day: "2-digit" }, locale)

  const formatTime = (date) =>
    formatInTimeZone(date, userTimeZone, { hour: "2-digit", minute: "2-digit", hour12: false }, locale)

  const formatDateTime = (date) =>
    formatInTimeZone(date, userTimeZone, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }, locale)

  const formatRelative = (date) =>
    formatRelativeTime(date, userTimeZone, language)

  const formatDateMonth = (date, fallback = "—") =>
    formatInTimeZone(date, userTimeZone, { day: "numeric", month: "short" }, locale) || fallback

  const formatScheduleTime = (timeStr) =>
    convertTimeStrToTz(timeStr, userTimeZone)

  const formatCustom = (date, options = {}) =>
    formatInTimeZone(date, userTimeZone, options, locale)

  return {
    userTimeZone,
    locale,
    language,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
    formatDateMonth,
    formatScheduleTime,
    formatCustom,
  }
}

export default useTimezone
