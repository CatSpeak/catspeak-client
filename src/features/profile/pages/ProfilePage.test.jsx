// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProfilePage, { PROFILE_TAB_ALIASES, resolveProfileTab } from "./ProfilePage"

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  navigate: vi.fn(),
  roleState: { isTeacher: false, isTeacherProfile: false },
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  default: () => mocks.roleState,
  useRoleOverride: () => mocks.roleState,
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ accountId: "446" }),
  useNavigate: () => mocks.navigate,
  useLocation: () => ({ search: "" }),
  useSearchParams: () => [mocks.params, vi.fn()],
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: { accountId: 446 } }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      profile: {
        tabs: {
          home: "Nhà",
          friends: "Bạn bè",
          media: "Video/Ảnh",
          documents: "Tài liệu",
          completedClass: "Lớp học đã hoàn thành",
        },
      },
    },
  }),
}))

vi.mock("@/store/api/userApi", () => ({
  useGetPublicProfileQuery: () => ({ data: {}, isLoading: false }),
}))

vi.mock("@/store/api/social/friendshipApi", () => ({
  useGetFriendshipCountsQuery: () => ({
    data: {},
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock("../components/SocialProfileHeader", () => ({
  default: () => <header data-testid="profile-header" />,
}))
vi.mock("../components/ProfilePageSkeleton", () => ({ default: () => null }))
vi.mock("../components/ProfileHomeTab", () => ({
  default: () => <div data-testid="home-tab" />,
}))
vi.mock("../components/ProfileMediaTab", () => ({
  default: () => <div data-testid="media-tab" />,
}))
vi.mock("../components/ProfileFriendsTab", () => ({
  default: () => <div data-testid="friends-tab" />,
}))
vi.mock("../components/ProfileMaterialsTab", () => ({
  default: () => <div data-testid="documents-tab" />,
}))
vi.mock("../components/CompletedClass", () => ({
  default: () => <div data-testid="completed-tab" />,
}))
vi.mock("@/shared/components/ui/animations/FluentAnimation", () => ({
  default: ({ children }) => <div>{children}</div>,
}))
vi.mock("@/shared/components/ui/navigation/Tabs", () => ({
  default: ({ tabs, activeTab }) => (
    <div>
      <div data-testid="active-tab">{activeTab}</div>
      <div data-testid="tab-ids">{tabs.map((tab) => tab.id).join(",")}</div>
    </div>
  ),
  TabContent: ({ children }) => <div>{children}</div>,
}))

const mount = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  const render = () => {
    act(() => {
      root.render(<ProfilePage />)
    })
  }
  render()
  return { container, render }
}

describe("ISS-13: ProfilePage ?tab= normalization", () => {
  it("maps legacy posts/activity aliases to home", () => {
    expect(resolveProfileTab(new URLSearchParams("tab=posts"))).toBe("home")
    expect(resolveProfileTab(new URLSearchParams("tab=activity"))).toBe("home")
  })

  it("keeps the supported tabs", () => {
    expect(resolveProfileTab(new URLSearchParams("tab=friends"))).toBe("friends")
    expect(resolveProfileTab(new URLSearchParams("tab=media"))).toBe("media")
    expect(resolveProfileTab(new URLSearchParams("tab=documents"))).toBe(
      "documents",
    )
    expect(resolveProfileTab(new URLSearchParams("tab=completedClass"))).toBe(
      "completedClass",
    )
  })

  it("defaults to home for missing or unknown tabs", () => {
    expect(resolveProfileTab(new URLSearchParams())).toBe("home")
    expect(resolveProfileTab(new URLSearchParams("tab=whatever"))).toBe("home")
  })

  it("forces the documents tab when a shared material token is present", () => {
    expect(
      resolveProfileTab(
        new URLSearchParams("tab=friends&sharedMaterialToken=abc"),
      ),
    ).toBe("documents")
    expect(PROFILE_TAB_ALIASES.posts).toBe("home")
  })
})

describe("R1-1: shared material token cleanup must not unmount the documents tab", () => {
  beforeEach(() => {
    mocks.params = new URLSearchParams()
    mocks.navigate.mockClear()
    mocks.roleState = { isTeacher: false, isTeacherProfile: false }
  })

  it("keeps ProfileMaterialsTab mounted after the token is removed from the URL", () => {
    mocks.params = new URLSearchParams("sharedMaterialToken=valid-tok")
    const { container, render } = mount()

    expect(container.querySelector('[data-testid="documents-tab"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="home-tab"]')).toBeNull()

    // ProfileMaterialsTab removes the token after opening the material modal.
    mocks.params = new URLSearchParams()
    render()

    expect(container.querySelector('[data-testid="documents-tab"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="home-tab"]')).toBeNull()
    expect(container.querySelector('[data-testid="active-tab"]').textContent).toBe(
      "documents",
    )
  })

  it("still follows ?tab=friends and maps ?tab=posts to home", () => {
    mocks.params = new URLSearchParams("tab=friends")
    const { container, render } = mount()

    expect(container.querySelector('[data-testid="friends-tab"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="active-tab"]').textContent).toBe(
      "friends",
    )

    mocks.params = new URLSearchParams("tab=posts")
    render()

    expect(container.querySelector('[data-testid="home-tab"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="friends-tab"]')).toBeNull()
    expect(container.querySelector('[data-testid="active-tab"]').textContent).toBe(
      "home",
    )
  })
})

describe("ISS-15: documents tab is teacher-only on the personal profile", () => {
  beforeEach(() => {
    mocks.params = new URLSearchParams()
    mocks.navigate.mockClear()
    mocks.roleState = { isTeacher: false, isTeacherProfile: false }
  })

  it("hides the documents tab for a Student owner", () => {
    const { container } = mount()

    expect(container.querySelector('[data-testid="tab-ids"]').textContent).toBe(
      "home,friends,media,completedClass",
    )
    expect(container.querySelector('[data-testid="documents-tab"]')).toBeNull()
  })

  it("falls ?tab=documents back to home for a Student owner", () => {
    mocks.params = new URLSearchParams("tab=documents")
    const { container } = mount()

    expect(container.querySelector('[data-testid="active-tab"]').textContent).toBe(
      "home",
    )
    expect(container.querySelector('[data-testid="home-tab"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="documents-tab"]')).toBeNull()
  })

  it("still mounts ProfileMaterialsTab for a shared material token (ISS-73)", () => {
    mocks.params = new URLSearchParams("sharedMaterialToken=tok")

    const { container } = mount()

    expect(container.querySelector('[data-testid="documents-tab"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="active-tab"]').textContent).toBe(
      "documents",
    )
    expect(container.querySelector('[data-testid="tab-ids"]').textContent).not.toContain(
      "documents",
    )
  })

  it("keeps the documents tab for an approved Teacher owner", () => {
    mocks.roleState = { isTeacher: true, isTeacherProfile: true }
    mocks.params = new URLSearchParams("tab=documents")

    const { container } = mount()

    expect(container.querySelector('[data-testid="tab-ids"]').textContent).toContain(
      "documents",
    )
    expect(container.querySelector('[data-testid="documents-tab"]')).toBeTruthy()
  })

  it("resolveProfileTab honours allowDocuments=false but keeps the token path", () => {
    expect(
      resolveProfileTab(new URLSearchParams("tab=documents"), {
        allowDocuments: false,
      }),
    ).toBe("home")
    expect(
      resolveProfileTab(new URLSearchParams("sharedMaterialToken=x"), {
        allowDocuments: false,
      }),
    ).toBe("documents")
  })
})
