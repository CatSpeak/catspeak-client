import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import AnalyticsKpiGrid from "../AnalyticsKpiGrid"
import AnalyticsLineChart from "../AnalyticsLineChart"
import AnalyticsBarChart from "../AnalyticsBarChart"
import AnalyticsDataTable from "../AnalyticsDataTable"
import { numberVi } from "../../../data/analyticsData"
import {
  useGetAnalyticsQualityOverviewQuery,
  useGetAnalyticsQualityRatingTrendQuery,
  useGetAnalyticsQualityRatingDistributionQuery,
  useGetAnalyticsQualityByClassQuery,
} from "@/store/api/coursesApi"

const QualityTab = ({ group, queryParams = {} }) => {
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
  const { data: overviewData } = useGetAnalyticsQualityOverviewQuery(activeParams)
  const { data: ratingTrendApi } = useGetAnalyticsQualityRatingTrendQuery(activeParams)
  const { data: starDistApi } = useGetAnalyticsQualityRatingDistributionQuery(activeParams)
  const { data: qualityByClassData } = useGetAnalyticsQualityByClassQuery(activeParams)

  // 1. KPIs (strict API data)
  const overview = overviewData || {}
  const kpis = [
    {
      label: kpiT.avgRating || "Đánh giá trung bình",
      value: `${numberVi(overview.averageRating ?? 0, 1)}/5`,
      delta: "",
      tone: "orange",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.reEnrollmentRate || "Tỷ lệ đăng ký lại",
      value: `${numberVi(overview.reenrollmentRate ?? 0, 1)}%`,
      delta: "",
      tone: "green",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.conversionRate || "Tỷ lệ chuyển đổi đăng ký",
      value: `${numberVi(overview.conversionRate ?? 0, 1)}%`,
      delta: "",
      tone: "orange",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
    {
      label: kpiT.cancellationRate || "Tỷ lệ hủy lớp",
      value: `${numberVi(overview.cancellationRate ?? 0, 1)}%`,
      delta: "",
      tone: "red",
      note: kpiT.vsPrevious || "so với kỳ trước",
    },
  ]

  // 2. Rating Trend Line Chart
  const trendPoints = (ratingTrendApi?.trendData || [])
    .filter((point) => point?.label || point?.date)

  const chartLabels = trendPoints.map((p) => p.label || p.date)

  const seriesRating = trendPoints.map((p) => p.averageRating ?? 0)

  // 3. Star Distribution Bar Chart
  const distItems = starDistApi?.data || (Array.isArray(starDistApi) ? starDistApi : [])
  const starDistribution = distItems.map((item) => ({
    label: `${item.stars} sao`,
    value: item.percentage,
  }))

  // 4. Quality Detail Table
  const qualityItems = qualityByClassData?.data || (Array.isArray(qualityByClassData) ? qualityByClassData : [])
  const qualityTableData = qualityItems.map((r) => ({
    className: r.className,
    course: r.courseName || "Khóa học",
    rating: (r.averageRating || 0).toFixed(1),
    ratingRaw: r.averageRating || 0,
    fill: `${r.fillRate}%`,
    fillRaw: r.fillRate || 0,
    conversion: `${r.conversionRate}%`,
    conversionRaw: r.conversionRate || 0,
    repeat: `${r.reenrollmentRate}%`,
    repeatRaw: r.reenrollmentRate || 0,
    cancellation: `${r.cancellationRate}%`,
    cancellationRaw: r.cancellationRate || 0,
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Summary Row */}
      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Rating Trend Chart */}
        <div className="lg:col-span-7 bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-3">{secT.ratingTrend || "Xu hướng đánh giá theo thời gian"}</h2>
          <AnalyticsLineChart
            chartLabels={chartLabels}
            series={[{ name: kpiT.avgRating || "Đánh giá trung bình", values: seriesRating, color: "#e11d2e" }]}
            yAxisLabel={kpiT.avgRating || "Điểm đánh giá"}
            valueFormatter={(val) => `${numberVi(val, 2)}/5`}
            axisFormatter={(val) => numberVi(val, 1)}
          />
        </div>

        {/* Star Distribution Bar Chart */}
        <div className="lg:col-span-5 bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-3">{secT.starDistribution || "Phân bố đánh giá"}</h2>
          <AnalyticsBarChart rows={starDistribution} formatter={(val) => `${val}%`} />
        </div>
      </div>

      {/* Quality Detail Table */}
      <div className="bg-white border border-[#e6e7ea] rounded-2xl p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-3">{secT.qualityByClass || "Chất lượng theo lớp học"}</h2>
        <AnalyticsDataTable
          columns={[
            { key: "className", label: colT.class || "Lớp học" },
            { key: "course", label: colT.course || "Khóa học" },
            { key: "rating", label: colT.rating || "Đánh giá TB", align: "right" },
            { key: "fill", label: colT.fillRate || "Lấp đầy", align: "right" },
            { key: "conversion", label: colT.conversion || "Chuyển đổi ĐK", align: "right" },
            { key: "repeat", label: colT.reEnrollment || "Đăng ký lại", align: "right" },
            { key: "cancellation", label: colT.cancellation || "Tỷ lệ hủy", align: "right" },
          ]}
          data={qualityTableData}
          pageSize={7}
        />
      </div>
    </div>
  )
}

export default QualityTab
