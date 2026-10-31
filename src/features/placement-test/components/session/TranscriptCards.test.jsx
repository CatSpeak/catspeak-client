import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import TranscriptCards from "./TranscriptCards"
import { CONVERSATION_PHASE } from "../../constants/conversation"

const copy = {
  aiLabel: "AI (Minh Minh)",
  replay: "Nghe lại",
  youLabel: "BẠN",
  statusWaiting: "Sẵn sàng",
  statusSubmitted: "Đã nộp bài",
  statusSkipped: "Đã bỏ qua câu này",
  transcriptPlaceholder: "Câu trả lời của bạn sẽ hiện ở đây...",
  analyzingSubline: "Đang tự động phân tích ngữ âm & ngữ pháp...",
  skippedSubline: "Câu này không được tính điểm.",
  waitingSubline: "Hãy nói câu trả lời của bạn bằng tiếng Trung.",
  scriptHanzi: "Chữ Hán",
  scriptPinyin: "Pinyin",
  scriptMeaning: "Tiếng Việt",
}

const question = {
  hanzi: "你周末通常怎么安排时间？",
  pinyin: "Nǐ zhōumò tōngcháng zěnme ānpái shíjiān?",
  meaningVi: "Bạn thường sắp xếp thời gian cuối tuần thế nào?",
}

const render = (props) =>
  renderToStaticMarkup(
    <TranscriptCards
      copy={copy}
      question={question}
      showHanzi
      showPinyin
      showMeaning
      {...props}
    />,
  )

describe("TranscriptCards after skipping a question", () => {
  it("acknowledges the skip instead of pretending the answer was submitted for analysis", () => {
    // Oracle: user ruling 2026-10-31 — skip must read "Đã bỏ qua câu này"
    // and must not show the automatic analysis copy.
    const html = render({ phase: CONVERSATION_PHASE.SKIPPED })

    expect(html).toContain("Đã bỏ qua câu này")
    expect(html).not.toContain("Đã nộp bài")
    expect(html).not.toContain("Đang tự động phân tích")
  })
})
