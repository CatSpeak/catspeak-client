import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import SessionControlRow from "./SessionControlRow"
import { CONVERSATION_PHASE } from "../../constants/conversation"

const copy = {
  muteCta: "Tắt tiếng",
  unmuteCta: "Bật tiếng",
  timerMuted: "Đang tắt tiếng",
  submitCta: "Hoàn tất câu trả lời",
  skipCta: "Bỏ qua câu này",
  scoringSummary: "Đang tổng hợp điểm đánh giá...",
  skippingCta: "Đang chuyển câu tiếp...",
}

const render = (props) =>
  renderToStaticMarkup(
    <SessionControlRow
      copy={copy}
      phase={CONVERSATION_PHASE.LISTENING}
      isRecording
      onToggleMute={vi.fn()}
      onSubmit={vi.fn()}
      onSkip={vi.fn()}
      {...props}
    />,
  )

describe("SessionControlRow skip acknowledgement", () => {
  it("shows the next-question notice instead of the scoring CTA after a skip", () => {
    // Oracle: user ruling 2026-10-31 — skipping must not look like scoring.
    const html = render({
      phase: CONVERSATION_PHASE.SKIPPED,
      isRecording: false,
    })

    expect(html).toContain("Đang chuyển câu tiếp...")
    expect(html).not.toContain("Đang tổng hợp điểm đánh giá...")
  })
})

describe("SessionControlRow mic toggle", () => {
  it("renders the muted state with a crossed-out mic and no level ring", () => {
    // Oracle: user ruling 2026-10-31 — first press mutes and the UI must show it.
    const html = render({ isMuted: true })

    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('aria-label="Bật tiếng"')
    expect(html).toContain("lucide-mic-off")
    expect(html).toContain("Đang tắt tiếng")
    expect(html).not.toContain("-inset-1.5")
  })

  it("renders the live state with an un-muted mic and the level ring", () => {
    // Oracle: user ruling 2026-10-31 — second press unmutes and the meter moves.
    const html = render({ isMuted: false })

    expect(html).toContain('aria-pressed="false"')
    expect(html).toContain('aria-label="Tắt tiếng"')
    expect(html).toContain("lucide-mic")
    expect(html).not.toContain("lucide-mic-off")
    expect(html).toContain("-inset-1.5")
  })
})
