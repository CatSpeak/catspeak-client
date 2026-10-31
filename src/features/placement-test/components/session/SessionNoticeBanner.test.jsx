import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import SessionNoticeBanner from "./SessionNoticeBanner"
import { CONVERSATION_NOTICE } from "../../constants/conversation"

const copy = {
  retryBanner:
    "Chưa nghe được câu trả lời, vui lòng nói lại. (Lần {{attempt}} / {{max}})",
  noHearingBanner: "AI chưa nghe thấy giọng bạn nói.",
  volumeHint: "Hãy nói to hơn.",
}

describe("SessionNoticeBanner", () => {
  it("announces an invalid answer through a live region", () => {
    // Oracle: user ruling 2026-10-30 — the learner must be told why the answer
    // was rejected instead of silently re-recording.
    const html = renderToStaticMarkup(
      <SessionNoticeBanner
        copy={copy}
        notice={CONVERSATION_NOTICE.RETRY}
        retryCount={1}
      />,
    )

    expect(html).toContain("Chưa nghe được câu trả lời, vui lòng nói lại")
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
  })

  it("renders nothing without a notice", () => {
    expect(
      renderToStaticMarkup(<SessionNoticeBanner copy={copy} notice={null} />),
    ).toBe("")
  })
})
