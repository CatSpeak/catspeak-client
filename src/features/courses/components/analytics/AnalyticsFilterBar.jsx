import React from "react"
import { Download } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { groupMeta } from "../../data/analyticsData"
import { useGetAllCoursesQuery, useGetAllClassesQuery } from "@/store/api/coursesApi"

const AnalyticsFilterBar = ({
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
  const meta = groupMeta[group] || groupMeta.month

  // Fetch real courses & classes from RTK Query
  const { data: coursesResponse } = useGetAllCoursesQuery({ pageSize: 100 })
  const { data: classesResponse } = useGetAllClassesQuery({ pageSize: 100 })

  const realCourses = coursesResponse?.data || []
  const realClasses = classesResponse?.data || []

  const courseList = realCourses.map(c => c.name || c.title)

  const handleGroupChange = (e) => {
    const newGroup = e.target.value
    setGroup(newGroup)
    const newMeta = groupMeta[newGroup] || groupMeta.month
    setPeriod(newMeta.periods[0])
    setCompare(newMeta.comparisons[0])
  }

  const handleCourseChange = (e) => {
    const newCourse = e.target.value
    setCourse(newCourse)
    setClassName(filterT.allClasses || "Tất cả lớp học")
  }

  const allCoursesLabel = filterT.allCourses || "Tất cả khóa học"
  const allClassesLabel = filterT.allClasses || "Tất cả lớp học"
  const unassignedLabel = filterT.unassigned || "Không thuộc khóa"

  const getClassOptions = () => {
    if (course === allCoursesLabel || course === "Tất cả khóa học") {
      return [allClassesLabel, ...realClasses.map(c => c.name || c.title)]
    }
    if (course === unassignedLabel || course === "Không thuộc khóa") {
      const unassigned = realClasses.filter(c => !c.courseId)
      return [allClassesLabel, ...unassigned.map(c => c.name || c.title)]
    }
    const selectedCourse = realCourses.find(c => (c.name || c.title) === course)
    const courseClasses = selectedCourse
      ? realClasses.filter(c => String(c.courseId) === String(selectedCourse.id))
      : []
    return [allClassesLabel, ...courseClasses.map(c => c.name || c.title)]
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
          {Object.keys(groupMeta).map((key) => (
            <option key={key} value={key}>
              {groupLabels[key] || groupMeta[key].label}
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
          {meta.periods.map((p) => (
            <option key={p} value={p}>
              {p}
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
          {meta.comparisons.map((c) => (
            <option key={c} value={c}>
              {c}
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
          <option value={allCoursesLabel}>{allCoursesLabel}</option>
          {courseList.map((cName) => (
            <option key={cName} value={cName}>
              {cName}
            </option>
          ))}
          <option value={unassignedLabel}>{unassignedLabel}</option>
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
          {getClassOptions().map((cls) => (
            <option key={cls} value={cls}>
              {cls}
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
