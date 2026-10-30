import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import AiAvatarPanel from "./AiAvatarPanel"

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
