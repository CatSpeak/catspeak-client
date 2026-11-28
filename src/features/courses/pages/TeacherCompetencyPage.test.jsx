// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import TeacherCompetencyPage from "./TeacherCompetencyPage"

let mockTeacher = null

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ slugOrId: "cat-speak-474" }),
  useLocation: () => ({ pathname: "/explore/teachers/cat-speak-474/competency" }),
}))

vi.mock("react-redux", () => ({ useDispatch: () => vi.fn() }))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      courses: {
        verifiedBadge: "Giảng viên được xác minh bởi Cat Speak",
        yearsExp: "{{count}} Năm KN",
        openClassesCount: "{{count}} lớp đang mở",
        lastUpdated: "Cập nhật lần cuối: {{time}}",
      },
    },
  }),
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatDate: (value) => `FMT:${value}` }),
}))

vi.mock("@/store/api/exploreTeachersApi", () => ({
  useGetExploreTeacherCompetencyQuery: () => ({
    data: mockTeacher,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock("@/store/api/social/friendshipApi", () => ({
  useGetConnectionStatusQuery: () => ({ data: null }),
  useFollowUserMutation: () => [vi.fn(), { isLoading: false }],
  useUnfollowUserMutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock("@/store/slices/messageWidgetSlice", () => ({ openWidget: vi.fn() }))

vi.mock("@/shared/components/ui/ConfirmationModal", () => ({
  default: () => null,
}))
vi.mock("../components/TeacherReviewsModal", () => ({ default: () => null }))

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <TeacherCompetencyPage />
    </MemoryRouter>,
  )

describe("ISS-62: TeacherCompetencyPage never fabricates profile data", () => {
  beforeEach(() => {
    mockTeacher = {
      accountId: 474,
      fullName: "Cat Speak 474",
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      activeClassCount: 0,
      yearsOfExperience: 0,
      lastUpdatedAt: null,
      introduction: "Giới thiệu của giảng viên",
      certificates: [],
      education: [],
      experience: [],
      featuredReviews: [],
      starDistribution: {},
    }
  })

  it("hides the badge, experience, last-updated and never prints 10 courses", () => {
    const html = renderPage()

    expect(html).not.toContain("Giảng viên được xác minh bởi Cat Speak")
    expect(html).not.toContain("Năm KN")
    expect(html).not.toContain("2 ngày trước")
    expect(html).not.toContain("10 Khóa")
    expect(html).toContain("0 lớp đang mở")
  })

  it("paints no filled stars when rating is 0.0 (only the header icon is filled)", () => {
    const html = renderPage()
    const filled = html.match(/fill-amber-400/g) || []
    expect(filled.length).toBe(1)
  })

  it("renders real experience, update date and 4 filled stars when present", () => {
    mockTeacher = {
      ...mockTeacher,
      isVerified: true,
      rating: 4.2,
      yearsOfExperience: 5,
      lastUpdatedAt: "2026-11-20T00:00:00Z",
    }
    const html = renderPage()

    expect(html).toContain("Giảng viên được xác minh bởi Cat Speak")
    expect(html).toContain("5 Năm KN")
    expect(html).toContain("FMT:2026-11-20T00:00:00Z")
    const filled = html.match(/fill-amber-400/g) || []
    expect(filled.length).toBe(5) // header icon + 4 rating stars
  })
})
