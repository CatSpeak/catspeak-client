import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {}, language: "vi" }),
}))

vi.mock("@/shared/components/ui/navigation/Breadcrumb", () => ({
  default: () => null,
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetDashboardQuery: () => ({ data: {} }),
  useExportDashboardMutation: () => [vi.fn(), { isLoading: false }],
  useGetAllCoursesQuery: () => ({ data: { data: [] } }),
  useGetAllClassesQuery: () => ({ data: { data: [] } }),
}))

vi.mock("./analytics/DashboardFilterBar", () => ({ default: () => null }))
vi.mock("./analytics/AnalyticsKpiCard", () => ({ default: () => null }))
vi.mock("./analytics/AnalyticsKpiGrid", () => ({ default: () => null }))
vi.mock("./analytics/AnalyticsLineChart", () => ({ default: () => null }))
vi.mock("./analytics/AnalyticsBarChart", () => ({ default: () => null }))
vi.mock("./analytics/HotClassRanking", () => ({ default: () => null }))

import WorkspaceDashboardPage from "./WorkspaceDashboardPage"

describe("ISS-33: teacher dashboard mini stats", () => {
  it("stacks the three course/class mini stats on mobile", () => {
    const html = renderToStaticMarkup(<WorkspaceDashboardPage />)

    expect(html).toContain("grid grid-cols-1 sm:grid-cols-3 gap-2")
    expect(html).not.toContain("grid grid-cols-3 gap-1.5")
    expect(html).toContain("Lớp đang mở")
    expect(html).toContain("Lấp đầy TB")
    expect(html).toContain("Hoàn thành TB")
  })
})
