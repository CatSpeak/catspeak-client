import { describe, expect, it } from "vitest"
import { GALAXY_STATE, toGalaxyState } from "./galaxyState"

describe("toGalaxyState (FE-07: trạng thái học -> độ sáng sao)", () => {
  it("thẻ mới chưa ôn -> chưa học", () => {
    expect(toGalaxyState({ word: "你" })).toBe(GALAXY_STATE.UNLEARNED)
    expect(toGalaxyState(null)).toBe(GALAXY_STATE.UNLEARNED)
  })
  it("trường cũ của sổ từ vựng", () => {
    expect(toGalaxyState({ is_long_term: true, is_known: true })).toBe(GALAXY_STATE.LONG_TERM)
    expect(toGalaxyState({ is_known: true })).toBe(GALAXY_STATE.MASTERED)
    expect(toGalaxyState({ review_count: 2 })).toBe(GALAXY_STATE.LEARNING)
    expect(toGalaxyState({ last_reviewed_at: "2026-11-20T00:00:00Z" })).toBe(GALAXY_STATE.LEARNING)
  })
  it("trường FSRS", () => {
    expect(toGalaxyState({ fsrs_state: 1 })).toBe(GALAXY_STATE.LEARNING)
    expect(toGalaxyState({ fsrs_state: 3 })).toBe(GALAXY_STATE.LEARNING)
    expect(toGalaxyState({ fsrs_state: 2, stability: 5 })).toBe(GALAXY_STATE.MASTERED)
    expect(toGalaxyState({ fsrs_state: 2, stability: 21 })).toBe(GALAXY_STATE.LONG_TERM)
  })
  it("galaxy_state server tính sẵn được ưu tiên; giá trị lạ bị bỏ qua", () => {
    expect(toGalaxyState({ galaxy_state: 2, fsrs_state: 0 })).toBe(GALAXY_STATE.MASTERED)
    expect(toGalaxyState({ galaxy_state: 9, is_known: true })).toBe(GALAXY_STATE.MASTERED)
  })
})
