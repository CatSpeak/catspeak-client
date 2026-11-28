// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/features/video-call/context/GlobalVideoCallProvider", () => ({
  useGlobalVideoCall: () => ({ user: { fullName: "Tester" } }),
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatTime: () => "10:00" }),
}))

import MessageBubble from "./MessageBubble"

const t = {
  rooms: {
    chatBox: {
      aiAssistant: "Trợ lý Cat Speak",
      aiFollowUpHeader: "GỢI Ý CÂU HỎI TIẾP THEO CHO AI:",
      aiErrorTitle: "Không thể kết nối trợ lý",
      aiErrorResponse: "Vui lòng thử lại.",
      aiTypingResponse: "AI đang soạn câu trả lời...",
      aiRetry: "Thử lại",
      reply: "Trả lời",
      you: "Bạn",
    },
  },
}

describe("MessageBubble", () => {
  it("renders an unwrapped AI answer instead of raw JSON", () => {
    const html = renderToStaticMarkup(
      <MessageBubble
        t={t}
        msg={{
          id: "ai-1",
          message: '{"answer": "Apple là quả táo."}',
          from: { name: "Public AI", isAi: true },
          status: "done",
          followUpSuggestions: ["Cách phát âm?"],
        }}
      />,
    )

    expect(html).toContain("Apple là quả táo.")
    expect(html).not.toContain('{"answer"')
    expect(html).toContain("Cách phát âm?")
  })

  it("renders starter greeting suggestions in light mode", () => {
    const html = renderToStaticMarkup(
      <MessageBubble
        t={t}
        msg={{
          isStarterGreeting: true,
          suggestions: [{ id: "s1", vi: "Xin chào", targetText: "Hello" }],
          topicInfo: { topicNameVi: "Chào hỏi" },
        }}
      />,
    )

    expect(html).toContain("Xin chào")
    expect(html).toContain("Hello")
  })
})
