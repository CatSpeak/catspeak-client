import React, { useState } from "react"
import {
  FileText,
  ZoomIn,
  ZoomOut,
  MoreVertical,
  Minus,
  Plus,
  ArrowLeft,
  Download,
  ExternalLink,
  Save,
  Send,
  X,
  Lock,
  AlertCircle,
} from "lucide-react"

import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGetPublicProfileQuery } from "@/store/api/userApi"
import { useGetClassDetailQuery } from "@/store/api/coursesApi"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { PillButton } from "@/shared/components/ui/buttons"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import { getFileMeta, getSafeFileUrl } from "../../../utils/assignmentUtils"
import { formatFileSize } from "../../../utils/courseUtils"
import { getStudentInitials } from "../../../utils/submissionUtils"
import { DocumentTypeBadge, getFileExtension } from "../../../utils/documentBadgeUtils"

const formatWorkspaceFileSize = (value) => {
  if (value === null || value === undefined || value === "") return "—"
  const size = Number(value)
  return Number.isFinite(size) && size > 0 && size < 1024 ** 4
    ? formatFileSize(size)
    : "—"
}

const getDisplayFileName = (value, fallback) =>
  typeof value === "string" && value.trim() ? value : fallback

const interpolate = (template, values) =>
  Object.entries(values).reduce(
    (message, [key, value]) => message.replace(`{{${key}}}`, String(value)),
    template || ""
  )

