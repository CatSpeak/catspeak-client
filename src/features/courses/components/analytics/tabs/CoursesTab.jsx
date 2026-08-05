import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import AnalyticsKpiGrid from "../AnalyticsKpiGrid"
import AnalyticsDataTable from "../AnalyticsDataTable"
import HotClassRanking from "../HotClassRanking"
import { courseRows, money } from "../../../data/analyticsData"

const CoursesTab = ({ courseFilter, filteredClasses }) => {
  const { t } = useLanguage()
  const analyticsT = t.courses?.analytics || {}
  const kpiT = analyticsT.kpis || {}
  const secT = analyticsT.sections || {}
  const colT = analyticsT.tableCols || {}

  const kpis = [
    { label: kpiT.totalCourses || "Tổng khóa học", value: "12", delta: "↑ 1", tone: "green", note: kpiT.vsPrevious || "so với kỳ trước" },
    { label: kpiT.totalClasses || "Tổng lớp học", value: "36", delta: "↑ 5", tone: "orange", note: kpiT.vsPrevious || "so với kỳ trước" },
    { label: kpiT.activeClasses || "Lớp đang mở", value: "14", delta: "↑ 2", tone: "blue", note: kpiT.vsPrevious || "so với kỳ trước" },
    { label: kpiT.avgFillRate || "Tỷ lệ lấp đầy TB", value: "76%", delta: "↑ 6%", tone: "purple", note: kpiT.vsPrevious || "so với kỳ trước" },
    { label: kpiT.avgCompletionRate || "Tỷ lệ hoàn thành TB", value: "82%", delta: "↑ 5%", tone: "green", note: kpiT.vsPrevious || "so với kỳ trước" },
  ]

  const allCoursesStr = analyticsT.filters?.allCourses || "Tất cả khóa học"
  const visibleCourseRows =
    courseFilter === allCoursesStr || courseFilter === "Tất cả khóa học"
      ? courseRows
      : courseRows.filter((r) => r.course === courseFilter)

  const courseTableData = visibleCourseRows.map((r) => ({
    course: r.course,
    classCount: r.classCount,
    students: r.students,
    average: money(r.average),
    fill: `${r.fill}%`,
    completion: `${r.completion}%`,
  }))

  const unassignedStr = analyticsT.filters?.unassigned || "Không thuộc khóa"
  const independentClasses = filteredClasses
    .filter((r) => r.course === unassignedStr || r.course === "Không thuộc khóa")
    .map((r) => ({
      className: r.className,
      students: r.learners,
      gross: money(r.gross),
      fill: `${r.fill}%`,
      completion: `${r.completion}%`,
    }))

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Summary Row */}
      <AnalyticsKpiGrid items={kpis} />

      {/* Course Performance Table */}
      <div className="bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-3">{secT.coursePerformance || "Hiệu quả khóa học"}</h2>
        <AnalyticsDataTable
          columns={[
            { key: "course", label: colT.course || "Khóa học" },
            { key: "classCount", label: colT.classCount || "Số lớp", align: "right" },
            { key: "students", label: colT.totalStudents || "Học viên", align: "right" },
            { key: "average", label: colT.avgGross || "DT TB/lớp", align: "right" },
            { key: "fill", label: colT.fillRate || "Lấp đầy", align: "right" },
            { key: "completion", label: colT.completionRate || "Hoàn thành", align: "right" },
          ]}
          data={courseTableData}
          pageSize={5}
        />
      </div>

      {/* Independent Classes Table */}
      <div className="bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-3">{secT.independentClasses || "Hiệu quả lớp riêng"}</h2>
        <AnalyticsDataTable
          columns={[
            { key: "className", label: colT.class || "Lớp học" },
            { key: "students", label: colT.totalStudents || "Học viên", align: "right" },
            { key: "gross", label: colT.grossRevenue || "Doanh thu", align: "right" },
            { key: "fill", label: colT.fillRate || "Lấp đầy", align: "right" },
            { key: "completion", label: colT.completionRate || "Hoàn thành", align: "right" },
          ]}
          data={independentClasses}
          pageSize={5}
        />
      </div>

      {/* Hot Class Popularity Ranking */}
      <div className="bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-3">{secT.hotClassRanking || "Mức độ hot của từng lớp"}</h2>
        <HotClassRanking rows={filteredClasses} pageSize={6} />
      </div>
    </div>
  )
}

export default CoursesTab
