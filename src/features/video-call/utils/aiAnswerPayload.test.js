import { describe, expect, it } from "vitest"
import { unwrapAiAnswerPayload } from "./aiAnswerPayload"

describe("unwrapAiAnswerPayload", () => {
  it("keeps a plain string untouched", () => {
    expect(unwrapAiAnswerPayload("Xin chào!", ["A?"])).toEqual({
      answer: "Xin chào!",
      followUps: ["A?"],
    })
  })

  it("unwraps a valid structured answer and keeps follow-ups", () => {
    const raw =
      '{"answer": "Apple là quả táo.", "follow_up_questions": ["Cách phát âm?", "Ví dụ?"]}'
    expect(unwrapAiAnswerPayload(raw)).toEqual({
      answer: "Apple là quả táo.",
      followUps: ["Cách phát âm?", "Ví dụ?"],
    })
  })

  it("unwraps double-encoded JSON once", () => {
    const inner = JSON.stringify({
      answer: "Hello là xin chào.",
      follow_up_questions: ["Good morning là gì?"],
    })
    expect(unwrapAiAnswerPayload(JSON.stringify({ answer: inner }))).toEqual({
      answer: "Hello là xin chào.",
      followUps: ["Good morning là gì?"],
    })
  })

  it("salvages a truncated JSON answer without leaking raw syntax", () => {
    const raw = '{"answer": "Quả táo là apple, ví dụ: I eat an app'
    const { answer, followUps } = unwrapAiAnswerPayload(raw, ["Giữ nguyên?"])
    expect(answer).toBe("Quả táo là apple, ví dụ: I eat an app")
    expect(answer.startsWith('{"answer"')).toBe(false)
    expect(followUps).toEqual(["Giữ nguyên?"])
  })

  it("decodes escaped newlines and unicode", () => {
    const raw = '{"answer": "Dòng 1\\nDòng 2 \\u26a1"}'
    expect(unwrapAiAnswerPayload(raw).answer).toBe("Dòng 1\nDòng 2 ⚡")
  })

  it("returns a non-string payload as an empty-safe value", () => {
    expect(unwrapAiAnswerPayload(null)).toEqual({ answer: "", followUps: [] })
  })
})
