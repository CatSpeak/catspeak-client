import { describe, expect, it } from "vitest"
import translations from "./index"

// Oracle: user ruling 2026-10-31 — the resume modal must warn that an
// unsubmitted recording is lost on reload. The page is served in every locale,
// so each locale must carry the notice.
describe("resume lifecycle copy", () => {
  it.each(Object.keys(translations))(
    "%s warns that the pending answer must be re-recorded",
    (locale) => {
      const notice =
        translations[locale].placementTest?.lifecycle?.resume
          ?.pendingAnswerNotice

      expect(typeof notice).toBe("string")
      expect(notice.trim().length).toBeGreaterThan(0)
    },
  )
})
