import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import React from "react"

// Hoisted state for mocking auth and navigation
const { authState, navigateState, calendarQueryState, locationState } = vi.hoisted(() => ({
  authState: { isAuthenticated: false },
  navigateState: { to: null, state: null },
  locationState: { pathname: "/zh/ai-tutor/learning-path" },
  calendarQueryState: {
    data: null,
    isLoading: false,
    isFetching: false,
    isError: true,
    error: { status: 401, data: { message: "Unauthorized" } },
  },
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
    role: null,
    user: null,
  }),
}))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Navigate: ({ to, state, replace }) => {
      navigateState.to = to
      navigateState.state = state
      return <div data-testid="navigate-redirect" data-to={to} data-require-login={String(state?.requireLogin)} />
    },
    useLocation: () => ({ pathname: locationState.pathname, search: "", hash: "" }),
    useNavigate: () => vi.fn(),
    useParams: () => ({ lang: "zh" }),
    useSearchParams: () => [new URLSearchParams(""), vi.fn()],
    Outlet: () => <div data-testid="outlet-content">ai-tutor-subpage-rendered</div>,
  }
})

vi.mock("@/features/learning-path/api/learningPathApi", () => ({
  useGetCalendarQuery: () => ({
    data: calendarQueryState.data,
    isLoading: calendarQueryState.isLoading,
    isFetching: calendarQueryState.isFetching,
    isError: calendarQueryState.isError,
    error: calendarQueryState.error,
    refetch: vi.fn(),
  }),
  useGetSessionPreviewQuery: () => ({
    data: null,
    isLoading: false,
    isError: false,
  }),
  useLaunchSessionMutation: () => [vi.fn(), { isLoading: false }],
  useChangeLevelMutation: () => [vi.fn(), { isLoading: false }],
}))

// Import the components under test
import SpeakingRoomFlowLayout from "./layouts/SpeakingRoomFlowLayout"
import LearningPathCalendarPage from "../learning-path/pages/LearningPathCalendarPage"

describe("Guest / Unauthenticated User in Gia sư AI", () => {
  it("allows unauthenticated user to view Speaking Room interface without redirecting to login immediately", () => {
    authState.isAuthenticated = false
    locationState.pathname = "/zh/ai-tutor/speaking-room"
    navigateState.to = null
    navigateState.state = null

    const html = renderToStaticMarkup(<SpeakingRoomFlowLayout />)

    // Expected: User can view the speaking room layout (outlet rendered), NOT redirected to login
    expect(html).toContain("ai-tutor-subpage-rendered")
    expect(html).not.toContain('data-require-login="true"')
  })

  it("redirects unauthenticated user to login when attempting to enter an active speaking session directly", () => {
    authState.isAuthenticated = false
    locationState.pathname = "/zh/ai-tutor/speaking-room/sessions/sess-123"
    navigateState.to = null
    navigateState.state = null

    const html = renderToStaticMarkup(<SpeakingRoomFlowLayout />)

    // Expected: Hard session route redirects to login
    expect(html).toContain('data-require-login="true"')
    expect(navigateState.to).toBe("/")
  })

  it("allows unauthenticated user to view 5-day roadmap without 'Không thể tải lộ trình học' error", () => {
    authState.isAuthenticated = false
    locationState.pathname = "/zh/ai-tutor/learning-path"
    calendarQueryState.data = null
    calendarQueryState.isError = true
    calendarQueryState.error = { status: 401 }

    const html = renderToStaticMarkup(<LearningPathCalendarPage />)

    // Expected: User should see guest preview / roadmap UI, NOT 'Không thể tải lộ trình học'
    expect(html).not.toContain("Không thể tải lộ trình học")
    expect(html).toContain("Lộ trình")
    expect(html).toContain("Buổi học trong chu kỳ")
  })
})
