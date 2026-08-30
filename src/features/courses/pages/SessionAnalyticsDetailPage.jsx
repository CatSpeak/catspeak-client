import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetSessionSpeakingStatsQuery } from "@/store/api/roomsApi"
import { useGetClassDetailQuery } from "@/store/api/coursesApi"
import {
  SessionDetailHeader,
  SessionDetailKpis,
  SessionStudentSpeakingTable,
} from "../components/analytics/session-detail"
import ClassAnalyticsNotice from "../components/analytics/class-detail/ClassAnalyticsNotice"

const SessionAnalyticsDetailPage = () => {
  const { classId, sessionId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const c = t.courses || {}
  const sessT = c.analytics?.sessionDetail || {}

  // 1. Fetch official class metadata from Main API (catspeak-api)
  const { data: mainClassDetail, isLoading: isClassLoading } = useGetClassDetailQuery(classId || "", {
    skip: !classId,
  })

  // 2. Fetch specific session speaking statistics from AI API
  const {
    data: sessionStatsData,
    isLoading: isSessionLoading,
  } = useGetSessionSpeakingStatsQuery(
    { classId: classId || "", sessionId: sessionId || "" },
    { skip: !sessionId }
  )

  const isLoading = isClassLoading || isSessionLoading

  // Resolve students list from session speech stats
  const rawParticipants = sessionStatsData?.participants || []

  const enrolledStudents =
    mainClassDetail?.students ||
    mainClassDetail?.members ||
    mainClassDetail?.enrolledStudents ||
    []

  // Filter out teacher participants and merge student info with official roster names
  const participants = rawParticipants
    .filter((p) => {
      const isTeacher =
        p.isTeacher === true ||
        p.is_teacher === true ||
        p.role === "teacher" ||
        p.role === "instructor" ||
        p.role === "host" ||
        p.isHost === true ||
        p.is_host === true
      return !isTeacher
    })
    .map((p) => {
      const accId = p.accountId ?? p.account_id ?? p.id
      const matchedRoster = enrolledStudents.find(
        (s) => String(s.accountId ?? s.id ?? s.userId) === String(accId)
      )

      const resolvedName =
        matchedRoster?.name ||
        matchedRoster?.fullName ||
        matchedRoster?.studentName ||
        p.name ||
        `Student ${accId || ""}`

      return {
        ...p,
        accountId: accId,
        name: resolvedName,
        percent: p.percent ?? p.stbScore ?? p.balance?.stbScore ?? 0,
        words: p.words ?? p.stats?.words ?? 0,
        durationSeconds: p.durationSeconds ?? p.stats?.durationSeconds ?? 0,
        wpm: p.wpm ?? p.stats?.wpm ?? 0,
        isMet: p.isMet ?? p.isThresholdMet ?? p.is_threshold_met ?? true,
        status: p.status ?? p.balance?.status ?? "normal",
      }
    })

  // Build unified session data object (self-contained from sessionStatsData)
  const sessionData = {
    sessionId: sessionId || sessionStatsData?.sessionId || "",
    createdAt: sessionStatsData?.createdAt || sessionStatsData?.created_at || null,
    updatedAt: sessionStatsData?.updatedAt || sessionStatsData?.updated_at || null,
    teacherSpeechPercent:
      sessionStatsData?.teacherTalkRatio?.teacherPercent ?? 45,
    studentSpeechPercent:
      sessionStatsData?.teacherTalkRatio?.studentPercent ?? 55,
    teacherStatus:
      sessionStatsData?.teacherTalkRatio?.status ?? "ideal",
    durationSeconds:
      sessionStatsData?.overview?.totalStudentDurationSeconds ??
      participants.reduce((acc, p) => acc + (p.durationSeconds || 0), 0) ??
      0,
    totalStudentDurationSeconds:
      sessionStatsData?.overview?.totalStudentDurationSeconds ??
      participants.reduce((acc, p) => acc + (p.durationSeconds || 0), 0) ??
      0,
    studentCount:
      participants.length ||
      sessionStatsData?.overview?.studentCount ||
      0,
    lowSpeakingCount:
      sessionStatsData?.fairShare?.lowSpeakingCount ??
      participants.filter((p) => !p.isMet).length ??
      0,
    participants,
  }

  const classData = {
    id: classId || "",
    classId: classId || "",
    className:
      mainClassDetail?.className ||
      mainClassDetail?.name ||
      classId ||
      "Lớp học",
    courseName:
      mainClassDetail?.courseName ||
      "",
    teacherName:
      mainClassDetail?.teacherName ||
      mainClassDetail?.instructorName ||
      "Giảng viên",
  }

  const handleSelectStudent = (student) => {
    const targetStudentId = student.accountId || student.id || student.participantId
    if (targetStudentId && classId) {
      navigate(
        `/workspace/analytics/class/${encodeURIComponent(classId)}/student/${encodeURIComponent(
          targetStudentId
        )}`
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#16a34a] rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">{sessT.loading || "Đang tải dữ liệu phân tích buổi học..."}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e] min-h-full pb-12 max-w-7xl mx-auto w-full">
      {/* 1. Header with Breadcrumbs, Title and Subtitle */}
      <SessionDetailHeader sessionData={sessionData} classData={classData} />

      {/* 2. Top Summary Metrics (3 KPI Cards) */}
      <SessionDetailKpis
        sessionData={sessionData}
        teacherName={classData.teacherName}
      />

      {/* 3. Teacher speech disclaimer notice */}
      <ClassAnalyticsNotice />

      {/* 4. Student Speaking Data Table */}
      <div className="flex flex-col bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-xs overflow-hidden">
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-900">
            {sessT.tableTitle || "Dữ liệu phát biểu học viên"}
          </h3>
          <p className="text-xs text-gray-500">
            {sessT.tableDesc || "Thống kê chi tiết thời lượng, số từ và trạng thái phát biểu của từng học viên trong buổi học."}
          </p>
        </div>

        <SessionStudentSpeakingTable
          participants={sessionData.participants}
          onSelectStudent={handleSelectStudent}
        />
      </div>
    </div>
  )
}

export default SessionAnalyticsDetailPage
