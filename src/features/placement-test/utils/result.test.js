import { describe, expect, it } from "vitest"
import { clampScore } from "../engine"
import {
  buildAdjustOptions,
  computeOverallScore,
  getBandDescriptor,
  getCefr,
  getDimensionScores,
  getStrengthDimension,
  getTargetRoadmapBand,
  getTierKey,
  getWeaknessDimension,
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

describe("buildAdjustOptions", () => {
  it("offers down/keep/up clamped to HSK 1-6", () => {
    expect(buildAdjustOptions(3)).toEqual([
      { key: "down", level: 2 },
      { key: "keep", level: 3 },
      { key: "up", level: 4 },
    ])
    expect(buildAdjustOptions(1)).toEqual([
      { key: "down", level: 1 },
      { key: "keep", level: 1 },
      { key: "up", level: 2 },
    ])
    expect(buildAdjustOptions(6)).toEqual([
      { key: "down", level: 5 },
      { key: "keep", level: 6 },
      { key: "up", level: 6 },
    ])
  })
})
