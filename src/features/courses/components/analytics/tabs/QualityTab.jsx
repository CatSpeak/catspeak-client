import React from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import AnalyticsKpiGrid from "../AnalyticsKpiGrid"
import AnalyticsLineChart from "../AnalyticsLineChart"
import AnalyticsBarChart from "../AnalyticsBarChart"
import AnalyticsDataTable from "../AnalyticsDataTable"
import { numberVi, getLocalizedCompareNote } from "../../../data/analyticsData"
import {
  useGetAnalyticsQualityOverviewQuery,
  useGetAnalyticsQualityRatingTrendQuery,
  useGetAnalyticsQualityRatingDistributionQuery,
  useGetAnalyticsQualityByClassQuery,
} from "@/store/api/coursesApi"

const QualityTab = ({ group, queryParams = {} }) => {
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
  const { data: overviewData } = useGetAnalyticsQualityOverviewQuery(activeParams)
  const { data: ratingTrendApi } = useGetAnalyticsQualityRatingTrendQuery(activeParams)
  const { data: starDistApi } = useGetAnalyticsQualityRatingDistributionQuery(activeParams)
  const { data: qualityByClassData } = useGetAnalyticsQualityByClassQuery(activeParams)

  // 2. Rating Trend Line Chart
  const trendPoints = (ratingTrendApi?.trendData || [])
    .filter((point) => point?.label || point?.date)

  const chartLabels = trendPoints.map((p) => p.label || p.date)
  const seriesRating = trendPoints.map((p) => p.averageRating ?? 0)

  // 1. Comparison & KPIs
  const hasComparison = Boolean(queryParams.compare && queryParams.compare !== "")
  const compareNote = getLocalizedCompareNote(group, queryParams.compare, language, t)

  const fmtGrowth = (growth) => {
    if (growth === null || growth === undefined || isNaN(growth)) return ""
    const sign = growth >= 0 ? "↑" : "↓"
    return `${sign} ${numberVi(Math.abs(growth), 1, language)}%`
  }

  const fmtRatingDiff = (diff) => {
    if (diff === null || diff === undefined || isNaN(diff)) return ""
    const sign = diff >= 0 ? "+" : ""
    return `${sign}${numberVi(diff, 1, language)}★`
  }

  const latestPoint = trendPoints.length > 0 ? trendPoints[trendPoints.length - 1] : null
  const prevPoint = trendPoints.length > 1 ? trendPoints[trendPoints.length - 2] : null

  const ratingDiff = prevPoint && prevPoint.averageRating != null
    ? (latestPoint.averageRating - prevPoint.averageRating)
    : null

  const overview = overviewData || {}
  const kpis = [
    {
      label: kpiT.avgRating || "Đánh giá trung bình",
      value: `${numberVi(overview.averageRating ?? 0, 1, language)}/5`,
      delta: hasComparison && ratingDiff != null ? fmtRatingDiff(ratingDiff) : "",
      tone: "orange",
      note: hasComparison && ratingDiff != null ? compareNote : "",
    },
    {
      label: kpiT.reEnrollmentRate || "Tỷ lệ đăng ký lại",
      value: `${numberVi(overview.reenrollmentRate ?? 0, 1, language)}%`,
      delta: hasComparison && overview.reenrollmentGrowth != null ? fmtGrowth(overview.reenrollmentGrowth) : "",
      tone: "green",
      note: hasComparison && overview.reenrollmentGrowth != null ? compareNote : "",
    },
    {
      label: kpiT.fillRate || "Tỷ lệ lấp đầy",
      value: `${numberVi(overview.fillRate ?? overview.averageFillRate ?? 0, 1, language)}%`,
      delta: hasComparison && overview.fillRateGrowth != null ? fmtGrowth(overview.fillRateGrowth) : "",
      tone: "purple",
      note: hasComparison && overview.fillRateGrowth != null ? compareNote : "",
    },
    {
      label: kpiT.conversionRate || "Chuyển đổi đăng ký",
      value: `${numberVi(overview.conversionRate ?? 0, 1, language)}%`,
      delta: hasComparison && overview.conversionGrowth != null ? fmtGrowth(overview.conversionGrowth) : "",
      tone: "blue",
      note: hasComparison && overview.conversionGrowth != null ? compareNote : "",
    },
    {
      label: kpiT.cancellationRate || "Tỷ lệ hủy lớp",
      value: `${numberVi(overview.cancellationRate ?? 0, 1, language)}%`,
      delta: hasComparison && overview.cancellationGrowth != null ? fmtGrowth(overview.cancellationGrowth) : "",
      tone: "red",
      note: hasComparison && overview.cancellationGrowth != null ? compareNote : "",
    },
  ]

  const getStarLabel = (stars) => {
    const lang = String(language || "vi").toLowerCase()
    if (lang.startsWith("zh")) return `${stars} 星`
    if (lang.startsWith("en")) return `${stars} ${stars > 1 ? "stars" : "star"}`
    return `${stars} sao`
  }

  // 3. Star Distribution Bar Chart
  const distItems = starDistApi?.data || (Array.isArray(starDistApi) ? starDistApi : [])
  const starDistribution = distItems.map((item) => ({
    label: getStarLabel(item.stars),
    value: item.percentage,
  }))

  const fmtPercent = (val) => (val != null && !isNaN(val) ? `${numberVi(val, 1, language)}%` : "0%")

  // 4. Quality Detail Table
  const qualityItems = qualityByClassData?.data || (Array.isArray(qualityByClassData) ? qualityByClassData : [])
  const qualityTableData = qualityItems.map((r) => ({
    classId: r.classId,
    className: r.className || "-",
    course: r.courseName || (colT.course || "Khóa học"),
    rating: (r.averageRating || 0).toFixed(1),
    ratingRaw: r.averageRating || 0,
    fill: fmtPercent(r.fillRate),
    fillRaw: r.fillRate || 0,
    conversion: fmtPercent(r.conversionRate),
    conversionRaw: r.conversionRate || 0,
    repeat: fmtPercent(r.reenrollmentRate),
    repeatRaw: r.reenrollmentRate || 0,
    cancellation: fmtPercent(r.cancellationRate),
    cancellationRaw: r.cancellationRate || 0,
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Summary Row */}
      <AnalyticsKpiGrid items={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Rating Trend Chart */}
        <div className="xl:col-span-7 bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-[#14171F] mb-3">{secT.ratingTrend || "Xu hướng đánh giá theo thời gian"}</h2>
          <AnalyticsLineChart
            chartLabels={chartLabels}
            series={[{ name: kpiT.avgRating || "Đánh giá trung bình", values: seriesRating, color: "#E11D48" }]}
            yAxisLabel={kpiT.avgRating || "Điểm đánh giá"}
            valueFormatter={(val) => `${numberVi(val, 2)}/5`}
            axisFormatter={(val) => numberVi(val, 1)}
          />
        </div>

        {/* Star Distribution Bar Chart */}
        <div className="xl:col-span-5 bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-[#14171F] mb-3">{secT.starDistribution || "Phân bố đánh giá"}</h2>
          <AnalyticsBarChart rows={starDistribution} formatter={(val) => `${val}%`} />
        </div>
      </div>

      {/* Quality Detail Table */}
      <div className="bg-white border border-[#DEE0E5] rounded-xl p-4 shadow-sm">
        <h2 className="text-base font-bold text-[#14171F] mb-3">{secT.qualityByClass || "Chất lượng theo lớp học"}</h2>
        <AnalyticsDataTable
          columns={[
            {
              key: "className",
              label: colT.class || "Lớp học",
              render: (val, row) => (
                <button
                  type="button"
                  onClick={() => {
                    if (row.classId) {
                      navigate(`/workspace/analytics/class/${encodeURIComponent(row.classId)}`)
                    }
                  }}
                  className="font-bold text-left text-gray-900 hover:text-[#990011] transition-colors cursor-pointer hover:underline"
                >
                  {val}
                </button>
              ),
            },
            { key: "course", label: colT.course || "Khóa học" },
            { key: "rating", label: colT.rating || "Đánh giá TB", align: "right" },
            { key: "fill", label: colT.fillRate || "Lấp đầy", align: "right" },
            { key: "conversion", label: colT.conversion || "Chuyển đổi ĐK", align: "right" },
            { key: "repeat", label: colT.reEnrollment || "Đăng ký lại", align: "right" },
            { key: "cancellation", label: colT.cancellation || "Tỷ lệ hủy", align: "right" },
          ]}
          data={qualityTableData}
          pageSize={6}
        />
      </div>
    </div>
  )
}

export default QualityTab
