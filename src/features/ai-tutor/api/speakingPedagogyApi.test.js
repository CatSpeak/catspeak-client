import { describe, expect, it } from "vitest"

if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  }
}

const { speakingAudioPath } = await import("./speakingPedagogyApi")

describe("speakingAudioPath.sample", () => {
  it("sinh đường dẫn sample-audio có text và rate", () => {
    const url = speakingAudioPath.sample("苹果", "slow")
    expect(url).toBe("/v1/speaking/sample-audio?text=%E8%8B%B9%E6%9E%9C&rate=slow")
  })

  it("phân biệt URL theo pinyin cho từ đa âm (TC-FC-040, TC-FC-010)", () => {
    const hang = speakingAudioPath.sample("行", "normal", "háng")
    const xing = speakingAudioPath.sample("行", "normal", "xíng")
    expect(hang).toBe("/v1/speaking/sample-audio?text=%E8%A1%8C&pinyin=h%C3%A1ng&rate=normal")
    expect(xing).toBe("/v1/speaking/sample-audio?text=%E8%A1%8C&pinyin=x%C3%ADng&rate=normal")
    expect(hang).not.toBe(xing)
  })
})
