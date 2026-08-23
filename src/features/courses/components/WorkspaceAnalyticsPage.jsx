import React, { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { BarChart3 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

import AnalyticsFilterBar from "./analytics/AnalyticsFilterBar"
import StudentsTab from "./analytics/tabs/StudentsTab"
import RevenueTab from "./analytics/tabs/RevenueTab"
import CoursesTab from "./analytics/tabs/CoursesTab"
import QualityTab from "./analytics/tabs/QualityTab"
import {
  useExportAnalyticsStudentsMutation,
  useExportAnalyticsRevenueMutation,
  useExportAnalyticsCourseClassMutation,
  useExportAnalyticsQualityMutation,
  useGetAllCoursesQuery,
  useGetAllClassesQuery,
} from "@/store/api/coursesApi"
import {
  buildAnalyticsQueryParams,
  CUSTOM_PERIOD_VALUE,
  getAnalyticsFilterMeta,
  getDrillDownSelection,
  resolveAnalyticsScope,
} from "../data/analyticsData"

const WorkspaceAnalyticsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, language } = useLanguage()
  const analyticsT = t.courses?.analytics || {}

  const filterMeta = useMemo(
    () => getAnalyticsFilterMeta(language),
    [language],
  )

  const tabsList = [
    {
      key: "students",
      label: analyticsT.tabs?.students || "Học viên",
      subtitle: analyticsT.tabs?.studentsSubtitle || "Phân tích tăng trưởng, duy trì và đăng ký lại của học viên.",
    },
    {
      key: "revenue",
      label: analyticsT.tabs?.revenue || "Doanh thu",
      subtitle: analyticsT.tabs?.revenueSubtitle || "Phân tích doanh thu ở cấp lớp học và phần thực nhận sau phí nền tảng.",
    },
    {
      key: "courses",
      label: analyticsT.tabs?.courses || "Khóa học & Lớp học",
      subtitle: analyticsT.tabs?.coursesSubtitle || "Phân tích tách biệt giữa hiệu quả khóa học và hiệu quả từng lớp học.",
    },
    {
      key: "quality",
      label: analyticsT.tabs?.quality || "Chất lượng giảng dạy",
      subtitle: analyticsT.tabs?.qualitySubtitle || "Phân tích chất lượng sau khi học và sức hút trước khi học.",
    },
  ]

  const urlTab = searchParams.get("tab") || searchParams.get("tabs")
  const VALID_TABS = ["students", "revenue", "courses", "quality"]
  const activeTab = urlTab && VALID_TABS.includes(urlTab) ? urlTab : "students"

  const handleTabChange = (newTab) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("tab", newTab)
    nextParams.delete("tabs")
    setSearchParams(nextParams, { replace: true })
  }

  // BR-DASH-40: when arriving from the Dashboard (URL carries resolved dates + course/class),
  // honour the exact range and auto-select the GroupBy via the shared auto-bucket rule.
  const [incomingScope] = useState(() => {
    const sp = new URLSearchParams(window.location.search)
    const scope = resolveAnalyticsScope({
      startDate: sp.get("startDate") || undefined,
      endDate: sp.get("endDate") || undefined,
      compareStartDate: sp.get("compareStartDate") || undefined,
      compareEndDate: sp.get("compareEndDate") || undefined,
    })
    // BR-DASH-11: the Dashboard's "Toàn bộ thời gian" preset has no resolved dates;
    // forward it as an all-time analytics scope instead of silently defaulting to this month.
    if (!scope && (sp.get("p") === "all" || sp.get("period") === "alltime")) {
      return { group: "month", period: "alltime", compare: "", customStartDate: "", customEndDate: "" }
    }
    return scope
  })

  const [group, setGroup] = useState(() => incomingScope?.group || "month")
  const [period, setPeriod] = useState(() => incomingScope?.period || filterMeta.month.periods[0].value)
  const [compare, setCompare] = useState(
    () => (incomingScope ? incomingScope.compare : filterMeta.month.comparisons[0].value),
  )
  const [courseFilter, setCourseFilter] = useState(() => {
    const courseId = new URLSearchParams(window.location.search).get("courseId")
    return courseId ? String(courseId) : "__all_courses__"
  })
  const [classFilter, setClassFilter] = useState(() => {
    const classId = new URLSearchParams(window.location.search).get("classId")
    return classId ? String(classId) : "__all_classes__"
  })
  const [customStartDate, setCustomStartDate] = useState(() => incomingScope?.customStartDate || "")
  const [customEndDate, setCustomEndDate] = useState(() => incomingScope?.customEndDate || "")

  // RTK Query hooks for course/class mapping and exports
  const { data: coursesResponse } = useGetAllCoursesQuery({ pageSize: 500 })
  const { data: classesResponse } = useGetAllClassesQuery({ pageSize: 500 })

  const [exportStudents, { isLoading: isExpStudents }] = useExportAnalyticsStudentsMutation()
  const [exportRevenue, { isLoading: isExpRevenue }] = useExportAnalyticsRevenueMutation()
  const [exportCourses, { isLoading: isExpCourses }] = useExportAnalyticsCourseClassMutation()
  const [exportQuality, { isLoading: isExpQuality }] = useExportAnalyticsQualityMutation()

  const isExporting = isExpStudents || isExpRevenue || isExpCourses || isExpQuality

  const selectedCourseObj = (coursesResponse?.data || []).find(
    (course) => String(course.id) === String(courseFilter),
  )
  const selectedClassObj = (classesResponse?.data || []).find(
    (item) => String(item.id) === String(classFilter),
  )

  const selectedPeriodMeta = (filterMeta?.[group]?.periods || []).find((p) => p.value === period)

  let resolvedPeriodParam = period
  let resolvedStartDate = customStartDate
  let resolvedEndDate = customEndDate

  if (period === CUSTOM_PERIOD_VALUE) {
    resolvedStartDate = customStartDate
    resolvedEndDate = customEndDate
    resolvedPeriodParam = "custom"
  } else if (selectedPeriodMeta?.startDate && selectedPeriodMeta?.endDate) {
    resolvedStartDate = selectedPeriodMeta.startDate
    resolvedEndDate = selectedPeriodMeta.endDate
    resolvedPeriodParam = "custom"
  } else if (group === "month" && /^\d{4}-\d{2}$/.test(period)) {
    const [yStr, mStr] = period.split("-")
    const yNum = parseInt(yStr, 10)
    const mNum = parseInt(mStr, 10)
    const startM = `${yNum}-${String(mNum).padStart(2, "0")}-01`
    const endMDate = new Date(yNum, mNum, 0)
    const endM = `${yNum}-${String(mNum).padStart(2, "0")}-${String(endMDate.getDate()).padStart(2, "0")}`
    resolvedStartDate = startM
    resolvedEndDate = endM
    resolvedPeriodParam = "custom"
  }

  const activeQueryParams = buildAnalyticsQueryParams({
    group,
    period: resolvedPeriodParam,
    compare,
    courseId: selectedCourseObj ? parseInt(selectedCourseObj.id, 10) : undefined,
    classId: selectedClassObj ? parseInt(selectedClassObj.id, 10) : undefined,
    customStartDate: resolvedStartDate || undefined,
    customEndDate: resolvedEndDate || undefined,
  })

  // Drill-down from month trend to day trend
  const handleDrillDown = (monthIndex) => {
    const selection = getDrillDownSelection({ group, period, index: monthIndex })
    if (!selection) return

    setGroup(selection.group)
    setPeriod(selection.period)
    setCompare(selection.compare)
  }

  const handleExport = async () => {
    try {
      let exportFn
      if (activeTab === "students") exportFn = exportStudents
      else if (activeTab === "revenue") exportFn = exportRevenue
      else if (activeTab === "courses") exportFn = exportCourses
      else if (activeTab === "quality") exportFn = exportQuality

      if (exportFn) {
        const blob = await exportFn(activeQueryParams).unwrap()
        if (blob) {
          const url = window.URL.createObjectURL(new Blob([blob]))
          const link = document.createElement("a")
          link.href = url
          link.setAttribute("download", `catspeak-${activeTab}-report.csv`)
          document.body.appendChild(link)
          link.click()
          link.parentNode.removeChild(link)
          window.URL.revokeObjectURL(url)
        }
      }
    } catch (err) {
      console.warn("API export failed:", err)
    }
  }

  const currentTabObj = tabsList.find((tItem) => tItem.key === activeTab) || tabsList[0]

  return (
    <div className="flex flex-col gap-5 text-[#14171F] min-h-full pb-10">
      {/* Breadcrumb Header */}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
          { label: analyticsT.title || "Phân tích" },
        ]}
      />

      {/* Page Title & Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFEEF0] text-[#B00020] flex items-center justify-center flex-shrink-0">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#12141A] tracking-tight leading-none">
              {analyticsT.title || "Thống kê"}
            </h1>
            <p className="text-xs text-[#6E788C] font-normal mt-1">
              {currentTabObj.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Container */}
      <div className="w-full flex flex-col gap-4">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-4 border-b border-[#DEDEE3] bg-transparent px-1 overflow-x-auto scrollbar-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {tabsList.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`pb-3.5 pt-1 text-sm transition-all relative whitespace-nowrap cursor-pointer select-none border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ${
                  isActive
                    ? "text-[#B20514] font-bold"
                    : "text-[#424A5C] hover:text-[#12141A] font-normal"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#BF0514] rounded-t" />
                )}
              </button>
            )
          })}
        </div>

        {/* Global Filter Bar */}
        <AnalyticsFilterBar
          filterMeta={filterMeta}
          courses={coursesResponse?.data || []}
          classes={classesResponse?.data || []}
          group={group}
          setGroup={setGroup}
          period={period}
          setPeriod={setPeriod}
          compare={compare}
          setCompare={setCompare}
          course={courseFilter}
          setCourse={setCourseFilter}
          className={classFilter}
          setClassName={setClassFilter}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          onExport={handleExport}
          isExporting={isExporting}
        />

        {/* Tab Content Views */}
        <div className="mt-1">
          {activeTab === "students" && (
            <StudentsTab
              group={group}
              courseFilter={courseFilter}
              onDrillDown={handleDrillDown}
              queryParams={activeQueryParams}
            />
          )}

          {activeTab === "revenue" && (
            <RevenueTab
              group={group}
              queryParams={activeQueryParams}
            />
          )}

          {activeTab === "courses" && (
            <CoursesTab
              courseFilter={courseFilter}
              queryParams={activeQueryParams}
            />
          )}

          {activeTab === "quality" && (
            <QualityTab
              group={group}
              queryParams={activeQueryParams}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkspaceAnalyticsPage
