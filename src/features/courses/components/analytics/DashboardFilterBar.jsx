import React from "react"
import { Download } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"

import {
  ALL_COURSES_VALUE,
  ALL_CLASSES_VALUE,
  UNASSIGNED_VALUE,
  PRESET_OPTIONS,
  COMPARE_OPTIONS,
} from "./filterConstants"

const selectClass =
  "h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all cursor-pointer font-normal"

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
}) => {
  const { t } = useLanguage()
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
    <section className="bg-white border border-[#e6e7ea] rounded-2xl p-3.5 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3 items-end shadow-sm">
      {/* Preset selection */}
      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
        <label htmlFor="dash-preset">{filterT.timePeriod || "Khoảng thời gian"}</label>
        <select
          id="dash-preset"
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          className={selectClass}
        >
          {PRESET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {dashT.periodOptions?.[opt.key] || opt.key}
            </option>
          ))}
        </select>
      </div>

      {/* Custom range (only when preset === custom) */}
      {preset === "custom" && (
        <>
          <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
            <label>{filterT.fromDate || "Từ ngày"}</label>
            <DatePicker value={fromDate} onChange={(d) => setFromDate(toDateString(d))} />
          </div>
          <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
            <label>{filterT.toDate || "Đến ngày"}</label>
            <DatePicker value={toDate} onChange={(d) => setToDate(toDateString(d))} />
          </div>
        </>
      )}

      {/* Compare selection */}
      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
        <label htmlFor="dash-compare">{filterT.compareTo || "So sánh với"}</label>
        <select
          id="dash-compare"
          value={compare}
          onChange={(e) => setCompare(e.target.value)}
          className={selectClass}
        >
          {COMPARE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {dashT.compareOptions?.[opt.key] || opt.key}
            </option>
          ))}
        </select>
      </div>

      {/* Course selection */}
      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
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
      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
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
        className="h-10 border border-[#990011] text-[#990011] hover:bg-[#990011]/5 bg-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
      >
        <Download size={18} />
        {isExporting ? (filterT.exporting || "Đang xuất...") : (filterT.exportReport || "Xuất báo cáo")}
      </button>
    </section>
  )
}

export default DashboardFilterBar
