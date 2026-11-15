import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import AiAvatarPanel from "./AiAvatarPanel"

// Oracle: user ruling 2026-10-31 (work/mascot-eye-states/state.md) —
// "Lắng nghe: mắt đỏ san hô. Phân tích: nhắm mắt. Chờ: mắt hổ phách."
const CORAL_EYE = "#CF5B5B"
const AMBER_EYE = "#D97706"

describe("AiAvatarPanel mascot eyes", () => {
  it("opens coral eyes while the AI is listening to the learner", () => {
    const html = renderToStaticMarkup(
      <AiAvatarPanel
        tone="listening"
        statusText="AI đang lắng nghe..."
        isRecording
      />,
    )

    expect(html.match(new RegExp(`fill="${CORAL_EYE}"`, "g")) || []).toHaveLength(2)
    expect(html.match(/class="pt-eye"/g) || []).toHaveLength(2)
  })

  it("closes the eyes while analysing", () => {
    const html = renderToStaticMarkup(
      <AiAvatarPanel
        tone="analyzing"
        statusText="AI đang phân tích..."
        processingLabel="Model đang xử lý"
      />,
    )

    expect(html.match(/pt-eye-closed/g) || []).toHaveLength(2)
    expect(html).not.toContain('class="pt-eye"')
  })

  it("shows amber eyes while waiting for the next question", () => {
    const html = renderToStaticMarkup(
      <AiAvatarPanel
        tone="listening"
        statusText="AI đang đọc câu hỏi, hãy lắng nghe..."
        aiSpeaking
      />,
    )

    expect(html.match(new RegExp(`fill="${AMBER_EYE}"`, "g")) || []).toHaveLength(2)
  })

  it("shows amber eyes while idle before auto-record", () => {
    const html = renderToStaticMarkup(
      <AiAvatarPanel tone="listening" statusText="Hệ thống sẽ tự ghi âm..." />,
    )

    expect(html.match(new RegExp(`fill="${AMBER_EYE}"`, "g")) || []).toHaveLength(2)
  })
})

describe("AiAvatarPanel", () => {
  it("shows the model-processing badge while analysing", () => {
    // Oracle: user ruling 2026-10-30 — "có badge Model đang xử lý".
    const html = renderToStaticMarkup(
      <AiAvatarPanel
        tone="analyzing"
        statusText="AI đang phân tích câu trả lời của bạn..."
        processingLabel="Model đang xử lý"
      />,
    )

    expect(html).toContain("Model đang xử lý")
    expect(html).toContain('role="status"')
  })

  it("hides the badge outside the analysing phase", () => {
    const html = renderToStaticMarkup(
      <AiAvatarPanel
        tone="listening"
        statusText="AI đang lắng nghe..."
        processingLabel="Model đang xử lý"
      />,
    )

    expect(html).not.toContain("Model đang xử lý")
  })
})
