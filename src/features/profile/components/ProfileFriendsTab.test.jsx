// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProfileFriendsTab from "./ProfileFriendsTab"

let mockFriendsState = {}

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/workspace/profile/1", state: null }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: { accountId: 1 } }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

vi.mock("../hooks/useProfileFriends", () => ({
  useProfileFriends: () => mockFriendsState,
}))

vi.mock("@/shared/components/ui/inputs/SearchInput", () => ({
  default: () => <input data-testid="search" />,
}))

vi.mock("@/shared/components/ui/buttons/PillButton", () => ({
  default: ({ children }) => <button>{children}</button>,
}))

vi.mock("@/shared/components/ui/FluentCard", () => ({
  default: ({ children }) => <div>{children}</div>,
}))

vi.mock("@/shared/components/ChipFilter", () => ({
  default: () => <div data-testid="chips" />,
}))

vi.mock("./ProfileFriendsFilterModal", () => ({
  default: () => null,
}))

const baseState = () => ({
  activeSubTab: "all",
  setActiveSubTab: vi.fn(),
  subTabs: [{ id: "all", label: "Tất cả bạn bè" }],
  activeFilter: { keyword: "", accountType: "all", level: "" },
  setActiveFilter: vi.fn(),
  clearActiveFilter: vi.fn(),
  filterActiveCount: 0,
  list: [],
  pendingIncomingList: [],
  pendingOutgoingList: [],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  emptyMessage: "Chưa có bạn bè nào.",
  hasMore: false,
  fetchingRecs: false,
  bottomSentinelRef: { current: null },
  followingIdSet: new Set(),
  sentRequestIds: new Set(),
  outgoingMap: new Map(),
  markRequestSent: vi.fn(),
  unmarkRequestSent: vi.fn(),
  markFollowed: vi.fn(),
  markUnfollowed: vi.fn(),
})

const render = () =>
  renderToStaticMarkup(
    <ProfileFriendsTab targetAccountId={1} isOwnProfile defaultSubTab="all" />,
  )

describe("R1-3: ProfileFriendsTab surfaces list errors instead of an empty state", () => {
  beforeEach(() => {
    mockFriendsState = baseState()
  })

  it("renders an explicit error state with a retry button", () => {
    mockFriendsState = { ...baseState(), isError: true }

    const html = render()

    expect(html).toContain("Không thể tải danh sách bạn bè.")
    expect(html).toContain("Thử lại")
    expect(html).not.toContain("Chưa có bạn bè nào.")
  })

  it("calls refetch when the retry button is clicked", async () => {
    const refetch = vi.fn()
    mockFriendsState = { ...baseState(), isError: true, refetch }

    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ProfileFriendsTab targetAccountId={1} isOwnProfile defaultSubTab="all" />,
      )
    })

    const retry = [...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Thử lại"),
    )
    expect(retry).toBeTruthy()

    await act(async () => {
      retry.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(refetch).toHaveBeenCalledTimes(1)
    root.unmount()
    container.remove()
  })

  it("keeps the honest empty state when the query succeeded", () => {
    const html = render()

    expect(html).toContain("Chưa có bạn bè nào.")
    expect(html).not.toContain("Không thể tải danh sách bạn bè.")
  })
})
