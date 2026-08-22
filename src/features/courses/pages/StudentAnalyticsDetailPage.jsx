import React, { useMemo } from "react"
import { useParams } from "react-router-dom"
import { getStudentAnalyticsData } from "../data/classAnalyticsMockData"
import {
  StudentDetailHeader,
  StudentDetailKpis,
  StudentDetailNotice,
  StudentSessionHistoryTable,
} from "../components/analytics/student-detail"

const StudentAnalyticsDetailPage = () => {
  const { classId, studentId } = useParams()

  // Fetch full mock dataset for this student in this class
  const studentData = useMemo(
    () => getStudentAnalyticsData(classId, studentId),
    [classId, studentId],
  )

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
