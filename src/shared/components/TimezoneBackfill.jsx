import { useTimezoneBackfill } from "@/shared/hooks/useTimezoneBackfill"

/**
 * Mount inside the Provider so the user is in scope. The hook fires a one-shot
 * mutation when the user has no TimeZone yet, persisting the default.
 * No visible UI.
 */
const TimezoneBackfill = () => {
  useTimezoneBackfill()
  return null
}

export default TimezoneBackfill
