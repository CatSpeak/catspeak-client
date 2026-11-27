// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import MyCalendarPage from "./MyCalendarPage"
import { resolveEffectiveTab } from "../utils/tabGuard"

let mockRole = { isTeacher: false }

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useLocation: () => ({
    key: "location-1",
    pathname: "/workspace/my-calendar",
    state: { activeTab: "event" },
  }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {}, language: "vi" }),
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  useRoleOverride: () => mockRole,
}))

vi.mock("@/features/calendar/hooks/useCalendarEvents", () => ({
  default: () => ({
    filteredEvents: [],
    eventsForSelectedDate: [],
    classesOptions: [],
    isLoading: false,
  }),
}))

vi.mock("@/shared/components/ui/navigation", () => ({
  Tabs: ({ tabs, activeTab }) => (
    <div data-testid="tabs-active">
      {activeTab}|{tabs.map((tab) => tab.id).join(",")}
    </div>
  ),
  TabContent: ({ activeTab, children }) => (
    <div>
      <span data-testid="tab-content-active">{activeTab}</span>
      {children}
    </div>
  ),
}))

vi.mock("../components/my-calendar/CalendarTab", () => ({
  default: () => <div data-testid="calendar-tab">calendar</div>,
}))
vi.mock("../components/my-calendar/DailyEventPanel", () => ({
  default: () => <div>daily</div>,
}))
vi.mock("../components/my-calendar/EventTab", () => ({
  default: () => <div data-testid="event-tab">event</div>,
}))
vi.mock("../components/my-calendar/TeachingScheduleTab", () => ({
  default: () => <div data-testid="teaching-tab">teaching</div>,
}))

const render = () => renderToStaticMarkup(<MyCalendarPage />)

describe("R1-1: MyCalendarPage tab guard does not destroy Teacher tab state", () => {
  beforeEach(() => {
    mockRole = { isTeacher: false, isRoleResolved: true }
  })

  it("resolveEffectiveTab keeps 'event' for Teacher and falls back for Student/unresolved", () => {
    expect(resolveEffectiveTab(true, "event")).toBe("event")
    expect(resolveEffectiveTab(false, "event")).toBe("calendar")
    expect(resolveEffectiveTab(null, "event")).toBe("calendar")
    expect(resolveEffectiveTab(null, "calendar")).toBe("calendar")
  })

  it("Student never renders EventTab (activeTab from state is ignored)", () => {
    const html = render()

    expect(html).toContain("calendar|")
    expect(html).not.toContain('data-testid="event-tab"')
  })

  it("Teacher keeps the requested 'event' tab", () => {
    mockRole = { isTeacher: true, isRoleResolved: true }

    const html = render()

    expect(html).toContain("event|calendar,event,teaching-schedule")
    expect(html).toContain('data-testid="event-tab"')
  })

  it("while the role is unresolved it renders calendar without rendering EventTab", () => {
    mockRole = { isTeacher: null, isRoleResolved: false }

    const html = render()

    expect(html).toContain("calendar|calendar")
    expect(html).not.toContain('data-testid="event-tab"')
  })
})
