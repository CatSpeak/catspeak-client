import { describe, expect, it } from "vitest"
import {
  countSubmittedTurns,
  isSubmittedTurn,
  sortTurns,
  upsertTurn,
} from "./turns"

describe("sortTurns", () => {
  it("sorts turns by order without mutating the source", () => {
    const source = [{ order: 2 }, { order: 1 }]
    expect(sortTurns(source).map((turn) => turn.order)).toEqual([1, 2])
    expect(source.map((turn) => turn.order)).toEqual([2, 1])
  })

  it("tolerates non-array input", () => {
    expect(sortTurns(null)).toEqual([])
  })
})

describe("upsertTurn", () => {
  it("appends a new turn in order", () => {
    const result = upsertTurn([{ order: 1 }, { order: 3 }], { order: 2 })
    expect(result.map((turn) => turn.order)).toEqual([1, 2, 3])
  })

  it("replaces an existing turn with the same order", () => {
    const result = upsertTurn(
      [{ order: 1, transcript: "old" }, { order: 2 }],
      { order: 1, transcript: "new" },
    )
    expect(result).toHaveLength(2)
    expect(result[0].transcript).toBe("new")
  })
})

describe("isSubmittedTurn", () => {
  it("requires submission evidence, not a transcript", () => {
    expect(isSubmittedTurn({ transcript: "我家有四口人" })).toBe(false)
    expect(isSubmittedTurn({ answeredAt: 1 })).toBe(true)
    expect(isSubmittedTurn({ submittedAt: 1 })).toBe(true)
    expect(isSubmittedTurn(null)).toBe(false)
  })
})

describe("countSubmittedTurns", () => {
  it("counts only submitted turns and clamps to the total", () => {
    const turns = [
      { order: 1, answeredAt: 1 },
      { order: 2, transcript: "pending" },
      { order: 3, submittedAt: 1 },
    ]
    expect(countSubmittedTurns(turns, 5)).toBe(2)
    expect(countSubmittedTurns(turns, 1)).toBe(1)
    expect(countSubmittedTurns(null, 5)).toBe(0)
  })
})
