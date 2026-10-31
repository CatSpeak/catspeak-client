import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

// The shared Modal/buttons barrels pull the redux store into the test bundle.
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
  PillButton: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

import PauseSessionModal from "./PauseSessionModal"

const copy = {
  pauseTitle: "Đã Tạm Dừng Khảo Sát",
  pauseBody: "Bộ đếm giờ của câu hỏi hiện tại đã dừng lại.",
  pauseSafeData: "Dữ liệu an toàn: Các câu trả lời trước đó ({{answered}} câu).",
  pauseBudgetLabel: "Thời gian tạm dừng tối đa còn lại:",
  pauseBudgetChip: "⏳ {{time}} phút",
  pauseLeaveCta: "Rời Phòng Thi Tạm Thời",
  pauseResumeCta: "Tiếp Tục Làm Bài Ngay ▷",
  pauseCancelCta: "Hủy bài thi và thi lại từ đầu",
  pauseCancelConfirmTitle: "Hủy bài thi và thi lại từ đầu?",
  pauseCancelConfirmWarning:
    "Bạn sẽ mất {{answered}}/{{total}} câu trả lời đã làm. Bài thi mới bắt đầu từ câu 1 và không thể khôi phục tiến trình cũ.",
  pauseCancelConfirmKeepCta: "Quay lại làm bài",
  pauseCancelConfirmCta: "Hủy và thi lại từ đầu",
}

const baseProps = {
  open: true,
  copy,
  pauseRemainingMs: 25 * 60 * 1000,
  answeredCount: 2,
  onResume: () => {},
  onLeave: () => {},
}

// Walk the element tree because the repo has no DOM test harness; the returned
// component tree still exposes the onClick each CTA is wired to.
const findButton = (node, label) => {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findButton(child, label)
      if (found) return found
    }
    return null
  }
  if (!node || typeof node !== "object") return null
  if (
    node.props?.children === label &&
    typeof node.props?.onClick === "function"
  ) {
    return node
  }
  const { children, footer } = node.props || {}
  return findButton(children, label) || findButton(footer, label)
}

describe("PauseSessionModal cancel confirmation", () => {
  it("asks for confirmation instead of cancelling the session immediately", () => {
    // Oracle: user report 2026-10-31 — the pause-modal cancel CTA must show a
    // consequence confirmation first (previously onClick={onCancel} at
    // PauseSessionModal.jsx:43 cancelled immediately).
    const onRequestCancel = vi.fn()
    const onConfirmCancel = vi.fn()

    const tree = PauseSessionModal({
      ...baseProps,
      onRequestCancel,
      onConfirmCancel,
    })
    const trigger = findButton(tree, copy.pauseCancelCta)

    expect(
      trigger,
      "cancel CTA must open a confirmation before cancelling",
    ).not.toBeNull()
    expect(trigger.props.onClick).toBe(onRequestCancel)
    expect(trigger.props.onClick).not.toBe(onConfirmCancel)
  })

  it("names the answered turns that will be lost before the destructive action", () => {
    const onDismissCancel = vi.fn()
    const onConfirmCancel = vi.fn()

    const tree = PauseSessionModal({
      ...baseProps,
      confirming: true,
      onDismissCancel,
      onConfirmCancel,
    })
    const html = renderToStaticMarkup(tree)

    expect(html).toContain(copy.pauseCancelConfirmTitle)
    expect(html).toContain("2/5")
    expect(html).toContain('role="alert"')
    expect(findButton(tree, copy.pauseCancelConfirmKeepCta).props.onClick).toBe(
      onDismissCancel,
    )
    expect(findButton(tree, copy.pauseCancelConfirmCta).props.onClick).toBe(
      onConfirmCancel,
    )
    // The destructive action is reachable only from the confirmation view.
    expect(findButton(tree, copy.pauseCancelCta)).toBeNull()
  })
})
