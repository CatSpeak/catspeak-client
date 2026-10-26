import { describe, expect, it } from "vitest"
import {
  DEFAULT_TARGET_BAND,
  TARGET_BANDS,
  getTargetBand,
  isTargetBand,
} from "./bands"

describe("target bands", () => {
  it("exposes the three HSK bands in order", () => {
    expect(TARGET_BANDS.map((band) => band.id)).toEqual([
      "hsk1_2",
      "hsk3_4",
      "hsk5_6",
    ])
  })

  it("defaults to HSK 3-4", () => {
    expect(DEFAULT_TARGET_BAND).toBe("hsk3_4")
  })

  it("marks exactly one recommended band", () => {
    expect(TARGET_BANDS.filter((band) => band.recommended).map((band) => band.id)).toEqual([
      "hsk3_4",
    ])
  })

  it("guards unknown ids", () => {
    expect(isTargetBand("hsk3_4")).toBe(true)
    expect(isTargetBand("hsk9")).toBe(false)
  })

  it("falls back to the default band", () => {
    expect(getTargetBand("nope").id).toBe(DEFAULT_TARGET_BAND)
  })
})
