// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ExploreCoursesPage from "./ExploreCoursesPage"

const mocks = vi.hoisted(() => ({
  catalogCalls: [],
  teacherCalls: [],
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {}, language: "vi" }),
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetExploreCoursesQuery: (...args) => {
    mocks.catalogCalls.push(args[0])
    return {
      data: { items: [] },
      isLoading: false,
      isFetching: false,
      error: null,
    }
  },
}))

vi.mock("@/store/api/exploreTeachersApi", () => ({
  useGetExploreTeachersQuery: (...args) => {
    mocks.teacherCalls.push(args[0])
    return {
      data: { data: [], pagination: {} },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    }
  },
}))

vi.mock("../components/CourseSearchInput", () => ({ default: () => null }))
vi.mock("../components/CourseSelectFilter", () => ({ default: () => null }))
vi.mock("../components/shared/ViewModeToggle", () => ({ default: () => null }))
vi.mock("../student/components/StudentCourseCard", () => ({
  default: () => null,
}))
vi.mock("../components/ClassCard", () => ({ default: () => null }))
vi.mock("../components/TeacherCard", () => ({ default: () => null }))
vi.mock("../components/CourseTabs", () => ({ default: () => null }))
vi.mock("../components/ExploreCoursesFilterModal", () => ({
  default: () => null,
}))
vi.mock("@/shared/components/ui/indicators", () => ({
  LoadingSpinner: () => null,
}))

describe("ISS-71: ExploreCoursesPage default community language", () => {
  beforeEach(() => {
    mocks.catalogCalls = []
    mocks.teacherCalls = []
    localStorage.removeItem("communityLanguage")
  })

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
