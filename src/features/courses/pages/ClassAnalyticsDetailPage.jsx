import React, { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getClassAnalyticsData } from "../data/classAnalyticsMockData"
import {
  ClassAnalyticsHeader,
  ClassAnalyticsKpis,
  ClassAnalyticsNotice,
  ClassAnalyticsStudentTable,
  ClassAnalyticsSessionList,
} from "../components/analytics/class-detail"

const ClassAnalyticsDetailPage = () => {
  const navigate = useNavigate()
  const { classId } = useParams()
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}

  // Fetch full mock dataset for this class
  const classData = useMemo(() => getClassAnalyticsData(classId), [classId])

  // Active tab state: "students" | "sessions"
  const [activeTab, setActiveTab] = useState("students")

  const handleStudentClick = (student) => {
    navigate(`/workspace/analytics/class/${encodeURIComponent(classId || "class-b2-sang")}/student/${encodeURIComponent(student.id || student.name)}`)
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e] min-h-full pb-12 max-w-7xl mx-auto w-full">
      {/* 1. Header with Breadcrumbs, Title and Subtitle */}
      <ClassAnalyticsHeader classData={classData} />

      {/* 2. Top Summary Metrics (3 Cards) */}
      <ClassAnalyticsKpis classData={classData} />

      {/* 3. Teacher speech disclaimer alert */}
      <ClassAnalyticsNotice teacherName={classData.teacherName} />

      {/* 4. Tab Navigation & Content Container */}
      <div className="flex flex-col bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex gap-6 border-b border-gray-200 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === "students"
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600 font-medium"
            }`}
          >
            {cd.tabByStudent || "Theo học viên"}
            {activeTab === "students" && (
              <span className="absolute left-0 right-0 bottom-0 h-[2.5px] bg-gray-900 rounded-t" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sessions")}
            className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === "sessions"
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600 font-medium"
            }`}
          >
            {cd.tabBySession || "Theo buổi"}
            {activeTab === "sessions" && (
              <span className="absolute left-0 right-0 bottom-0 h-[2.5px] bg-gray-900 rounded-t" />
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6">
          {activeTab === "students" ? (
            <ClassAnalyticsStudentTable
              students={classData.students}
              thresholdRate={classData.thresholdRate}
              totalStudents={classData.totalStudents}
              onSelectStudent={handleStudentClick}
            />
          ) : (
            <ClassAnalyticsSessionList
              sessions={classData.sessions}
              teacherName={classData.teacherName}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ClassAnalyticsDetailPage
