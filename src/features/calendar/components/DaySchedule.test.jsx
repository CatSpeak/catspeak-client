// @vitest-environment happy-dom
import React from "react"
import dayjs from "dayjs"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import DaySchedule from "./DaySchedule"

const api = vi.hoisted(() => ({
  getRegistered: vi.fn(() => ({ data: undefined, isLoading: false })),
  getStudentRegistered: vi.fn(() => ({ data: undefined, isLoading: false })),
}))

let mockAuth = false
let mockRole = { isTeacher: false }

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ lang: "zh" }),
}))

vi.mock("react-redux", async (importOriginal) => ({
  ...(await importOriginal()),
  useSelector: () => mockAuth,
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  useRoleOverride: () => mockRole,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {}, language: "vi" }),
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatCustom: (v) => v }),
}))

vi.mock("@/store/api/eventsApi", () => ({
  useGetEventsByDateQuery: () => ({ data: undefined, isLoading: false }),
  useGetRegisteredEventsQuery: api.getRegistered,
  useGetStudentRegisteredEventsQuery: api.getStudentRegistered,
  useGetEventByIdQuery: () => ({ data: undefined }),
  useGetEventOccurrenceByIdQuery: () => ({ data: undefined }),
}))

vi.mock("./day-schedule/DayScheduleMonthView", () => ({
  default: () => <div>month</div>,
}))
vi.mock("./day-schedule/DayScheduleDayView", () => ({
  default: () => <div>day</div>,
}))
vi.mock("./day-schedule/DayScheduleEventDetail", () => ({
  default: () => <div>detail</div>,
}))

const render = () =>
  renderToStaticMarkup(
    <DaySchedule
      currentDate={dayjs("2026-11-01")}
      activeFilters={{ eventTypes: [], classIds: [] }}
      eventCountsByDay={{}}
      totalUniqueEvents={0}
      totalUniqueRegisteredEvents={0}
      onSelectDate={() => {}}
    />,
  )

describe("ISS-08 / ISS-09: DaySchedule query gating", () => {
  beforeEach(() => {
    api.getRegistered.mockClear()
    api.getStudentRegistered.mockClear()
  })

  it("skips both registered-event queries for guests", () => {
    mockAuth = false
    mockRole = { isTeacher: false }

    render()

    expect(api.getRegistered).toHaveBeenCalledWith(undefined, { skip: true })
    expect(api.getStudentRegistered).toHaveBeenCalledWith(undefined, {
      skip: true,
    })
  })

  it("lets an authenticated teacher load registered events", () => {
    mockAuth = true
    mockRole = { isTeacher: true }

    render()

    expect(api.getRegistered).toHaveBeenCalledWith(undefined, { skip: false })
    expect(api.getStudentRegistered).toHaveBeenCalledWith(undefined, {
      skip: false,
    })
  })

  it("skips teacher management queries for an authenticated student", () => {
    mockAuth = true
    mockRole = { isTeacher: false }

    render()

    expect(api.getRegistered).toHaveBeenCalledWith(undefined, { skip: true })
    expect(api.getStudentRegistered).toHaveBeenCalledWith(undefined, {
      skip: false,
    })
  })
})
