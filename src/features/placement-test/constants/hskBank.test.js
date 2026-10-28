import { describe, expect, it } from "vitest"
import {
  HSK_BAND_THRESHOLDS,
  HSK_BANK,
  HSK_LEVELS,
} from "./hskBank"

const bankFor = (level) => HSK_BANK[level]

describe("hskBank", () => {
  it("covers HSK 1 through 6", () => {
    expect(HSK_LEVELS).toEqual([1, 2, 3, 4, 5, 6])
    expect(Object.keys(HSK_BANK).map(Number).sort((a, b) => a - b)).toEqual(
      HSK_LEVELS,
    )
  })

  it("gives every level at least three questions tagged with that level", () => {
    for (const level of HSK_LEVELS) {
      const questions = bankFor(level).questions
      expect(questions.length).toBeGreaterThanOrEqual(3)
      for (const question of questions) {
        expect(question.level).toBe(level)
        expect(question.hanzi).toBeTruthy()
        expect(question.pinyin).toBeTruthy()
        expect(question.vi).toBeTruthy()
      }
    }
  })

  it("keeps question ids unique", () => {
    const ids = HSK_LEVELS.flatMap((level) =>
      bankFor(level).questions.map((question) => question.id),
    )
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("gives every level curated vocabulary with a positive difficulty", () => {
    const words = []
    for (const level of HSK_LEVELS) {
      const vocabulary = bankFor(level).vocabulary
      expect(vocabulary.length).toBeGreaterThanOrEqual(5)
      for (const entry of vocabulary) {
        expect(entry.level).toBe(level)
        expect(entry.word).toBeTruthy()
        expect(entry.difficulty).toBeGreaterThan(0)
        words.push(entry.word)
      }
    }
    expect(new Set(words).size).toBe(words.length)
  })

  it("gives every level grammar regex matchers with unique ids", () => {
    const ids = []
    for (const level of HSK_LEVELS) {
      const grammar = bankFor(level).grammar
      expect(grammar.length).toBeGreaterThanOrEqual(1)
      for (const entry of grammar) {
        expect(entry.level).toBe(level)
        expect(entry.pattern).toBeInstanceOf(RegExp)
        ids.push(entry.id)
      }
    }
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("provides fallback answers for every level", () => {
    for (const level of HSK_LEVELS) {
      const fallback = bankFor(level).fallbackAnswers
      expect(fallback.length).toBeGreaterThanOrEqual(1)
      expect(fallback[0].hanzi).toBeTruthy()
    }
  })

  it("defines contiguous band thresholds from HSK1 to HSK6", () => {
    expect(HSK_BAND_THRESHOLDS.map((threshold) => threshold.band)).toEqual(
      HSK_LEVELS,
    )
    for (let index = 1; index < HSK_BAND_THRESHOLDS.length; index += 1) {
      expect(HSK_BAND_THRESHOLDS[index].min).toBe(
        HSK_BAND_THRESHOLDS[index - 1].max,
      )
    }
  })
})
