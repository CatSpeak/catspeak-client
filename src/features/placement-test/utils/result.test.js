import { describe, expect, it } from "vitest"
import { clampScore } from "../engine"
import {
  buildAdjustOptions,
  computeOverallScore,
  getBandDescriptor,
  getCefr,
  getDimensionScores,
  getRoadmapDays,
  getStrengthDimension,
  getTargetRoadmapBand,
  getTierKey,
  getWeaknessDimension,
  isInsufficientEvidence,
  normalizeServerResult,
} from "./result"

const result = {
  pronunciation: 80,
  vocabulary: 65,
  grammar: 72,
  fluency: 60,
  weaknesses: [
    { dimension: "fluency", score: 60 },
    { dimension: "vocabulary", score: 65 },
  ],
}

describe("band to tier/CEFR mapping", () => {
  it("maps each HSK band to its tier group", () => {
    expect(getTierKey(1)).toBe("tierBeginner")
    expect(getTierKey(2)).toBe("tierBeginner")
    expect(getTierKey(3)).toBe("tierIntermediate")
    expect(getTierKey(4)).toBe("tierIntermediate")
    expect(getTierKey(5)).toBe("tierAdvanced")
    expect(getTierKey(6)).toBe("tierAdvanced")
  })

  it("maps each HSK band to a CEFR level", () => {
    expect(getCefr(1)).toBe("A1")
    expect(getCefr(2)).toBe("A2")
    expect(getCefr(3)).toBe("B1")
    expect(getCefr(4)).toBe("B2")
    expect(getCefr(5)).toBe("C1")
    expect(getCefr(6)).toBe("C2")
  })

  it("clamps out-of-range bands and returns a descriptor", () => {
    expect(getTierKey(0)).toBe("tierBeginner")
    expect(getTierKey(9)).toBe("tierAdvanced")
    expect(getBandDescriptor(3)).toEqual({
      band: 3,
      tierKey: "tierIntermediate",
      cefr: "B1",
    })
    expect(getBandDescriptor(99)).toEqual({
      band: 6,
      tierKey: "tierAdvanced",
      cefr: "C2",
    })
  })
})

describe("clampScore", () => {
  it("rounds and clamps into 0-100", () => {
    expect(clampScore(72.6)).toBe(73)
    expect(clampScore(-5)).toBe(0)
    expect(clampScore(140)).toBe(100)
    expect(clampScore("nope")).toBe(0)
  })
})

describe("score derivations", () => {
  it("returns the four dimension scores", () => {
    expect(getDimensionScores(result)).toEqual([
      { key: "pronunciation", score: 80 },
      { key: "vocabulary", score: 65 },
      { key: "grammar", score: 72 },
      { key: "fluency", score: 60 },
    ])
  })

  it("averages the four dimensions into an overall score", () => {
    expect(computeOverallScore(result)).toBe(69)
  })

  it("picks the strongest dimension", () => {
    expect(getStrengthDimension(result)).toEqual({
      key: "pronunciation",
      score: 80,
    })
  })

  it("prefers the listed weakness over the lowest dimension", () => {
    expect(getWeaknessDimension(result)).toEqual({ key: "fluency", score: 60 })
  })

  it("falls back to the lowest dimension when no weakness is listed", () => {
    expect(
      getWeaknessDimension({ pronunciation: 40, vocabulary: 90, grammar: 70, fluency: 60 }),
    ).toEqual({ key: "pronunciation", score: 40 })
  })
})

describe("strength threshold", () => {
  it("does not call the best of a weak set a strength", () => {
    expect(
      getStrengthDimension({ pronunciation: 0, vocabulary: 0, grammar: 30, fluency: 0 }),
    ).toBeNull()
  })

  it("returns null when no dimension was measured", () => {
    expect(
      getStrengthDimension({
        pronunciation: null,
        vocabulary: null,
        grammar: null,
        fluency: null,
      }),
    ).toBeNull()
  })

  it("keeps a dimension at or above 60 as a strength", () => {
    expect(
      getStrengthDimension({ pronunciation: 0, vocabulary: 60, grammar: 30, fluency: 0 }),
    ).toEqual({ key: "vocabulary", score: 60 })
  })
})

describe("insufficient evidence", () => {
  it("propagates the server flag for an all-skipped session", () => {
    const normalized = normalizeServerResult({
      final_hsk_level: 1,
      scores: { pronunciation: null, vocabulary: 0, grammar: 0, fluency: 0 },
      insufficient_evidence: true,
      turn_count: 0,
    })

    expect(normalized.insufficientEvidence).toBe(true)
    expect(normalized.answeredCount).toBe(0)
  })

  it("keeps a normal session as having evidence", () => {
    const normalized = normalizeServerResult({
      final_hsk_level: 3,
      scores: { pronunciation: 70, vocabulary: 65, grammar: 72, fluency: 60 },
      turn_count: 5,
    })

    expect(normalized.insufficientEvidence).toBe(false)
    expect(normalized.answeredCount).toBe(5)
  })

  it("gates both result screens on the same predicate", () => {
    expect(isInsufficientEvidence({ insufficientEvidence: true })).toBe(true)
    expect(isInsufficientEvidence({ insufficientEvidence: false })).toBe(false)
    expect(isInsufficientEvidence({})).toBe(false)
    expect(isInsufficientEvidence(null)).toBe(false)
  })
})

describe("getTargetRoadmapBand", () => {
  it("targets one band above the current level", () => {
    expect(getTargetRoadmapBand(3)).toBe(4)
    expect(getTargetRoadmapBand(1)).toBe(2)
  })

  it("does not exceed HSK 6", () => {
    expect(getTargetRoadmapBand(6)).toBe(6)
    expect(getTargetRoadmapBand(9)).toBe(6)
  })
})

describe("getRoadmapDays", () => {
  const copy = {
    roadmapByBand: { 2: [{ day: 1, focus: "A" }], 6: [{ day: 1, focus: "F" }] },
    roadmapDays: [{ day: 1, focus: "fallback" }],
  }

  it("picks the content written for the target band", () => {
    expect(getRoadmapDays(copy, 2)).toEqual([{ day: 1, focus: "A" }])
  })

  it("falls back to the legacy list when the band is missing", () => {
    expect(getRoadmapDays(copy, 4)).toEqual([{ day: 1, focus: "fallback" }])
  })

  it("clamps out-of-range bands", () => {
    expect(getRoadmapDays(copy, 99)).toEqual([{ day: 1, focus: "F" }])
  })
})

describe("buildAdjustOptions", () => {
  it("offers down/keep/up clamped to HSK 1-6", () => {
    expect(buildAdjustOptions(3)).toEqual([
      { key: "down", level: 2 },
      { key: "keep", level: 3 },
      { key: "up", level: 4 },
    ])
    expect(buildAdjustOptions(1)).toEqual([
      { key: "down", level: 1, disabled: true },
      { key: "keep", level: 1 },
      { key: "up", level: 2 },
    ])
    expect(buildAdjustOptions(6)).toEqual([
      { key: "down", level: 5 },
      { key: "keep", level: 6 },
      { key: "up", level: 6, disabled: true },
    ])
  })
})
