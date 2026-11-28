// @vitest-environment happy-dom
import React, { act } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import InstructorPage from "./InstructorPage"

const mocks = vi.hoisted(() => ({
  role: null,
  userProfile: null,
  instructorResult: null,
  instructorQueryOptions: null,
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}))

vi.mock("@/store/api/userApi", () => ({
  useGetUserProfileQuery: () => mocks.userProfile,
}))

vi.mock("@/store/api/instructorApi", () => ({
  instructorApi: { util: { invalidateTags: vi.fn() } },
  buildInstructorFormData: vi.fn(),
  useGetInstructorProfileQuery: (arg, options) => {
    mocks.instructorQueryOptions = options
    return mocks.instructorResult
  },
  useApplyInstructorMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateInstructorProfileMutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  useRoleOverride: () => mocks.role,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      nav: { instructor: "Giảng viên" },
      profile: { instructor: {} },
    },
  }),
}))

vi.mock("@/shared/hooks/useGlobalTask.jsx", () => ({
  useGlobalTask: () => ({ startTask: vi.fn() }),
}))

vi.mock("@/store", () => ({
  store: { dispatch: vi.fn() },
}))

vi.mock("@/shared/components/ui/ConfirmationModal", () => ({
  default: () => null,
}))

vi.mock("@/features/user/pages/instructor/ApprovedProfilePage", () => ({
  default: () => <div data-testid="approved-profile-page" />,
}))

vi.mock(
  "@/features/user/components/instructor/InstructorEmptyState",
  () => ({ default: () => <div data-testid="instructor-empty-state" /> }),
)

vi.mock("@/features/user/components/instructor/InstructorStatusBanner", () => ({
  default: () => <div data-testid="instructor-status-banner" />,
}))

vi.mock("@/features/user/components/instructor/InstructorPersonalInfo", () => ({
  default: () => null,
}))

vi.mock("@/features/user/components/instructor/InstructorLanguages", () => ({
  default: () => null,
}))

vi.mock("@/features/user/components/instructor/InstructorIdentity", () => ({
  default: () => null,
}))

vi.mock("@/features/user/components/instructor/InstructorCredentials", () => ({
  default: () => null,
}))

vi.mock("@/features/user/components/instructor/InstructorMedia", () => ({
  default: () => null,
}))

vi.mock("@/features/user/components/instructor/InstructorSubmitSection", () => ({
  default: () => null,
}))

const renderPage = () => renderToStaticMarkup(<InstructorPage />)

beforeEach(() => {
  mocks.role = {
    isTeacher: false,
    isRoleResolved: true,
    error: null,
    retry: vi.fn(),
    switchRole: vi.fn(),
    isSwitching: false,
  }
  mocks.userProfile = {
    data: { data: { isTeacher: false } },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }
  mocks.instructorResult = {
    data: undefined,
    isLoading: false,
    error: undefined,
    refetch: vi.fn(),
  }
  mocks.instructorQueryOptions = null
})

describe("ISS-51: /setting/instructor respects the active role", () => {
  it("skips /InstructorProfile/my and shows the approved banner for a Student with a linked teacher account", () => {
    mocks.userProfile = {
      data: { data: { isTeacher: true } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
    mocks.role = {
      ...mocks.role,
      isTeacher: false,
    }

    const html = renderPage()

    expect(mocks.instructorQueryOptions.skip).toBe(true)
    expect(html).toContain("Hồ sơ đã được duyệt")
    expect(html).toContain("dark:bg-emerald-950/35")
    expect(html).toContain("background-color:#047857")
    expect(html).toContain("group-hover/pill:!bg-[#065F46]")
  })

  it("keeps the Teacher-role request and renders the approved profile page", () => {
    mocks.role = {
      ...mocks.role,
      isTeacher: true,
    }
    mocks.userProfile = {
      data: { data: { isTeacher: true } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
    mocks.instructorResult = {
      data: { data: { status: "Approved", profileId: 474 } },
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    }

    const html = renderPage()

    expect(mocks.instructorQueryOptions.skip).toBe(false)
    expect(html).toContain('data-testid="approved-profile-page"')
  })

  it("keeps the pure Student path requesting the instructor profile", () => {
    mocks.instructorResult = {
      data: undefined,
      isLoading: false,
      error: { status: 404 },
      refetch: vi.fn(),
    }

    const html = renderPage()

    expect(mocks.instructorQueryOptions.skip).toBe(false)
    expect(html).toContain('data-testid="instructor-empty-state"')
  })
})

describe("R1-1: role resolution error does not hang the spinner", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
    vi.clearAllMocks()
  })

  it("renders the error panel and retries the role when /Account/profile fails", async () => {
    const retryRole = vi.fn()
    mocks.role = {
      isTeacher: null,
      isRoleResolved: false,
      error: { status: 500 },
      retry: retryRole,
      switchRole: vi.fn(),
      isSwitching: false,
    }
    mocks.userProfile = {
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }

    await act(async () => {
      root.render(<InstructorPage />)
    })

    expect(container.textContent).toContain(
      "Không tải được hồ sơ giảng viên",
    )
    expect(container.querySelector(".animate-spin")).toBeNull()

    const retryButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Thử lại"),
    )
    expect(retryButton).toBeTruthy()

    await act(async () => {
      retryButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(retryRole).toHaveBeenCalledTimes(1)
  })
})
