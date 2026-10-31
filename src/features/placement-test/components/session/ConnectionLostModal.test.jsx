import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

// The shared Modal/buttons barrels pull the redux store into the test bundle;
// the live-region contract only needs the rendered alert markup.
vi.mock("@/shared/components/ui/Modal", () => ({
  default: ({ open, children, footer }) =>
    open ? (
      <div>
        {children}
        {footer}
      </div>
    ) : null,
}))
vi.mock("@/shared/components/ui/buttons", () => ({
  PillButton: ({ children }) => <button type="button">{children}</button>,
}))

import ConnectionLostModal from "./ConnectionLostModal"

const copy = {
  reconnectTitle: "Mất Kết Nối Đường Truyền",
  reconnectBody: "Hệ thống đang tự kết nối lại.",
  reconnectSafeData: "Đã lưu {{answered}}/{{total}} câu trả lời.",
  reconnectProgressLabel: "Đang thử lại",
  reconnectProgressChip: "{{seconds}}s ({{attempt}}/{{max}})",
  reconnectRetryCta: "Kết nối lại ngay",
  pauseLeaveCta: "Rời phòng thi",
}

describe("ConnectionLostModal", () => {
  it("announces the connection loss assertively", () => {
    // Oracle: user report 2026-10-31 — the connection-lost modal must be a live
    // region. Already implemented at ConnectionLostModal.jsx:47-51; locked here.
    const html = renderToStaticMarkup(
      <ConnectionLostModal
        open
        copy={copy}
        reconnectAttempt={1}
        reconnectRemainingMs={15000}
        currentOrder={2}
        answeredCount={1}
      />,
    )

    expect(html).toContain("Mất Kết Nối Đường Truyền")
    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
  })
})
