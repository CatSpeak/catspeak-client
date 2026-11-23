import { describe, expect, it } from "vitest"
import { alignTyped, blankSentence, checkTypedAnswer, hasHan, parsePinyin } from "./practiceText"

const NIHAO = { word: "你好", pinyin: "nǐ hǎo" }
const LV = { word: "绿", pinyin: "lǜ" }
const MAMA = { word: "妈妈", pinyin: "māma" }

describe("parsePinyin", () => {
  it("dấu thanh và số thanh ra cùng một dạng", () => {
    expect(parsePinyin("nǐ hǎo")).toEqual({ letters: "nihao", tones: "33" })
    expect(parsePinyin("ni3hao3")).toEqual({ letters: "nihao", tones: "33" })
    expect(parsePinyin("Ni3 Hao3")).toEqual({ letters: "nihao", tones: "33" })
  })
  it("ü, v và u: là một", () => {
    expect(parsePinyin("lǜ")).toEqual(parsePinyin("lv4"))
    expect(parsePinyin("lu:4")).toEqual(parsePinyin("lǜ"))
  })
  it("thanh nhẹ không tính", () => {
    expect(parsePinyin("māma")).toEqual(parsePinyin("ma1ma5"))
    expect(parsePinyin("ma1ma0")).toEqual(parsePinyin("ma1ma"))
  })
  it("dấu nháy tách âm tiết bị bỏ qua", () => {
    expect(parsePinyin("Xī'ān").letters).toBe("xian")
  })
})

describe("checkTypedAnswer", () => {
  it("chữ Hán: so khớp chính xác, bỏ dấu câu và khoảng trắng", () => {
    expect(checkTypedAnswer("你好", NIHAO)).toBe("correct")
    expect(checkTypedAnswer(" 你好。", NIHAO)).toBe("correct")
    expect(checkTypedAnswer("你们", NIHAO)).toBe("wrong")
  })
  it("pinyin đúng thanh -> correct, dạng nào cũng được", () => {
    expect(checkTypedAnswer("nǐhǎo", NIHAO)).toBe("correct")
    expect(checkTypedAnswer("ni3 hao3", NIHAO)).toBe("correct")
    expect(checkTypedAnswer("lv4", LV)).toBe("correct")
    expect(checkTypedAnswer("ma1ma", MAMA)).toBe("correct")
  })
  it("pinyin thiếu hoặc sai thanh -> partial", () => {
    expect(checkTypedAnswer("nihao", NIHAO)).toBe("partial")
    expect(checkTypedAnswer("ni2hao3", NIHAO)).toBe("partial")
  })
  it("pinyin sai mặt chữ -> wrong; để trống -> blank", () => {
    expect(checkTypedAnswer("nihau", NIHAO)).toBe("wrong")
    expect(checkTypedAnswer("   ", NIHAO)).toBe("blank")
  })
  it("thẻ không có pinyin thì chỉ nhận chữ Hán", () => {
    expect(checkTypedAnswer("nihao", { word: "你好" })).toBe("wrong")
  })
  it("hasHan nhận ra chữ Hán", () => {
    expect(hasHan("abc")).toBe(false)
    expect(hasHan("a你")).toBe(true)
  })
})

describe("alignTyped (Gõ câu)", () => {
  const target = "我很好，谢谢。"
  it("không bắt gõ dấu câu", () => {
    const r = alignTyped(target, "我很好谢谢")
    expect(r.done).toBe(true)
    expect(r.chars.filter((c) => c.state === "skip").map((c) => c.ch)).toEqual(["，", "。"])
  })
  it("đánh dấu chữ sai và vị trí con trỏ", () => {
    const r = alignTyped(target, "我很")
    expect(r.chars.map((c) => c.state).slice(0, 4)).toEqual(["ok", "ok", "caret", "skip"])
    const bad = alignTyped(target, "我狠")
    expect(bad.chars[1].state).toBe("bad")
    expect(bad.done).toBe(false)
  })
  it("gõ thừa chữ thì chưa xong", () => {
    expect(alignTyped("你好", "你好啊").done).toBe(false)
  })
  it("chấp nhận dấu câu nửa khổ học viên tự gõ", () => {
    expect(alignTyped(target, "我很好, 谢谢.").done).toBe(true)
  })
})

describe("blankSentence (Nghe và điền)", () => {
  it("ưu tiên example_blank của server", () => {
    expect(blankSentence({ example_blank: "我＿＿", example_sentence: "我你好", word: "你好" })).toBe("我＿＿")
  })
  it("tự khoét từ khi server chưa trả", () => {
    expect(blankSentence({ example_sentence: "他说你好。", word: "你好" })).toBe("他说＿＿。")
  })
  it("câu không chứa từ -> null (chuyển sang nghe từ)", () => {
    expect(blankSentence({ example_sentence: "他走了。", word: "你好" })).toBeNull()
  })
})
