import { describe, expect, it } from "vitest"
import { TOPICS, assistReducer, initialAssistState } from "./speakingAssist"

const sub = (turn_index, text, seq = turn_index) => ({ topic: TOPICS.subtitle, data: { seq, turn_index, role: "ai", text } })
const assist = (turn_index, extra = {}) => ({
  topic: TOPICS.assist,
  data: { turn_index, pinyin: "Nǐ hǎo", meaning_vi: "Chào bạn", hint_mode: "proactive",
          hints: [{ id: `h${turn_index}a`, text: "你好！" }], correction: null, ...extra },
})

describe("ghép phụ đề với turn-assist", () => {
  it("phụ đề trước, assist sau", () => {
    let s = assistReducer(initialAssistState, sub(1, "你好！"))
    expect(s.ai).toMatchObject({ text: "你好！", pinyin: null })
    s = assistReducer(s, assist(1))
    expect(s.ai).toMatchObject({ text: "你好！", pinyin: "Nǐ hǎo", meaningVi: "Chào bạn" })
    expect(s.hints).toHaveLength(1)
    expect(s.hintMode).toBe("proactive")
  })

  it("assist tới trước phụ đề thì được giữ lại rồi ghép", () => {
    let s = assistReducer(initialAssistState, assist(2))
    expect(s.ai).toBeNull()
    s = assistReducer(s, sub(2, "你喜欢吃什么？"))
    expect(s.ai.pinyin).toBe("Nǐ hǎo")
    expect(s.pending).toEqual({})
  })

  it("câu AI mới xoá gợi ý cũ, mẹo sửa lỗi đi theo assist", () => {
    let s = assistReducer(initialAssistState, sub(1, "a"))
    s = assistReducer(s, assist(1, { correction: { original: "我要二斤", corrected: "我要两斤" } }))
    expect(s.correction.corrected).toBe("我要两斤")
    s = assistReducer(s, sub(2, "b"))
    expect(s.hints).toEqual([])
    s = assistReducer(s, assist(2))
    expect(s.correction).toBeNull()
  })

  it("assist của lượt cũ không đè câu đang hiện", () => {
    let s = assistReducer(initialAssistState, sub(3, "c"))
    s = assistReducer(s, assist(2, { pinyin: "sai lượt" }))
    expect(s.ai.pinyin).toBeNull()
  })

  it("phụ đề của học viên và trạng thái phiên", () => {
    let s = assistReducer(initialAssistState, { topic: TOPICS.subtitle, data: { seq: 4, role: "learner", text: "我要两斤" } })
    expect(s.learner.text).toBe("我要两斤")
    s = assistReducer(s, { topic: TOPICS.state, data: { phase: "talking", warn: "silence_10s", script_turns: 3 } })
    expect([s.phase, s.warn, s.scriptTurns]).toEqual(["talking", "silence_10s", 3])
  })
})
