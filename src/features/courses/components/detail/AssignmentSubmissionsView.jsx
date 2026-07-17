import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  Calendar,
  Eye,
  Lock,
  Unlock,
  Edit,
  MoreVertical,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  X,
  FileCheck,
  ZoomIn,
  ZoomOut,
  Download
} from "lucide-react"
import {
  useGetAssignmentByIdQuery,
  useCloseAssignmentMutation,
  useOpenAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useGetClassMembersQuery,
  useGradeSubmissionMutation,
  useBulkReturnSubmissionsMutation
} from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const getAssignmentTitle = (assignment) => (
  assignment?.name || assignment?.title || "Untitled assignment"
)

const getAssignmentStatus = (assignment) => (
  String(assignment?.status || "").toLowerCase()
)

const getAssignmentMaxScore = (assignment) => {
  const maxScore = Number(assignment?.maxScore)
  return Number.isFinite(maxScore) && maxScore > 0 ? maxScore : 10
}

const isAssignmentExpired = (assignment) => {
  const dueTime = assignment?.dueDate ? new Date(assignment.dueDate).getTime() : null
  return Boolean(dueTime && !Number.isNaN(dueTime) && dueTime < Date.now())
}

const getMemberStudentId = (member) => (
  member?.studentId ?? member?.userId ?? member?.id
)

const getMemberName = (member, fallbackId) => (
  member?.name || member?.fullName || member?.studentName || `Học viên ${fallbackId || ""}`.trim()
)

