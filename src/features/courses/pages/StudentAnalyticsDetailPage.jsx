import React from "react"
import { useParams } from "react-router-dom"
import { useGetStudentSpeakingHistoryQuery } from "@/store/api/roomsApi"
import { useGetClassDetailQuery } from "@/store/api/coursesApi"
import {
  StudentDetailHeader,
  StudentDetailKpis,
  StudentDetailNotice,
  StudentSessionHistoryTable,
} from "../components/analytics/student-detail"

const StudentAnalyticsDetailPage = () => {
  const { classId, studentId } = useParams()

  // Fetch official class metadata from Main API Service (catspeak-api)
  const { data: mainClassDetail } = useGetClassDetailQuery(classId || "", {
    skip: !classId,
  })

  // Fetch real speaking history for this student from AI API Service (catspeak-ai)
  const { data: apiData, isLoading, isError } = useGetStudentSpeakingHistoryQuery(
    { classId: classId || "", studentId: studentId || "" },
    { skip: !classId || !studentId }
  )

  // Find student in official enrolled roster
  const mainStudent = (
    mainClassDetail?.students ||
    mainClassDetail?.members ||
    mainClassDetail?.enrolledStudents ||
    []
  ).find(
    (s) =>
      String(s.accountId ?? s.id ?? s.userId) === String(studentId),
  )

  const resolvedStudentName =
    mainStudent?.name ||
    mainStudent?.fullName ||
    mainStudent?.studentName ||
    apiData?.studentName ||
    `Học viên ${studentId || ""}`

  // Combined data object
  const studentData = {
    studentId: studentId || "",
    studentName: resolvedStudentName,
    avatar: mainStudent?.avatar ?? mainStudent?.avatarUrl ?? mainStudent?.avatarImageUrl,
    email: mainStudent?.email,
    classId: classId || "",
    className:
      mainClassDetail?.className ||
      mainClassDetail?.name ||
      apiData?.className ||
      classId ||
      "Lớp học",
    term: mainClassDetail?.term || apiData?.term || "",
    totalSessions: apiData?.totalSessions ?? 0,
    classExpectedRate: apiData?.classExpectedRate ?? 25,
    avgSpeechPercent: apiData?.avgSpeechPercent ?? 0,
    metRecentCount: apiData?.metRecentCount ?? 0,
    recentTotal: apiData?.recentTotal ?? 0,
    totalWords: apiData?.totalWords ?? 0,
    avgWordsPerSession: apiData?.avgWordsPerSession ?? 0,
    trend: apiData?.trend ?? "stable",
    trendText: apiData?.trendText ?? "Ổn định",
    recentSessionNumber: apiData?.recentSessionNumber ?? 0,
    recentSessionPercent: apiData?.recentSessionPercent ?? 0,
    warningMessage: apiData?.warningMessage ?? null,
    sessions: apiData?.sessions || [],
    isError,
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#16a34a] rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Đang tải lịch sử phát biểu học viên...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e] min-h-full pb-14 max-w-7xl mx-auto w-full">
      {/* 1. Header with Breadcrumbs, Title and Subtitle */}
      <StudentDetailHeader data={studentData} />

      {/* 2. Top Summary Metrics (4 Cards) */}
      <StudentDetailKpis data={studentData} />

      {/* 3. Attention Notice Warning Banner */}
      <StudentDetailNotice
        message={studentData.warningMessage}
        unmet={studentData.recentTotal - studentData.metRecentCount}
        total={studentData.recentTotal}
      />

      {/* 4. Session-by-Session History Table */}
      <div className="flex flex-col bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-xs">
        <StudentSessionHistoryTable sessions={studentData.sessions} />
      </div>
    </div>
  )
}

export default StudentAnalyticsDetailPage
