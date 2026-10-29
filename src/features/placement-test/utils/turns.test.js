import { describe, expect, it } from "vitest"
import { sortTurns, upsertTurn } from "./turns"

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
