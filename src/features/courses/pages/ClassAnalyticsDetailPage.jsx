import React, { useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetClassSpeakingAnalyticsQuery } from "@/store/api/roomsApi"
import { useGetClassDetailQuery } from "@/store/api/coursesApi"
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

  // Fetch official class metadata from Main API Service (catspeak-api)
  const { data: mainClassDetail, isLoading: isClassLoading } = useGetClassDetailQuery(
    classId || "",
    { skip: !classId }
  )

  // Fetch speaking balance & session analytics from AI API Service (catspeak-ai)
  const {
    data: apiData,
    isLoading: isSpeakingLoading,
    isError: isSpeakingError,
  } = useGetClassSpeakingAnalyticsQuery(classId || "", { skip: !classId })

  const isLoading = isClassLoading && isSpeakingLoading

  // Merged student roster: joins Main DB enrolled students with AI speaking metrics
  const mergedStudents = useMemo(() => {
    const mainStudents =
      mainClassDetail?.students ||
      mainClassDetail?.members ||
      mainClassDetail?.enrolledStudents ||
      []

    const aiStudents = apiData?.students || []

    // Build lookup map by accountId and id
    const aiStatsMap = new Map()
    aiStudents.forEach((st) => {
      if (st.accountId != null) aiStatsMap.set(String(st.accountId), st)
      if (st.id != null) aiStatsMap.set(String(st.id), st)
    })

    if (mainStudents.length === 0) {
      return aiStudents
    }

    // Merge each enrolled student with their AI speaking stats
    const merged = mainStudents.map((ms) => {
      const accId = ms.accountId ?? ms.id ?? ms.userId
      const name =
        ms.name ?? ms.fullName ?? ms.studentName ?? `Học viên ${accId}`
      const initial = name.trim().slice(0, 1).toUpperCase() || "H"
      const aiStat = aiStatsMap.get(String(accId))

      if (aiStat) {
        return {
          ...aiStat,
          id: String(accId),
          accountId: Number(accId) || aiStat.accountId,
          name: name || aiStat.name,
          initial: initial || aiStat.initial,
          avatar: ms.avatar ?? ms.avatarUrl ?? ms.avatarImageUrl,
          email: ms.email,
        }
      }

      // Zero-activity fallback for enrolled students who haven't attended / spoken yet
      return {
        id: String(accId),
        accountId: Number(accId),
        name,
        initial,
        avatar: ms.avatar ?? ms.avatarUrl ?? ms.avatarImageUrl,
        email: ms.email,
        avgStbPercent: 0,
        barLevel: 1,
        barColor: "bg-gray-300",
        barTrackWidth: "15%",
        sessionsMet: 0,
        sessionsUnmet: 0,
        trend: "stable",
        status: "normal",
        totalWords: 0,
        hasNoData: true,
      }
    })

    return merged
  }, [mainClassDetail, apiData])

  // Combined data merging Main DB metadata with AI speaking metrics
  const classData = {
    id: classId || "",
    className:
      mainClassDetail?.className ||
      mainClassDetail?.name ||
      apiData?.className ||
      classId ||
      "Lớp học",
    courseName:
      mainClassDetail?.courseName ||
      mainClassDetail?.courseTitle ||
      apiData?.courseName ||
      "",
    term: mainClassDetail?.term || apiData?.term || "",
    teacherName:
      mainClassDetail?.teacherName ||
      mainClassDetail?.instructorName ||
      mainClassDetail?.instructor?.name ||
      apiData?.teacherName ||
      "Giảng viên",
    totalStudents:
      mainClassDetail?.studentCount ||
      mergedStudents.length ||
      apiData?.totalStudents ||
      0,
    totalSessions: apiData?.totalSessions ?? (mainClassDetail?.totalSessions || 0),
    avgClassStb: apiData?.avgClassStb ?? 0,
    belowThresholdCount: apiData?.belowThresholdCount ?? 0,
    thresholdRate: apiData?.thresholdRate ?? 25,
    students: mergedStudents,
    sessions: apiData?.sessions || [],
    isSpeakingError,
  }

  // Active tab state: "students" | "sessions"
  const [activeTab, setActiveTab] = useState("students")

  const handleStudentClick = (student) => {
    navigate(
      `/workspace/analytics/class/${encodeURIComponent(classId || "")}/student/${encodeURIComponent(
        student.accountId || student.id || student.name
      )}`
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#16a34a] rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Đang tải dữ liệu phân tích buổi học...</p>
      </div>
    )
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
