// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import ChatSidebar from "./ChatSidebar"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

const noop = () => {}

describe("ISS-02: ChatSidebar surfaces conversation load failures", () => {
  it("shows a retryable error instead of a fake empty list when the query fails", () => {
    const html = renderToStaticMarkup(
      <ChatSidebar
        conversations={[]}
        currentUser={{}}
        selectedId={null}
        onSelect={noop}
        searchQuery=""
        onSearchChange={noop}
        onNewChatClick={noop}
        isLoading={false}
        isError
        onRetry={noop}
      />,
    )

    expect(html).toContain("Không thể tải danh sách cuộc trò chuyện")
    expect(html).toContain("Thử lại")
    expect(html).not.toContain("No conversations found")
  })

  it("still shows the normal empty state when the query succeeded", () => {
    const html = renderToStaticMarkup(
      <ChatSidebar
        conversations={[]}
        currentUser={{}}
        selectedId={null}
        onSelect={noop}
        searchQuery=""
        onSearchChange={noop}
        onNewChatClick={noop}
        isLoading={false}
      />,
    )

    expect(html).toContain("No conversations found")
  })
})
