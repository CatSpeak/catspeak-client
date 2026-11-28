// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import NewsCard from "./NewsCard"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ lang: "zh" }),
  useNavigate: () => mocks.navigate,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: { news: { newsCard: { comments: "Bình luận", views: "lượt xem" } } },
  }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

vi.mock("@/shared/context/AuthModalContext", () => ({
  useAuthModal: () => ({ openAuthModal: vi.fn() }),
}))

vi.mock("@/shared/hooks/usePostReaction", () => ({
  default: () => ({ handleReact: vi.fn() }),
}))

vi.mock("@/store/api/social/postsApi", () => ({
  useSharePostMutation: () => [vi.fn()],
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatTimeAgo: () => "1 giờ trước" }),
}))

vi.mock("./ShareModal", () => ({ default: () => null }))
vi.mock("@/shared/components/ui/Carousel", () => ({ default: () => null }))
vi.mock("@/shared/components/ui/ReactionsPopover", () => ({
  default: () => null,
  ReactionIcon: () => null,
}))
vi.mock("./ReactionBadge", () => ({
  ReactionBadge: () => null,
  NEWS_REACTIONS: {},
}))
vi.mock("@/shared/components/ui/indicators/Badge", () => ({
  default: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

const news = {
  postId: 5,
  slug: "hello-world",
  title: "Hello World",
  excerpt: "Excerpt",
  viewCount: 10,
  totalReactions: 0,
  totalComments: 2,
  topics: [{ topicId: 7, title: "travel" }],
}

const renderStatic = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={["/zh/cat-speak/news"]}>
      <NewsCard news={news} />
    </MemoryRouter>,
  )

beforeEach(() => {
  mocks.navigate.mockClear()
})

describe("ISS-68: NewsCard semantic article links", () => {
  it("renders real anchors pointing at the article detail route", () => {
    const html = renderStatic()

    expect(html).toContain('href="/zh/cat-speak/news/hello-world"')
    expect(html).not.toContain("<a><a")
  })

  it("does not nest anchors and keeps topic badges outside the article link", () => {
    const container = document.createElement("div")
    container.innerHTML = renderStatic()

    const anchors = container.querySelectorAll('a[href*="/news/"]')
    expect(anchors.length).toBeGreaterThanOrEqual(2)
    expect(container.querySelectorAll("a a").length).toBe(0)
  })

  it("still navigates to the topic filter when a topic badge is clicked", () => {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <MemoryRouter initialEntries={["/zh/cat-speak/news"]}>
          <NewsCard news={news} />
        </MemoryRouter>,
      )
    })

    const topicButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("#travel"),
    )
    expect(topicButton).toBeTruthy()

    act(() => {
      topicButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/zh/cat-speak/news?topicIds=7",
    )

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
