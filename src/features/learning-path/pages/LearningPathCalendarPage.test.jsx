import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import LearningPathCalendarPage from "./LearningPathCalendarPage"

const { calendarState, previewProps, quotaProps } = vi.hoisted(() => ({
  calendarState: { data: null, search: "" },
  previewProps: { current: null },
  quotaProps: { current: null },
}))

vi.mock("../api/learningPathApi", () => ({
  useGetCalendarQuery: () => ({
    data: calendarState.data,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useLaunchSessionMutation: () => [vi.fn(), { isLoading: false }],
  useChangeLevelMutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useParams: () => ({ lang: "zh" }),
  useSearchParams: () => [
    new URLSearchParams(calendarState.search),
    vi.fn(),
  ],
}))

vi.mock("../components/SessionPreviewModal", () => ({
  default: (props) => {
    previewProps.current = props
    return null
  },
}))

vi.mock("../components/QuotaLockedModal", () => ({
  default: (props) => {
    quotaProps.current = props
    return null
  },
}))

vi.mock("../components/ReminderBanner", () => ({ default: () => null }))
vi.mock("../components/CycleSummaryModal", () => ({ default: () => null }))
vi.mock("../components/LevelChangedModal", () => ({ default: () => null }))
vi.mock("./ComingSoonPage", () => ({ default: () => null }))

const createCalendar = (secondCard = {}) => ({
  status: "Active",
  hskLevel: "HSK 3",
  cycleId: 1,
  completedSessions: 0,
  totalSessions: 5,
  cards: [
    { cardId: "c1", dayIndex: 1, status: "Completed" },
    { cardId: "c2", dayIndex: 2, status: "Scheduled", ...secondCard },
    { cardId: "c3", dayIndex: 3, status: "Completed" },
    { cardId: "c4", dayIndex: 4, status: "Completed" },
    { cardId: "c5", dayIndex: 5, status: "Completed" },
  ],
})

beforeEach(() => {
  previewProps.current = null
  quotaProps.current = null
  calendarState.search = "day=2"
  calendarState.data = createCalendar()
})

describe("LearningPathCalendarPage deep link", () => {
  // Oracle: the placement profile roadmap CTA navigates to `?day=N` and must
  // open that day's preview without launching a session.
  it("opens the preview for the deep-linked day", () => {
    renderToStaticMarkup(<LearningPathCalendarPage />)

    expect(previewProps.current).toMatchObject({ cardId: "c2", isOpen: true })
    expect(quotaProps.current.isOpen).toBe(false)
  })

  it("opens the quota modal instead when the day is quota-locked", () => {
    calendarState.data = createCalendar({ status: "QuotaLocked" })

    renderToStaticMarkup(<LearningPathCalendarPage />)

    expect(quotaProps.current.isOpen).toBe(true)
    expect(previewProps.current.isOpen).toBe(false)
  })

  it("opens nothing when the requested day is not in the calendar", () => {
    calendarState.search = "day=9"

    renderToStaticMarkup(<LearningPathCalendarPage />)

    expect(previewProps.current.isOpen).toBe(false)
    expect(quotaProps.current.isOpen).toBe(false)
  })
})
