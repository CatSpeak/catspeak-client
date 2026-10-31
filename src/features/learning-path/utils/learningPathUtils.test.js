import { describe, expect, it } from "vitest"
import { findCardByDay } from "./learningPathUtils"

const cards = [
  { cardId: "c1", dayIndex: 1 },
  { cardId: "c2", dayIndex: 2 },
  { cardId: "c5", dayIndex: 5 },
]

describe("findCardByDay", () => {
  it("returns the card whose dayIndex matches the requested day", () => {
    expect(findCardByDay(cards, "2")).toBe(cards[1])
  })

  it("returns null when the day is missing, invalid, or out of range", () => {
    expect(findCardByDay(cards, 3)).toBeNull()
    expect(findCardByDay(cards, "abc")).toBeNull()
    expect(findCardByDay(cards, 0)).toBeNull()
    expect(findCardByDay(undefined, 1)).toBeNull()
  })
})
