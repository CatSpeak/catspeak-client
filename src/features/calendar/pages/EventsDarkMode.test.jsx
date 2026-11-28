// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import WorkspaceEventsPage from "./WorkspaceEventsPage"
import CreateEventPage from "./CreateEventPage"

const formState = vi.hoisted(() => ({
  title: "Sự kiện mẫu",
  startTime: null,
  endTime: null,
  eventLocation: "",
  description: "",
  isOnline: null,
  eventColor: "#990011",
  selectedTimezone: { id: "Asia/Ho_Chi_Minh", name: "Asia/Ho_Chi_Minh" },
  isLoading: false,
  errors: {},
  handleSubmit: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useLocation: () => ({
    key: "location-1",
    pathname: "/workspace/events/create",
    state: {},
  }),
  useParams: () => ({ lang: "zh" }),
}))

vi.mock("react-redux", async (importOriginal) => ({
  ...(await importOriginal()),
  useSelector: () => true,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {}, language: "vi" }),
}))

vi.mock("@/shared/context/AuthModalContext", () => ({
  useAuthModal: () => ({ openAuthModal: vi.fn() }),
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatTime: (value) => value }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: { accountId: 1 } }),
}))

vi.mock("@/store/api/eventsApi", () => ({
  useGetMyEventsQuery: () => ({
    data: { occurrences: [] },
    isLoading: false,
    error: null,
  }),
  useGetEventDraftsQuery: () => ({ data: [] }),
  useDeleteEventMutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock("../hooks/useEventForm", () => ({
  useEventForm: () => formState,
}))

vi.mock("../components/workspace-events/RegistrationsModal", () => ({
  default: () => null,
}))
vi.mock("../components/workspace-events/EventFetcher", () => ({
  default: () => null,
}))
vi.mock("../components/workspace-events/WorkspaceEventCard", () => ({
  default: () => null,
}))
vi.mock("../components/CreateEventModal/EventDateTimeSection", () => ({
  default: () => null,
}))
vi.mock("../components/CreateEventModal/EventRecurrenceSection", () => ({
  default: () => null,
}))
vi.mock("../components/CreateEventModal/EventDetailsSection", () => ({
  default: () => null,
}))
vi.mock("../components/EventDetailModal/EditChoiceModal", () => ({
  default: () => null,
}))
vi.mock("../components/Mapview", () => ({ default: () => null }))
vi.mock("@/shared/components/ui/Modal", () => ({ default: () => null }))
vi.mock("@/shared/components/ui/Dropdown", () => ({ default: () => null }))

describe("WorkspaceEventsPage dark mode", () => {
  it("renders the title and empty state with dark surfaces", () => {
    const html = renderToStaticMarkup(<WorkspaceEventsPage />)

    expect(html).toContain("text-red-900 dark:text-[#FF7A8A]")
    expect(html).toContain("bg-gray-50/50 dark:bg-[#1A1A1A]")
    expect(html).toContain("border-border dark:border-[#3F3F3F]")
    expect(html).toContain("text-gray-600 dark:text-neutral-400")
  })
})

describe("CreateEventPage dark mode", () => {
  it("renders the description label and textarea with dark variants", () => {
    const html = renderToStaticMarkup(<CreateEventPage />)

    expect(html).toContain("Mô tả sự kiện (tùy chọn)")
    expect(html).toContain("text-gray-700 dark:text-gray-300")
    expect(html).toContain("dark:bg-[#242424]")
    expect(html).toContain("dark:border-[#3F3F3F]")
    expect(html).toContain("dark:placeholder:text-neutral-500")
    expect(html).toContain("dark:focus:border-red-400")
    expect(html).toContain("text-gray-500 dark:text-neutral-400")
  })
})
