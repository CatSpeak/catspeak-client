import React from "react"
import { BookOpen, CalendarDays, ChevronDown } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  PERIOD_PRESETS,
  ALL_COURSES_FILTER_ID,
} from "../../constants/learnerDashboardConstants"

const LearnerFilterBar = ({
  preset,
  courseId,
  filterOptions,
  onFilterChange,
}) => {
  const { language } = useLanguage()
  const isEn = language === "en"
  const courses = filterOptions?.courses || []
  const periods = [
    { value: PERIOD_PRESETS.TODAY, labelVi: "Hôm nay", labelEn: "Today" },
    { value: PERIOD_PRESETS.WEEK, labelVi: "Tuần này", labelEn: "This week" },
    { value: PERIOD_PRESETS.MONTH, labelVi: "Tháng này", labelEn: "This month" },
    { value: PERIOD_PRESETS.QUARTER, labelVi: "Quý này", labelEn: "This quarter" },
    { value: PERIOD_PRESETS.YEAR, labelVi: "Năm nay", labelEn: "This year" },
    { value: PERIOD_PRESETS.ALL, labelVi: "Tất cả", labelEn: "All time" },
  ]

  const selectClassName =
    "h-9 w-full appearance-none truncate rounded-lg border border-[#DEE0E5] bg-white py-1.5 pl-9 pr-8 text-xs font-medium text-[#303747] outline-none transition-colors hover:border-[#B8BBC4] focus:border-[#72000D] focus:ring-2 focus:ring-[#72000D]/10 sm:text-sm"

  return (
    <section
      aria-label={isEn ? "Dashboard filters" : "Bộ lọc tổng quan"}
      className="mb-5 flex justify-end"
    >
      <div className="grid w-full grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-2 sm:flex sm:w-auto">
        <label className="relative block sm:w-40">
          <span className="sr-only">
            {isEn ? "Time range" : "Khoảng thời gian"}
          </span>
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72000D]" />
          <select
            value={preset}
            onChange={(event) => onFilterChange({ p: event.target.value })}
            className={selectClassName}
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {isEn ? period.labelEn : period.labelVi}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8496]" />
        </label>

        <label className="relative block sm:w-60">
          <span className="sr-only">{isEn ? "Course" : "Khóa học"}</span>
          <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72000D]" />
          <select
            value={courseId}
            onChange={(event) => onFilterChange({ course: event.target.value })}
            className={selectClassName}
          >
            <option value={ALL_COURSES_FILTER_ID}>
              {isEn ? "All courses" : "Tất cả khóa học"}
            </option>
            {courses
              .filter((course) => course.id !== ALL_COURSES_FILTER_ID)
              .map((course) => (
                <option key={course.id} value={course.id}>
                  {isEn ? course.nameEn : course.nameVi}
                </option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8496]" />
        </label>
      </div>
    </section>
  )
}

export default LearnerFilterBar
