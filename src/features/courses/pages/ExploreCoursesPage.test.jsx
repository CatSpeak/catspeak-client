// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import ExploreCoursesPage from "./ExploreCoursesPage"

const mocks = vi.hoisted(() => ({
  catalogCalls: [],
  teacherCalls: [],
  teacherCardProps: [],
  searchParams: new URLSearchParams(),
  catalogError: null,
  catalogItems: [],
  teachers: [],
  refetchCatalog: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [mocks.searchParams, vi.fn()],
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {}, language: "vi" }),
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetExploreCoursesQuery: (...args) => {
    mocks.catalogCalls.push(args[0])
    return {
      data: mocks.catalogError ? null : { items: mocks.catalogItems },
      isLoading: false,
      isFetching: false,
      error: mocks.catalogError,
      refetch: mocks.refetchCatalog,
    }
  },
}))

vi.mock("@/store/api/exploreTeachersApi", () => ({
  useGetExploreTeachersQuery: (...args) => {
    mocks.teacherCalls.push(args[0])
    return {
      data: { data: mocks.teachers, pagination: {} },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    }
  },
}))

vi.mock("../components/CourseSearchInput", () => ({ default: () => null }))
vi.mock("../components/CourseSelectFilter", () => ({ default: () => null }))
vi.mock("../components/shared/ViewModeToggle", () => ({
  default: ({ onChange }) => (
    <div>
      <button type="button" onClick={() => onChange("grid")}>
        grid-mode
      </button>
      <button type="button" onClick={() => onChange("list")}>
        list-mode
      </button>
    </div>
  ),
}))
vi.mock("../student/components/StudentCourseCard", () => ({
  default: () => null,
}))
vi.mock("../components/ClassCard", () => ({ default: () => null }))
vi.mock("../components/TeacherCard", () => ({
  default: (props) => {
    mocks.teacherCardProps.push(props)
    return <div data-testid="teacher-card" data-viewmode={props.viewMode} />
  },
}))
vi.mock("../components/CourseTabs", () => ({ default: () => null }))
vi.mock("../components/ExploreCoursesFilterModal", () => ({
  default: ({ onApply }) => (
    <button
      type="button"
      onClick={() =>
        onApply({
          enrollmentStatus: "all",
          minPrice: "2000000",
          maxPrice: "100000",
        })
      }
    >
      apply-invalid-range
    </button>
  ),
}))
vi.mock("@/shared/components/ui/indicators", () => ({
  LoadingSpinner: () => null,
}))

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let root = null

const mount = () => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(<ExploreCoursesPage />)
  })
  return container
}

const clickByText = (container, text) => {
  const button = Array.from(
    document.querySelectorAll("button"),
  ).find((element) => element.textContent.trim() === text)
  expect(button).toBeTruthy()
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

beforeEach(() => {
  mocks.catalogCalls = []
  mocks.teacherCalls = []
  mocks.teacherCardProps = []
  mocks.searchParams = new URLSearchParams()
  mocks.catalogError = null
  mocks.catalogItems = []
  mocks.teachers = []
  mocks.refetchCatalog.mockClear()
  localStorage.removeItem("communityLanguage")
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
})

afterEach(() => {
  if (root) {
    act(() => root.unmount())
    root = null
  }
  document.body.innerHTML = ""
})

describe("ISS-71: ExploreCoursesPage default community language", () => {
  it("queries Chinese when no communityLanguage preference is stored", () => {
    renderToStaticMarkup(<ExploreCoursesPage />)

    expect(mocks.catalogCalls[0].language).toBe("chinese")
    expect(mocks.teacherCalls[0].language).toBe("chinese")
  })

  it("still honours an explicit stored language", () => {
    localStorage.setItem("communityLanguage", "en")

    renderToStaticMarkup(<ExploreCoursesPage />)

    expect(mocks.catalogCalls[0].language).toBe("english")
  })
})

describe("ISS-47: teacher list layout", () => {
  it("hands the selected viewMode down to TeacherCard", () => {
    mocks.searchParams = new URLSearchParams("type=teachers")
    mocks.teachers = [{ id: 1, name: "Teacher One" }]

    const container = mount()

    expect(mocks.teacherCardProps.at(-1).viewMode).toBe("grid")

    clickByText(container, "list-mode")

    expect(mocks.teacherCardProps.at(-1).viewMode).toBe("list")
    expect(
      container.querySelector('[data-testid="teacher-card"]').dataset.viewmode,
    ).toBe("list")
  })
})

describe("ISS-49: invalid price range alert", () => {
  it("explains the filter error and offers a real clear-filters action", () => {
    mocks.catalogError = {
      status: 400,
      data: { errorCode: "INVALID_PRICE_RANGE" },
    }

    const container = mount()

    clickByText(container, "apply-invalid-range")

    const alert = container.querySelector('[role="alert"]')
    expect(alert).toBeTruthy()
    expect(alert.textContent).toContain("Khoảng giá lọc không hợp lệ")
    expect(alert.textContent).not.toContain("kiểm tra kết nối")

    const clearButton = Array.from(alert.querySelectorAll("button")).find(
      (button) => button.textContent.trim() === "Xóa bộ lọc",
    )
    expect(clearButton).toBeTruthy()

    act(() => {
      clearButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const clearedAlert = container.querySelector('[role="alert"]')
    expect(clearedAlert).toBeTruthy()
    expect(
      Array.from(clearedAlert.querySelectorAll("button")).some(
        (button) => button.textContent.trim() === "Xóa bộ lọc",
      ),
    ).toBe(false)
  })
})
