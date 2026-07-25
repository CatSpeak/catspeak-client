import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"

import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useBulkReturnSubmissionsMutation,
  useCloseAssignmentMutation,
  useDeleteAssignmentMutation,
  useDownloadAssignmentGradeSheetMutation,
  useGetAssignmentByIdQuery,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
  useOpenAssignmentMutation,
  useReturnSubmissionMutation,
} from "@/store/api/coursesApi"

import {
  getAssignmentStatus,
  getAssignmentTitle,
  isAssignmentExpired,
} from "../../../utils/assignmentUtils"
import {
  buildSubmissionStudentList,
  formatSubmissionDate,
  getSafeSubmissionErrorMessage,
  getValidAttachmentList,
  getValidDateMs,
} from "../../../utils/submissionUtils"
import AssignmentGradingWorkspace from "./AssignmentGradingWorkspace"
import AssignmentSubmissionsList from "./AssignmentSubmissionsList"

const SUBMISSION_STATUSES = new Set([
  "graded",
  "late",
  "returned",
  "submitted",
])
const ASSIGNMENT_STATUSES = new Set(["closed", "draft", "published"])

const isRecord = (value) => (
  value !== null && typeof value === "object" && !Array.isArray(value)
)

const hasValidId = (value) => (
  ["string", "number"].includes(typeof value)
  && String(value).trim().length > 0
)

const isValidOptionalString = (value) => (
  value === null || value === undefined || typeof value === "string"
)

const isValidSubmissionRecord = (submission) => {
  if (
    !isRecord(submission)
    || !hasValidId(submission.id)
    || typeof submission.status !== "string"
    || !SUBMISSION_STATUSES.has(submission.status.trim().toLowerCase())
  ) {
    return false
  }

  const hasGrade = (
    submission.grade !== null
    && submission.grade !== undefined
    && submission.grade !== ""
  )
  const hasInvalidDate = (
    submission.submittedAt !== null
    && submission.submittedAt !== undefined
    && submission.submittedAt !== ""
    && getValidDateMs(submission.submittedAt) === null
  )
  const hasInvalidFiles = getValidAttachmentList(submission.files) === null

  return (
    (!hasGrade || Number.isFinite(Number(submission.grade)))
    && !hasInvalidDate
    && !hasInvalidFiles
    && isValidOptionalString(submission.contentText)
    && isValidOptionalString(submission.comment)
    && isValidOptionalString(submission.studentName)
    && isValidOptionalString(submission.studentEmail)
    && (
      submission.studentId === null
      || submission.studentId === undefined
      || hasValidId(submission.studentId)
    )
  )
}

const unwrapResponse = (response) => (
  isRecord(response)
    && Object.prototype.hasOwnProperty.call(response, "data")
    ? response.data
    : response
)

const getAssignmentFromResponse = (response) => {
  const payload = unwrapResponse(response)
  return isRecord(payload) ? payload : null
}

const getSubmissionsFromResponse = (response) => {
  const payload = unwrapResponse(response)
  return Array.isArray(payload) ? payload : null
}

const getAssignmentMaxScore = (assignment) => {
  const maxScore = Number(assignment?.maxScore)
  return Number.isFinite(maxScore) && maxScore > 0 ? maxScore : null
}

const getGradingSearchParams = (
  currentParams,
  assignmentId,
  { studentId, submissionId } = {}
) => {
  const nextParams = new URLSearchParams(currentParams)
  nextParams.set("assignmentId", String(assignmentId))
  nextParams.delete("studentId")
  nextParams.delete("submissionId")

  if (submissionId !== undefined && submissionId !== null) {
    nextParams.set("submissionId", String(submissionId))
  } else if (studentId !== undefined && studentId !== null) {
    nextParams.set("studentId", String(studentId))
  }

  return nextParams
}

const sanitizeDownloadName = (value) => {
  const unsafeCharacters = '<>:"/\\|?*'
  const safeName = [...String(value || "")].map((character) => {
    const codePoint = character.codePointAt(0)
    return codePoint <= 31
      || codePoint === 127
      || unsafeCharacters.includes(character)
      ? "_"
      : character
  }).join("").trim()

  return safeName.slice(0, 100) || "grades"
}

