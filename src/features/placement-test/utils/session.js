import { SESSION_CODE_PREFIX } from "../constants/session"

export const createSessionCode = ({ year, random } = {}) => {
  const resolvedYear = year ?? new Date().getFullYear()
  const resolvedRandom = typeof random === "number" ? random : Math.random()
  const suffix = String(Math.floor(resolvedRandom * 10000))
    .padStart(4, "0")
    .slice(-4)
  return `${SESSION_CODE_PREFIX}-${resolvedYear}-${suffix}`
}