const AssignmentGradingWorkspace = ({
  assignmentTitle,
  assignmentMaxScore = 10,
  assignmentClosed = false,
  classId,
  className: classNameProp,
  student = {},
  onBack,
  onSave,
  onRelease,
  isSaving = false,
  isReleasing = false,
}) => {
  const { t } = useLanguage()
  const { formatDate, formatTime, formatDateTime } = useTimezone()
  const cg = t.courses?.grading || {}

  const { data: classDetailResponse } = useGetClassDetailQuery(classId, { skip: !classId })
  const classData = classDetailResponse?.data || classDetailResponse
  const className = classNameProp || classData?.name || classData?.className || classData?.title || classData?.code || "—"

  const [score, setScore] = useState(() => {
    if (
      student.score !== null &&
      student.score !== undefined &&
      student.score !== "" &&
      Number.isFinite(Number(student.score))
    ) {
      return String(student.score)
    }
    return ""
  })

  const [feedback, setFeedback] = useState(
    typeof student.feedback === "string" ? student.feedback : ""
  )
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isTouched, setIsTouched] = useState(false)
  const [hasAvatarError, setHasAvatarError] = useState(false)
  const [showMoreDocMenu, setShowMoreDocMenu] = useState(false)

  // Query student public profile by studentId/accountId to get real avatar if missing from submission
  const targetStudentId = student.studentId || (typeof student.id === "number" || (typeof student.id === "string" && !student.id.startsWith("submission-")) ? student.id : null)
  const { data: publicProfileResponse } = useGetPublicProfileQuery(targetStudentId, {
    skip: !targetStudentId,
  })
  const userProfile = publicProfileResponse?.data || publicProfileResponse
  const profileAvatar = userProfile?.avatarUrl || userProfile?.avatar || userProfile?.meetingAvatarUrl || userProfile?.profileAvatar

  const studentStatus = typeof student.status === "string"
    ? student.status.trim().toLowerCase()
    : ""
  const isSubmitted = ["graded", "late", "returned", "submitted"].includes(studentStatus)

  const getScoreError = (val, maxScore) => {
    const trimmed = (val ?? "").toString().trim()
    if (!trimmed) {
      return cg.scoreRequired || "Vui lòng nhập điểm số"
    }
    const num = Number(trimmed)
    if (Number.isNaN(num) || !/^\d+(\.\d+)?$/.test(trimmed)) {
      return cg.scoreInvalidNumber || "Điểm số phải là một số hợp lệ"
    }
    if (num < 0) {
      return cg.scoreMinError || "Điểm số không được nhỏ hơn 0"
    }
    if (num > maxScore) {
      return interpolate(cg.scoreMaxError || "Điểm số không được vượt quá {{maxScore}}", { maxScore })
    }
    return null
  }

  const scoreError = getScoreError(score, assignmentMaxScore)
  const isScoreInvalid = isSubmitted && assignmentClosed && !!scoreError && (isTouched || score.trim() !== "")

  const handleSave = () => {
    if (!assignmentClosed) return
    setIsTouched(true)
    if (scoreError || isSaving || isReleasing) return
    onSave?.({ score, feedback })
  }

  const handleStepScore = (delta) => {
    if (!assignmentClosed) return
    setIsTouched(true)
    const currentNum = Number(score) || 0
    let nextNum = Math.round((currentNum + delta) * 10) / 10
    if (nextNum < 0) nextNum = 0
    if (nextNum > assignmentMaxScore) nextNum = assignmentMaxScore
    setScore(String(nextNum))
  }

  const studentName = typeof student.name === "string" && student.name.trim()
    ? student.name.trim()
    : (userProfile?.fullName || userProfile?.name || cg.studentLabel || "Học viên")
  const studentInitials = getStudentInitials(studentName, cg.studentInitials || "HV")
  const submissionFiles = Array.isArray(student.files) ? student.files : []
  const firstFile = submissionFiles[0]
    ? getFileMeta(submissionFiles[0], cg.unnamedFile || "Tệp đính kèm")
    : null
  const firstFileUrl = getSafeFileUrl(firstFile?.url)

  function safeTitleToFileName(title) {
    if (!title || typeof title !== "string") return "Bai_tap"
    return title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30)
  }

  const firstFileName = firstFile?.name || (submissionText ? `${safeTitleToFileName(assignmentTitle)}.pdf` : "Tệp bài làm")
  const fileExtension = getFileExtension(firstFileName)

  const safeAssignmentTitle = typeof assignmentTitle === "string" && assignmentTitle.trim()
    ? assignmentTitle.trim()
    : (cg.untitledAssignment || "Bài tập chưa có tiêu đề")

  const submissionText = typeof student.submissionText === "string"
    ? student.submissionText
    : ""

  const rawAvatar =
    student.avatar ||
    student.avatarUrl ||
    student.studentAvatarUrl ||
    profileAvatar ||
    student.userAvatar ||
    student.user?.avatarUrl ||
    student.user?.avatar ||
    student.member?.avatarUrl ||
    student.member?.avatar
  const safeAvatarUrl = getSafeFileUrl(rawAvatar) || (typeof rawAvatar === "string" && rawAvatar.trim() ? rawAvatar.trim() : "")

  const scoreInputLabel = assignmentMaxScore === 10
    ? (cg.scoreTenSystem || "Điểm (Hệ số 10)")
    : interpolate(cg.scoreMaxLabel || "Điểm (Hệ số {{maxScore}})", { maxScore: assignmentMaxScore })

  const inputIdSuffix = String(student.submissionId || student.id || "student").replace(/[^a-zA-Z0-9_-]/g, "-")
  const scoreInputId = `assignment-score-${inputIdSuffix}`
  const feedbackInputId = `assignment-feedback-${inputIdSuffix}`
  const isMutating = Boolean(isSaving || isReleasing)

  // Format submission timestamp for student profile box using useTimezone
  const formatStudentSubmittedTime = () => {
    if (!isSubmitted) return cg.filterNotSubmitted || "Chưa nộp bài"
    const targetDate = student.submittedAt || (student.time !== "—" ? student.time : null)
    if (targetDate) {
      const d = new Date(targetDate)
      if (!Number.isNaN(d.getTime())) {
        const datePart = formatDate(targetDate)
        const timePart = formatTime(targetDate)
        if (datePart && timePart) {
          return `${datePart}, ${timePart}`
        }
        return formatDateTime(targetDate)
      }
      return String(targetDate)
    }
    return cg.submissionSubmitted || "Đã nộp bài"
  }

  return (
    <div aria-busy={isMutating} className="flex flex-col gap-5 text-[#2e2e2e]">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb
          items={[
            { label: t.courses?.home || "Trang chủ", onClick: onBack },
            { label: t.courses?.title || "Khóa học", onClick: onBack },
            { label: safeAssignmentTitle, onClick: onBack },
            { label: `${cg.gradingTitle || "Chấm bài"}: ${studentName}` },
          ]}
        />
        <PillButton
          variant="outline"
          className="!h-9 shrink-0"
          startIcon={<ArrowLeft className="w-4 h-4 text-[#990011]" />}
          onClick={onBack}
        >
          <span className="text-xs font-semibold text-[#990011]">{cg.btnBack || "Quay lại"}</span>
        </PillButton>
      </div>

      {/* Main 2-Column Grading Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ─── LEFT COLUMN: Document & Submission Preview (8 cols) ─── */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Document Header Bar */}
          <div className="bg-white rounded-2xl border border-border px-4 py-3 flex items-center justify-between shadow-2xs">
            {/* Left: Document Type Badge + File Name */}
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
              <DocumentTypeBadge extension={fileExtension} className="w-8 h-10" />
              <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                {firstFileName}
              </span>
            </div>

            {/* Right: Connected Pill Zoom Controls & More */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Single Connected Pill Zoom Control */}
              <div className="flex items-center rounded-full overflow-hidden border border-border bg-gray-100/90 h-9 shadow-2xs">
                {/* Zoom Out: Red Rounded-L Button */}
                <button
                  type="button"
                  onClick={() => setZoomLevel((val) => Math.max(50, val - 10))}
                  className="w-9 sm:w-10 h-full bg-[#80000e] hover:bg-[#990011] active:bg-[#66000b] text-white flex items-center justify-center transition-colors cursor-pointer"
                  title={cg.zoomOutSubmission || "Thu nhỏ"}
                  aria-label={cg.zoomOutSubmission || "Thu nhỏ"}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                {/* 100% Center Display */}
                <div className="px-3 sm:px-4 text-xs font-semibold text-gray-800 select-none min-w-[52px] sm:min-w-[58px] text-center bg-gray-50/60 h-full flex items-center justify-center">
                  {zoomLevel}%
                </div>

                {/* Zoom In: Red Rounded-R Button */}
                <button
                  type="button"
                  onClick={() => setZoomLevel((val) => Math.min(200, val + 10))}
                  className="w-9 sm:w-10 h-full bg-[#80000e] hover:bg-[#990011] active:bg-[#66000b] text-white flex items-center justify-center transition-colors cursor-pointer"
                  title={cg.zoomInSubmission || "Phóng to"}
                  aria-label={cg.zoomInSubmission || "Phóng to"}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Three dots menu */}
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setShowMoreDocMenu((prev) => !prev)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                  title="Thao tác"
                  aria-label="Thao tác tài liệu"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMoreDocMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowMoreDocMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-xl py-2 z-40 text-xs font-semibold text-gray-700 animate-in fade-in slide-in-from-top-2 duration-150">
                      {firstFileUrl && (
                        <a
                          href={firstFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={firstFileName}
                          onClick={() => setShowMoreDocMenu(false)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-800"
                        >
                          <Download className="w-4 h-4 text-[#990011]" />
                          <span>Tải xuống tệp</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setZoomLevel(100)
                          setShowMoreDocMenu(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-800 ${
                          firstFileUrl ? "border-t border-gray-100" : ""
                        }`}
                      >
                        <ZoomIn className="w-4 h-4 text-gray-400" />
                        <span>Đặt lại thu phóng (100%)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Document Content Canvas */}
          <div className="bg-white rounded-2xl border border-border p-6 sm:p-10 shadow-xs min-h-[550px] overflow-hidden flex flex-col">
            {!isSubmitted ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 gap-3">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <X className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-gray-800">
                  {cg.modalNotSubmittedMsg || "Học viên chưa nộp bài làm"}
                </h4>
                <p className="text-xs text-gray-400 max-w-sm">
                  Bài làm của học viên sẽ được hiển thị tại đây sau khi học viên hoàn thành và nộp bài.
                </p>
              </div>
            ) : (
              <div
                className="flex-1 flex flex-col gap-6 text-[#2e2e2e] transition-transform duration-150"
                style={{
                  transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                  transformOrigin: "top left",
                  width: zoomLevel !== 100 ? `${(100 / zoomLevel) * 100}%` : "100%",
                }}
              >
                {/* Canvas Header */}
                <div className="border-b border-gray-200 pb-4 space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
                    {safeAssignmentTitle}
                  </h2>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-gray-500 font-medium">
                    <div>
                      <span className="text-gray-400">{cg.studentNameLabel || "Tên học viên:"} </span>
                      <strong className="text-gray-900 font-bold">{studentName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">{cg.classLabel || "Lớp:"} </span>
                      <strong className="text-gray-900 font-bold">{className}</strong>
                    </div>
                  </div>
                </div>

                {/* Direct Text Response (if any) */}
                {submissionText ? (
                  <div className="space-y-4 text-xs sm:text-sm font-normal text-gray-800 leading-relaxed font-sans">
                    <RenderHTML
                      html={submissionText}
                      className="prose max-w-none text-gray-800 leading-relaxed font-sans"
                      fallback={<p className="italic text-gray-400">{cg.noContentProvided || "Không có nội dung văn bản."}</p>}
                    />
                  </div>
                ) : null}

                {/* Submitted Files List & Preview */}
                {submissionFiles.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {submissionText && (
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        {cg.submittedFilesHeader || "Tệp tin đính kèm"}
                      </span>
                    )}
                    <div className="grid grid-cols-1 gap-2.5">
                      {submissionFiles.map((file, index) => {
                        const { name, url, size } = getFileMeta(file, cg.unnamedFile || "Tệp đính kèm")
                        const safeUrl = getSafeFileUrl(url)
                        const displayName = getDisplayFileName(name, cg.unnamedFile || "Tệp đính kèm")
                        const ext = getFileExtension(displayName)

                        return (
                          <div
                            key={`${safeUrl || displayName}-${index}`}
                            className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-border rounded-2xl hover:bg-gray-100/60 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <DocumentTypeBadge extension={ext} className="w-7 h-9" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-gray-800 truncate max-w-[200px] sm:max-w-md">
                                  {displayName}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {formatWorkspaceFileSize(size)}
                                </span>
                              </div>
                            </div>
                            {safeUrl && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                  href={safeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={displayName}
                                  className="p-1.5 text-gray-400 hover:text-[#990011] hover:bg-red-50 rounded-lg transition-colors"
                                  title="Tải về"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State if neither text nor files */}
                {!submissionText && submissionFiles.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-xs italic">
                    {cg.noContentProvided || "Học viên không gửi kèm nội dung hoặc tệp tin nào."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Grading & Feedback Card (4 cols) ─── */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-border shadow-xs flex flex-col gap-5 sticky top-6">
          {/* Card Title */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {cg.gradingAndComment || "Chấm điểm & nhận xét"}
            </h3>
            <div className="h-px bg-gray-200 w-full mt-4" />
          </div>

          {/* Student Profile Box */}
          <div className="border border-border rounded-2xl p-3.5 flex items-center gap-3.5 bg-white shadow-2xs">
            {safeAvatarUrl && !hasAvatarError ? (
              <img
                src={safeAvatarUrl}
                alt={studentName}
                onError={() => setHasAvatarError(true)}
                className="w-11 h-11 rounded-full object-cover shrink-0 border border-border"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#990011] text-white font-bold text-sm font-sans flex items-center justify-center shrink-0 shadow-2xs">
                {studentInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-gray-900 text-sm truncate">
                {studentName}
              </h4>
              <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                {formatStudentSubmittedTime()}
              </p>
            </div>
          </div>

          {/* Score Input Section */}
          <div className="space-y-2">
            <label
              htmlFor={scoreInputId}
              className="text-xs sm:text-sm font-bold text-gray-800 block"
            >
              {scoreInputLabel}
            </label>

            {!isSubmitted ? (
              <div className="text-xs font-semibold text-gray-400 italic bg-gray-50 border border-dashed border-border rounded-xl p-3.5 text-center">
                {cg.modalNotSubmittedMsg || "Học viên chưa nộp bài"}
              </div>
            ) : !assignmentClosed ? (
              /* State 1: Assignment is OPEN -> Disabled Gray Stepper (Cannot grade yet) */
              <div
                className="flex items-center rounded-full overflow-hidden border border-gray-200 bg-gray-100/90 h-11 select-none"
                title="Bài tập đang mở, bạn cần khóa bài nộp để chấm điểm"
              >
                {/* Left Disabled Minus Button */}
                <div className="w-12 h-full bg-[#9CA3AF] text-white flex items-center justify-center font-bold text-xl rounded-l-full shrink-0 cursor-not-allowed">
                  <Minus className="w-4 h-4 stroke-[3]" />
                </div>

                {/* Centered Gray Score Display */}
                <div className="flex-1 flex items-center justify-center gap-1.5 text-base font-bold">
                  <span className="text-gray-900 font-bold">{score || "0"}</span>
                  <span className="text-gray-400 font-medium">/ {assignmentMaxScore}</span>
                </div>

                {/* Right Disabled Plus Button */}
                <div className="w-12 h-full bg-[#4B5563] text-white flex items-center justify-center font-bold text-xl rounded-r-full shrink-0 cursor-not-allowed">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            ) : (
              /* State 2: Assignment is CLOSED -> Active Red Stepper (Grading Enabled) */
              <div className="space-y-1">
                <div
                  className={`flex items-center rounded-full overflow-hidden border bg-gray-50 h-11 transition-all ${
                    isScoreInvalid
                      ? "border-red-500 ring-1 ring-red-200"
                      : "border-gray-200 focus-within:border-[#990011] focus-within:ring-1 focus-within:ring-[#990011]"
                  }`}
                >
                  {/* Active Minus Button (Gray) */}
                  <button
                    type="button"
                    onClick={() => handleStepScore(-0.5)}
                    disabled={isMutating || (Number(score) || 0) <= 0}
                    className="w-12 h-full bg-[#6B7280] hover:bg-[#4B5563] active:bg-[#374151] text-white flex items-center justify-center font-bold text-xl transition-colors cursor-pointer shrink-0 rounded-l-full disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Giảm điểm"
                    aria-label="Giảm điểm"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>

                  {/* Centered Score Input with Red Score Text */}
                  <div className="flex-1 flex items-center justify-center gap-1 text-base font-bold">
                    <input
                      id={scoreInputId}
                      type="text"
                      value={score}
                      disabled={isMutating}
                      onChange={(e) => {
                        setScore(e.target.value)
                        setIsTouched(true)
                      }}
                      onBlur={() => setIsTouched(true)}
                      placeholder="0"
                      inputMode="decimal"
                      className={`w-14 text-center bg-transparent font-bold text-base select-all focus:outline-none ${
                        isScoreInvalid ? "text-red-600" : "text-[#80000e]"
                      }`}
                    />
                    <span className="font-bold text-gray-900 text-base select-none">
                      / {assignmentMaxScore}
                    </span>
                  </div>

                  {/* Active Plus Button (Dark Red) */}
                  <button
                    type="button"
                    onClick={() => handleStepScore(0.5)}
                    disabled={isMutating || (Number(score) || 0) >= assignmentMaxScore}
                    className="w-12 h-full bg-[#80000e] hover:bg-[#990011] active:bg-[#66000b] text-white flex items-center justify-center font-bold text-xl transition-colors cursor-pointer shrink-0 rounded-r-full disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Tăng điểm"
                    aria-label="Tăng điểm"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                {isScoreInvalid && (
                  <span
                    id={`${scoreInputId}-error`}
                    role="alert"
                    className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {scoreError}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Feedback Section */}
          <div className="space-y-2">
            <label
              htmlFor={feedbackInputId}
              className="text-xs sm:text-sm font-bold text-gray-800 block"
            >
              {cg.generalFeedback || "Nhận xét chung"}
            </label>
            <textarea
              id={feedbackInputId}
              value={feedback}
              disabled={isMutating || !isSubmitted}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={cg.modalFeedbackPlaceholder || "Nhập nhận xét tại đây"}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50/90 border border-border text-xs sm:text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] transition-colors resize-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
            {studentStatus === "graded" && (
              <PillButton
                variant="primary"
                bgColor="#059669"
                className="!h-11 w-full shrink-0"
                loading={isReleasing}
                endIcon={<Send className="w-4 h-4 text-white" />}
                onClick={() => {
                  if (!isSaving && !isReleasing) onRelease?.()
                }}
                disabled={isSaving || isReleasing}
              >
                <span className="font-bold text-xs uppercase tracking-wider">
                  {cg.btnRelease || "Trả kết quả"}
                </span>
              </PillButton>
            )}

            <div className="flex items-center gap-2.5 w-full">
              <PillButton
                variant="outline"
                className="!h-11 flex-1 shrink-0"
                onClick={onBack}
                disabled={isMutating}
              >
                <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
                  {cg.btnBack || "Quay về"}
                </span>
              </PillButton>

              {isSubmitted && (
                <PillButton
                  variant="primary"
                  bgColor={assignmentClosed ? "#80000e" : "#9CA3AF"}
                  className="!h-11 flex-1 shrink-0"
                  loading={isSaving}
                  endIcon={<Save className="w-4 h-4 text-white" />}
                  onClick={handleSave}
                  disabled={!assignmentClosed || isSaving || isReleasing || !!scoreError}
                  title={!assignmentClosed ? "Cần khóa bài nộp để lưu điểm" : undefined}
                >
                  <span className="font-bold text-xs uppercase tracking-wider text-white">
                    {studentStatus === "graded" || studentStatus === "returned"
                      ? (cg.btnRegrade || "Chấm lại")
                      : (cg.modalBtnSave || "Lưu điểm")}
                  </span>
                </PillButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentGradingWorkspace
