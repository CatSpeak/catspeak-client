import React, { useMemo, useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import {
  useGetStudentAssignmentsQuery,
  useGetStudentQuizzesQuery,
} from "@/store/api/coursesApi"
import { getQuizListFromResponse } from "../../utils/quizUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import TablePagination from "../shared/TablePagination"
import StudentGradingCard from "./StudentGradingCard"
import StudentGradingFilterModal from "./StudentGradingFilterModal"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import StudentAssignmentDetailView from "../assignments/StudentAssignmentDetailView"
import { FilterIcon, SlidersHorizontal } from "lucide-react"

const STUDENT_PAGE_SIZE = 9

const getTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const getArrayFromResponse = (response) => {
  const data = response?.data ?? response
  return Array.isArray(data) ? data : null
}

const getDisplayableItems = (items) => {
  if (!Array.isArray(items)) return []
  const seenIds = new Set()
  return items.filter((item) => {
    if (!item || typeof item !== "object" || item.id == null) return false
    const id = String(item.id)
    if (seenIds.has(id)) return false
    seenIds.add(id)
    return true
  })
}

const StudentGradingTab = ({ id: classId }) => {
  const { t } = useLanguage()
  const { formatDateTime } = useTimezone()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState("all") // all | pending | submitted | overdue
  const [activeType, setActiveType] = useState("all") // all | assignment | quiz
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [studentPage, setStudentPage] = useState(1)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const timerId = window.setInterval(() => setNowMs(Date.now()), 30_000)
    return () => window.clearInterval(timerId)
  }, [])

  // Fetch queries
  const {
    currentData: assignmentsData,
    isLoading: isAssignmentsInitialLoading,
    isFetching: isAssignmentsFetching,
  } = useGetStudentAssignmentsQuery({ classId }, { skip: !classId })

  const {
    currentData: quizzesData,
    isLoading: isQuizzesInitialLoading,
    isFetching: isQuizzesFetching,
  } = useGetStudentQuizzesQuery({ classId }, { skip: !classId })

  const isAssignmentsLoading =
    isAssignmentsInitialLoading ||
    (isAssignmentsFetching && assignmentsData === undefined)
  const isQuizzesLoading =
    isQuizzesInitialLoading ||
    (isQuizzesFetching && quizzesData === undefined)

  const isLoading = isAssignmentsLoading || isQuizzesLoading

  const rawAssignments = useMemo(
    () => getArrayFromResponse(assignmentsData),
    [assignmentsData]
  )
  const rawQuizzes = useMemo(
    () => getQuizListFromResponse(quizzesData),
    [quizzesData]
  )

  const assignments = useMemo(
    () => getDisplayableItems(rawAssignments),
    [rawAssignments]
  )
  const quizzes = useMemo(() => getDisplayableItems(rawQuizzes), [rawQuizzes])


  // Normalize items
  const normalizedItems = useMemo(() => {
    const items = []

    const calculateTimeRemaining = (remainingMs) => {
      if (remainingMs <= 0) return ""
      const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24))
      const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24)
      if (days > 0) return `Còn ${days} ngày ${hours} giờ`
      if (hours > 0) return `Còn ${hours} giờ`
      return `Còn ${Math.floor((remainingMs / (1000 * 60)) % 60)} phút`
    }

    assignments.forEach((assignment) => {
      const submission = assignment.studentSubmission ?? null
      const subStatus = submission?.status?.toLowerCase()
      const dueDateMs = getTimestamp(assignment.dueDate)
      const remainingMs = dueDateMs - nowMs
      const isExpired = dueDateMs > 0 && dueDateMs < nowMs

      let status = "pending"
      let statusLabel = "Chưa làm"
      let scoreText = null
      let footerText = ""
      let actionText = "Làm bài"

      if (subStatus) {
        if (subStatus === "submitted" || subStatus === "late") {
          status = subStatus
          statusLabel = subStatus === "late" ? "Nộp muộn" : "Đã nộp"
          footerText = "Chờ chấm điểm"
          actionText = "Xem chi tiết"
        } else if (subStatus === "graded") {
          status = "graded"
          statusLabel = "Đã chấm"
          footerText = "Chờ công bố điểm"
          actionText = "Xem chi tiết"
        } else if (subStatus === "returned") {
          status = "returned"
          statusLabel = "Đã có điểm"
          scoreText = submission.grade != null ? String(submission.grade) : null
          actionText = "Xem kết quả"
        }
      } else if (isExpired) {
        status = "overdue"
        statusLabel = "Quá hạn"
        actionText = "Đã đóng"
      }

      items.push({
        type: "assignment",
        id: assignment.id,
        raw: assignment,
        title: assignment.name || "Bài tập không tên",
        duration: null,
        questionCount: null,
        dueDateMs,
        createdAtMs: getTimestamp(assignment.createdAt),
        status,
        statusLabel,
        timeRemainingText: status === "pending" ? calculateTimeRemaining(remainingMs) : "",
        deadlineText: assignment.dueDate ? `Hạn ${formatDateTime(assignment.dueDate).split(' ')[0]}` : "",
        scoreText,
        footerText,
        actionText,
      })
    })

    quizzes.forEach((quiz) => {
      const submission = quiz.studentSubmission ?? null
      const subStatus = submission?.status?.toLowerCase() || (typeof quiz.recordStatus === "string" ? quiz.recordStatus.toLowerCase() : null)
      const closeTimestamp = getTimestamp(quiz.closeTime)
      const remainingMs = closeTimestamp - nowMs
      const isExpired = closeTimestamp > 0 && closeTimestamp < nowMs

      let status = "pending"
      let statusLabel = "Chưa làm"
      let scoreText = null
      let footerText = ""
      let actionText = "Làm bài"

      if (subStatus) {
        if (subStatus === "submitted" || subStatus === "late") {
          status = subStatus
          statusLabel = subStatus === "late" ? "Nộp muộn" : "Đã nộp"
          footerText = "Chờ chấm điểm"
          actionText = "Xem chi tiết"
        } else if (subStatus === "graded") {
          status = "graded"
          statusLabel = "Đã chấm"
          footerText = "Chờ công bố điểm"
          actionText = "Xem chi tiết"
        } else if (subStatus === "returned") {
          status = "returned"
          statusLabel = "Đã có điểm"
          scoreText = submission?.grade != null ? String(submission.grade) : (quiz.recordScore != null ? String(quiz.recordScore) : null)
          actionText = "Xem kết quả"
        }
      } else if (isExpired) {
        status = "overdue"
        statusLabel = "Quá hạn"
        actionText = "Đã đóng"
      }

      items.push({
        type: "quiz",
        id: quiz.id,
        raw: quiz,
        title: quiz.name || "Bài kiểm tra không tên",
        duration: quiz.timeLimitMinutes ?? "0",
        questionCount: quiz.totalQuestions ?? 0,
        dueDateMs: closeTimestamp,
        createdAtMs: getTimestamp(quiz.createdAt),
        status,
        statusLabel,
        timeRemainingText: status === "pending" ? calculateTimeRemaining(remainingMs) : "",
        deadlineText: quiz.closeTime ? `Hạn ${formatDateTime(quiz.closeTime).split(' ')[0]}` : "",
        scoreText,
        footerText,
        actionText,
      })
    })

    return items
  }, [assignments, quizzes, nowMs, formatDateTime])

  // Filter items based on activeTab and activeType
  const filteredItems = useMemo(() => {
    return normalizedItems
      .filter((item) => {
        let matchStatus = false
        if (activeTab === "all") matchStatus = true
        else if (activeTab === "pending") matchStatus = item.status === "pending"
        else if (activeTab === "submitted") matchStatus = item.status === "submitted" || item.status === "late"
        else if (activeTab === "graded") matchStatus = item.status === "graded" || item.status === "returned"
        else if (activeTab === "overdue") matchStatus = item.status === "overdue"

        const matchType = activeType === "all" || item.type === activeType
        return matchStatus && matchType
      })
      .sort((a, b) => {
        const getStatusWeight = (status) => {
          if (status === "pending") return 1
          if (status === "submitted" || status === "late") return 2
          if (status === "graded" || status === "returned") return 3
          if (status === "overdue") return 4
          return 5
        }

        const weightA = getStatusWeight(a.status)
        const weightB = getStatusWeight(b.status)

        if (weightA !== weightB) {
          return weightA - weightB
        }

        if (a.status === "pending") {
          // Chưa làm: Bài sắp hết hạn xếp trước, không có hạn thì đẩy xuống dưới cùng
          const dateA = a.dueDateMs > 0 ? a.dueDateMs : Infinity
          const dateB = b.dueDateMs > 0 ? b.dueDateMs : Infinity
          return dateA - dateB
        } else {
          // Đã xử lý / Quá hạn: Bài có hoạt động gần nhất (hạn gần nhất) xếp trước
          const dateA = a.dueDateMs > 0 ? a.dueDateMs : 0
          const dateB = b.dueDateMs > 0 ? b.dueDateMs : 0
          return dateB - dateA
        }
      })
  }, [normalizedItems, activeTab, activeType])

  // Pagination
  const totalItems = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / STUDENT_PAGE_SIZE))
  const activePage = Math.min(studentPage, totalPages)

  const visibleItems = useMemo(() => {
    const start = (activePage - 1) * STUDENT_PAGE_SIZE
    return filteredItems.slice(start, start + STUDENT_PAGE_SIZE)
  }, [activePage, filteredItems])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setStudentPage(1)
  }

  const handleActionClick = (item) => {
    if (item.type === "assignment") {
      setSearchParams({ tab: "grading", assignmentId: item.id })
    } else {
      const isDone = item.status !== "pending" && item.status !== "overdue"
      const target = `/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(item.id)}/take${isDone ? '?step=result' : ''}`
      navigate(target)
    }
  }

  const assignmentId = searchParams.get("assignmentId")
  if (assignmentId) {
    return (
      <StudentAssignmentDetailView
        assignmentId={assignmentId}
        classId={classId}
        onBack={() => setSearchParams({ tab: "grading" })}
      />
    )
  }

  if (isLoading && normalizedItems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  const activeFilterCount = (activeTab !== "all" ? 1 : 0) + (activeType !== "all" ? 1 : 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Quản lý bài</h2>
        <div className="relative">
          <IconButton
            onClick={() => setShowFilterModal(true)}
            title="Lọc trạng thái"
            variant="outline"
          >
            <SlidersHorizontal />
          </IconButton>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[24px] h-[24px] bg-[#990011] text-white text-base font-bold rounded-full flex items-center justify-center border-[1.5px] border-white pointer-events-none z-10 px-1 leading-none shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>

      <StudentGradingFilterModal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        activeStatus={activeTab}
        onStatusChange={handleTabChange}
        activeType={activeType}
        onTypeChange={(type) => {
          setActiveType(type)
          setStudentPage(1)
        }}
      />

      {visibleItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          Không có bài tập/bài kiểm tra nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleItems.map((item) => (
            <StudentGradingCard
              key={`${item.type}-${item.id}`}
              type={item.type}
              typeLabel={item.type === "assignment" ? "Bài nộp" : "Bài kiểm tra"}
              status={item.status}
              statusLabel={item.statusLabel}
              title={item.title}
              duration={item.duration}
              questionCount={item.questionCount}
              timeRemainingText={item.timeRemainingText}
              deadlineText={item.deadlineText}
              score={item.scoreText}
              footerText={item.footerText}
              actionText={item.actionText}
              onAction={() => handleActionClick(item)}
            />
          ))}
        </div>
      )}

      {totalItems > STUDENT_PAGE_SIZE && (
        <TablePagination
          currentPage={activePage}
          totalPages={totalPages}
          totalCount={totalItems}
          limit={STUDENT_PAGE_SIZE}
          onPageChange={setStudentPage}
          t={t}
        />
      )}
    </div>
  )
}

export default StudentGradingTab