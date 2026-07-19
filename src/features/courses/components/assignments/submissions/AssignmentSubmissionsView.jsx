import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"

import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useBulkReturnSubmissionsMutation,
  useCloseAssignmentMutation,
  useGetAssignmentByIdQuery,
  useGetAssignmentSubmissionsQuery,
  useGetClassMembersQuery,
  useGradeSubmissionMutation,
  useOpenAssignmentMutation,
  useReturnSubmissionMutation,
} from "@/store/api/coursesApi"

import {
  getAssignmentMaxScore,
  getAssignmentStatus,
  getAssignmentTitle,
  isAssignmentExpired,
} from "../../../utils/assignmentUtils"
import { buildSubmissionStudentList } from "../../../utils/submissionUtils"
import AssignmentGradingWorkspace from "./AssignmentGradingWorkspace"
import AssignmentSubmissionsList from "./AssignmentSubmissionsList"

const AssignmentSubmissionsView = ({ assignment, onBack, classId }) => {
  const { language, t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [nowMs] = useState(() => Date.now())
  const [studentSearch, setStudentSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const gradingTranslations = t.courses?.grading || {}
  const activeStudentId = searchParams.get("studentId")

  const { data: assignmentDetailResponse, refetch: refetchAssignment } = useGetAssignmentByIdQuery({
    classId,
    assignmentId: assignment.id,
  })
  const { data: submissionsResponse, isLoading: isSubmissionsLoading } = useGetAssignmentSubmissionsQuery({
    classId,
    assignmentId: assignment.id,
  })
  const { data: membersResponse, isLoading: isMembersLoading } = useGetClassMembersQuery({ classId })
  const [closeAssignment] = useCloseAssignmentMutation()
  const [openAssignment] = useOpenAssignmentMutation()
  const [gradeSubmission] = useGradeSubmissionMutation()
  const [bulkReturn] = useBulkReturnSubmissionsMutation()
  const [returnSubmission] = useReturnSubmissionMutation()

  const currentAssignment = assignmentDetailResponse?.data || assignmentDetailResponse || assignment
  const assignmentTitle = getAssignmentTitle(currentAssignment)
  const assignmentClosed = getAssignmentStatus(currentAssignment) === "closed"
  const assignmentMaxScore = getAssignmentMaxScore(currentAssignment)
  const assignmentExpired = isAssignmentExpired(currentAssignment, nowMs)
  const assignmentDueLabel = currentAssignment.dueDate
    ? new Date(currentAssignment.dueDate).toLocaleString(language === "vi" ? "vi-VN" : "en-US")
    : "—"
  const submissions = useMemo(
    () => submissionsResponse?.data || submissionsResponse || [],
    [submissionsResponse],
  )
  const members = useMemo(
    () => membersResponse?.data || membersResponse?.items || membersResponse || [],
    [membersResponse],
  )
  const students = useMemo(() => buildSubmissionStudentList({
    members,
    submissions,
    language,
  }), [members, submissions, language])
  const activeStudent = useMemo(() => {
    if (!activeStudentId) return null
    return students.find((student) => student.id === activeStudentId) || null
  }, [students, activeStudentId])

  const handleToggleSubmissionsLock = async () => {
    try {
      if (assignmentClosed) {
        await openAssignment({ classId, assignmentId: assignment.id }).unwrap()
        toast.success(gradingTranslations.toastOpenSuccess || "Đã mở lại bài nộp thành công!")
      } else {
        await closeAssignment({ classId, assignmentId: assignment.id }).unwrap()
        toast.success(gradingTranslations.toastLockSuccess || "Đã khóa bài nộp thành công!")
      }
      refetchAssignment()
    } catch (error) {
      console.error(error)
      toast.error(error?.data?.error?.message || "Lỗi khi khóa/mở khóa bài nộp")
    }
  }

  const handleSaveGrade = async ({ score, feedback }) => {
    if (!activeStudent) return

    if (!assignmentClosed) {
      const errorMessage = language === "vi"
        ? "Cần khóa bài nộp trước khi chấm điểm!"
        : language === "zh"
          ? "评分前需要关闭作业！"
          : "Submissions must be closed before grading!"
      toast.error(errorMessage)
      return
    }

    const numericScore = parseFloat(score)
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > assignmentMaxScore) {
      const errorMessage = language === "vi"
        ? `Vui lòng nhập điểm từ 0 đến ${assignmentMaxScore}`
        : language === "zh"
          ? `请输入0至${assignmentMaxScore}之间的得分`
          : `Please enter a score between 0 and ${assignmentMaxScore}`
      toast.error(errorMessage)
      return
    }

    if (!activeStudent.submissionId) {
      toast.error("Không tìm thấy bài nộp của học viên này")
      return
    }

    try {
      await gradeSubmission({
        classId,
        assignmentId: assignment.id,
        submissionId: activeStudent.submissionId,
        grade: numericScore,
        comment: feedback,
      }).unwrap()

      const successMessage = gradingTranslations.toastGradeSaved
        ? gradingTranslations.toastGradeSaved
          .replace("{{score}}", numericScore)
          .replace("{{student}}", activeStudent.name)
        : `Đã chấm ${numericScore} điểm cho ${activeStudent.name}`
      toast.success(successMessage)
      setSearchParams({ assignmentId: assignment.id })
    } catch (error) {
      console.error(error)
      toast.error(error?.data?.error?.message || "Lỗi khi lưu điểm")
    }
  }

  const handleDownloadGradeSheet = async () => {
    try {
      const baseUrl = import.meta.env.VITE_INSTRUCTOR_API_BASE_URL || "/api"
      const url = `${baseUrl}/teacher/classes/${classId}/assignments/${assignment.id}/grade-sheet`
      const token = localStorage.getItem("token")
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to download grade sheet")

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const downloadLink = document.createElement("a")
      downloadLink.href = downloadUrl
      downloadLink.download = `${assignmentTitle || "Grades"}_grades.xlsx`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      window.URL.revokeObjectURL(downloadUrl)
      toast.success(gradingTranslations.toastDownloadSuccess || "Tải xuống bảng điểm thành công!")
    } catch (error) {
      console.error(error)
      toast.error(gradingTranslations.toastDownloadError || "Lỗi khi tải xuống bảng điểm")
    }
  }

  const handleBulkReturn = async () => {
    try {
      const response = await bulkReturn({ classId, assignmentId: assignment.id }).unwrap()
      const returnedCount = response.returnedCount || 0
      toast.success(gradingTranslations.toastBulkReturnSuccess
        ? gradingTranslations.toastBulkReturnSuccess.replace("{{count}}", returnedCount)
        : `Đã trả bài cho ${returnedCount} học viên`)
    } catch (error) {
      console.error(error)
      toast.error(error?.data?.error?.message || "Lỗi khi trả bài")
    }
  }

  const handleReleaseGrade = async () => {
    if (!activeStudent || !activeStudent.submissionId) return

    try {
      await returnSubmission({
        classId,
        assignmentId: assignment.id,
        submissionId: activeStudent.submissionId,
      }).unwrap()

      const successMessage = gradingTranslations.toastGradeReturned
        ? gradingTranslations.toastGradeReturned.replace("{{student}}", activeStudent.name)
        : `Đã trả bài chấm cho học viên ${activeStudent.name}`
      toast.success(successMessage)
      setSearchParams({ assignmentId: assignment.id })
    } catch (error) {
      console.error(error)
      toast.error(error?.data?.error?.message || "Lỗi khi trả kết quả")
    }
  }

  if (isSubmissionsLoading || isMembersLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (activeStudent) {
    return (
      <AssignmentGradingWorkspace
        key={`${activeStudent.id}-${activeStudent.submissionId}-${activeStudent.score}-${activeStudent.feedback}`}
        assignmentTitle={assignmentTitle}
        assignmentMaxScore={assignmentMaxScore}
        student={activeStudent}
        onBack={() => setSearchParams({ assignmentId: assignment.id })}
        onSave={handleSaveGrade}
        onRelease={handleReleaseGrade}
      />
    )
  }

  return (
    <AssignmentSubmissionsList
      assignmentId={assignment.id}
      assignmentTitle={assignmentTitle}
      assignmentClosed={assignmentClosed}
      assignmentExpired={assignmentExpired}
      assignmentDueLabel={assignmentDueLabel}
      assignmentMaxScore={assignmentMaxScore}
      classId={classId}
      students={students}
      studentSearch={studentSearch}
      activeFilter={activeFilter}
      currentPage={currentPage}
      onBack={onBack}
      onToggleSubmissionsLock={handleToggleSubmissionsLock}
      onDownloadGradeSheet={handleDownloadGradeSheet}
      onBulkReturn={handleBulkReturn}
      onSelectStudent={(studentId) => setSearchParams({ assignmentId: assignment.id, studentId })}
      onStudentSearchChange={(value) => {
        setStudentSearch(value)
        setCurrentPage(1)
      }}
      onActiveFilterChange={(value) => {
        setActiveFilter(value)
        setCurrentPage(1)
      }}
      onPageChange={setCurrentPage}
    />
  )
}

export default AssignmentSubmissionsView
