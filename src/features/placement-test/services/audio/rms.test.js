import { describe, expect, it } from "vitest"
import { bytesToUnitSamples, computeLevel, computeRms } from "./rms"

describe("computeRms", () => {
  it("returns 0 for silence", () => {
    expect(computeRms(new Float32Array([0, 0, 0, 0]))).toBe(0)
  })

  it("returns 1 for a full-scale square wave", () => {
    expect(computeRms([1, -1, 1, -1])).toBe(1)
  })

  it("returns the amplitude for a constant signal", () => {
    expect(computeRms([0.5, 0.5, 0.5])).toBeCloseTo(0.5, 5)
  })

  it("returns 0 for empty input", () => {
    expect(computeRms([])).toBe(0)
    expect(computeRms(null)).toBe(0)
  })
})

describe("bytesToUnitSamples", () => {
  it("maps the byte midpoint to silence", () => {
    expect(Array.from(bytesToUnitSamples(new Uint8Array([128])))).toEqual([0])
  })

  it("maps byte extremes to -1 and ~1", () => {
    const [low, high] = bytesToUnitSamples(new Uint8Array([0, 255]))
    expect(low).toBe(-1)
    expect(high).toBeCloseTo(127 / 128, 5)
  })
})

describe("computeLevel", () => {
  it("clamps the level into the 0..1 range", () => {
    expect(computeLevel([2, 2, 2])).toBe(1)
    expect(computeLevel([])).toBe(0)
  })
})
