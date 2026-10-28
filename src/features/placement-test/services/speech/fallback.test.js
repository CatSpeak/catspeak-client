import { describe, expect, it } from "vitest"
import { HSK_BANK } from "../../constants/hskBank"
import { pickFallbackTranscript } from "./fallback"

describe("pickFallbackTranscript", () => {
  it("returns a hanzi answer from the requested level bank", () => {
    const transcript = pickFallbackTranscript({ level: 3, random: () => 0 })
    expect(transcript).toBe(HSK_BANK[3].fallbackAnswers[0].hanzi)
  })

  it("selects deterministically from the fallback list", () => {
    const transcript = pickFallbackTranscript({ level: 5, random: () => 0.99 })
    expect(transcript).toBe(
      HSK_BANK[5].fallbackAnswers[HSK_BANK[5].fallbackAnswers.length - 1].hanzi,
    )
  })

  it("falls back to HSK 1 for an unknown level", () => {
    const transcript = pickFallbackTranscript({ level: 99, random: () => 0 })
    expect(transcript).toBe(HSK_BANK[1].fallbackAnswers[0].hanzi)
  })

  it("returns an empty string when no fallback answers exist", () => {
    const transcript = pickFallbackTranscript({
      level: 1,
      bank: { 1: { fallbackAnswers: [] } },
    })
    expect(transcript).toBe("")
  })
})