const AssignmentSubmissionsContent = ({ assignment, assignmentId: assignmentIdProp, onBack, classId }) => {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [studentSearch, setStudentSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const toggleInFlightRef = useRef(false)
  const gradeInFlightRef = useRef(false)
  const bulkReturnInFlightRef = useRef(false)
  const returnInFlightRef = useRef(false)
  const downloadInFlightRef = useRef(false)
  const deleteInFlightRef = useRef(false)
  const componentActiveRef = useRef(true)
  const gradingTranslations = t.courses?.grading || {}
  const activeSubmissionId = searchParams.get("submissionId")
  const activeStudentId = searchParams.get("studentId")
  const assignmentId = assignmentIdProp ?? assignment?.id

  const {
    currentData: assignmentDetailResponse,
    isSuccess: isAssignmentSuccess,
    isLoading: isAssignmentLoading,
    error: assignmentError,
    refetch: refetchAssignment,
  } = useGetAssignmentByIdQuery({
    classId,
    assignmentId,
  }, { skip: !classId || !assignmentId })
  const {
    currentData: submissionsResponse,
    isSuccess: isSubmissionsSuccess,
    isLoading: isSubmissionsLoading,
    error: submissionsError,
    refetch: refetchSubmissions,
  } = useGetAssignmentSubmissionsQuery({
    classId,
    assignmentId,
  }, { skip: !classId || !assignmentId })
  const [closeAssignment, { isLoading: isClosingAssignment }] = useCloseAssignmentMutation()
  const [openAssignment, { isLoading: isOpeningAssignment }] = useOpenAssignmentMutation()
  const [deleteAssignment, { isLoading: isDeletingAssignment }] = useDeleteAssignmentMutation()
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation()
  const [bulkReturn, { isLoading: isBulkReturning }] = useBulkReturnSubmissionsMutation()
  const [returnSubmission, { isLoading: isReturning }] = useReturnSubmissionMutation()
  const [downloadGradeSheet, { isLoading: isDownloading }] = useDownloadAssignmentGradeSheetMutation()

  const assignmentPayload = getAssignmentFromResponse(assignmentDetailResponse)
  const fallbackAssignment = isRecord(assignment) ? assignment : null
  const currentAssignment = assignmentDetailResponse == null
    ? fallbackAssignment
    : assignmentPayload
  const rawSubmissions = getSubmissionsFromResponse(submissionsResponse)
  const seenSubmissionIds = new Set()
  const hasDuplicateSubmissionIds = Boolean(rawSubmissions?.some((submission) => {
    const submissionId = isRecord(submission) ? String(submission.id).trim() : ""
    if (!submissionId || seenSubmissionIds.has(submissionId)) return Boolean(submissionId)
    seenSubmissionIds.add(submissionId)
    return false
  }))
  const hasMalformedAssignment = (
    (isAssignmentSuccess && !assignmentPayload)
    || (!isAssignmentLoading && !currentAssignment)
  )
  const hasMalformedSubmissions = (
    isSubmissionsSuccess
    && (
      !rawSubmissions
      || hasDuplicateSubmissionIds
      || rawSubmissions.some((submission) => !isValidSubmissionRecord(submission))
    )
  )
  const submissions = useMemo(() => (
    (rawSubmissions || []).filter(isValidSubmissionRecord)
  ), [rawSubmissions])
  const rawAssignmentTitle = currentAssignment
    ? getAssignmentTitle(
      currentAssignment,
      language === "vi" ? "Bài tập chưa đặt tên" : "Untitled assignment"
    )
    : ""
  const assignmentTitle = typeof rawAssignmentTitle === "string"
    ? rawAssignmentTitle
    : (language === "vi" ? "Bài tập chưa đặt tên" : "Untitled assignment")
  const assignmentStatus = getAssignmentStatus(currentAssignment)
  const assignmentClosed = assignmentStatus === "closed"
  const isDraftAssignment = assignmentStatus === "draft"
  const hasInvalidAssignmentStatus = Boolean(
    currentAssignment
    && !ASSIGNMENT_STATUSES.has(assignmentStatus)
  )
  const assignmentMaxScore = getAssignmentMaxScore(currentAssignment)
  const hasInvalidDueDate = Boolean(
    currentAssignment
    && getValidDateMs(currentAssignment.dueDate) === null
  )
  const assignmentExpired = isAssignmentExpired(currentAssignment, nowMs)
  const assignmentDueLabel = formatSubmissionDate(
    currentAssignment?.dueDate,
    language === "vi"
      ? "vi-VN"
      : (language === "zh" ? "zh-CN" : "en-US")
  )
  const assignmentMembers = useMemo(
    () => (
      Array.isArray(currentAssignment?.members)
        ? currentAssignment.members
        : []
    ),
    [currentAssignment?.members]
  )
  const students = useMemo(() => buildSubmissionStudentList({
    members: assignmentMembers,
    submissions,
    language,
  }), [assignmentMembers, submissions, language])
  const activeStudent = useMemo(() => {
    if (activeSubmissionId) {
      const found = students.find((student) => String(student.submissionId) === String(activeSubmissionId))
      if (found) return found
    }
    if (activeStudentId) {
      const found = students.find((student) => String(student.id) === String(activeStudentId))
      if (found) return found
    }
    return null
  }, [students, activeSubmissionId, activeStudentId])

  useEffect(() => {
    componentActiveRef.current = true
    return () => {
      componentActiveRef.current = false
    }
  }, [])

  useEffect(() => {
    const timerId = window.setInterval(() => setNowMs(Date.now()), 30_000)
    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    if (
      !assignmentId
      || isSubmissionsLoading
      || submissionsError
      || hasMalformedSubmissions
    ) {
      return
    }

    const hasRouteSelection = Boolean(activeSubmissionId || activeStudentId)
    if (hasRouteSelection && !activeStudent) {
      setSearchParams(
        (currentParams) => getGradingSearchParams(currentParams, assignmentId),
        { replace: true }
      )
      return
    }

    if (activeStudent && activeSubmissionId && activeStudentId) {
      setSearchParams(
        (currentParams) => getGradingSearchParams(currentParams, assignmentId, {
          submissionId: activeStudent.submissionId,
        }),
        { replace: true }
      )
    }
  }, [
    activeStudent,
    activeStudentId,
    activeSubmissionId,
    assignmentId,
    hasMalformedSubmissions,
    isSubmissionsLoading,
    setSearchParams,
    submissionsError,
  ])

  const handleToggleSubmissionsLock = async () => {
    if (
      !classId
      || !assignmentId
      || isClosingAssignment
      || isOpeningAssignment
      || toggleInFlightRef.current
    ) {
      return
    }

    toggleInFlightRef.current = true
    try {
      if (assignmentClosed) {
        await openAssignment({ classId, assignmentId }).unwrap()
        if (!componentActiveRef.current) return
        toast.success(gradingTranslations.toastOpenSuccess || "Đã mở lại bài nộp thành công!")
      } else {
        await closeAssignment({ classId, assignmentId }).unwrap()
        if (!componentActiveRef.current) return
        toast.success(gradingTranslations.toastLockSuccess || "Đã khóa bài nộp thành công!")
      }
    } catch (error) {
      if (!componentActiveRef.current) return

      toast.error(getSafeSubmissionErrorMessage(
        error,
        language,
        language === "vi"
          ? "Không thể thay đổi trạng thái bài nộp. Vui lòng thử lại."
          : "The submission status could not be changed. Please try again."
      ))
    } finally {
      toggleInFlightRef.current = false
    }
  }

  const handleSaveGrade = async ({ score, feedback }) => {
    if (
      !activeStudent
      || isGrading
      || gradeInFlightRef.current
    ) {
      return
    }

    if (!assignmentClosed) {
      const errorMessage = language === "vi"
        ? "Cần khóa bài nộp trước khi chấm điểm!"
        : language === "zh"
          ? "评分前需要关闭作业！"
          : "Submissions must be closed before grading!"
      toast.error(errorMessage)
      return
    }

    const trimmedScore = (score ?? "").toString().trim()
    const numericScore = Number(trimmedScore)
    const isInvalidNumber = !trimmedScore || Number.isNaN(numericScore) || !/^\d+(\.\d+)?$/.test(trimmedScore)

    if (
      assignmentMaxScore === null
      || isInvalidNumber
      || numericScore < 0
      || numericScore > assignmentMaxScore
    ) {
      const errorMessage = gradingTranslations.scoreRangeError
        ? gradingTranslations.scoreRangeError.replace("{{maxScore}}", assignmentMaxScore)
        : language === "vi"
          ? `Vui lòng nhập điểm từ 0 đến ${assignmentMaxScore}`
          : language === "zh"
            ? `请输入0至${assignmentMaxScore}之间的得分`
            : `Please enter a score between 0 and ${assignmentMaxScore}`
      toast.error(errorMessage)
      return
    }

    if (!activeStudent.submissionId) {
      toast.error(
        language === "vi"
          ? "Không tìm thấy bài nộp của học viên này."
          : "This student's submission could not be found."
      )
      return
    }

    const targetSubmissionId = activeStudent.submissionId
    const targetStudentId = activeStudent.studentId ?? activeStudent.id
    const targetStudentName = typeof activeStudent.name === "string"
      ? activeStudent.name
      : (language === "vi" ? "học viên" : "student")
    const normalizedFeedback = typeof feedback === "string" ? feedback : ""

    gradeInFlightRef.current = true
    try {
      await gradeSubmission({
        classId,
        assignmentId,
        submissionId: targetSubmissionId,
        grade: numericScore,
        comment: normalizedFeedback,
      }).unwrap()

      if (!componentActiveRef.current) return

      const successMessage = gradingTranslations.toastGradeSaved
        ? gradingTranslations.toastGradeSaved
          .replace("{{score}}", numericScore)
          .replace("{{student}}", targetStudentName)
        : `Đã chấm ${numericScore} điểm cho ${targetStudentName}`
      toast.success(successMessage)
      setSearchParams((currentParams) => {
        const routeAssignmentId = currentParams.get("assignmentId")
        const routeSubmissionId = currentParams.get("submissionId")
        const routeStudentId = currentParams.get("studentId")
        const isSameAssignment = (
          !routeAssignmentId
          || routeAssignmentId === String(assignmentId)
        )
        const isSameSelection = (
          routeSubmissionId === String(targetSubmissionId)
          || (
            !routeSubmissionId
            && routeStudentId === String(targetStudentId)
          )
        )

        return isSameAssignment && isSameSelection
          ? getGradingSearchParams(currentParams, assignmentId)
          : currentParams
      })
    } catch (error) {
      if (!componentActiveRef.current) return

      toast.error(getSafeSubmissionErrorMessage(
        error,
        language,
        language === "vi"
          ? "Không thể lưu điểm. Vui lòng tải lại và thử lại."
          : "The grade could not be saved. Refresh and try again."
      ))
    } finally {
      gradeInFlightRef.current = false
    }
  }

  const handleDownloadGradeSheet = async () => {
    if (
      !classId
      || !assignmentId
      || isDownloading
      || downloadInFlightRef.current
    ) {
      return
    }

    downloadInFlightRef.current = true
    let downloadUrl = ""
    let downloadLink = null
    try {
      const response = await downloadGradeSheet({ classId, assignmentId }).unwrap()
      const blob = response instanceof Blob
        ? response
        : (response?.data instanceof Blob ? response.data : null)
      const responseType = blob?.type?.toLowerCase() || ""
      if (
        !blob
        || blob.size <= 0
        || responseType.includes("json")
        || responseType.startsWith("text/")
      ) {
        throw new Error("Invalid grade sheet response")
      }

      if (!componentActiveRef.current) return

      downloadUrl = window.URL.createObjectURL(blob)
      downloadLink = document.createElement("a")
      downloadLink.href = downloadUrl
      downloadLink.download = `${sanitizeDownloadName(assignmentTitle)}_grades.xlsx`
      downloadLink.style.display = "none"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      toast.success(gradingTranslations.toastDownloadSuccess || "Tải xuống bảng điểm thành công!")
    } catch (error) {
      if (!componentActiveRef.current) return

      toast.error(getSafeSubmissionErrorMessage(
        error,
        language,
        gradingTranslations.toastDownloadError || (
          language === "vi"
            ? "Không thể tải bảng điểm. Vui lòng thử lại."
            : "The grade sheet could not be downloaded. Please try again."
        )
      ))
    } finally {
      downloadLink?.remove()
      if (downloadUrl) {
        window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 0)
      }
      downloadInFlightRef.current = false
    }
  }

  const handleBulkReturn = async () => {
    if (
      !classId
      || !assignmentId
      || isBulkReturning
      || bulkReturnInFlightRef.current
    ) {
      return
    }

    bulkReturnInFlightRef.current = true
    try {
      const response = await bulkReturn({ classId, assignmentId }).unwrap()
      if (!componentActiveRef.current) return

      const payload = unwrapResponse(response)
      const returnedCount = Number(payload?.returnedCount)
      const hasReturnedCount = Number.isInteger(returnedCount) && returnedCount >= 0
      const translatedSuccess = gradingTranslations.toastBulkReturnSuccess
      const successMessage = (
        hasReturnedCount
        && typeof translatedSuccess === "string"
      )
        ? translatedSuccess.replace(
          "{{count}}",
          returnedCount
        )
        : (
          typeof translatedSuccess === "string"
          && !translatedSuccess.includes("{{count}}")
        )
          ? translatedSuccess
          : hasReturnedCount
            ? (language === "vi"
              ? `Đã trả bài cho ${returnedCount} học viên`
              : `Returned ${returnedCount} submissions`)
            : (language === "vi"
              ? "Đã hoàn tất trả bài."
              : "Submissions were returned.")
      toast.success(successMessage)
    } catch (error) {
      if (!componentActiveRef.current) return

      toast.error(getSafeSubmissionErrorMessage(
        error,
        language,
        language === "vi"
          ? "Không thể trả bài hàng loạt. Vui lòng thử lại."
          : "The submissions could not be returned. Please try again."
      ))
    } finally {
      bulkReturnInFlightRef.current = false
    }
  }

  const handleReleaseGrade = async () => {
    if (
      !activeStudent?.submissionId
      || isReturning
      || returnInFlightRef.current
    ) {
      return
    }

    const targetSubmissionId = activeStudent.submissionId
    const targetStudentId = activeStudent.studentId ?? activeStudent.id
    const targetStudentName = typeof activeStudent.name === "string"
      ? activeStudent.name
      : (language === "vi" ? "học viên" : "student")

    returnInFlightRef.current = true
    try {
      await returnSubmission({
        classId,
        assignmentId,
        submissionId: targetSubmissionId,
      }).unwrap()

      if (!componentActiveRef.current) return

      const successMessage = gradingTranslations.toastGradeReturned
        ? gradingTranslations.toastGradeReturned.replace("{{student}}", targetStudentName)
        : `Đã trả bài chấm cho học viên ${targetStudentName}`
      toast.success(successMessage)
      setSearchParams((currentParams) => {
        const routeAssignmentId = currentParams.get("assignmentId")
        const routeSubmissionId = currentParams.get("submissionId")
        const routeStudentId = currentParams.get("studentId")
        const isSameAssignment = (
          !routeAssignmentId
          || routeAssignmentId === String(assignmentId)
        )
        const isSameSelection = (
          routeSubmissionId === String(targetSubmissionId)
          || (
            !routeSubmissionId
            && routeStudentId === String(targetStudentId)
          )
        )

        return isSameAssignment && isSameSelection
          ? getGradingSearchParams(currentParams, assignmentId)
          : currentParams
      })
    } catch (error) {
      if (!componentActiveRef.current) return

      toast.error(getSafeSubmissionErrorMessage(
        error,
        language,
        language === "vi"
          ? "Không thể trả kết quả. Vui lòng thử lại."
          : "The result could not be released. Please try again."
      ))
    } finally {
      returnInFlightRef.current = false
    }
  }

  if (isAssignmentLoading || isSubmissionsLoading) {
    return (
      <div
        role="status"
        aria-label={language === "vi" ? "Đang tải bài nộp" : "Loading submissions"}
        className="flex justify-center items-center min-h-[400px]"
      >
        <LoadingSpinner />
      </div>
    )
  }

  if (
    !classId
    || !assignmentId
    || assignmentError
    || submissionsError
    || hasMalformedAssignment
    || hasMalformedSubmissions
    || hasInvalidAssignmentStatus
    || isDraftAssignment
    || assignmentMaxScore === null
    || hasInvalidDueDate
  ) {
    const hasRequestError = Boolean(assignmentError || submissionsError)
    return (
      <div
        role="alert"
        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3"
      >
        <span>
          {hasRequestError
            ? getSafeSubmissionErrorMessage(
              assignmentError || submissionsError,
              language,
              language === "vi"
                ? "Không thể tải danh sách bài nộp."
                : "Failed to load assignment submissions."
            )
            : isDraftAssignment
              ? (language === "vi"
                ? "Bài tập này chưa được xuất bản."
                : "This assignment has not been published.")
              : (language === "vi"
                ? "Dữ liệu bài tập hoặc bài nộp không hợp lệ."
                : "The assignment or submission data is invalid.")}
        </span>
        {classId && assignmentId && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                refetchAssignment()
                refetchSubmissions()
              }}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-extrabold text-red-700 hover:bg-red-50"
            >
              {language === "vi" ? "Thử lại" : "Try again"}
            </button>
            {typeof onBack === "function" && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-extrabold text-red-700 hover:bg-red-50"
              >
                {language === "vi" ? "Quay lại" : "Go back"}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  if (activeStudent) {
    return (
      <AssignmentGradingWorkspace
        key={`${assignmentId}-${activeStudent.submissionId || activeStudent.id}`}
        assignmentTitle={assignmentTitle}
        assignmentMaxScore={assignmentMaxScore}
        student={activeStudent}
        onBack={() => setSearchParams(
          (currentParams) => getGradingSearchParams(currentParams, assignmentId)
        )}
        onSave={handleSaveGrade}
        onRelease={handleReleaseGrade}
        isSaving={isGrading || gradeInFlightRef.current}
        isReleasing={isReturning || returnInFlightRef.current}
      />
    )
  }

  const handleDeleteAssignment = async () => {
    if (
      !classId
      || !assignmentId
      || isDeletingAssignment
      || deleteInFlightRef.current
    ) {
      return
    }

    deleteInFlightRef.current = true
    try {
      await deleteAssignment({ classId, assignmentId }).unwrap()
      if (!componentActiveRef.current) return

      toast.success(gradingTranslations.toastDeleteSuccess || "Đã xóa bài tập thành công!")
      if (onBack) {
        onBack()
      } else {
        navigate(`/workspace/courses/class/${encodeURIComponent(String(classId))}`)
      }
    } catch (error) {
      if (!componentActiveRef.current) return

      toast.error(getSafeSubmissionErrorMessage(
        error,
        language,
        language === "vi"
          ? "Không thể xóa bài tập. Vui lòng thử lại."
          : "The assignment could not be deleted. Please try again."
      ))
    } finally {
      deleteInFlightRef.current = false
    }
  }

  return (
    <AssignmentSubmissionsList
      assignmentId={assignmentId}
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
      onDeleteAssignment={handleDeleteAssignment}
      isDeletingAssignment={isDeletingAssignment}
      isTogglingSubmissionsLock={isClosingAssignment || isOpeningAssignment}
      isDownloadingGradeSheet={isDownloading}
      isBulkReturning={isBulkReturning}
      onSelectStudent={(studentArg) => {
        const student = typeof studentArg === "object" ? studentArg : students.find(s => String(s.id) === String(studentArg))
        if (student?.submissionId) {
          setSearchParams((currentParams) => getGradingSearchParams(
            currentParams,
            assignmentId,
            { submissionId: student.submissionId }
          ))
        } else if (student?.id) {
          setSearchParams((currentParams) => getGradingSearchParams(
            currentParams,
            assignmentId,
            { studentId: student.id }
          ))
        }
      }}
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

const AssignmentSubmissionsView = (props) => {
  const assignmentId = props.assignmentId ?? props.assignment?.id ?? ""
  const viewKey = `${props.classId ?? ""}-${assignmentId}`

  return <AssignmentSubmissionsContent key={viewKey} {...props} />
}

export default AssignmentSubmissionsView
