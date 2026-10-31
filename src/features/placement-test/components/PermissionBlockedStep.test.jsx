import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

// The buttons barrel pulls every button implementation and with it the redux
// store; the live-region contract only needs the rendered text.
vi.mock("@/shared/components/ui/buttons", () => ({
  PillButton: ({ children }) => <button type="button">{children}</button>,
}))

import PermissionBlockedStep from "./PermissionBlockedStep"

const copy = {
  blocked: {
    title: "Trình duyệt đang Chặn Quyền Micro",
    body: "CatSpeak cần truy cập microphone để kết nối với phòng thi đàm thoại.",
    consequencesTitle: "Hậu quả nếu không cấp quyền:",
    consequences: ["Không thể hoàn thành bài khảo sát phản xạ nói."],
    stepsTitle: "3 Bước Mở Khóa Microphone",
    steps: [
      { title: "1. Nhấp biểu tượng Ổ khóa", desc: "Nhấp vào icon ổ khóa." },
    ],
    retryCta: "Đã bật mic, Thử lại ngay",
    trust: "CatSpeak không lưu bản ghi.",
  },
}

describe("PermissionBlockedStep", () => {
  it("announces the blocked-mic error assertively", () => {
    // Oracle: user report 2026-10-31 — the denied-permission step replaces the
    // page, so the error must be announced, not only shown.
    const html = renderToStaticMarkup(
      <PermissionBlockedStep copy={copy} onRetry={() => {}} requesting={false} />,
    )

    expect(html).toContain("Trình duyệt đang Chặn Quyền Micro")
    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
  })
})
