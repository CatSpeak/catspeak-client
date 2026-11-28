import React from "react"
import dayjs from "dayjs"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import CalendarMonthPanel from "./CalendarMonthPanel"
import DayScheduleMonthView from "./day-schedule/DayScheduleMonthView"
import SpeakingRoomQuotaBanner from "@/features/ai-tutor/components/speakingRoom/SpeakingRoomQuotaBanner"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {}, language: "vi" }),
}))

describe("CalendarMonthPanel dark mode", () => {
  it("renders out-of-month days with readable dark text", () => {
    const html = renderToStaticMarkup(
      <CalendarMonthPanel
        currentDate={dayjs("2026-11-01")}
        selectedDate={1}
        eventCountsByDay={{}}
        localizedMonth="Tháng 11"
        todayLegend="Hôm nay"
        selectedDayLegend="Đang chọn"
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onSelectDate={vi.fn()}
      />,
    )

    expect(html).toContain("text-base text-gray-500 dark:text-neutral-400")
    expect(html).not.toContain("dark:text-neutral-600")
  })
})

describe("DayScheduleMonthView dark mode", () => {
  it("renders yellow event-count badges with dark text", () => {
    const html = renderToStaticMarkup(
      <DayScheduleMonthView
        currentDate={dayjs("2026-11-01")}
        eventCountsByDay={{ 5: 2 }}
        totalUniqueEvents={2}
        registeredMonthEvents={[{ id: 1 }]}
        registeredByDay={{ 5: 1 }}
        daysWithRegistered={[5]}
        monthTab="upcoming"
        setMonthTab={vi.fn()}
        onSelectDate={vi.fn()}
        isLoading={false}
        cal={{}}
      />,
    )

    expect(html).toContain("bg-[#F4AB1B] text-gray-950")
    expect(html).not.toContain("bg-[#F4AB1B] text-white")
  })
})

describe("SpeakingRoomQuotaBanner dark mode", () => {
  it("renders the '0 buổi' label with readable light and dark text", () => {
    const html = renderToStaticMarkup(
      <SpeakingRoomQuotaBanner
        quota={{
          total: 2,
          used: 2,
          percent: 0,
          currentPlan: "Free",
          resetTime: "00:00",
        }}
      />,
    )

    expect(html).toContain("0 buổi")
    expect(html).toContain("text-slate-600 dark:text-neutral-300")
  })
})