const AssignmentSubmissionsView = ({ assignment, onBack, classId }) => {
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const c = t.courses || {}
  const cg = c.grading || {}

  // Active student from query params
  const studentId = searchParams.get("studentId")

  // API Queries & Mutations
  const { data: assignmentDetailResponse, refetch: refetchAssignment } = useGetAssignmentByIdQuery({ classId, assignmentId: assignment.id })
  const currentAssignment = assignmentDetailResponse?.data || assignmentDetailResponse || assignment
  const assignmentTitle = getAssignmentTitle(currentAssignment)
  const assignmentStatus = getAssignmentStatus(currentAssignment)
  const assignmentClosed = assignmentStatus === "closed"
  const assignmentMaxScore = getAssignmentMaxScore(currentAssignment)
  const assignmentExpired = isAssignmentExpired(currentAssignment)
  const assignmentDueLabel = currentAssignment.dueDate
    ? new Date(currentAssignment.dueDate).toLocaleString(language === "vi" ? "vi-VN" : "en-US")
    : "—"
  const scoreInputLabel = assignmentMaxScore === 10
    ? (cg.scoreTenSystem || "Điểm (Hệ số 10)")
    : language === "zh"
      ? `分数 (满分 ${assignmentMaxScore})`
      : language === "vi"
        ? `Điểm (Tối đa ${assignmentMaxScore})`
        : `Score (max ${assignmentMaxScore})`

  const { data: submissionsResponse, isLoading: isSubmissionsLoading } = useGetAssignmentSubmissionsQuery({ classId, assignmentId: assignment.id })
  const { data: membersResponse, isLoading: isMembersLoading } = useGetClassMembersQuery({ classId })

  const [closeAssignment] = useCloseAssignmentMutation()
  const [openAssignment] = useOpenAssignmentMutation()
  const [gradeSubmission] = useGradeSubmissionMutation()
  const [bulkReturn] = useBulkReturnSubmissionsMutation()

  // Dropdown menus
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Search & Filter state
  const [studentSearch, setStudentSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all") // all, not_submitted, submitted, late, graded, returned
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4 // Matches the mockup screen showing exactly 4 rows

  // Grading states for active student
  const [tempScore, setTempScore] = useState("")
  const [tempFeedback, setTempFeedback] = useState("")
  const [zoomLevel, setZoomLevel] = useState(100)

  const submissionsData = useMemo(() => submissionsResponse?.data || submissionsResponse || [], [submissionsResponse])
  const membersData = useMemo(() => membersResponse?.data || membersResponse?.items || membersResponse || [], [membersResponse])

  const studentList = useMemo(() => {
    // Filter out teachers/instructors from class members
    const classStudents = membersData.filter((member) => {
      const role = String(member.role || "").toLowerCase()
      return role !== "teacher" && role !== "instructor"
    })

    // Map each class student to their submission if it exists
    return classStudents.map(student => {
      const memberStudentId = getMemberStudentId(student)
      const memberStudentIdText = memberStudentId?.toString() || ""
      // Find submission for this student
      const sub = submissionsData.find((submission) => (
        submission.studentId?.toString() === memberStudentIdText
      ))

      if (sub) {
        let parsedFiles = []
        try {
          if (sub.files) {
            parsedFiles = typeof sub.files === 'string' ? JSON.parse(sub.files) : sub.files
          }
        } catch (e) {
          console.error("Failed to parse files JSON:", e)
        }

        const apiStatus = (sub.status || "submitted").toLowerCase()

        return {
          id: memberStudentIdText,
          studentId: memberStudentIdText,
          submissionId: sub.id,
          name: getMemberName(student, memberStudentId) || sub.studentName || `Học viên ${memberStudentIdText}`,
          email: student.email || student.studentEmail || "—",
          avatar: student.avatarUrl || student.avatar || "",
          status: apiStatus, // submitted, late, graded, returned
          time: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US") : "—",
          score: sub.grade, // raw grade out of maxScore
          submissionText: sub.contentText || "",
          feedback: sub.comment || "",
          files: parsedFiles,
          submittedAt: sub.submittedAt
        }
      } else {
        // Not submitted
        return {
          id: memberStudentIdText,
          studentId: memberStudentIdText,
          submissionId: null,
          name: getMemberName(student, memberStudentId),
          email: student.email || student.studentEmail || "—",
          avatar: student.avatarUrl || student.avatar || "",
          status: "not_submitted",
          time: "—",
          score: null,
          submissionText: "",
          feedback: "",
          files: [],
          submittedAt: null
        }
      }
    })
  }, [membersData, submissionsData, language])

  const activeStudent = useMemo(() => {
    if (!studentId) return null
    return studentList.find((s) => s.id === studentId) || null
  }, [studentList, studentId])

  // Synchronize score/feedback states when activeStudent changes
  useEffect(() => {
    if (activeStudent) {
      setTempScore(activeStudent.score !== null && activeStudent.score !== undefined ? activeStudent.score.toString() : "")
      setTempFeedback(activeStudent.feedback || "")
      setZoomLevel(100)
    }
  }, [activeStudent])

  // Toggle Lock/Unlock submissions
  const handleToggleSubmissionsLock = async () => {
    try {
      if (assignmentClosed) {
        await openAssignment({ classId, assignmentId: assignment.id }).unwrap()
        toast.success(cg.toastOpenSuccess || "Đã mở lại bài nộp thành công!")
      } else {
        await closeAssignment({ classId, assignmentId: assignment.id }).unwrap()
        toast.success(cg.toastLockSuccess || "Đã khóa bài nộp thành công!")
      }
      refetchAssignment()
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.error?.message || "Lỗi khi khóa/mở khóa bài nộp")
    }
  }

  // Filters computed lists
  const filteredStudents = useMemo(() => {
    return studentList.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase())

      if (activeFilter === "all") return matchesSearch
      if (activeFilter === "not_submitted") return matchesSearch && student.status === "not_submitted"
      if (activeFilter === "submitted") return matchesSearch && (student.status === "submitted" || student.status === "late")
      if (activeFilter === "late") return matchesSearch && student.status === "late"
      if (activeFilter === "graded") return matchesSearch && student.status === "graded"
      if (activeFilter === "returned") return matchesSearch && student.status === "returned"

      return matchesSearch
    })
  }, [studentList, studentSearch, activeFilter])

  // Pagination lists
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredStudents, currentPage])

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [studentSearch, activeFilter])

  // Save Grade in Dual-Pane Screen
  const handleSaveGradeDualPane = async () => {
    if (!activeStudent) return

    if (!assignmentClosed) {
      const errText = language === "vi"
        ? "Cần khóa bài nộp trước khi chấm điểm!"
        : language === "zh"
          ? "评分前需要关闭作业！"
          : "Submissions must be closed before grading!"
      toast.error(errText)
      return
    }

    const inputVal = parseFloat(tempScore)
    if (isNaN(inputVal) || inputVal < 0 || inputVal > assignmentMaxScore) {
      const errText = language === "vi"
        ? `Vui lòng nhập điểm từ 0 đến ${assignmentMaxScore}`
        : language === "zh"
          ? `请输入0至${assignmentMaxScore}之间的得分`
          : `Please enter a score between 0 and ${assignmentMaxScore}`
      toast.error(errText)
      return
    }

    try {
      const submissionId = activeStudent.submissionId
      if (!submissionId) {
        toast.error("Không tìm thấy bài nộp của học viên này")
        return
      }

      await gradeSubmission({
        classId,
        assignmentId: assignment.id,
        submissionId,
        grade: inputVal,
        comment: tempFeedback
      }).unwrap()

      const successMsg = cg.toastGradeSaved
        ? cg.toastGradeSaved.replace("{{score}}", inputVal).replace("{{student}}", activeStudent.name)
        : `Đã chấm ${inputVal} điểm cho ${activeStudent.name}`
      toast.success(successMsg)

      // Return to submissions list
      setSearchParams({ assignmentId: assignment.id })
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.error?.message || "Lỗi khi lưu điểm")
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
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Failed to download grade sheet")

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `${assignmentTitle || "Grades"}_grades.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
      toast.success(cg.toastDownloadSuccess || "Tải xuống bảng điểm thành công!")
    } catch (err) {
      console.error(err)
      toast.error(cg.toastDownloadError || "Lỗi khi tải xuống bảng điểm")
    }
  }

  const handleBulkReturn = async () => {
    try {
      const res = await bulkReturn({ classId, assignmentId: assignment.id }).unwrap()
      toast.success(cg.toastBulkReturnSuccess
        ? cg.toastBulkReturnSuccess.replace("{{count}}", res.returnedCount || 0)
        : `Đã trả bài cho ${res.returnedCount || 0} học viên`
      )
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.error?.message || "Lỗi khi trả bài")
    }
  }

  // Loading spinner rendering
  if (isSubmissionsLoading || isMembersLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  // Get Initials for Avatar Placeholder
  const getInitials = (name) => {
    if (!name) return "ST"
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  // Count helper functions for statistics
  const totalStudents = studentList.length
  const notSubmittedStudents = studentList.filter((s) => s.status === "not_submitted").length
  const stats = {
    total: totalStudents,
    submitted: totalStudents - notSubmittedStudents,
    needsGrading: studentList.filter((s) => s.status === "submitted" || s.status === "late").length,
  }
  const statsPercentage = stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0

  // Format Pagination showing text dynamically
  const getPaginationShowingText = () => {
    const start = (currentPage - 1) * itemsPerPage + 1
    const end = Math.min(currentPage * itemsPerPage, filteredStudents.length)
    const total = filteredStudents.length
    if (cg.paginationShowing) {
      return cg.paginationShowing
        .replace("{{start}}", start)
        .replace("{{end}}", end)
        .replace("{{total}}", total)
    }
    return `Hiển thị ${start} đến ${end} trong tổng số ${total} học viên`
  }

  // ─── Dual-Pane Student Grading Workspace ───
  if (activeStudent) {
    const isSubmitted = activeStudent.status !== "not_submitted"
    const studentInitials = getInitials(activeStudent.name)
    const cleanFileName = `Bai_tap_tieng_anh_HK1_${activeStudent.name.replace(/\s+/g, "")}.pdf`

    return (
      <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-105px)] bg-gray-150 border border-gray-200 rounded-3xl overflow-hidden shadow-sm text-gray-800 animate-fade-in">

        {/* Left Pane (65% width) - PDF Preview Document */}
        <div className="flex-1 flex flex-col bg-gray-100/50 min-h-[450px] md:min-h-0">

          {/* Document Top Bar */}
          <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between text-xs font-bold text-gray-500 shadow-2xs select-none">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#990011]" />
              <span className="font-extrabold text-gray-800 tracking-tight">{cleanFileName}</span>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <button
                type="button"
                className="hover:text-gray-700 transition-colors"
                title="Search"
              >
                <Search size={14} />
              </button>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className="hover:text-gray-700 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-gray-800 font-extrabold text-[10px] w-8 text-center">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                  className="hover:text-gray-700 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
              <span className="text-gray-200">|</span>
              <button
                type="button"
                className="hover:text-gray-700 transition-colors"
                title="Download"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Paper Sheet Preview Area */}
          <div className="flex-1 p-6 md:p-8 flex justify-center items-start overflow-y-visible md:overflow-y-auto bg-gray-200/40">
            {!isSubmitted ? (
              <div className="w-full max-w-[620px] bg-white rounded-2xl shadow-sm border border-gray-150 p-12 text-center flex flex-col items-center justify-center gap-3">
                <X size={44} className="text-red-500 bg-red-50 p-2 rounded-full" />
                <h4 className="text-base font-extrabold text-gray-900">{cg.modalNotSubmittedMsg || "Học viên chưa nộp bài tập này."}</h4>
              </div>
            ) : (
              <div
                className="w-full max-w-[620px] bg-white rounded-lg shadow-md border border-gray-200 p-8 md:p-10 flex flex-col gap-6 text-[#2e2e2e] leading-relaxed transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              >
                <div className="border-b border-gray-100 pb-5">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                    {assignmentTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-2">
                    <span>Student: <strong className="text-gray-700 font-extrabold">{activeStudent.name}</strong></span>
                    <span>•</span>
                    <span>Class: <strong className="text-gray-700 font-extrabold">ENG-301</strong></span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-gray-750 flex flex-col gap-4">
                  <span className="text-sm font-black text-gray-900">Part 1: Essay</span>

                  {activeStudent.submissionText ? (
                    <p className="whitespace-pre-line leading-relaxed font-sans font-medium text-gray-700">
                      {activeStudent.submissionText}
                    </p>
                  ) : (
                    <p className="italic text-gray-400">No submission content provided.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane (35% width) - Grading Control Bar */}
        <div className="w-full md:w-[350px] lg:w-[380px] bg-white flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 min-h-0 md:h-full">

          <div className="p-6 flex flex-col gap-6 overflow-y-visible md:overflow-y-auto">
            <h2 className="text-lg font-black text-gray-950 tracking-tight">
              {cg.gradingAndComment || "Chấm điểm & Nhận xét"}
            </h2>

            {/* Student profile card */}
            <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex items-center gap-3">
              {activeStudent.avatar ? (
                <img
                  src={activeStudent.avatar}
                  alt={activeStudent.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 text-sm font-extrabold uppercase shadow-2xs font-sans">
                  {studentInitials}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-gray-900 text-sm leading-snug">{activeStudent.name}</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  {isSubmitted ? `Đã nộp: ${activeStudent.time}` : (cg.filterNotSubmitted || "Chưa nộp")}
                </span>
              </div>
            </div>

            {/* Score input area */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-gray-400 tracking-wider uppercase">
                {scoreInputLabel}
              </label>
              {!isSubmitted ? (
                <div className="text-xs font-bold text-gray-400 italic bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
                  {cg.modalNotSubmittedMsg || "Học viên chưa nộp bài tập này."}
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-2xs focus-within:ring-2 focus-within:ring-red-100 focus-within:border-[#990011] transition-all">
                  <input
                    type="text"
                    value={tempScore}
                    onChange={(e) => setTempScore(e.target.value)}
                    placeholder="0.0"
                    className="w-20 text-center font-black text-2xl text-[#990011] focus:outline-none placeholder-gray-300 select-all"
                  />
                  <span className="text-lg font-extrabold text-gray-400">/ {assignmentMaxScore}</span>
                </div>
              )}
            </div>

            {/* Comments / feedback text area */}
            {isSubmitted && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400 tracking-wider uppercase">
                  {cg.generalFeedback || "Nhận xét chung"}
                </label>
                <textarea
                  value={tempFeedback}
                  onChange={(e) => setTempFeedback(e.target.value)}
                  placeholder={cg.modalFeedbackPlaceholder || "Ghi nhận xét cho học viên..."}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-750 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] shadow-2xs resize-none leading-relaxed"
                />
              </div>
            )}

          </div>

          {/* Footer actions */}
          <div className="p-6 border-t border-gray-200 flex gap-3 bg-gray-50/50">
            <button
              type="button"
              onClick={() => setSearchParams({ assignmentId: assignment.id })}
              className="flex-1 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-xl text-center transition-colors shadow-2xs uppercase tracking-wider"
            >
              {cg.btnBack || "Quay về"}
            </button>
            {isSubmitted && (
              <button
                type="button"
                onClick={handleSaveGradeDualPane}
                className="flex-1 py-3 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-sm uppercase tracking-wider"
              >
                {activeStudent.status === "graded" || activeStudent.status === "returned"
                  ? (cg.btnRegrade || "Chấm lại bài")
                  : (cg.modalBtnSave || "Lưu điểm")}
              </button>
            )}
          </div>

        </div>

      </div>
    )
  }

  // ─── Main Submissions List View ───
  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumbs ─── */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.title || "Khóa học của tôi"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.allCourses?.title || "All Courses"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/courses/details/${classId}`)}>{c.student?.courseDetails || "Chi tiết khóa học"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={onBack}>{c.student?.classDetails || "Chi tiết lớp học"}</span>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{assignmentTitle}</span>
        </div>
      </div>

      {/* ─── Page Title ─── */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {cg.viewSubmissionsTitle || "Xem bài nộp"}
        </h1>
      </div>

      {/* ─── Section 1: Assignment Summary Card ─── */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-5 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-950 leading-tight mb-3">
              {assignmentTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {assignmentClosed ? (
                <span className="bg-gray-100 text-gray-500 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgeClosed || "ĐÃ ĐÓNG"}
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgePublished || "ĐÃ ĐĂNG"}
                </span>
              )}

              {assignmentExpired ? (
                <span className="bg-red-50 border border-red-100 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgeExpired || "HẾT HẠN"}
                </span>
              ) : (
                <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgeUpcoming || "SẮP ĐẾN HẠN"}
                </span>
              )}

              <button
                type="button"
                className="text-[#990011] hover:underline text-[11px] font-extrabold flex items-center gap-1 ml-2 transition-colors"
              >
                <span>{cg.viewPost || "Xem bài đăng"}</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 self-end md:self-start">
            <button
              type="button"
              onClick={() => navigate(`/workspace/courses/class/${classId}/create-assignment?assignmentId=${assignment.id}`)}
              className="h-10 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-2xs"
            >
              <Edit size={14} className="text-gray-500" />
              <span>{cg.editBtn || "Chỉnh sửa"}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSubmissionsLock}
              className={`h-10 px-4 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm text-white ${assignmentClosed
                ? "bg-[#990011] hover:bg-[#80000e]"
                : "bg-gray-800 hover:bg-gray-900"
                }`}
            >
              {assignmentClosed ? (
                <>
                  <Unlock size={14} />
                  <span>{cg.openSubmissions || "Mở bài nộp"}</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>{cg.lockSubmissions || "Khóa bài nộp"}</span>
                </>
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(prev => !prev)}
                className="w-10 h-10 border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 transition-colors shadow-2xs cursor-pointer"
              >
                <MoreVertical size={16} />
              </button>

              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-150 rounded-2xl shadow-xl py-2 z-50 text-xs font-bold text-gray-700 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false)
                        handleDownloadGradeSheet()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Download size={14} className="text-[#990011]" />
                      <span>{cg.downloadGradeSheet || "Tải bảng điểm (.xlsx)"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false)
                        handleBulkReturn()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 text-green-700 cursor-pointer"
                    >
                      <FileCheck size={14} />
                      <span>{cg.bulkReturnGrade || "Trả điểm toàn bộ"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-150 w-full" />

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Deadline */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">
              {cg.deadlineHeader || "HẠN NỘP"}
            </span>
            <div className="flex items-center gap-2.5 text-gray-800">
              <Calendar size={18} className="text-[#990011]" />
              <span className="text-base font-extrabold">{assignmentDueLabel}</span>
            </div>
          </div>

          {/* Column 2: Submitted */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">
              {cg.submittedHeader || "BÀI ĐÃ NỘP"}
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="text-base font-extrabold text-gray-800 font-sans">
                {stats.submitted} <span className="text-xs font-semibold text-gray-400">/ {stats.total} {cg.totalLabel || "Tổng số"}</span>
              </div>
              <div className="w-48 h-2 bg-gray-150 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#990011] rounded-full transition-all"
                  style={{ width: `${statsPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Column 3: Needs Grading */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">
              {cg.needsGradingHeader || "CẦN CHẤM"}
            </span>
            <div className="flex items-center gap-2.5 text-amber-600">
              <FileCheck size={18} />
              <span className="text-base font-extrabold">{stats.needsGrading}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 2: Filter, Search & Submissions Table Card ─── */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-6 animate-fade-in">

        {/* Search & Pills Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* Magnifying glass search bar */}
          <div className="relative w-full lg:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder={cg.searchStudentsPlaceholder || "Tìm kiếm học viên..."}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all placeholder-gray-400"
            />
          </div>

          {/* Filter Pills - Desktop */}
          <div className="hidden lg:flex flex-wrap items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 lg:pb-0 scrollbar-none lg:w-auto">
            {[
              { id: "all", label: cg.filterAll || "Tất cả" },
              { id: "not_submitted", label: cg.filterNotSubmitted || "Chưa nộp" },
              { id: "submitted", label: cg.filterSubmitted || "Đã nộp" },
              { id: "late", label: cg.filterLate || "Nộp muộn" },
              { id: "graded", label: cg.filterGraded || "Đã chấm" },
              { id: "returned", label: cg.filterReturned || "Đã trả bài" }
            ].map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all active:scale-95 ${isActive
                    ? "bg-[#990011] border-[#990011] text-white shadow-2xs"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          {/* Responsive Select Dropdown - Mobile */}
          <div className="relative w-full sm:w-auto min-w-[170px] block lg:hidden">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all appearance-none cursor-pointer"
            >
              <option value="all">{cg.filterAll || "Tất cả"}</option>
              <option value="not_submitted">{cg.filterNotSubmitted || "Chưa nộp"}</option>
              <option value="submitted">{cg.filterSubmitted || "Đã nộp"}</option>
              <option value="late">{cg.filterLate || "Nộp muộn"}</option>
              <option value="graded">{cg.filterGraded || "Đã chấm"}</option>
              <option value="returned">{cg.filterReturned || "Đã trả bài"}</option>
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

        </div>

        {/* Submissions Table */}
        <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="min-w-[650px] w-full border-collapse text-left text-xs font-semibold text-gray-500">
              <thead>
                <tr className="border-b border-gray-150 bg-gray-50 text-gray-700 font-extrabold uppercase tracking-wider">
                  <th className="p-4 pl-6">{cg.thStudent || "Học viên"}</th>
                  <th className="p-4">{cg.thStatus || "Trạng thái"}</th>
                  <th className="p-4">{cg.thSubmittedTime || "Thời gian nộp"}</th>
                  <th className="p-4 text-center">{cg.thGrade || "Điểm số"}</th>
                  <th className="p-4 pr-6 text-center">{cg.thActions || "Thao tác"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-750">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">
                      {cg.noStudentsFound || "Không tìm thấy học viên nào."}
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">

                      {/* Student Info */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-2xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 text-xs font-extrabold uppercase shadow-2xs font-sans">
                              {getInitials(student.name)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-extrabold text-gray-900 text-sm leading-snug">{student.name}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {student.status === "not_submitted" && (
                          <span className="bg-red-50 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-red-100 uppercase tracking-wide">
                            {cg.filterNotSubmitted || "Chưa nộp"}
                          </span>
                        )}
                        {student.status === "submitted" && (
                          <span className="bg-orange-50 text-orange-655 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-orange-100 uppercase tracking-wide">
                            {cg.filterSubmitted || "Đã nộp"}
                          </span>
                        )}
                        {student.status === "late" && (
                          <span className="bg-red-50 text-red-600 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-red-100 uppercase tracking-wide">
                            {cg.filterLate || "Nộp muộn"}
                          </span>
                        )}
                        {student.status === "graded" && (
                          <span className="bg-amber-50 text-amber-600 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-amber-100 uppercase tracking-wide">
                            {cg.filterGraded || "Đã chấm"}
                          </span>
                        )}
                        {student.status === "returned" && (
                          <span className="bg-emerald-50 text-emerald-650 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-wide">
                            {cg.filterReturned || "Đã trả bài"}
                          </span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="p-4 text-gray-400 font-medium whitespace-nowrap">
                        {student.time}
                      </td>

                      {/* Score */}
                      <td className="p-4 text-center font-black text-sm text-gray-900 font-mono whitespace-nowrap">
                        {student.score !== null && student.score !== undefined ? `${student.score} / ${assignmentMaxScore}` : "—"}
                      </td>

                      {/* View Button */}
                      <td className="p-4 pr-6 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSearchParams({ assignmentId: assignment.id, studentId: student.id })}
                          className="h-8 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-lg flex items-center gap-1.5 justify-center transition-colors shadow-2xs mx-auto"
                        >
                          <Eye size={12} className="text-gray-400" />
                          <span>{cg.btnView || "Xem"}</span>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 font-sans">
          <span className="text-xs text-gray-400 font-bold">
            {getPaginationShowingText()}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pg = idx + 1
              const isActive = currentPage === pg
              return (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${isActive
                    ? "bg-[#990011] text-white shadow-2xs border border-[#990011]"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {pg}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}

export default AssignmentSubmissionsView
