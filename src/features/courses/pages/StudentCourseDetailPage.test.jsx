// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import StudentCourseDetailPage from "./StudentCourseDetailPage"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  error: { status: 404 },
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ id: "999999" }),
  useNavigate: () => mocks.navigate,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      courses: {
        studentCourseDetail: {
          retry: "Thử lại",
          backToCatalog: "Quay lại danh mục",
        },
      },
    },
    language: "vi",
  }),
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({
    formatDate: (value) => String(value),
    formatScheduleTime: (value) => String(value),
    formatScheduleDays: (value) => String(value),
  }),
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetStudentCourseDetailQuery: () => ({
    currentData: undefined,
    isLoading: false,
    isFetching: false,
    error: mocks.error,
    refetch: vi.fn(),
  }),
  useGetExploreCourseDetailQuery: () => ({
    currentData: undefined,
    isLoading: false,
    isFetching: false,
    error: mocks.error,
    refetch: vi.fn(),
  }),
}))

vi.mock("@/store/api/social/conversationsApi", () => ({
  useCreatePrivateConversationMutation: () => [vi.fn()],
}))

vi.mock("@/store/api/userApi", () => ({
  useGetUserProfileQuery: () => ({ data: null }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ isAuthenticated: false }),
}))

vi.mock("../components/RoleSwitcher", () => ({
  default: () => ({ isStudent: true }),
  useRoleOverride: () => ({ isStudent: true }),
}))

vi.mock("./StudentCourseDetailPageElement/GeneralSection", () => ({
  default: () => null,
}))
vi.mock("./StudentCourseDetailPageElement/TeacherInforCard", () => ({
  default: () => null,
}))
vi.mock("./StudentCourseDetailPageElement/CourseTab", () => ({
  default: () => null,
}))

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(<StudentCourseDetailPage />)
  })
  return container
}

describe("ISS-73: StudentCourseDetailPage 404 handling", () => {
  beforeEach(() => {
    mocks.navigate.mockClear()
    mocks.error = { status: 404 }
    window.history.replaceState({}, "", "/")
  })

  it("renders a not-found card with a catalog CTA for 404", () => {
    const container = render()

    expect(container.textContent).toContain(
      "Không tìm thấy thông tin khóa học",
    )

    const cta = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("Khám phá các khóa học khác"),
    )
    expect(cta).toBeTruthy()

    act(() => {
      cta.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mocks.navigate).toHaveBeenCalledWith("/explore-courses")
  })

  it("keeps retry and back-to-catalog actions for non-404 errors", () => {
    mocks.error = { status: 500 }
    const container = render()

    const labels = [...container.querySelectorAll("button")].map(
      (button) => button.textContent,
    )

    expect(labels).toContain("Thử lại")
    expect(labels).toContain("Quay lại danh mục")
    expect(container.textContent).not.toContain(
      "Không tìm thấy thông tin khóa học",
    )
  })
})
