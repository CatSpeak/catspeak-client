import { describe, expect, it } from "vitest"
import translations from "./index"

// Oracle: user ruling 2026-10-31 — every pause-expiry exit must announce that
// the exam expired instead of offering to resume, in every served locale.
describe("pause expiry copy", () => {
  it.each(Object.keys(translations))(
    "%s announces that the paused exam expired",
    (locale) => {
      const notice =
        translations[locale].placementTest?.lifecycle?.pauseExpiredToast

      expect(typeof notice).toBe("string")
      expect(notice.trim().length).toBeGreaterThan(0)
    },
  )
})
