import React, { useCallback, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { LayoutDashboard, ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

import DashboardFilterBar from "./analytics/DashboardFilterBar"
import { ALL_COURSES_VALUE, ALL_CLASSES_VALUE } from "./analytics/filterConstants"
import AnalyticsKpiCard from "./analytics/AnalyticsKpiCard"
import AnalyticsKpiGrid from "./analytics/AnalyticsKpiGrid"
import AnalyticsLineChart from "./analytics/AnalyticsLineChart"
import AnalyticsBarChart from "./analytics/AnalyticsBarChart"
import HotClassRanking from "./analytics/HotClassRanking"
import { money, numberVi } from "../data/analyticsData"
import {
  useGetDashboardQuery,
  useExportDashboardMutation,
  useGetAllCoursesQuery,
  useGetAllClassesQuery,
} from "@/store/api/coursesApi"

const KPI_DEFS = [
  { key: "totalStudents", tone: "red" },
  { key: "totalCourses", tone: "green" },
  { key: "totalClasses", tone: "orange" },
  { key: "totalRegistrations", tone: "purple" },
  { key: "totalRevenue", tone: "blue" },
  { key: "averageRating", tone: "orange" },
]

const daysAgo = (iso) => {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const m = String(d.getDate()).padStart(2, "0")
  const mo = String(d.getMonth() + 1).padStart(2, "0")
  return `${m}/${mo}/${d.getFullYear()}`
}

const defaultCustomRange = () => {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const f = String(from.getMonth() + 1).padStart(2, "0")
  const t = String(now.getMonth() + 1).padStart(2, "0")
  return {
    from: `${from.getFullYear()}-${f}-01`,
    to: `${now.getFullYear()}-${t}-${String(now.getDate()).padStart(2, "0")}`,
  }
}

const SnapshotCard = ({ title, onViewDetails, viewDetailsLabel, children }) => {
  return (
    <section className="bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#990011] hover:underline cursor-pointer"
          >
            {viewDetailsLabel}
            <ChevronRight size={14} />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

const MetricStat = ({ label, value, dotClass = "" }) => {
  return (
    <div className="min-w-0 bg-[#fafbfc] border border-[#e6e7ea] rounded-xl p-3">
      <p className="m-0 text-[#5f6b7e] text-xs font-medium truncate">{label}</p>
      <p className={`m-0 mt-1 flex items-center gap-2 text-lg font-bold text-[#111827]`}>
        {dotClass && <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />}
        <span className="tabular-nums">{value}</span>
      </p>
    </div>
  )
}

const periodTypeMap = {
  today: "Today",
  week: "ThisWeek",
  month: "ThisMonth",
  quarter: "ThisQuarter",
  year: "ThisYear",
  custom: "Custom",
  all: "AllTime",
}
const compareTypeMap = { prev: "PreviousPeriod", year: "SamePeriodLastYear", none: "None" }

const WorkspaceDashboardPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useLanguage()
  const dashT = t.courses?.dashboard || {}
  const kpiT = t.courses?.analytics?.kpis || {}
  const metricsT = dashT.metrics || {}
  const secT = dashT.sections || {}
  const viewDetailsLabel = dashT.viewDetails || "Xem chi tiết"
  const na = dashT.na || "N/A"

  const defaults = defaultCustomRange()
  const preset = searchParams.get("p") || "month"
  const fromDate = searchParams.get("from") || defaults.from
  const toDate = searchParams.get("to") || defaults.to
  const compare = searchParams.get("c") || "prev"
  const course = searchParams.get("course") || ALL_COURSES_VALUE
  const className = searchParams.get("class") || ALL_CLASSES_VALUE

  const updateParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams)
      Object.entries(patch).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "") next.delete(key)
        else next.set(key, val)
      })
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const { data: coursesResponse } = useGetAllCoursesQuery({ pageSize: 500 })
  const { data: classesResponse } = useGetAllClassesQuery({ pageSize: 500 })
  const courses = coursesResponse?.data || []
  const classes = classesResponse?.data || []

  const selectedCourse = courses.find((item) => String(item.id) === String(course))
  const selectedClass = classes.find((item) => String(item.id) === String(className))

  const dashboardParams = useMemo(
    () => ({
      periodType: periodTypeMap[preset] || "ThisMonth",
      fromDate: preset === "custom" ? fromDate : undefined,
      toDate: preset === "custom" ? toDate : undefined,
      compareType: compareTypeMap[compare] || "None",
      courseId: selectedCourse ? parseInt(selectedCourse.id, 10) : undefined,
      classId: selectedClass ? parseInt(selectedClass.id, 10) : undefined,
    }),
    [preset, fromDate, toDate, compare, selectedCourse, selectedClass],
  )

  const { data } = useGetDashboardQuery(dashboardParams)
  const dashboard = data || {}

  const [exportDashboard, { isLoading: isExporting }] = useExportDashboardMutation()

  const handleExport = async () => {
    try {
      const blob = await exportDashboard(dashboardParams).unwrap()
      if (blob) {
        const url = window.URL.createObjectURL(new Blob([blob]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", "catspeak-dashboard-report.xlsx")
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.warn("Dashboard export failed:", err)
    }
  }

  const handleViewDetails = (tabKey) => {
    const params = new URLSearchParams()
    params.set("tab", tabKey)
    params.set("p", preset)
    const filter = dashboard?.filter
    if (filter) {
      if (filter.startDate) params.set("startDate", filter.startDate)
      if (filter.endDate) params.set("endDate", filter.endDate)
      if (filter.compareStartDate) params.set("compareStartDate", filter.compareStartDate)
      if (filter.compareEndDate) params.set("compareEndDate", filter.compareEndDate)
    }
    if (course !== ALL_COURSES_VALUE) params.set("courseId", course)
    if (className !== ALL_CLASSES_VALUE) params.set("classId", className)
    navigate(`/workspace/analytics?${params.toString()}`)
  }

  const fmtGrowth = (growth) => {
    if (growth === null || growth === undefined) return na
    const sign = growth >= 0 ? "↑" : "↓"
    return `${sign} ${numberVi(Math.abs(growth), 1)}%`
  }

  const kpiTone = (key) => KPI_DEFS.find((d) => d.key === key)?.tone || "red"

  const formatKpi = (kpi) => {
    if (kpi.value === null || kpi.value === undefined) return na
    if (kpi.key === "totalRevenue") return money(kpi.value)
    if (kpi.key === "averageRating") return `${numberVi(kpi.value, 1)}/5`
    return numberVi(kpi.value, 0)
  }

  const kpiLabel = (key) => {
    const labelMap = {
      totalStudents: kpiT.totalStudents || "Tổng học viên",
      totalCourses: kpiT.totalCourses || "Tổng khóa học",
      totalClasses: kpiT.totalClasses || "Tổng lớp học",
      totalRegistrations: metricsT.totalRegistrations || "Tổng lượt đăng ký",
      totalRevenue: kpiT.totalRevenue || "Tổng doanh thu",
      averageRating: kpiT.avgRating || "Đánh giá trung bình",
    }
    return labelMap[key]
  }

  const kpiItems = (dashboard?.kpis || [])
    .filter((kpi) => KPI_DEFS.some((d) => d.key === kpi.key))
    .map((kpi) => ({
      key: kpi.key,
      label: kpiLabel(kpi.key),
      value: formatKpi(kpi),
      delta: kpi.growth === null || kpi.growth === undefined ? na : fmtGrowth(kpi.growth),
      tone: kpiTone(kpi.key),
      note: kpi.growth === null || kpi.growth === undefined ? "" : (kpiT.vsPrevious || "so với kỳ trước"),
    }))

  // ── Students snapshot ──
  const students = dashboard?.students || {}
  const studentTrendPoints = students.trendData || []
  const studentMetrics = [
    {
      label: kpiT.totalStudents || "Tổng học viên",
      value: numberVi(students.metrics?.totalStudents ?? 0, 0),
      delta: "", tone: "red", note: "",
    },
    {
      label: kpiT.newStudents || "Học viên mới",
      value: numberVi(students.metrics?.newStudents ?? 0, 0),
      delta: "", tone: "green", note: "",
    },
    {
      label: kpiT.returningStudents || "Học viên quay lại",
      value: numberVi(students.metrics?.returningStudents ?? 0, 0),
      delta: "", tone: "orange", note: "",
    },
    {
      label: kpiT.retentionRate || "Tỷ lệ duy trì học viên",
      value: students.metrics?.retentionRate == null ? na : `${numberVi(students.metrics.retentionRate, 1)}%`,
      delta: "", tone: "purple", note: "",
    },
    {
      label: kpiT.reEnrollmentRate || "Tỷ lệ đăng ký lại",
      value: students.metrics?.reenrollmentRate == null ? na : `${numberVi(students.metrics.reenrollmentRate, 1)}%`,
      delta: "", tone: "orange", note: "",
    },
  ]
  const topStudentsBar = (students.topClassesByStudents || []).map((r) => ({
    label: r.className,
    value: r.students ?? 0,
  }))

  // ── Revenue snapshot ──
  const revenue = dashboard?.revenue || {}
  const revenueTrendPoints = revenue.trendData || []
  const revenueMetrics = [
    {
      label: kpiT.totalRevenue || "Tổng doanh thu",
      value: money(revenue.metrics?.totalRevenue ?? 0),
      delta: "", tone: "red", note: "",
    },
    {
      label: kpiT.platformFee || "Phí nền tảng",
      value: money(revenue.metrics?.platformFee ?? 0),
      delta: "", tone: "blue", note: "",
    },
    {
      label: kpiT.netEarnings || "Thực nhận",
      value: money(revenue.metrics?.netReceipt ?? 0),
      delta: "", tone: "green", note: "",
    },
    {
      label: kpiT.topRevenueClass || "Lớp doanh thu cao nhất",
      value: revenue.metrics?.topClassByRevenue || "-",
      delta: "", tone: "orange", note: "",
    },
    {
      label: kpiT.avgRevenuePerClass || "Doanh thu TB/lớp",
      value: revenue.metrics?.averageRevenuePerClass == null ? na : money(revenue.metrics.averageRevenuePerClass),
      delta: "", tone: "purple", note: "",
    },
  ]
  const topRevenueBar = (revenue.topClassesByRevenue || []).map((r) => ({
    label: r.className,
    value: r.revenue ?? 0,
  }))

  // ── Performance snapshot ──
  const performance = dashboard?.performance || {}
  const performanceMetrics = [
    {
      key: "hours",
      label: metricsT.teachingHours || "Tổng giờ giảng dạy",
      value: `${numberVi(performance.totalTeachingHours ?? 0, 1)}h`,
      dotClass: "bg-[#2563eb]",
    },
    {
      key: "completed",
      label: metricsT.completedSessions || "Buổi đã hoàn thành",
      value: numberVi(performance.completedSessions ?? 0, 0),
      dotClass: "bg-[#16a34a]",
    },
    {
      key: "avgDuration",
      label: metricsT.avgSessionDuration || "Thời lượng TB/buổi",
      value: performance.averageDurationMinutes == null
        ? na
        : `${numberVi(performance.averageDurationMinutes, 0)} ${metricsT.minutes || "phút"}`,
      dotClass: "bg-[#f97316]",
    },
  ]
  const sessionStatus = performance.status || {}
  const statusStats = [
    { label: metricsT.sessionsActive || "Đang hoạt động", value: sessionStatus.active ?? 0, dotClass: "bg-[#16a34a]" },
    { label: metricsT.sessionsUpcoming || "Sắp mở", value: sessionStatus.upcoming ?? 0, dotClass: "bg-[#2563eb]" },
    { label: metricsT.sessionsCompleted || "Đã hoàn thành", value: sessionStatus.completed ?? 0, dotClass: "bg-[#7c3aed]" },
    { label: metricsT.sessionsCancelled || "Đã hủy", value: sessionStatus.cancelled ?? 0, dotClass: "bg-[#f97316]" },
  ]

  // ── Course & Class snapshot ──
  const courseClass = dashboard?.courseClass || {}
  const courseClassMetrics = [
    {
      label: kpiT.totalCourses || "Tổng khóa học",
      value: numberVi(courseClass.metrics?.totalCourses ?? 0, 0),
      delta: "", tone: "green", note: "",
    },
    {
      label: kpiT.totalClasses || "Tổng lớp học",
      value: numberVi(courseClass.metrics?.totalClasses ?? 0, 0),
      delta: "", tone: "orange", note: "",
    },
    {
      label: kpiT.activeClasses || "Lớp đang mở",
      value: numberVi(courseClass.metrics?.openClasses ?? 0, 0),
      delta: "", tone: "blue", note: "",
    },
    {
      label: kpiT.avgFillRate || "Tỷ lệ lấp đầy TB",
      value: courseClass.metrics?.averageFillRate == null ? na : `${numberVi(courseClass.metrics.averageFillRate, 1)}%`,
      delta: "", tone: "purple", note: "",
    },
    {
      label: kpiT.avgCompletionRate || "Tỷ lệ hoàn thành TB",
      value: courseClass.metrics?.averageCompletionRate == null ? na : `${numberVi(courseClass.metrics.averageCompletionRate, 1)}%`,
      delta: "", tone: "green", note: "",
    },
  ]
  const topCourse = courseClass.topCourseByAverageRevenuePerClass
  const fillRateRows = (courseClass.topClassesByFillRate || []).map((r) => ({
    className: r.className,
    course: r.courseName || "Khóa học",
    learners: r.students ?? 0,
    fill: r.fillRate ?? 0,
    newRegistrations: r.newRegistrations ?? 0,
  }))

  // ── Quality snapshot ──
  const quality = dashboard?.quality || {}
  const qualityMetrics = [
    {
      label: kpiT.avgRating || "Đánh giá trung bình",
      value: quality.metrics?.averageRating == null ? na : `${numberVi(quality.metrics.averageRating, 1)}/5`,
      delta: "", tone: "orange", note: "",
    },
    {
      label: metricsT.reenrollment || kpiT.reEnrollmentRate || "Tỷ lệ đăng ký lại",
      value: quality.metrics?.reenrollmentRate == null ? na : `${numberVi(quality.metrics.reenrollmentRate, 1)}%`,
      delta: "", tone: "green", note: "",
    },
    {
      label: kpiT.avgFillRate || "Tỷ lệ lấp đầy",
      value: quality.metrics?.fillRate == null ? na : `${numberVi(quality.metrics.fillRate, 1)}%`,
      delta: "", tone: "purple", note: "",
    },
    {
      label: kpiT.conversionRate || "Tỷ lệ chuyển đổi đăng ký",
      value: quality.metrics?.conversionRate == null ? na : `${numberVi(quality.metrics.conversionRate, 1)}%`,
      delta: "", tone: "orange", note: "",
    },
    {
      label: kpiT.cancellationRate || "Tỷ lệ hủy lớp",
      value: quality.metrics?.cancellationRate == null ? na : `${numberVi(quality.metrics.cancellationRate, 1)}%`,
      delta: "", tone: "red", note: "",
    },
  ]

  const resolvedFilter = dashboard?.filter
  const viewingPeriod =
    resolvedFilter?.startDate && resolvedFilter?.endDate
      ? `${daysAgo(resolvedFilter.startDate)} – ${daysAgo(resolvedFilter.endDate)}`
      : (dashT.allTime || "Toàn bộ thời gian")

  const studentChartLabels = studentTrendPoints.map((p) => p.label || p.date)
  const revenueChartLabels = revenueTrendPoints.map((p) => p.label || p.date)

  return (
    <div className="flex flex-col gap-5 text-[#2e2e2e] min-h-full pb-10">
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Home", onClick: () => navigate("/workspace") },
          { label: dashT.title || "Dashboard" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffecef] text-[#990011] flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-none">
              {dashT.title || "Dashboard"}
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {dashT.subtitle || ""}
            </p>
          </div>
        </div>
        {resolvedFilter && (
          <span className="text-xs text-gray-500 font-medium bg-white border border-[#e6e7ea] rounded-full px-3 py-1.5">
            {dashT.viewingPeriod || "Kỳ đang xem"}: {viewingPeriod}
          </span>
        )}
      </div>

      <DashboardFilterBar
        preset={preset}
        setPreset={(v) => updateParams({ p: v })}
        fromDate={fromDate}
        setFromDate={(v) => updateParams({ from: v })}
        toDate={toDate}
        setToDate={(v) => updateParams({ to: v })}
        compare={compare}
        setCompare={(v) => updateParams({ c: v })}
        course={course}
        setCourse={(v) => updateParams({ course: v })}
        className={className}
        setClassName={(v) => updateParams({ class: v })}
        courses={courses}
        classes={classes}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* 6 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiItems.map((item) => (
          <AnalyticsKpiCard key={item.key} {...item} />
        ))}
      </div>

      {/* Học viên snapshot */}
      <SnapshotCard title={secT.students || "Học viên"} onViewDetails={() => handleViewDetails("students")} viewDetailsLabel={viewDetailsLabel}>
        <AnalyticsKpiGrid items={studentMetrics} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{secT.studentGrowth || "Tăng trưởng học viên"}</h3>
            <AnalyticsLineChart
              chartLabels={studentChartLabels}
              series={[
                { name: kpiT.totalStudents || "Tổng học viên", values: studentTrendPoints.map((p) => p.totalStudents ?? 0), color: "#e11d2e" },
                { name: kpiT.newStudents || "Học viên mới", values: studentTrendPoints.map((p) => p.newStudents ?? 0), color: "#f97316" },
              ]}
              valueFormatter={(val) => numberVi(val, 0)}
              axisFormatter={(val) => numberVi(Math.round(val), 0)}
            />
          </div>
          <div className="lg:col-span-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{secT.topStudents || "Top 3 lớp học theo học viên"}</h3>
            <AnalyticsBarChart rows={topStudentsBar} formatter={(val) => numberVi(val, 0)} />
          </div>
        </div>
      </SnapshotCard>

      {/* Doanh thu snapshot */}
      <SnapshotCard title={secT.revenue || "Doanh thu"} onViewDetails={() => handleViewDetails("revenue")} viewDetailsLabel={viewDetailsLabel}>
        <AnalyticsKpiGrid items={revenueMetrics} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{secT.revenueTrend || "Xu hướng doanh thu"}</h3>
            <AnalyticsLineChart
              chartLabels={revenueChartLabels}
              series={[{ name: kpiT.totalRevenue || "Tổng doanh thu", values: revenueTrendPoints.map((p) => p.totalRevenue ?? 0), color: "#e11d2e" }]}
              valueFormatter={(val) => money(val)}
              axisFormatter={(val) => money(Math.round(val))}
            />
          </div>
          <div className="lg:col-span-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{secT.topRevenue || "Top 3 lớp học theo doanh thu"}</h3>
            <AnalyticsBarChart rows={topRevenueBar} formatter={money} />
          </div>
        </div>
      </SnapshotCard>

      {/* Hiệu suất giảng dạy snapshot (no view details) */}
      <SnapshotCard title={secT.performance || "Hiệu suất giảng dạy"}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {performanceMetrics.map((m) => (
            <MetricStat key={m.key} label={m.label} value={m.value} dotClass={m.dotClass} />
          ))}
        </div>
        <h3 className="text-sm font-bold text-gray-900 mt-4 mb-3">{secT.sessionVolume || "Số buổi theo trạng thái"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusStats.map((s) => (
            <MetricStat key={s.label} label={s.label} value={numberVi(s.value, 0)} dotClass={s.dotClass} />
          ))}
        </div>
      </SnapshotCard>

      {/* Khóa học & Lớp học snapshot */}
      <SnapshotCard title={secT.courseClass || "Khóa học & Lớp học"} onViewDetails={() => handleViewDetails("courses")} viewDetailsLabel={viewDetailsLabel}>
        <AnalyticsKpiGrid items={courseClassMetrics} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-[#fafbfc] border border-[#e6e7ea] rounded-xl p-4">
            <p className="m-0 mb-1 text-[#5f6b7e] text-xs font-medium">{metricsT.topCourseRevenue || "Khóa có DT TB/lớp cao nhất"}</p>
            <p className="m-0 text-base font-bold text-gray-900 truncate">{topCourse?.courseName || na}</p>
            <p className="m-0 mt-1 text-sm font-semibold text-[#990011] tabular-nums">
              {topCourse?.averageRevenuePerClass == null ? na : money(topCourse.averageRevenuePerClass)}
            </p>
          </div>
          <div className="lg:col-span-7">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{secT.topFillRate || "Top 3 lớp học theo lấp đầy"}</h3>
            <HotClassRanking rows={fillRateRows} pageSize={3} />
          </div>
        </div>
      </SnapshotCard>

      {/* Chất lượng giảng dạy snapshot */}
      <SnapshotCard title={secT.quality || "Chất lượng giảng dạy"} onViewDetails={() => handleViewDetails("quality")} viewDetailsLabel={viewDetailsLabel}>
        <AnalyticsKpiGrid items={qualityMetrics} />
      </SnapshotCard>
    </div>
  )
}

export default WorkspaceDashboardPage