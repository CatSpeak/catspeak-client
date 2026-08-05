import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import AnalyticsKpiGrid from "../AnalyticsKpiGrid"
import AnalyticsDataTable from "../AnalyticsDataTable"
import HotClassRanking from "../HotClassRanking"
import { money } from "../../../data/analyticsData"
import {
  useGetAnalyticsCourseClassOverviewQuery,
  useGetAnalyticsCourseClassEffectivenessQuery,
  useGetAnalyticsCourseClassStandaloneClassesQuery,
  useGetAnalyticsCourseClassHotClassesQuery,
} from "@/store/api/coursesApi"

const CoursesTab = ({ queryParams = {} }) => {
  const { t } = useLanguage()
  const analyticsT = t.courses?.analytics || {}
  const kpiT = analyticsT.kpis || {}
  const secT = analyticsT.sections || {}
  const colT = analyticsT.tableCols || {}

  const activeParams = {
    groupBy: "Month",
    ...queryParams,
  }

  // RTK Query API calls
  const { data: overviewData } = useGetAnalyticsCourseClassOverviewQuery(activeParams)
  const { data: effectivenessData } = useGetAnalyticsCourseClassEffectivenessQuery(activeParams)
  const { data: standaloneData } = useGetAnalyticsCourseClassStandaloneClassesQuery(activeParams)
  const { data: hotClassesData } = useGetAnalyticsCourseClassHotClassesQuery(activeParams)

  // 1. KPIs (strict API data)
  const overview = overviewData || {}
  const kpis = [
    {
      label: kpiT.totalCourses || "Tổng khóa học",
      value: String(overview.totalCourses ?? 0),
      delta: "",
      tone: "green",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.totalClasses || "Tổng lớp học",
      value: String(overview.totalClasses ?? 0),
      delta: "",
      tone: "orange",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.activeClasses || "Lớp đang mở",
      value: String(overview.openClasses ?? 0),
      delta: "",
      tone: "blue",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.avgFillRate || "Tỷ lệ lấp đầy TB",
      value: `${overview.averageFillRate ?? 0}%`,
      delta: "",
      tone: "purple",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.avgCompletionRate || "Tỷ lệ hoàn thành TB",
      value: `${overview.averageCompletionRate ?? 0}%`,
      delta: "",
      tone: "green",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
  ]

  // 2. Course Performance Table Data
  const effItems = effectivenessData?.data || (Array.isArray(effectivenessData) ? effectivenessData : [])
  const courseTableData = effItems.map((r) => ({
    course: r.courseName,
    classCount: r.classCount,
    students: r.totalStudents,
    average: money(r.averageRevenuePerClass || 0),
    fill: `${r.averageFillRate}%`,
    completion: `${r.averageCompletionRate}%`,
  }))

  // 3. Standalone Classes Table Data
  const saItems = standaloneData?.data || (Array.isArray(standaloneData) ? standaloneData : [])
  const independentClasses = saItems.map((r) => ({
    className: r.className,
    students: r.studentCount,
    gross: money(r.revenue || 0),
    fill: `${r.fillRate}%`,
    completion: `${r.completionRate}%`,
  }))

  // 4. Hot Class Ranking Data
  const hotItems = hotClassesData?.data || (Array.isArray(hotClassesData) ? hotClassesData : [])
  const hotRankingRows = hotItems.map((r) => ({
    className: r.className,
    course: r.courseName || "Khóa học",
    learners: r.students,
    fill: r.fillRate,
    gross: r.revenue,
    newRegistrations: r.newEnrollments || 0,
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
        <HotClassRanking rows={hotRankingRows} pageSize={6} />
      </div>
    </div>
  )
}

export default CoursesTab
