import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import SessionTopbar from "./SessionTopbar"

const copy = {
  title: "Phòng luyện nói",
  subtitle: "Hội thoại thích ứng AI • HSK 3.0",
  connection: "Kết nối ổn định",
  connectionLost: "Mất kết nối",
  configure: "Cấu hình AI",
  pause: "Tạm dừng bài thi",
}

const render = (props = {}) =>
  renderToStaticMarkup(
    <SessionTopbar copy={copy} onPause={() => {}} onConfigure={() => {}} {...props} />,
  )

describe("SessionTopbar connection badge", () => {
  it("shows the connected label while the session is online", () => {
    const html = render()
    expect(html).toContain("Kết nối ổn định")
    expect(html).not.toContain("Mất kết nối")
  })

  // Oracle: user ruling 2026-10-31 — the badge must follow the same
  // connectionLost state as the modal instead of always claiming stability.
  it("shows the lost-connection label from the same state as the modal", () => {
    const html = render({ connectionLost: true })
    expect(html).toContain("Mất kết nối")
    expect(html).not.toContain("Kết nối ổn định")
  })
})
