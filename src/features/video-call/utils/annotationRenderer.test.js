import { describe, expect, test } from "vitest"

import {
  AUTHOR_PILL_MS,
  HIGHLIGHTER_ALPHA,
  LASER_TTL_MS,
  renderAnnotationFrame,
} from "./annotationRenderer.js"

const createFakeContext = () => {
  const calls = []
  const ctx = {
    globalAlpha: 1,
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 1,
    lineCap: "",
    lineJoin: "",
    font: "",
    textBaseline: "",
    calls,
    save: () => calls.push({ op: "save" }),
    restore: () => calls.push({ op: "restore" }),
    clearRect: (...args) => calls.push({ op: "clearRect", args }),
    beginPath: () => calls.push({ op: "beginPath" }),
    closePath: () => calls.push({ op: "closePath" }),
    moveTo: (...args) => calls.push({ op: "moveTo", args }),
    lineTo: (...args) => calls.push({ op: "lineTo", args }),
    quadraticCurveTo: (...args) => calls.push({ op: "quadraticCurveTo", args }),
    arc: (...args) => calls.push({ op: "arc", args }),
    arcTo: (...args) => calls.push({ op: "arcTo", args }),
    rect: (...args) => calls.push({ op: "rect", args }),
    ellipse: (...args) => calls.push({ op: "ellipse", args }),
    stroke: () =>
      calls.push({
        op: "stroke",
        alpha: ctx.globalAlpha,
        color: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
      }),
    fill: () =>
      calls.push({
        op: "fill",
        alpha: ctx.globalAlpha,
        color: ctx.fillStyle,
      }),
    fillText: (text, x, y) =>
      calls.push({ op: "fillText", text, x, y, alpha: ctx.globalAlpha }),
    measureText: (text) => ({ width: String(text).length * 6 }),
  }
  return ctx
}

const strokeItem = (tool = "pen") => ({
  id: "s1",
  kind: "stroke",
  tool,
  color: "#ef4444",
  width: 4,
  authorId: "42",
  authorName: "An",
  pts: [
    [0.1, 0.1],
    [0.5, 0.5],
  ],
})

const render = (ctx, overrides = {}) =>
  renderAnnotationFrame(ctx, {
    width: 1280,
    height: 720,
    now: 1000,
    ...overrides,
  })

describe("renderAnnotationFrame", () => {
  test("clears the canvas before drawing", () => {
    const ctx = createFakeContext()
    render(ctx, { items: [strokeItem()] })

    expect(ctx.calls[0]).toEqual({ op: "clearRect", args: [0, 0, 1280, 720] })
  })

  test("highlighter strokes are translucent and pen strokes are opaque", () => {
    const highlighter = createFakeContext()
    render(highlighter, { items: [strokeItem("highlighter")] })
    const highlighterStroke = highlighter.calls.find(
      (call) => call.op === "stroke",
    )

    expect(HIGHLIGHTER_ALPHA).toBeCloseTo(0.35)
    expect(highlighterStroke.alpha).toBeCloseTo(0.35)

    const pen = createFakeContext()
    render(pen, { items: [strokeItem("pen")] })
    expect(pen.calls.find((call) => call.op === "stroke").alpha).toBe(1)
  })

  test("arrow shapes draw a filled head", () => {
    const ctx = createFakeContext()
    render(ctx, {
      items: [
        {
          id: "a1",
          kind: "shape",
          tool: "arrow",
          color: "#3b82f6",
          width: 4,
          x1: 0.1,
          y1: 0.1,
          x2: 0.8,
          y2: 0.6,
        },
      ],
    })

    const fill = ctx.calls.find((call) => call.op === "fill")
    expect(fill).toMatchObject({ color: "#3b82f6", alpha: 1 })
    expect(ctx.calls.some((call) => call.op === "lineTo")).toBe(true)
    expect(ctx.calls.some((call) => call.op === "closePath")).toBe(true)
  })

  test("text notes render one line per newline at the stored position", () => {
    const ctx = createFakeContext()
    render(ctx, {
      items: [
        {
          id: "t1",
          kind: "text",
          color: "#eab308",
          fontSize: 24,
          x: 0.25,
          y: 0.5,
          text: "Hello\nWorld",
        },
      ],
    })

    const lines = ctx.calls.filter((call) => call.op === "fillText")
    expect(lines.map((line) => line.text)).toEqual(["Hello", "World"])
    expect(lines[0].x).toBe(320)
    expect(lines[0].y).toBe(360)
    expect(lines[1].y).toBe(390)
  })

  test("laser trails fade and disappear after the TTL", () => {
    const laser = {
      authorName: "An",
      color: "#ef4444",
      trail: [{ x: 0.5, y: 0.5, ts: 1000 }],
    }

    const visible = createFakeContext()
    render(visible, { lasers: [laser], now: 1000 })
    expect(visible.calls.some((call) => call.op === "fill")).toBe(true)

    const expired = createFakeContext()
    render(expired, { lasers: [laser], now: 1000 + LASER_TTL_MS + 1 })
    expect(expired.calls.some((call) => call.op === "fill")).toBe(false)
  })

  test("author pills fade out after about three seconds", () => {
    const fresh = createFakeContext()
    render(fresh, {
      items: [{ ...strokeItem(), createdAt: 1000 }],
      now: 1000,
    })
    expect(fresh.calls.filter((call) => call.op === "fillText")).toHaveLength(1)

    const stale = createFakeContext()
    render(stale, {
      items: [{ ...strokeItem(), createdAt: 1000 }],
      now: 1000 + AUTHOR_PILL_MS + 1,
    })
    expect(stale.calls.filter((call) => call.op === "fillText")).toHaveLength(0)
  })
})
