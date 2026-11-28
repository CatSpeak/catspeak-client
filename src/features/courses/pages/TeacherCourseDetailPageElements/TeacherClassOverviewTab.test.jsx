// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { describe, expect, it, vi } from "vitest"
import TeacherClassOverviewTab from "./TeacherClassOverviewTab"

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
  useParams: () => ({ id: "1" }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetTeacherCourseTeachingTasksCombinedQuery: () => ({
    data: [],
    isLoading: false,
  }),
}))

vi.mock("./GeneralSection", () => ({ default: () => <div /> }))
vi.mock("./CurrentClassesSection", () => ({ default: () => <div /> }))
vi.mock("../../components/overview/VoucherSection", () => ({
  default: () => <div />,
}))
vi.mock("../../components/sessions/UpcomingSessionCard", () => ({
  default: ({ onViewAll }) => (
    <button type="button" onClick={onViewAll}>
      upcoming-view-all
    </button>
  ),
}))
vi.mock("../../components/assignments/TeachingTasksSection", () => ({
  default: ({ onViewAll }) => (
    <button type="button" onClick={onViewAll}>
      tasks-view-all
    </button>
  ),
}))

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(
      <TeacherClassOverviewTab
        courseData={{ id: 1, classes: [] }}
        teachingTasks={[]}
        isLoadingTasks={false}
      />,
    )
  })
  return container
}

const clickByText = (container, text) => {
  const button = [...container.querySelectorAll("button")].find(
    (item) => item.textContent === text,
  )
  expect(button).toBeTruthy()
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

describe("ISS-65: TeacherClassOverviewTab 'view all' targets", () => {
  it("sends upcoming sessions to /workspace/schedule", () => {
    const container = render()

    clickByText(container, "upcoming-view-all")

    expect(mocks.navigate).toHaveBeenCalledWith("/workspace/schedule")
  })

  it("sends teaching tasks to /workspace/teaching-tasks", () => {
    const container = render()

    clickByText(container, "tasks-view-all")

    expect(mocks.navigate).toHaveBeenCalledWith("/workspace/teaching-tasks")
  })
})
