import React from "react"
import { Download } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"

import {
  ALL_COURSES_VALUE,
  ALL_CLASSES_VALUE,
  UNASSIGNED_VALUE,
  PRESET_OPTIONS,
  getPresetDateRange,
  getCompareOptionsForPreset,
  formatDateStr,
} from "./filterConstants"

const selectClass =
  "h-10 border border-[#D6D9E0] rounded-lg px-3 text-sm text-[#14171F] bg-white hover:border-[#B20514] focus:outline-none focus:ring-1 focus:ring-[#B20514] transition-all cursor-pointer font-normal"

const DashboardFilterBar = ({
  preset,
  setPreset,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  compare,
  setCompare,
  course,
  setCourse,
  className,
  setClassName,
  courses = [],
  classes = [],
  onExport,
  isExporting = false,
  resolvedFilter = null,
}) => {
  const { t, language } = useLanguage()
  const dashT = t.courses?.dashboard || {}
  const filterT = dashT.filters || {}
  const analyticsFilterT = t.courses?.analytics?.filters || {}

  const toDateString = (date) => {
    if (!date) return ""
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return ""
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${d.getFullYear()}-${m}-${day}`
  }

  const handlePresetChange = (e) => {
    const nextPreset = e.target.value
    setPreset(nextPreset)
    if (nextPreset === "all") {
      setCompare("none")
    } else if (nextPreset === "year" && compare === "year") {
      setCompare("prev")
    }
  }

  const computedRange = getPresetDateRange(preset, new Date(), {
    allTime: dashT.periodOptions?.all || "Toàn bộ thời gian",
    selectedPeriod: filterT.currentPeriod || "Theo kỳ đã chọn",
  })
  const displayedDateRange =
    preset === "custom"
      ? (fromDate && toDate ? `${formatDateStr(fromDate)} – ${formatDateStr(toDate)}` : (dashT.periodOptions?.custom || "Tùy chọn ngày"))
      : (resolvedFilter?.startDate && resolvedFilter?.endDate
        ? `${formatDateStr(resolvedFilter.startDate)} – ${formatDateStr(resolvedFilter.endDate)}`
        : computedRange.display)

  const compareOptions = getCompareOptionsForPreset(preset, filterT, language)

  const courseList = courses
    .map((item) => ({ value: String(item.id), label: item.name || item.title }))
    .filter((item) => item.label)

  const handleCourseChange = (e) => {
    setCourse(e.target.value)
    setClassName(ALL_CLASSES_VALUE)
  }

  const getClassOptions = () => {
    const allLabel = analyticsFilterT.allClasses || "Tất cả lớp học"
    if (course === ALL_COURSES_VALUE) {
      return [
        { value: ALL_CLASSES_VALUE, label: allLabel },
        ...classes
          .map((item) => ({ value: String(item.id), label: item.name || item.title }))
          .filter((item) => item.label),
      ]
    }
    if (course === UNASSIGNED_VALUE) {
      const unassigned = classes.filter((item) => !item.courseId)
      return [
        { value: ALL_CLASSES_VALUE, label: allLabel },
        ...unassigned
          .map((item) => ({ value: String(item.id), label: item.name || item.title }))
          .filter((item) => item.label),
      ]
    }
    const selectedCourse = courses.find((item) => String(item.id) === String(course))
    const courseClasses = selectedCourse
      ? classes.filter((item) => String(item.courseId) === String(selectedCourse.id))
      : []
    return [
      { value: ALL_CLASSES_VALUE, label: allLabel },
      ...courseClasses
        .map((item) => ({ value: String(item.id), label: item.name || item.title }))
        .filter((item) => item.label),
    ]
  }

  return (
    <section className="bg-white border border-[#DEE0E5] rounded-xl p-3.5 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 items-end shadow-sm">
      {/* Preset selection */}
      <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
        <label htmlFor="dash-preset">{filterT.timePeriod || "Khoảng thời gian"}</label>
        <select
          id="dash-preset"
          value={preset}
          onChange={handlePresetChange}
          className={selectClass}
        >
          {PRESET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {dashT.periodOptions?.[opt.key] || opt.key}
            </option>
          ))}
        </select>
      </div>

      {/* Date range or Custom Range */}
      {preset === "custom" ? (
        <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
          <label>{filterT.fromDate || "Kỳ đang xem"}</label>
          <div className="grid grid-cols-2 gap-1.5">
            <DatePicker value={fromDate} onChange={(d) => setFromDate(toDateString(d))} />
            <DatePicker value={toDate} onChange={(d) => setToDate(toDateString(d))} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
          <label>{filterT.currentPeriod || "Kỳ đang xem"}</label>
          <div className="h-10 border border-[#D6D9E0] rounded-lg px-3 text-sm text-[#14171F] bg-[#FBFBFC] flex items-center font-medium truncate" title={displayedDateRange}>
            {displayedDateRange}
          </div>
        </div>
      )}

      {/* Compare selection */}
      <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
        <label htmlFor="dash-compare">{filterT.compareTo || "So sánh với"}</label>
        <select
          id="dash-compare"
          value={compare}
          onChange={(e) => setCompare(e.target.value)}
          className={selectClass}
          disabled={preset === "all"}
        >
          {compareOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Course selection */}
      <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
        <label htmlFor="dash-course">{filterT.course || "Khóa học"}</label>
        <select
          id="dash-course"
          value={course}
          onChange={handleCourseChange}
          className={selectClass}
        >
          <option value={ALL_COURSES_VALUE}>{analyticsFilterT.allCourses || "Tất cả khóa học"}</option>
          {courseList.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
          <option value={UNASSIGNED_VALUE}>{analyticsFilterT.unassigned || "Không thuộc khóa"}</option>
        </select>
      </div>

      {/* Class selection */}
      <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
        <label htmlFor="dash-class">{filterT.class || "Lớp học"}</label>
        <select
          id="dash-class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className={selectClass}
        >
          {getClassOptions().map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Export button */}
      <button
        type="button"
        disabled={isExporting}
        onClick={() => onExport && onExport()}
        className="h-10 border border-[#BF0514] text-[#B20514] hover:bg-[#FFEEF0] bg-white font-semibold rounded-lg flex items-center justify-center gap-2 text-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
      >
        <Download size={16} />
        {isExporting ? (filterT.exporting || "Đang xuất...") : (filterT.exportReport || "Xuất báo cáo")}
      </button>
    </section>
  )
}

export default DashboardFilterBar
