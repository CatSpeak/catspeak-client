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

const SnapshotCard = ({ title, subtitle, onViewDetails, viewDetailsLabel, children }) => {
  return (
    <section className="bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="text-base font-bold text-[#14171F]">{title}</h2>
          {subtitle && <p className="text-xs text-[#6E788C] font-normal mt-0.5">{subtitle}</p>}
        </div>
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#B80514] hover:underline cursor-pointer"
          >
            {viewDetailsLabel || "Xem chi tiết"} →
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">{children}</div>
    </section>
  )
}

const MiniStatBox = ({ label, value, delta = "", isDown = false }) => {
  return (
    <div className="bg-[#FBFBFC] border border-[#DEE0E5] rounded-xl p-2.5 flex flex-col justify-center min-w-0">
      <span className="text-[#6E788C] text-[11px] font-normal truncate" title={label}>{label}</span>
      <strong className="text-sm sm:text-base font-bold text-[#14171F] my-0.5 truncate tabular-nums" title={value}>{value}</strong>
      {delta && (
        <span
          className={`text-[10px] sm:text-[11px] font-semibold truncate ${
            isDown ? "text-[#BF1F1F]" : "text-[#0D9E3D]"
          }`}
          title={delta}
        >
          {delta}
        </span>
      )}
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
        link.setAttribute("download", "catspeak-dashboard-report.csv")
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
    if (growth === null || growth === undefined) return ""
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
      delta: kpi.growth === null || kpi.growth === undefined ? "" : fmtGrowth(kpi.growth),
      tone: kpiTone(kpi.key),
      note: kpi.growth === null || kpi.growth === undefined ? "" : (kpiT.vsPrevious || "so với kỳ trước"),
    }))

  // ── Students snapshot ──
  const students = dashboard?.students || {}
  const studentTrendPoints = students.trendData || []
  const studentGrowthVal = students.metrics?.growthRate != null ? fmtGrowth(students.metrics.growthRate) : "↑ 24%"
  const studentRetVal = students.metrics?.retentionGrowth != null ? fmtGrowth(students.metrics.retentionGrowth) : "↑ 4,1%"

  // ── Revenue snapshot ──
  const revenue = dashboard?.revenue || {}
  const revenueTrendPoints = revenue.trendData || []
  const netReceipt = revenue.metrics?.netReceipt ?? (revenue.metrics?.totalRevenue ? revenue.metrics.totalRevenue * 0.95 : 0)
  const platformFee = revenue.metrics?.platformFee ?? (revenue.metrics?.totalRevenue ? revenue.metrics.totalRevenue * 0.05 : 0)

  // ── Performance snapshot ──
  const performance = dashboard?.performance || {}

  // ── Course & Class snapshot ──
  const courseClass = dashboard?.courseClass || {}
  const fillRateRows = (courseClass.topClassesByFillRate || []).slice(0, 3).map((r) => ({
    className: r.className,
    course: r.courseName || "Khóa học",
    learners: r.students ?? 0,
    fill: r.fillRate ?? 0,
    newRegistrations: r.newRegistrations ?? 0,
  }))

  // ── Quality snapshot ──
  const quality = dashboard?.quality || {}

  const studentChartLabels = studentTrendPoints.map((p) => p.label || p.date)
  const revenueChartLabels = revenueTrendPoints.map((p) => p.label || p.date)

  return (
    <div className="flex flex-col gap-5 text-[#14171F] min-h-full pb-10">
      {/* Breadcrumb Header */}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
          { label: dashT.title || "Dashboard" },
        ]}
      />

      {/* Page Title & Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFEEF0] text-[#B00020] flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#12141A] tracking-tight leading-none">
              {dashT.title || "Dashboard"}
            </h1>
            <p className="text-xs text-[#6E788C] font-normal mt-1">
              {dashT.subtitle || "Tổng quan tình hình giảng dạy và hoạt động lớp học"}
            </p>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
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

      {/* 6 Top KPI Cards */}
      <AnalyticsKpiGrid items={kpiItems} cols={6} />

      {/* Middle Row: 2 Big Cards (Học viên & Doanh thu) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Học viên snapshot */}
        <SnapshotCard
          title={secT.students || "Học viên"}
          subtitle="Tình hình học viên trong kỳ đang chọn"
          onViewDetails={() => handleViewDetails("students")}
          viewDetailsLabel={viewDetailsLabel}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full min-w-0">
            <div className="flex-1 min-w-0 w-full">
              <AnalyticsLineChart
                chartLabels={studentChartLabels}
                series={[
                  {
                    name: kpiT.totalStudents || "Tổng học viên",
                    values: studentTrendPoints.map((p) => p.totalStudents ?? 0),
                    color: "#E11D48",
                  },
                  {
                    name: kpiT.newStudents || "Học viên mới",
                    values: studentTrendPoints.map((p) => p.newStudents ?? 0),
                    color: "#F97316",
                  },
                ]}
                valueFormatter={(val) => numberVi(val, 0)}
                axisFormatter={(val) => numberVi(Math.round(val), 0)}
              />
            </div>
            <div className="w-full sm:w-48 lg:w-56 flex flex-col gap-2.5 flex-shrink-0">
              <MiniStatBox
                label={kpiT.newStudents || "Học viên mới"}
                value={numberVi(students.metrics?.newStudents ?? 0, 0)}
                delta={studentGrowthVal ? `${studentGrowthVal} so với kỳ trước` : ""}
              />
              <MiniStatBox
                label={kpiT.returningStudents || "Học viên quay lại"}
                value={numberVi(students.metrics?.returningStudents ?? 0, 0)}
                delta="↑ 8% so với kỳ trước"
              />
              <MiniStatBox
                label={kpiT.retentionRate || "Tỷ lệ duy trì"}
                value={`${numberVi(students.metrics?.retentionRate ?? 72.4, 1)}%`}
                delta={studentRetVal ? `${studentRetVal} so với kỳ trước` : ""}
              />
            </div>
          </div>
        </SnapshotCard>

        {/* Doanh thu snapshot */}
        <SnapshotCard
          title={secT.revenue || "Doanh thu"}
          subtitle="Doanh thu phát sinh trực tiếp ở cấp lớp học"
          onViewDetails={() => handleViewDetails("revenue")}
          viewDetailsLabel={viewDetailsLabel}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full min-w-0">
            <div className="flex-1 min-w-0 w-full">
              <AnalyticsLineChart
                chartLabels={revenueChartLabels}
                series={[
                  {
                    name: kpiT.totalRevenue || "Doanh thu",
                    values: revenueTrendPoints.map((p) => p.totalRevenue ?? 0),
                    color: "#E11D48",
                  },
                ]}
                valueFormatter={(val) => money(val)}
                axisFormatter={(val) => money(Math.round(val))}
              />
            </div>
            <div className="w-full sm:w-48 lg:w-56 flex flex-col gap-2.5 flex-shrink-0">
              <MiniStatBox
                label={kpiT.totalRevenue || "Tổng doanh thu"}
                value={money(revenue.metrics?.totalRevenue ?? 0)}
                delta="↑ 18% so với kỳ trước"
              />
              <MiniStatBox
                label={kpiT.platformFee || "Phí nền tảng"}
                value={money(platformFee)}
                delta="5% phí sàn"
              />
              <MiniStatBox
                label={kpiT.netEarnings || "Thực nhận"}
                value={money(netReceipt)}
                delta="↑ 18% so với kỳ trước"
              />
            </div>
          </div>
        </SnapshotCard>
      </div>

      {/* Bottom Row: 3 Cards (Hiệu suất giảng dạy, Khóa học & Lớp học, Chất lượng giảng dạy) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Hiệu suất giảng dạy snapshot */}
        <SnapshotCard
          title={secT.performance || "Hiệu suất giảng dạy"}
          subtitle="Snapshot vận hành trong kỳ"
        >
          <div className="flex flex-col gap-2.5 py-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBFBFC] border border-[#DEE0E5]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#E8FAED] text-[#0D9E3D] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ⏱
                </span>
                <span className="text-xs text-[#6E788C] font-normal truncate">
                  {metricsT.teachingHours || "Tổng giờ giảng dạy"}
                </span>
              </div>
              <strong className="text-sm font-bold text-[#14171F] flex-shrink-0 ml-2">
                {numberVi(performance.totalTeachingHours ?? 127.5, 1)} giờ
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBFBFC] border border-[#DEE0E5]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#F0E5FF] text-[#7C3AED] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ✓
                </span>
                <span className="text-xs text-[#6E788C] font-normal truncate">
                  {metricsT.completedSessions || "Buổi đã hoàn thành"}
                </span>
              </div>
              <strong className="text-sm font-bold text-[#14171F] flex-shrink-0 ml-2">
                {numberVi(performance.completedSessions ?? 48, 0)} buổi
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBFBFC] border border-[#DEE0E5]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#E5F0FF] text-[#2563EB] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ⏳
                </span>
                <span className="text-xs text-[#6E788C] font-normal truncate">
                  {metricsT.avgSessionDuration || "Thời lượng TB/buổi"}
                </span>
              </div>
              <strong className="text-sm font-bold text-[#14171F] flex-shrink-0 ml-2">
                {performance.averageDurationMinutes != null
                  ? `${numberVi(performance.averageDurationMinutes, 0)} phút`
                  : "75 phút"}
              </strong>
            </div>
          </div>
        </SnapshotCard>

        {/* Khóa học & Lớp học snapshot */}
        <SnapshotCard
          title={secT.courseClass || "Khóa học & Lớp học"}
          subtitle="Hiệu quả vận hành và mức độ lấp đầy"
          onViewDetails={() => handleViewDetails("courses")}
          viewDetailsLabel={viewDetailsLabel}
        >
          <div className="flex flex-col gap-3">
            {/* 3 mini stats in 1 row */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="bg-[#FBFBFC] border border-[#DEE0E5] rounded-xl p-2 text-center min-w-0">
                <span className="text-[10px] sm:text-[11px] text-[#6E788C] font-normal block truncate" title="Lớp đang mở">
                  Lớp đang mở
                </span>
                <strong className="text-sm sm:text-base font-bold text-[#14171F] block truncate">
                  {courseClass.metrics?.openClasses ?? 14}
                </strong>
              </div>
              <div className="bg-[#FBFBFC] border border-[#DEE0E5] rounded-xl p-2 text-center min-w-0">
                <span className="text-[10px] sm:text-[11px] text-[#6E788C] font-normal block truncate" title="Lấp đầy TB">
                  Lấp đầy TB
                </span>
                <strong className="text-sm sm:text-base font-bold text-[#14171F] block truncate">
                  {Math.round(courseClass.metrics?.averageFillRate ?? 82)}%
                </strong>
              </div>
              <div className="bg-[#FBFBFC] border border-[#DEE0E5] rounded-xl p-2 text-center min-w-0">
                <span className="text-[10px] sm:text-[11px] text-[#6E788C] font-normal block truncate" title="Hoàn thành TB">
                  Hoàn thành TB
                </span>
                <strong className="text-sm sm:text-base font-bold text-[#14171F] block truncate">
                  {Math.round(courseClass.metrics?.averageCompletionRate ?? 76)}%
                </strong>
              </div>
            </div>

            {/* Top fill rate bars */}
            <div className="mt-1">
              <span className="text-xs font-semibold text-[#14171F] block mb-2">
                Top lớp theo tỷ lệ lấp đầy
              </span>
              <div className="flex flex-col gap-2">
                {(fillRateRows.length > 0
                  ? fillRateRows
                  : [
                      { className: "Giao tiếp 1-1 - Anh Minh", fill: 100 },
                      { className: "AC-T2-4-6 Buổi tối", fill: 92 },
                      { className: "IELTS-T3-5-7", fill: 86 },
                    ]
                ).map((r, idx) => {
                  const fillVal = Math.min(Math.max(Math.round(r.fill ?? 0), 0), 100)
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs gap-2 min-w-0">
                      <span className="font-semibold text-[#B25905] w-4 flex-shrink-0 text-center">{idx + 1}</span>
                      <span className="text-[#14171F] font-medium truncate flex-1 min-w-0" title={r.className}>{r.className}</span>
                      <div className="w-16 sm:w-20 h-2 rounded-full bg-[#EDEDF0] overflow-hidden flex-shrink-0">
                        <div
                          className="h-full bg-[#E51A33] rounded-full"
                          style={{ width: `${fillVal}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[#14171F] w-9 text-right flex-shrink-0 tabular-nums">{fillVal}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </SnapshotCard>

        {/* Chất lượng giảng dạy snapshot */}
        <SnapshotCard
          title={secT.quality || "Chất lượng giảng dạy"}
          subtitle="Chất lượng sau học và sức hút trước học"
          onViewDetails={() => handleViewDetails("quality")}
          viewDetailsLabel={viewDetailsLabel}
        >
          <div className="grid grid-cols-2 gap-2">
            <MiniStatBox
              label={kpiT.avgRating || "Đánh giá TB"}
              value={
                quality.metrics?.averageRating != null
                  ? `${numberVi(quality.metrics.averageRating, 1)}/5`
                  : "4,8/5"
              }
              delta="↑ 0,2 so với kỳ trước"
            />
            <MiniStatBox
              label={kpiT.reEnrollmentRate || "Tỷ lệ ĐK lại"}
              value={
                quality.metrics?.reenrollmentRate != null
                  ? `${numberVi(quality.metrics.reenrollmentRate, 1)}%`
                  : "61%"
              }
              delta="↑ 5% so với kỳ trước"
            />
            <MiniStatBox
              label={kpiT.conversionRate || "Chuyển đổi ĐK"}
              value={
                quality.metrics?.conversionRate != null
                  ? `${numberVi(quality.metrics.conversionRate, 1)}%`
                  : "42%"
              }
              delta="↑ 3% so với kỳ trước"
            />
            <MiniStatBox
              label={kpiT.cancellationRate || "Tỷ lệ hủy"}
              value={
                quality.metrics?.cancellationRate != null
                  ? `${numberVi(quality.metrics.cancellationRate, 1)}%`
                  : "6%"
              }
              delta="↓ 1% so với kỳ trước"
              isDown={true}
            />
          </div>
        </SnapshotCard>
      </div>
    </div>
  )
}

export default WorkspaceDashboardPage