// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import AddActivityModal from "./AddActivityModal"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock("@/shared/components/ui/Modal", async () => {
  const React = await import("react")
  return {
    default: ({ children, footer }) =>
      React.createElement("div", null, children, footer),
  }
})

const mockActivityData = vi.hoisted(() => ({
  assignments: [{ id: 1, name: "Assignment Alpha", status: "published" }],
  quizzes: [{ id: 2, title: "Quiz Beta", status: "published" }],
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetTeacherAssignmentsQuery: () => ({
    data: { data: mockActivityData.assignments },
    isLoading: false,
  }),
  useGetTeacherQuizzesQuery: () => ({
    data: { data: mockActivityData.quizzes },
    isLoading: false,
  }),
}))

const dict = vi.hoisted(() => ({
  title: "Thêm hoạt động học tập",
  searchPlaceholder: "Tìm kiếm...",
  filterAll: "Tất cả",
  filterAssignment: "Bài nộp",
  filterQuiz: "Bài kiểm tra",
  visibleToStudents: "Hiển thị với học viên",
  visibleToStudentsDesc: "Tùy chỉnh độ hiển thị với học viên",
  noActivitiesFound: "Không tìm thấy bài tập nào.",
  add: "Thêm hoạt động",
  cancel: "Hủy",
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      courses: {
        lectureHall: { loading: "Đang tải...", modals: { addActivity: dict } },
      },
    },
  }),
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatDateTime: () => "01/01/2026" }),
}))

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}))

describe("ISS-66: AddActivityModal search, filter, checkbox and contrast", () => {
  it("renders search, filter controls and accessible contrast classes", () => {
    mockActivityData.assignments = []
    mockActivityData.quizzes = []
    const emptyHtml = renderToStaticMarkup(
      <AddActivityModal open classId={26} onClose={() => {}} onSubmit={() => {}} />,
    )
    mockActivityData.assignments = [
      { id: 1, name: "Assignment Alpha", status: "published" },
    ]
    mockActivityData.quizzes = [{ id: 2, title: "Quiz Beta", status: "published" }]
    const html = renderToStaticMarkup(
      <AddActivityModal open classId={26} onClose={() => {}} onSubmit={() => {}} />,
    )

    expect(html).toContain("Tìm kiếm...")
    expect(html).toContain("Tất cả")
    expect(html).toContain("Bài nộp")
    expect(html).toContain("Bài kiểm tra")
    expect(emptyHtml).toContain("text-gray-600 dark:text-gray-300")
    expect(emptyHtml).not.toContain("text-[#9CA3AF] dark:text-gray-500")
    expect(html).toContain("bg-[#595959] dark:bg-[#4B5563]")
    expect(html).not.toContain("bg-[#777777]")
    expect(html).toContain("Hiển thị với học viên")
    expect(html).toContain("Tùy chỉnh độ hiển thị với học viên")
  })

  it("filters by search text and by activity type", async () => {
    const ReactDOM = await import("react-dom/client")
    const { act } = await import("react")
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <AddActivityModal open classId={26} onClose={() => {}} onSubmit={() => {}} />,
      )
    })

    expect(container.textContent).toContain("Assignment Alpha")
    expect(container.textContent).toContain("Quiz Beta")

    const search = container.querySelector("input")
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set
      setter.call(search, "Quiz")
      search.dispatchEvent(new window.Event("input", { bubbles: true }))
    })

    expect(container.textContent).toContain("Quiz Beta")
    expect(container.textContent).not.toContain("Assignment Alpha")

    // Clear search, then apply the "Bài nộp" type filter.
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set
      setter.call(search, "")
      search.dispatchEvent(new window.Event("input", { bubbles: true }))
    })
    const assignmentFilter = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent === "Bài nộp",
    )
    await act(async () => {
      assignmentFilter.dispatchEvent(new window.MouseEvent("click", { bubbles: true }))
    })

    expect(container.textContent).toContain("Assignment Alpha")
    expect(container.textContent).not.toContain("Quiz Beta")
    expect(assignmentFilter.getAttribute("aria-pressed")).toBe("true")

    await act(async () => root.unmount())
    container.remove()
  })

  it("toggles a selection exactly once per checkbox click", async () => {
    const ReactDOM = await import("react-dom/client")
    const { act } = await import("react")
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <AddActivityModal open classId={26} onClose={() => {}} onSubmit={() => {}} />,
      )
    })

    const submitButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent.includes("Thêm hoạt động"),
    )
    expect(submitButton.disabled).toBe(true)

    const checkbox = container.querySelector('[role="checkbox"]')
    await act(async () => {
      checkbox.dispatchEvent(new window.MouseEvent("click", { bubbles: true }))
    })
    expect(submitButton.disabled).toBe(false)

    await act(async () => {
      checkbox.dispatchEvent(new window.MouseEvent("click", { bubbles: true }))
    })
    expect(submitButton.disabled).toBe(true)

    await act(async () => root.unmount())
    container.remove()
  })
})
