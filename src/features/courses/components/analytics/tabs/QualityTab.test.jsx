// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import QualityTab from "./QualityTab"

const tooltip = vi.hoisted(
  () =>
    "Tỷ lệ lượt đăng ký bị hủy trên tổng lượt đăng ký hợp lệ (Đã xác nhận + Đã hủy)",
)

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    language: "vi",
    t: {
      courses: {
        analytics: {
          kpis: {
            avgRating: "Đánh giá trung bình",
            reEnrollmentRate: "Tỷ lệ đăng ký lại",
            fillRate: "Tỷ lệ lấp đầy",
            conversionRate: "Chuyển đổi đăng ký",
            cancellationRate: "Tỷ lệ hủy đăng ký",
            cancellationRateTooltip: tooltip,
          },
          sections: {},
          tableCols: {},
        },
      },
    },
  }),
}))

const emptyQuery = vi.hoisted(() => () => ({ data: undefined }))
vi.mock("@/store/api/coursesApi", () => ({
  useGetAnalyticsQualityOverviewQuery: () => ({
    data: {
      averageRating: 4.5,
      fillRate: 80,
      cancellationRate: null,
      reenrollmentRate: null,
      conversionRate: null,
    },
  }),
  useGetAnalyticsQualityRatingTrendQuery: emptyQuery,
  useGetAnalyticsQualityRatingDistributionQuery: emptyQuery,
  useGetAnalyticsQualityByClassQuery: emptyQuery,
}))

vi.mock("../AnalyticsLineChart", () => ({ default: () => null }))
vi.mock("../AnalyticsBarChart", () => ({ default: () => null }))
vi.mock("../AnalyticsDataTable", () => ({ default: () => null }))

describe("ISS-23: QualityTab cancellation KPI", () => {
  it("shows the enrollment-cancellation label with an explanation tooltip", () => {
    const html = renderToStaticMarkup(<QualityTab group="month" />)

    expect(html).toContain("Tỷ lệ hủy đăng ký")
    expect(html).toContain(tooltip)
  })

  it("renders an em dash instead of 0% when rates come back null", () => {
    const html = renderToStaticMarkup(<QualityTab group="month" />)

    // cancellation + reenrollment + conversion are null in the payload.
    expect((html.match(/—/g) || []).length).toBeGreaterThanOrEqual(3)
    expect(html).toContain("80")
  })
})
