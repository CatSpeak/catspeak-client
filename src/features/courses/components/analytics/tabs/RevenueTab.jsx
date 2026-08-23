import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import AnalyticsKpiGrid from "../AnalyticsKpiGrid"
import AnalyticsLineChart from "../AnalyticsLineChart"
import AnalyticsBarChart from "../AnalyticsBarChart"
import AnalyticsDataTable from "../AnalyticsDataTable"
import { money, numberVi } from "../../../data/analyticsData"
import {
  useGetAnalyticsRevenueOverviewQuery,
  useGetAnalyticsRevenueTrendQuery,
  useGetAnalyticsRevenueByClassQuery,
  useGetAnalyticsRevenueTopClassesQuery,
} from "@/store/api/coursesApi"

const RevenueTab = ({ group, queryParams = {} }) => {
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
  const { data: overviewData } = useGetAnalyticsRevenueOverviewQuery(activeParams)
  const { data: trendDataApi } = useGetAnalyticsRevenueTrendQuery(activeParams)
  const { data: revenueByClassData } = useGetAnalyticsRevenueByClassQuery(activeParams)
  const { data: topClassesData } = useGetAnalyticsRevenueTopClassesQuery(activeParams)

  // 1. KPIs (strict API data)
  const overview = overviewData || {}
  const kpis = [
    {
      label: kpiT.totalRevenue || "Tổng doanh thu",
      value: money(overview.totalRevenue ?? 0),
      delta: "",
      tone: "red",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.netEarnings || "Thực nhận",
      value: money(overview.netReceipt ?? 0),
      delta: "",
      tone: "green",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.platformFee || "Phí nền tảng",
      value: money(overview.platformFee ?? 0),
      delta: "",
      tone: "blue",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.topRevenueClass || "Lớp doanh thu cao nhất",
      value: overview.topClassByRevenue || "-",
      delta: "",
      tone: "orange",
      note: "Top lớp",
    },
    {
      label: kpiT.avgRevenuePerClass || "Doanh thu TB/lớp",
      value: money(overview.averageRevenuePerClass ?? 0),
      delta: "",
      tone: "purple",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
  ]

  // 2. Bar Chart Data (Top Classes)
  const topItems = topClassesData?.data || (Array.isArray(topClassesData) ? topClassesData : [])
  const barData = topItems.map((r) => ({
    label: r.className,
    value: r.grossRevenue ?? r.revenue ?? 0,
  }))

  // 3. Line Chart Data (Revenue Trend)
  const trendPoints = (trendDataApi?.trendData || [])
    .filter((point) => point?.label || point?.date)

  const chartLabels = trendPoints.map((p) => p.label || p.date)

  const seriesRevenue = trendPoints.map((p) => (p.totalRevenue != null ? p.totalRevenue / 1000000 : 0))

  // 4. Detail Table Data
  const tableItems = revenueByClassData?.data || (Array.isArray(revenueByClassData) ? revenueByClassData : [])
  const tableData = tableItems.map((r) => ({
    className: r.className,
    course: r.courseName || "Khóa học",
    learners: r.studentCount,
    gross: money(r.grossRevenue || 0),
    grossRaw: r.grossRevenue || 0,
    fee: money(r.platformFee || 0),
    feeRaw: r.platformFee || 0,
    net: money(r.netReceipt || 0),
    netRaw: r.netReceipt || 0,
  }))

  const millionLabel = secT.millionVnd || "Triệu đồng"
  const millionShortLabel = secT.millionVndShort || "triệu đ"

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Summary Row */}
      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Top Class Revenue Bar Chart */}
        <div className="xl:col-span-5 bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-[#14171F] mb-3">{secT.topRevenueClasses || "Top lớp học theo doanh thu"}</h2>
          <AnalyticsBarChart rows={barData} formatter={money} />
        </div>

        {/* Revenue Trend Line Chart */}
        <div className="xl:col-span-7 bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-[#14171F] mb-3">{secT.revenueTrend || "Xu hướng doanh thu"}</h2>
          <AnalyticsLineChart
            chartLabels={chartLabels}
            series={[{ name: kpiT.totalRevenue || "Doanh thu", values: seriesRevenue, color: "#E11D48" }]}
            yAxisLabel={millionLabel}
            valueFormatter={(val) => `${numberVi(val)} ${millionShortLabel}`}
            axisFormatter={(val) => `${numberVi(val)}tr`}
          />
        </div>
      </div>

      {/* Revenue Detail Table */}
      <div className="bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm">
        <h2 className="text-base font-bold text-[#14171F] mb-3">{secT.revenueDetail || "Chi tiết doanh thu theo lớp học"}</h2>
        <AnalyticsDataTable
          columns={[
            { key: "className", label: colT.class || "Lớp học" },
            { key: "course", label: colT.course || "Khóa học" },
            { key: "learners", label: colT.totalStudents || "Học viên", align: "right" },
            { key: "gross", label: colT.grossRevenue || "Doanh thu", align: "right" },
            { key: "fee", label: colT.platformFee || "Phí nền tảng", align: "right" },
            { key: "net", label: colT.netEarnings || "Thực nhận", align: "right" },
          ]}
          data={tableData}
          pageSize={6}
        />
      </div>
    </div>
  )
}

export default RevenueTab
