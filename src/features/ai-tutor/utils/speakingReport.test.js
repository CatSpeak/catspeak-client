import { describe, expect, it } from "vitest"
import {
  buildMetrics,
  formatDuration,
  toAnalysisData,
  toGuideData,
  toResultPageProps,
  waitProgress,
} from "./speakingReport"

const REPORT = {
  session_id: "ss_1",
  status: "ready",
  overall_score: 82,
  scores: { vocabulary: 80, grammar: 70, fluency: 76, task_completion: 100, pronunciation: null },
  strengths: ["Bạn trả lời đủ cả 3 câu hỏi, không bỏ lượt nào."],
  errors: [{ seq: 4, original: "我要二斤", corrected: "我要两斤", note_vi: "Trước lượng từ như 斤 thì nói 两." }],
  vocab: [
    { word: "西瓜", pinyin: "xīguā", meaning_vi: "dưa hấu", hsk_level: 2, reason: "topic_keyword", new_card: true },
    { word: "便宜", pinyin: "piányi", meaning_vi: null, meaning_en: "cheap", hsk_level: 2, reason: "new_word", new_card: false },
  ],
  hsk_level: 2,
  duration_ms: 184000,
  learner_turn_count: 3,
  updated_at: "2026-09-24T08:00:00Z",
}

describe("ss11", () => {
  it("ẩn thanh phát âm khi chưa đo, gộp ngữ pháp và từ vựng", () => {
    const labels = buildMetrics(REPORT.scores).map((m) => [m.key, m.score])
    expect(labels).toEqual([["fluency", 76], ["grammar_vocab", 75], ["task", 100]])
    expect(buildMetrics({ ...REPORT.scores, pronunciation: 64 }).map((m) => m.key)).toContain("pronunciation")
  })

  it("dịch báo cáo sang props của ResultPage", () => {
    const p = toResultPageProps(REPORT, { topicTitle: "Mua hoa quả" })
    expect(p.overallScore).toBe(82)
    expect(p.duration).toBe("03:04")
    expect(p.cefrLevel).toBe("Buổi nói cấp HSK 2")
    expect(p.improvements[0]).toContain("“我要二斤” ➔ “我要两斤”")
    expect(p.savedVocabs).toEqual([
      { hanzi: "西瓜", pinyin: "xīguā", meaning: "dưa hấu", isNew: true },
      { hanzi: "便宜", pinyin: "piányi", meaning: "cheap", isNew: false },
    ])
    expect(p.isPartial).toBe(false)
    expect(p.isEmptySession).toBe(false)
  })

  it("phiên rỗng không có danh sách lỗi và được đánh dấu", () => {
    const p = toResultPageProps({ ...REPORT, learner_turn_count: 0, errors: [] })
    expect(p.isEmptySession).toBe(true)
    expect(p.improvements).toEqual([])
  })

  it("không có lỗi thì một câu động viên", () => {
    expect(toResultPageProps({ ...REPORT, errors: [] }).improvements).toHaveLength(1)
  })
})

describe("ss10", () => {
  it("90% trong 3 giây đầu, không chạm 100 khi chưa có báo cáo", () => {
    expect(waitProgress(0, false)).toBe(0)
    expect(waitProgress(3000, false)).toBe(90)
    expect(waitProgress(20000, false)).toBe(99)
    expect(waitProgress(500, true)).toBe(100)
  })

  it("định dạng thời lượng", () => {
    expect(formatDuration(290000)).toBe("04:50")
    expect(formatDuration(null)).toBe("--:--")
  })
})

describe("ss12, ss13", () => {
  const word = {
    seq: 2, word: "苹果", pinyin: "píngguǒ", accuracy: 73, accuracy_status: "Khá", meaning_vi: "quả táo",
    syllables: [
      { index: 1, pinyin: "píng", tone_name: "Thanh 2: Sắc", status: "Chuẩn", accuracy: 91, is_correct: true, note: null },
      { index: 2, pinyin: "guǒ", tone_name: "Thanh 3: Hỏi", status: "Cần luyện", accuracy: 55, is_correct: false,
        note: "Chưa hạ giọng đủ sâu (cao độ cao và bằng)" },
    ],
    pitch: { user_curve: "¯¯¯", user_note: "Cao độ cao và bằng", model_curve: "_/¯", model_note: "Hạ xuống" },
    audio: { seq: 2, start_ms: 100, end_ms: 900 },
    guide_ref_code: "TONE:3",
  }

  it("modal phân tích", () => {
    const d = toAnalysisData(word, { score: 88, result_label: "Tốt lắm!", delta: 15 })
    expect(d.hanzi).toBe("苹果")
    expect(d.meaning).toBe("quả táo")
    expect(d.syllables[1]).toMatchObject({ syllable: "guǒ", isCorrect: false, score: 55 })
    expect(d.pitchComparison.aiPitch).toBe("_/¯")
    expect([d.lastRetestScore, d.lastRetestDelta]).toEqual([88, 15])
    expect(toAnalysisData(word).lastRetestScore).toBeNull()
  })

  it("modal khẩu hình: chưa có clip thì youtubeId null", () => {
    const g = toGuideData({ ref_code: "TONE:3", title: "Hướng dẫn: Thanh 3", steps: ["1", "2", "3"], ai_tip: "tip", video: null })
    expect(g.youtubeId).toBeNull()
    expect(g.steps).toHaveLength(3)
  })
})
