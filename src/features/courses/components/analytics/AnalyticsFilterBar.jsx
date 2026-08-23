import React from "react"
import { Download } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"
import {
  CUSTOM_PERIOD_VALUE,
  COMPARE_LAST_YEAR_VALUE,
  COMPARE_PREVIOUS_VALUE,
} from "../../data/analyticsData"

const ALL_COURSES_VALUE = "__all_courses__"
const ALL_CLASSES_VALUE = "__all_classes__"
const UNASSIGNED_VALUE = "__unassigned__"

const toDateString = (date) => {
  if (!date) return ""
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ""
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

const AnalyticsFilterBar = ({
  filterMeta,
  courses = [],
  classes = [],
  group,
  setGroup,
  period,
  setPeriod,
  compare,
  setCompare,
  course,
  setCourse,
  className,
  setClassName,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  onExport,
  isExporting = false,
}) => {
  const { t } = useLanguage()
  const filterT = t.courses?.analytics?.filters || {}
  const meta = filterMeta?.[group] || filterMeta?.month
  const isCustom = period === CUSTOM_PERIOD_VALUE

  const courseList = courses
    .map((item) => ({
      value: String(item.id),
      label: item.name || item.title,
    }))
    .filter((item) => item.label)

  const handleGroupChange = (e) => {
    const newGroup = e.target.value
    setGroup(newGroup)
    const newMeta = filterMeta?.[newGroup] || filterMeta?.month
    setPeriod(newMeta.periods[0].value)
    setCompare(newMeta.comparisons[0].value)
    setCustomStartDate("")
    setCustomEndDate("")
  }

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value
    setPeriod(newPeriod)
    if (newPeriod !== CUSTOM_PERIOD_VALUE) {
      setCompare((meta.comparisons[0] || {}).value || "")
      setCustomStartDate("")
      setCustomEndDate("")
    }
  }

  const handleCompareChange = (e) => {
    setCompare(e.target.value)
  }

  const handleCourseChange = (e) => {
    const newCourse = e.target.value
    setCourse(newCourse)
    setClassName(ALL_CLASSES_VALUE)
  }

  const allCoursesLabel = filterT.allCourses || "Tất cả khóa học"
  const allClassesLabel = filterT.allClasses || "Tất cả lớp học"
  const unassignedLabel = filterT.unassigned || "Không thuộc khóa"
  const lastYearLabel = filterT.samePeriodLastYear || "Cùng kỳ năm trước"

  const getClassOptions = () => {
    if (course === ALL_COURSES_VALUE) {
      return [
        { value: ALL_CLASSES_VALUE, label: allClassesLabel },
        ...classes
          .map((item) => ({ value: String(item.id), label: item.name || item.title }))
          .filter((item) => item.label),
      ]
    }
    if (course === UNASSIGNED_VALUE) {
      const unassigned = classes.filter((item) => !item.courseId)
      return [
        { value: ALL_CLASSES_VALUE, label: allClassesLabel },
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
      { value: ALL_CLASSES_VALUE, label: allClassesLabel },
      ...courseClasses
        .map((item) => ({ value: String(item.id), label: item.name || item.title }))
        .filter((item) => item.label),
    ]
  }

  const groupLabels = {
    day: filterT.byDay || "Theo ngày",
    week: filterT.byWeek || "Theo tuần",
    month: filterT.byMonth || "Theo tháng",
    year: filterT.byYear || "Theo năm",
  }

  const periodOptions = period === "alltime"
    ? [{ value: "alltime", label: filterT.allTime || "Toàn bộ thời gian" }]
    : [
        ...meta.periods,
        { value: CUSTOM_PERIOD_VALUE, label: filterT.custom || "Tùy chỉnh" },
      ]

  const compareOptions = isCustom
    ? [
        { value: "", label: filterT.noComparison || "Không so sánh" },
        { value: COMPARE_PREVIOUS_VALUE, label: filterT.previousPeriod || "Kỳ liền trước" },
        { value: COMPARE_LAST_YEAR_VALUE, label: lastYearLabel },
      ]
    : [
        { value: "", label: filterT.noComparison || "Không so sánh" },
        ...meta.comparisons,
        { value: COMPARE_LAST_YEAR_VALUE, label: lastYearLabel },
      ]

  const selectClass =
    "h-10 border border-[#D6D9E0] rounded-lg px-3 text-sm text-[#14171F] bg-white hover:border-[#B20514] focus:outline-none focus:ring-1 focus:ring-[#B20514] transition-all cursor-pointer font-normal"

  return (
    <section className="bg-white border border-[#DEE0E5] rounded-xl p-3.5 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 items-end shadow-sm">
      {/* Group selection */}
      <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
        <label htmlFor="select-group">{filterT.dataGroup || "Nhóm dữ liệu"}</label>
        <select
          id="select-group"
          value={group}
          onChange={handleGroupChange}
          className={selectClass}
        >
          {Object.keys(filterMeta || {}).map((key) => (
            <option key={key} value={key}>
              {groupLabels[key] || filterMeta[key].label}
            </option>
          ))}
        </select>
      </div>

      {/* Period selection */}
      <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
        <label htmlFor="select-period">{filterT.timePeriod || "Khoảng thời gian"}</label>
        <select
          id="select-period"
          value={period}
          onChange={handlePeriodChange}
          className={selectClass}
        >
          {periodOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom range (only when period === custom) */}
      {isCustom && (
        <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
          <label>{filterT.fromDate || "Khoảng thời gian"}</label>
          <div className="grid grid-cols-2 gap-1.5">
            <DatePicker value={customStartDate} onChange={(d) => setCustomStartDate(toDateString(d))} />
            <DatePicker value={customEndDate} onChange={(d) => setCustomEndDate(toDateString(d))} />
          </div>
        </div>
      )}

      {/* Compare selection */}
      <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
        <label htmlFor="select-compare">{filterT.compareTo || "So sánh với"}</label>
        <select
          id="select-compare"
          value={compare}
          onChange={handleCompareChange}
          disabled={period === "alltime"}
          className={selectClass}
        >
          {compareOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Course selection */}
      <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
        <label htmlFor="select-course">{filterT.course || "Khóa học"}</label>
        <select
          id="select-course"
          value={course}
          onChange={handleCourseChange}
          className={selectClass}
        >
          <option value={ALL_COURSES_VALUE}>{allCoursesLabel}</option>
          {courseList.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
          <option value={UNASSIGNED_VALUE}>{unassignedLabel}</option>
        </select>
      </div>

      {/* Class selection */}
      <div className="flex flex-col gap-1 text-xs font-normal text-[#6B758A]">
        <label htmlFor="select-class">{filterT.class || "Lớp học"}</label>
        <select
          id="select-class"
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

export default AnalyticsFilterBar