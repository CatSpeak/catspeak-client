import { describe, expect, test } from "vitest"

import {
  clientPointToNormalized,
  computeContainedMediaRect,
  hitTestAnnotation,
  normalizedToCanvas,
  simplifyPoints,
} from "./annotationGeometry.js"

describe("computeContainedMediaRect", () => {
  test("letterboxes 16:9 media inside a square container", () => {
    expect(computeContainedMediaRect(1000, 1000, 1920, 1080)).toEqual({
      x: 0,
      y: 218.75,
      width: 1000,
      height: 562.5,
    })
  })

  test("pillarboxes 4:3 media inside a 16:9 container", () => {
    expect(computeContainedMediaRect(1920, 1080, 800, 600)).toEqual({
      x: 240,
      y: 0,
      width: 1440,
      height: 1080,
    })
  })

  test("letterboxes 16:9 media inside a 4:3 container", () => {
    expect(computeContainedMediaRect(800, 600, 1920, 1080)).toEqual({
      x: 0,
      y: 75,
      width: 800,
      height: 450,
    })
  })

  test("pillarboxes portrait media", () => {
    expect(computeContainedMediaRect(1000, 600, 1080, 1920)).toEqual({
      x: 331.25,
      y: 0,
      width: 337.5,
      height: 600,
    })
  })

  test("returns an empty rect for missing or invalid dimensions", () => {
    const empty = { x: 0, y: 0, width: 0, height: 0 }
    expect(computeContainedMediaRect(0, 100, 1920, 1080)).toEqual(empty)
    expect(computeContainedMediaRect(1000, 1000, 0, 0)).toEqual(empty)
    expect(computeContainedMediaRect(Number.NaN, 100, 10, 10)).toEqual(empty)
  })
})

describe("clientPointToNormalized", () => {
  const rect = { x: 100, y: 50, width: 800, height: 450 }

  test("maps a client point into [0..1] relative to the media rect", () => {
    expect(clientPointToNormalized(300, 275, rect)).toEqual({ x: 0.25, y: 0.5 })
  })

  test("clamps points outside the media rect", () => {
    expect(clientPointToNormalized(0, 1000, rect)).toEqual({ x: 0, y: 1 })
  })

  test("returns null when the rect is empty", () => {
    expect(
      clientPointToNormalized(10, 10, { x: 0, y: 0, width: 0, height: 0 }),
    ).toBeNull()
  })
})

describe("normalizedToCanvas", () => {
  test("maps [0..1] to canvas pixels", () => {
    expect(normalizedToCanvas(0.5, 0.25, 800, 450)).toEqual({
      x: 400,
      y: 112.5,
    })
  })

  test("clamps out-of-range values", () => {
    expect(normalizedToCanvas(-1, 2, 800, 450)).toEqual({ x: 0, y: 450 })
  })
})

describe("simplifyPoints (RDP)", () => {
  test("drops collinear intermediate points but keeps both ends", () => {
    expect(
      simplifyPoints([
        [0, 0],
        [0.25, 0],
        [0.5, 0],
        [0.75, 0],
        [1, 0],
      ]),
    ).toEqual([
      [0, 0],
      [1, 0],
    ])
  })

  test("keeps a corner that exceeds the tolerance", () => {
    expect(
      simplifyPoints(
        [
          [0, 0],
          [0.5, 0],
          [0.5, 0.5],
          [1, 0.5],
        ],
        0.001,
      ),
    ).toEqual([
      [0, 0],
      [0.5, 0],
      [0.5, 0.5],
      [1, 0.5],
    ])
  })

  test("handles short inputs", () => {
    expect(simplifyPoints([])).toEqual([])
    expect(simplifyPoints([[0.1, 0.1]])).toEqual([[0.1, 0.1]])
    expect(
      simplifyPoints([
        [0.1, 0.1],
        [0.2, 0.2],
      ]),
    ).toEqual([
      [0.1, 0.1],
      [0.2, 0.2],
    ])
  })
})

describe("hitTestAnnotation", () => {
  const stroke = {
    id: "s1",
    kind: "stroke",
    tool: "pen",
    pts: [
      [0.1, 0.1],
      [0.5, 0.1],
    ],
  }

  test("hits a stroke within the tolerance band", () => {
    expect(
      hitTestAnnotation([stroke], { x: 0.3, y: 0.12 }, { tolerance: 0.03 }),
    ).toBe(stroke)
  })

  test("misses a stroke outside the tolerance band", () => {
    expect(hitTestAnnotation([stroke], { x: 0.3, y: 0.5 })).toBeNull()
  })

  test("ignores malformed items", () => {
    expect(hitTestAnnotation([null, {}, stroke], { x: 0.3, y: 0.1 })).toBe(
      stroke,
    )
  })
})
