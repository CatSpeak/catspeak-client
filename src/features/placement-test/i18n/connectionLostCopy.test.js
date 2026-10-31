import { describe, expect, it } from "vitest"
import translations from "./index"

// Oracle: user ruling 2026-10-31 — when the reconnect window runs out the room
// must leave for the Dashboard and blame the learner's own network, and the
// badge must be able to show the lost-connection state.
describe("connection lost copy", () => {
  it.each(Object.keys(translations))(
    "%s names the lost-connection badge and exit notice",
    (locale) => {
      const room = translations[locale].placementTest?.room || {}

      expect(typeof room.connectionLost).toBe("string")
      expect(room.connectionLost.trim().length).toBeGreaterThan(0)
      expect(typeof room.connectionLostExitToast).toBe("string")
      expect(room.connectionLostExitToast.trim().length).toBeGreaterThan(0)
    },
  )
})
