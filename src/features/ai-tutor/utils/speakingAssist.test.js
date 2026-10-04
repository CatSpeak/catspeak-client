import { describe, expect, it } from "vitest"
import { TOPICS, assistReducer, initialAssistState } from "./speakingAssist"

const sub = (turn_index, text, seq = turn_index) => ({
  topic: TOPICS.subtitle,
  data: { seq, turn_index, role: "ai", text },
})
const assist = (turn_index, extra = {}, seq = turn_index) => ({
  topic: TOPICS.assist,
  data: {
    seq: extra.seq ?? seq,
    turn_index,
    pinyin: "Nǐ hǎo",
    meaning_vi: "Chào bạn",
    hint_mode: "proactive",
    hints: [{ id: `h${turn_index}a`, text: "你好！" }],
    correction: null,
    ...extra,
  },
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

  it("hỗ trợ seq = 0 (câu chào mở đầu)", () => {
    let s = assistReducer(initialAssistState, sub(0, "你好！准备好了吗？", 0))
    expect(s.ai.seq).toBe(0)
    s = assistReducer(s, assist(0, { pinyin: "Nǐ hǎo! Zhǔnbèi hǎole ma?" }, 0))
    expect(s.ai.pinyin).toBe("Nǐ hǎo! Zhǔnbèi hǎole ma?")

    // Assist tới trước với seq = 0
    let s2 = assistReducer(initialAssistState, assist(0, { pinyin: "Chào 0" }, 0))
    s2 = assistReducer(s2, sub(0, "Chào", 0))
    expect(s2.ai.pinyin).toBe("Chào 0")
    expect(s2.pending).toEqual({})
  })

  it("câu AI mới xoá gợi ý cũ, mẹo sửa lỗi đi theo assist", () => {
    let s = assistReducer(initialAssistState, sub(1, "a"))
    s = assistReducer(s, assist(1, { correction: { original: "我要二斤", corrected: "我要两斤" } }))
    expect(s.correction.corrected).toBe("我要两斤")
    s = assistReducer(s, sub(2, "b"))
    expect(s.hints).toEqual([])
    expect(s.correction).toBeNull()
    expect(s.ai.pinyin).toBeNull()
    s = assistReducer(s, assist(2))
    expect(s.correction).toBeNull()
  })

  it("assist của lượt cũ / seq cũ không đè câu đang hiện", () => {
    let s = assistReducer(initialAssistState, sub(3, "c"))
    s = assistReducer(s, assist(2, { pinyin: "sai lượt" }))
    expect(s.ai.pinyin).toBeNull()
  })

  it("assist với generation cũ bị bỏ qua, generation mới được cập nhật", () => {
    let s = assistReducer(initialAssistState, sub(1, "a"))
    s = assistReducer(s, assist(1, { generation: 2, pinyin: "gen2" }))
    expect(s.ai.pinyin).toBe("gen2")
    // Generation cũ (1 < 2) bị bỏ qua
    s = assistReducer(s, assist(1, { generation: 1, pinyin: "gen1" }))
    expect(s.ai.pinyin).toBe("gen2")
    // Generation mới (3 > 2) được áp dụng
    s = assistReducer(s, assist(1, { generation: 3, pinyin: "gen3" }))
    expect(s.ai.pinyin).toBe("gen3")
  })

  it("assist tới sớm giữ generation mới nhất trong pending", () => {
    let s = assistReducer(initialAssistState, assist(2, { generation: 2, pinyin: "early gen2" }))
    s = assistReducer(s, assist(2, { generation: 1, pinyin: "early gen1" }))
    s = assistReducer(s, sub(2, "text"))
    expect(s.ai.pinyin).toBe("early gen2")
  })

  it("replay cùng seq không xóa assist đã ghép", () => {
    let s = assistReducer(initialAssistState, sub(1, "câu 1"))
    s = assistReducer(s, assist(1, { pinyin: "pinyin 1", hints: [{ id: "h1", text: "gợi ý" }] }))
    expect(s.ai.pinyin).toBe("pinyin 1")
    expect(s.hints).toHaveLength(1)
    // Replay gửi lại subtitle cùng seq
    s = assistReducer(s, sub(1, "câu 1 replay", 1))
    expect(s.ai.text).toBe("câu 1 replay")
    expect(s.ai.pinyin).toBe("pinyin 1")
    expect(s.hints).toHaveLength(1)
  })

  it("nhiều câu trong cùng một lượt (turn_index giống nhau, seq tăng dần)", () => {
    let s = assistReducer(initialAssistState, sub(1, "câu hỏi 1", 1))
    s = assistReducer(s, assist(1, { pinyin: "pinyin 1", hints: [{ id: "h1", text: "g1" }] }, 1))
    expect(s.ai.pinyin).toBe("pinyin 1")
    expect(s.hints).toHaveLength(1)

    // Câu thứ 2 cùng turn_index=1 nhưng seq=2
    s = assistReducer(s, sub(1, "câu hỏi 2", 2))
    expect(s.ai.text).toBe("câu hỏi 2")
    expect(s.ai.pinyin).toBeNull()
    expect(s.hints).toHaveLength(0)

    s = assistReducer(s, assist(1, { pinyin: "pinyin 2", hints: [{ id: "h2", text: "g2" }] }, 2))
    expect(s.ai.pinyin).toBe("pinyin 2")
    expect(s.hints).toHaveLength(1)
  })

  it("phụ đề của học viên và trạng thái phiên", () => {
    let s = assistReducer(initialAssistState, {
      topic: TOPICS.subtitle,
      data: { seq: 4, role: "learner", text: "我要两斤" },
    })
    expect(s.learner.text).toBe("我要两斤")
    // Bỏ qua packet seq cũ của học viên
    s = assistReducer(s, {
      topic: TOPICS.subtitle,
      data: { seq: 2, role: "learner", text: "cũ" },
    })
    expect(s.learner.text).toBe("我要两斤")

    s = assistReducer(s, {
      topic: TOPICS.state,
      data: { phase: "talking", warn: "silence_10s", script_turns: 3, turn_index: 2 },
    })
    expect([s.phase, s.warn, s.scriptTurns, s.turnIndex]).toEqual(["talking", "silence_10s", 3, 2])
  })
})
