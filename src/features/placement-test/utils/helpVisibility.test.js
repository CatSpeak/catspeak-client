import { describe, expect, it } from "vitest"
import { isHelpHidden } from "@/features/help/utils/helpVisibility"

// Nút "?" nổi góc phải-dưới đè lên cụm nút điều khiển cuối khung phòng thi đánh giá
// trình độ, sát nút "Hoàn tất câu trả lời" (~8px). Ruling 2026-10-31: ẩn "?" trong
// phòng thi, đồng bộ với /meet, /room, /chat.
describe("help widget route gating", () => {
  it("hides the floating help button inside the placement exam room", () => {
    expect(isHelpHidden("/zh/ai-tutor/level-assessment/session")).toBe(true)
    expect(isHelpHidden("/vi/ai-tutor/level-assessment/session")).toBe(true)
  })

  it("keeps the help button on the placement entry, scoring and result pages", () => {
    expect(isHelpHidden("/zh/ai-tutor/level-assessment")).toBe(false)
    expect(isHelpHidden("/zh/ai-tutor/level-assessment/scoring")).toBe(false)
    expect(isHelpHidden("/zh/ai-tutor/level-assessment/result")).toBe(false)
  })

  it("still hides the help button in live rooms and chat", () => {
    expect(isHelpHidden("/vi/meet/abc")).toBe(true)
    expect(isHelpHidden("/vi/chat")).toBe(true)
  })
})
