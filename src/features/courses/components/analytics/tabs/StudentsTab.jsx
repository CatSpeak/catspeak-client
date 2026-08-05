import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import AnalyticsKpiGrid from "../AnalyticsKpiGrid"
import AnalyticsLineChart from "../AnalyticsLineChart"
import AnalyticsBarChart from "../AnalyticsBarChart"
import AnalyticsDataTable from "../AnalyticsDataTable"
import { trendData, labels, studentCourseRows, numberVi } from "../../../data/analyticsData"

const StudentsTab = ({ group, courseFilter, filteredClasses, onDrillDown }) => {
  const { t } = useLanguage()
  const analyticsT = t.courses?.analytics || {}
  const kpiT = analyticsT.kpis || {}
  const secT = analyticsT.sections || {}
  const colT = analyticsT.tableCols || {}

  const trend = trendData[group] || trendData.month

  const kpis = [
    { label: kpiT.totalStudents || "Tổng học viên", value: "1.256", delta: "↑ 12%", tone: "red", note: kpiT.vsPrevious || "so với kỳ trước" },
    { label: kpiT.newStudents || "Học viên mới", value: "186", delta: "↑ 24%", tone: "green", note: kpiT.vsPrevious || "so với kỳ trước" },
    { label: kpiT.returningStudents || "Học viên quay lại", value: "1.070", delta: "↑ 8%", tone: "orange", note: kpiT.vsPrevious || "so với kỳ trước" },
    { label: kpiT.retentionRate || "Tỷ lệ duy trì học viên", value: "72,4%", delta: "↑ 4,1%", tone: "purple", note: kpiT.vsPrevious || "so với kỳ trước" },
    { label: kpiT.reEnrollmentRate || "Tỷ lệ đăng ký lại", value: "61%", delta: "↑ 5%", tone: "orange", note: kpiT.vsPrevious || "so với kỳ trước" },
  ]

  const allCoursesStr = analyticsT.filters?.allCourses || "Tất cả khóa học"
  const visibleCourses =
    courseFilter === allCoursesStr || courseFilter === "Tất cả khóa học"
      ? studentCourseRows
      : studentCourseRows.filter((r) => r.course === courseFilter)

  const courseTableData = visibleCourses.map((r) => ({
    ...r,
    retention: `${r.retention}%`,
  }))

  const classTableData = filteredClasses.map((r) => ({
    className: r.className,
    course: r.course,
    learners: r.learners,
    newStudents: Math.max(1, r.newRegistrations),
    returning: Math.max(0, r.learners - r.newRegistrations),
    fill: `${r.fill}%`,
  }))

  const barData = filteredClasses.slice(0, 6).map((r) => ({
    label: r.className,
    value: r.learners,
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
            chartLabels={labels[group] || labels.month}
            series={[
              { name: kpiT.totalStudents || "Tổng học viên", values: trend.students, color: "#e11d2e" },
              { name: kpiT.newStudents || "Học viên mới", values: trend.newStudents, color: "#f97316" },
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
