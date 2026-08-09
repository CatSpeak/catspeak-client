import React from "react"
import { Download } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ALL_COURSES_VALUE = "__all_courses__"
const ALL_CLASSES_VALUE = "__all_classes__"
const UNASSIGNED_VALUE = "__unassigned__"

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
  onExport,
  isExporting = false,
}) => {
  const { t } = useLanguage()
  const filterT = t.courses?.analytics?.filters || {}
  const meta = filterMeta?.[group] || filterMeta?.month

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
  }

  const handleCourseChange = (e) => {
    const newCourse = e.target.value
    setCourse(newCourse)
    setClassName(ALL_CLASSES_VALUE)
  }

  const allCoursesLabel = filterT.allCourses || "Tất cả khóa học"
  const allClassesLabel = filterT.allClasses || "Tất cả lớp học"
  const unassignedLabel = filterT.unassigned || "Không thuộc khóa"

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

  const handleExportClick = () => {
    if (onExport) {
      onExport()
    }
  }

  return (
    <section className="bg-white border border-[#e6e7ea] border-t-0 rounded-b-2xl p-3.5 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 items-end shadow-sm">
      {/* Group selection */}
      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
        <label htmlFor="select-group">{filterT.dataGroup || "Nhóm dữ liệu"}</label>
        <select
          id="select-group"
          value={group}
          onChange={handleGroupChange}
          className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all cursor-pointer font-normal"
        >
          {Object.keys(filterMeta || {}).map((key) => (
            <option key={key} value={key}>
              {groupLabels[key] || filterMeta[key].label}
            </option>
          ))}
        </select>
      </div>

      {/* Period selection */}
      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
        <label htmlFor="select-period">{filterT.timePeriod || "Khoảng thời gian"}</label>
        <select
          id="select-period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all cursor-pointer font-normal"
        >
          {meta.periods.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Compare selection */}
      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
        <label htmlFor="select-compare">{filterT.compareTo || "So sánh với"}</label>
        <select
          id="select-compare"
          value={compare}
          onChange={(e) => setCompare(e.target.value)}
          className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all cursor-pointer font-normal"
        >
          {meta.comparisons.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Course selection */}
      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
        <label htmlFor="select-course">{filterT.course || "Khóa học"}</label>
        <select
          id="select-course"
          value={course}
          onChange={handleCourseChange}
          className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all cursor-pointer font-normal"
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
      <div className="flex flex-col gap-1 text-xs font-semibold text-gray-500">
        <label htmlFor="select-class">{filterT.class || "Lớp học"}</label>
        <select
          id="select-class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all cursor-pointer font-normal"
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
        onClick={handleExportClick}
        className="h-10 border border-[#990011] text-[#990011] hover:bg-[#990011]/5 bg-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
      >
        <Download size={18} />
        {isExporting ? "Đang xuất..." : (filterT.exportReport || "Xuất báo cáo")}
      </button>
    </section>
  )
}

export default AnalyticsFilterBar
