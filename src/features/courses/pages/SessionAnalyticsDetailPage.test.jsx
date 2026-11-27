// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import SessionAnalyticsDetailPage from "./SessionAnalyticsDetailPage"

let mockSession = { data: undefined, isLoading: false, isError: false }

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ classId: "1", sessionId: "2" }),
  useNavigate: () => vi.fn(),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

vi.mock("@/store/api/roomsApi", () => ({
  useGetSessionSpeakingStatsQuery: () => mockSession,
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetClassDetailQuery: () => ({ data: null, isLoading: false }),
}))

describe("ISS-04: SessionAnalyticsDetailPage honesty states", () => {
  beforeEach(() => {
    mockSession = { data: undefined, isLoading: false, isError: false }
  })

  it("renders an explicit error state with retry instead of fake KPIs", () => {
    mockSession = { data: undefined, isLoading: false, isError: true, refetch: vi.fn() }

    const html = renderToStaticMarkup(<SessionAnalyticsDetailPage />)

    expect(html).toContain("Không thể tải dữ liệu phân tích")
    expect(html).toContain("Thử lại")
    expect(html).not.toContain("45%")
    expect(html).not.toContain("55%")
    expect(html).not.toContain("Lý tưởng")
  })

  it("renders an empty state when the session has no analytics", () => {
    mockSession = { data: undefined, isLoading: false, isError: false }

    const html = renderToStaticMarkup(<SessionAnalyticsDetailPage />)

    expect(html).toContain("Chưa có dữ liệu phân tích buổi học")
  })

  it("never shows 45/55 when the payload omits teacherTalkRatio", () => {
    mockSession = {
      data: { participants: [], overview: {}, fairShare: {} },
      isLoading: false,
      isError: false,
    }

    const html = renderToStaticMarkup(<SessionAnalyticsDetailPage />)

    expect(html).not.toContain("45%")
    expect(html).not.toContain("55%")
    expect(html).not.toContain("Lý tưởng")
  })
})
