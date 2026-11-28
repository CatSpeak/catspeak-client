// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import TeacherPublicProfilePage from "./TeacherPublicProfilePage"

let mockTeacher = null
let mockLoading = false
let mockError = false

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ slugOrId: "cat-speak-474" }),
  useLocation: () => ({ pathname: "/explore/teachers/cat-speak-474" }),
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
        sendMessage: "Nhắn tin",
        follow: "Theo dõi",
        following: "Đang theo dõi",
        defaultTeacherHeadline: "Giảng viên ngôn ngữ",
      },
    },
  }),
}))

vi.mock("@/store/api/exploreTeachersApi", () => ({
  useGetExploreTeacherDetailQuery: () => ({
    data: mockTeacher,
    isLoading: mockLoading,
    isError: mockError,
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
vi.mock("../components/TeacherOpenClassCard", () => ({ default: () => null }))
vi.mock("../components/TeacherClassesModal", () => ({ default: () => null }))
vi.mock("../components/TeacherReviewsModal", () => ({ default: () => null }))
vi.mock("../components/TeacherReportModal", () => ({ default: () => null }))

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={["/explore/teachers/cat-speak-474"]}>
      <TeacherPublicProfilePage />
    </MemoryRouter>,
  )

describe("ISS-23: TeacherPublicProfilePage verified badge", () => {
  beforeEach(() => {
    mockLoading = false
    mockError = false
    mockTeacher = {
      accountId: 474,
      fullName: "Cat Speak 474",
      isVerified: false,
      rating: 4.2,
      reviewCount: 3,
      activeClassCount: 0,
      yearsOfExperience: 0,
      activeClasses: [],
      featuredReviews: [],
      starDistribution: {},
    }
  })

  it("hides the verification pill when isVerified is false", () => {
    const html = renderPage()
    expect(html).not.toContain("Giảng viên được xác minh bởi Cat Speak")
  })

  it("shows the verification pill only when isVerified is true", () => {
    mockTeacher = { ...mockTeacher, isVerified: true }
    const html = renderPage()
    expect(html).toContain("Giảng viên được xác minh bởi Cat Speak")
  })
})
