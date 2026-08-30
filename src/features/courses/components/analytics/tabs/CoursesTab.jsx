import React from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import AnalyticsKpiGrid from "../AnalyticsKpiGrid"
import AnalyticsDataTable from "../AnalyticsDataTable"
import HotClassRanking from "../HotClassRanking"
import { money, numberVi, getLocalizedCompareNote } from "../../../data/analyticsData"
import {
  useGetAnalyticsCourseClassOverviewQuery,
  useGetAnalyticsCourseClassEffectivenessQuery,
  useGetAnalyticsCourseClassStandaloneClassesQuery,
  useGetAnalyticsCourseClassHotClassesQuery,
} from "@/store/api/coursesApi"

const CoursesTab = ({ group, queryParams = {} }) => {
  const { t, language } = useLanguage()
  const analyticsT = t.courses?.analytics || {}
  const kpiT = analyticsT.kpis || {}
  const secT = analyticsT.sections || {}
  const colT = analyticsT.tableCols || {}

  const activeParams = {
    groupBy: group ? group.charAt(0).toUpperCase() + group.slice(1) : "Month",
    ...queryParams,
  }

  // RTK Query API calls
  const { data: overviewData } = useGetAnalyticsCourseClassOverviewQuery(activeParams)
  const { data: effectivenessData } = useGetAnalyticsCourseClassEffectivenessQuery(activeParams)
  const { data: standaloneData } = useGetAnalyticsCourseClassStandaloneClassesQuery(activeParams)
  const { data: hotClassesData } = useGetAnalyticsCourseClassHotClassesQuery(activeParams)

  // 1. Comparison & KPIs
  const hasComparison = Boolean(queryParams.compare && queryParams.compare !== "")
  const compareNote = getLocalizedCompareNote(group, queryParams.compare, language, t)

  const fmtGrowth = (growth) => {
    if (growth === null || growth === undefined || isNaN(growth)) return ""
    const sign = growth >= 0 ? "↑" : "↓"
    return `${sign} ${numberVi(Math.abs(growth), 1, language)}%`
  }

  const overview = overviewData || {}
  const kpis = [
    {
      label: kpiT.totalCourses || "Tổng khóa học",
      value: String(overview.totalCourses ?? 0),
      delta: hasComparison && overview.courseGrowth != null ? fmtGrowth(overview.courseGrowth) : "",
      tone: "green",
      note: hasComparison && overview.courseGrowth != null ? compareNote : "",
    },
    {
      label: kpiT.totalClasses || "Tổng lớp học",
      value: String(overview.totalClasses ?? 0),
      delta: hasComparison && overview.classGrowth != null ? fmtGrowth(overview.classGrowth) : "",
      tone: "orange",
      note: hasComparison && overview.classGrowth != null ? compareNote : "",
    },
    {
      label: kpiT.activeClasses || "Lớp đang mở",
      value: String(overview.openClasses ?? 0),
      delta: hasComparison && overview.openClassGrowth != null ? fmtGrowth(overview.openClassGrowth) : "",
      tone: "blue",
      note: hasComparison && overview.openClassGrowth != null ? compareNote : "",
    },
    {
      label: kpiT.avgFillRate || "Tỷ lệ lấp đầy TB",
      value: `${overview.averageFillRate ?? 0}%`,
      delta: hasComparison && overview.fillRateGrowth != null ? fmtGrowth(overview.fillRateGrowth) : "",
      tone: "purple",
      note: hasComparison && overview.fillRateGrowth != null ? compareNote : "",
    },
    {
      label: kpiT.avgCompletionRate || "Tỷ lệ hoàn thành TB",
      value: `${overview.averageCompletionRate ?? 0}%`,
      delta: hasComparison && overview.completionRateGrowth != null ? fmtGrowth(overview.completionRateGrowth) : "",
      tone: "green",
      note: hasComparison && overview.completionRateGrowth != null ? compareNote : "",
    },
  ]

  const fmtPercent = (val) => (val != null && !isNaN(val) ? `${numberVi(val, 1, language)}%` : "0%")

  // 2. Course Performance Table Data
  const effItems = effectivenessData?.data || (Array.isArray(effectivenessData) ? effectivenessData : [])
  const courseTableData = effItems.map((r) => ({
    course: r.courseName || "-",
    classCount: r.classCount ?? 0,
    students: r.totalStudents ?? 0,
    average: money(r.averageRevenuePerClass || 0, language),
    averageRaw: r.averageRevenuePerClass || 0,
    fill: fmtPercent(r.averageFillRate),
    fillRaw: r.averageFillRate || 0,
    completion: fmtPercent(r.averageCompletionRate),
    completionRaw: r.averageCompletionRate || 0,
  }))

  // 3. Standalone Classes Table Data
  const saItems = standaloneData?.data || (Array.isArray(standaloneData) ? standaloneData : [])
  const independentClasses = saItems.map((r) => ({
    classId: r.classId,
    className: r.className || "-",
    students: r.studentCount ?? 0,
    gross: money(r.revenue || 0, language),
    grossRaw: r.revenue || 0,
    fill: fmtPercent(r.fillRate),
    fillRaw: r.fillRate || 0,
    completion: fmtPercent(r.completionRate),
    completionRaw: r.completionRate || 0,
  }))

  // 4. Hot Class Ranking Data
  const hotItems = hotClassesData?.data || (Array.isArray(hotClassesData) ? hotClassesData : [])
  const hotRankingRows = hotItems.map((r) => ({
    classId: r.classId,
    className: r.className || "-",
    course: r.courseName || (colT.course || "Khóa học"),
    learners: r.students ?? 0,
    fill: r.fillRate ?? 0,
    fillRaw: r.fillRate || 0,
    gross: money(r.revenue || 0, language),
    grossRaw: r.revenue || 0,
    newRegistrations: r.newEnrollments || 0,
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Summary Row */}
      <AnalyticsKpiGrid items={kpis} />

      {/* Row 2: 2 tables side-by-side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Course Performance Table */}
        <div className="bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-[#14171F] mb-3">{secT.coursePerformance || "Hiệu quả khóa học"}</h2>
          <AnalyticsDataTable
            columns={[
              { key: "course", label: colT.course || "Khóa học" },
              { key: "classCount", label: colT.classCount || "Số lớp", align: "right" },
              { key: "students", label: colT.totalStudents || "Học viên", align: "right" },
              { key: "average", label: colT.avgGross || "DT TB/lớp", align: "right" },
              { key: "fill", label: colT.fillRate || "Lấp đầy", align: "right" },
            ]}
            data={courseTableData}
            pageSize={4}
          />
        </div>

        {/* Independent Classes Table */}
        <div className="bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-[#14171F] mb-3">{secT.independentClasses || "Hiệu quả lớp riêng"}</h2>
          <AnalyticsDataTable
            columns={[
              { key: "className", label: colT.class || "Lớp học" },
              { key: "students", label: colT.totalStudents || "Học viên", align: "right" },
              { key: "gross", label: colT.grossRevenue || "Doanh thu", align: "right" },
              { key: "fill", label: colT.fillRate || "Lấp đầy", align: "right" },
              { key: "completion", label: colT.completionRate || "Hoàn thành", align: "right" },
            ]}
            data={independentClasses}
            pageSize={4}
          />
        </div>
      </div>

      {/* Row 3: Hot Class Popularity Ranking */}
      <div className="bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm">
        <h2 className="text-base font-bold text-[#14171F] mb-1">{secT.hotClassRanking || "Mức độ hot của từng lớp"}</h2>
        <p className="text-xs text-[#6E788C] mb-3">{secT.hotClassSubtitle || "Xếp hạng theo tỷ lệ lấp đầy, đăng ký mới và doanh thu"}</p>
        <HotClassRanking rows={hotRankingRows} pageSize={6} />
      </div>
    </div>
  )
}

export default CoursesTab
