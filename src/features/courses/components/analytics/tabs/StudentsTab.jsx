import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import AnalyticsKpiGrid from "../AnalyticsKpiGrid"
import AnalyticsLineChart from "../AnalyticsLineChart"
import AnalyticsBarChart from "../AnalyticsBarChart"
import AnalyticsDataTable from "../AnalyticsDataTable"
import { numberVi } from "../../../data/analyticsData"
import {
  useGetAnalyticsStudentsOverviewQuery,
  useGetAnalyticsStudentsGrowthQuery,
  useGetAnalyticsStudentsByClassQuery,
  useGetAnalyticsStudentsByCourseQuery,
} from "@/store/api/coursesApi"

const StudentsTab = ({ group, onDrillDown, queryParams = {} }) => {
  const { t } = useLanguage()
  const analyticsT = t.courses?.analytics || {}
  const kpiT = analyticsT.kpis || {}
  const secT = analyticsT.sections || {}
  const colT = analyticsT.tableCols || {}

  const activeParams = {
    groupBy: group ? group.charAt(0).toUpperCase() + group.slice(1) : "Month",
    ...queryParams,
  }

  // RTK Query API calls
  const { data: overviewData } = useGetAnalyticsStudentsOverviewQuery(activeParams)
  const { data: growthData } = useGetAnalyticsStudentsGrowthQuery(activeParams)
  const { data: studentsByClassData } = useGetAnalyticsStudentsByClassQuery(activeParams)
  const { data: studentsByCourseData } = useGetAnalyticsStudentsByCourseQuery(activeParams)

  // 1. KPIs Mapping (strict API data)
  const overview = overviewData || {}
  const kpis = [
    {
      label: kpiT.totalStudents || "Tổng học viên",
      value: numberVi(overview.totalStudents ?? 0, 0),
      delta: "",
      tone: "red",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.newStudents || "Học viên mới",
      value: numberVi(overview.newStudents ?? 0, 0),
      delta: "",
      tone: "green",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.returningStudents || "Học viên quay lại",
      value: numberVi(overview.returningStudents ?? 0, 0),
      delta: "",
      tone: "orange",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.retentionRate || "Tỷ lệ duy trì học viên",
      value: `${numberVi(overview.retentionRate ?? 0, 1)}%`,
      delta: "",
      tone: "purple",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.reEnrollmentRate || "Tỷ lệ đăng ký lại",
      value: `${numberVi(overview.reenrollmentRate ?? 0, 1)}%`,
      delta: "",
      tone: "orange",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
  ]

  // 2. Growth Line Chart
  const growthPoints = (growthData?.growthData || [])
    .filter((point) => point?.label || point?.date)

  const chartLabels = growthPoints.map((p) => p.label || p.date)

  const seriesTotalStudents = growthPoints.map((p) => p.totalStudents ?? 0)
  const seriesNewStudents = growthPoints.map((p) => p.newStudents ?? 0)

  // 3. Course Table Data
  const courseItems = studentsByCourseData?.data || (Array.isArray(studentsByCourseData) ? studentsByCourseData : [])
  const courseTableData = courseItems.map((r) => ({
    course: r.courseName,
    classCount: r.classCount,
    total: r.totalStudents,
    average: r.averageStudentsPerClass || (r.classCount ? Math.round(r.totalStudents / r.classCount) : r.totalStudents),
    newStudents: r.newStudents,
    retention: `${r.retentionRate}%`,
    retentionRaw: r.retentionRate || 0,
  }))

  // 4. Class Table Data & Bar Data
  const classItems = studentsByClassData?.data || (Array.isArray(studentsByClassData) ? studentsByClassData : [])
  const classTableData = classItems.map((r) => ({
    className: r.className,
    course: r.courseName || "Khóa học",
    learners: r.totalStudents,
    newStudents: r.newStudents,
    returning: r.returningStudents,
    fill: `${r.fillRate}%`,
    fillRaw: r.fillRate || 0,
  }))

  const barData = classItems.slice(0, 6).map((r) => ({
    label: r.className,
    value: r.totalStudents,
  }))

  const hvSuffix = secT.studentsShort || "HV"

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Summary Row */}
      <AnalyticsKpiGrid items={kpis} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Growth Trend */}
        <div className="lg:col-span-7 bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-3">{secT.studentGrowth || "Tăng trưởng học viên"}</h2>
          <AnalyticsLineChart
            chartLabels={chartLabels}
            series={[
              { name: kpiT.totalStudents || "Tổng học viên", values: seriesTotalStudents, color: "#e11d2e" },
              { name: kpiT.newStudents || "Học viên mới", values: seriesNewStudents, color: "#f97316" },
            ]}
            yAxisLabel={kpiT.totalStudents || "Số học viên"}
            valueFormatter={(val) => `${numberVi(val, 0)} ${hvSuffix}`}
            axisFormatter={(val) => numberVi(Math.round(val), 0)}
            clickable={group === "month"}
            onDrillDown={onDrillDown}
          />
        </div>

        {/* Student By Class Bar Chart */}
        <div className="lg:col-span-5 bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-gray-900 mb-3">{secT.studentsByClass || "Học viên theo lớp học"}</h2>
          <AnalyticsBarChart rows={barData} formatter={(val) => `${val} ${hvSuffix}`} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-4">
        {/* Course Table */}
        <div className="bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-3">{secT.studentsByCourse || "Học viên theo khóa học"}</h2>
          <AnalyticsDataTable
            columns={[
              { key: "course", label: colT.course || "Khóa học" },
              { key: "classCount", label: colT.classCount || "Số lớp", align: "right" },
              { key: "total", label: colT.totalStudents || "Tổng HV", align: "right" },
              { key: "average", label: colT.avgStudents || "HV TB/lớp", align: "right" },
              { key: "newStudents", label: colT.newStudents || "HV mới", align: "right" },
              { key: "retention", label: colT.retentionRate || "Tỷ lệ duy trì", align: "right" },
            ]}
            data={courseTableData}
            pageSize={5}
          />
        </div>

        {/* Class Table */}
        <div className="bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-3">{secT.studentsByClass || "Học viên theo lớp học"}</h2>
          <AnalyticsDataTable
            columns={[
              { key: "className", label: colT.class || "Lớp học" },
              { key: "course", label: colT.course || "Khóa học" },
              { key: "learners", label: colT.totalStudents || "Học viên", align: "right" },
              { key: "newStudents", label: colT.newStudents || "HV mới", align: "right" },
              { key: "returning", label: colT.returning || "HV quay lại", align: "right" },
              { key: "fill", label: colT.fillRate || "Lấp đầy", align: "right" },
            ]}
            data={classTableData}
            pageSize={6}
          />
        </div>
      </div>
    </div>
  )
}

export default StudentsTab
