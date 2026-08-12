import { useState } from "react"
import { Eye, FileText, X, ZoomIn, ZoomOut } from "lucide-react"

import { useLanguage } from "@/shared/context/LanguageContext"
import RenderHTML from "@/shared/components/ui/RenderHTML"

import { getFileMeta, getSafeFileUrl } from "../../../utils/assignmentUtils"
import { formatFileSize, getFileIconColorClass } from "../../../utils/courseUtils"
import { getStudentInitials } from "../../../utils/submissionUtils"

const formatWorkspaceFileSize = (value) => {
  if (value === null || value === undefined || value === "") return "—"

  const size = Number(value)
  return Number.isFinite(size) && size > 0 && size < (1024 ** 4)
    ? formatFileSize(size)
    : "—"
}

const getDisplayFileName = (value, fallback) => (
  typeof value === "string" && value.trim() ? value : fallback
)

const interpolate = (template, values) => Object.entries(values).reduce(
  (message, [key, value]) => message.replace(`{{${key}}}`, String(value)),
  template || "",
)

const AssignmentGradingWorkspace = ({
  assignmentTitle,
  assignmentMaxScore,
  student,
  onBack,
  onSave,
  onRelease,
  isSaving,
  isReleasing,
}) => {
  const { t } = useLanguage()
  const cg = t.courses?.grading || {}
  const [score, setScore] = useState(() => (
    student.score !== null
      && student.score !== undefined
      && student.score !== ""
      && Number.isFinite(Number(student.score))
      ? String(student.score)
      : ""
  ))
  const [feedback, setFeedback] = useState(
    typeof student.feedback === "string" ? student.feedback : ""
  )
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isTouched, setIsTouched] = useState(false)
  const [hasAvatarError, setHasAvatarError] = useState(false)

  const getScoreError = (val, maxScore) => {
    const trimmed = (val ?? "").toString().trim()
    if (!trimmed) {
      return cg.scoreRequired
    }
    const num = Number(trimmed)
    if (Number.isNaN(num) || !/^\d+(\.\d+)?$/.test(trimmed)) {
      return cg.scoreInvalidNumber
    }
    if (num < 0) {
      return cg.scoreMinError
    }
    if (num > maxScore) {
      return cg.scoreMaxError
        .replace("{{maxScore}}", maxScore)
    }
    return null
  }

  const studentStatus = typeof student.status === "string"
    ? student.status.trim().toLowerCase()
    : ""
  const isSubmitted = ["graded", "late", "returned", "submitted"]
    .includes(studentStatus)
  const scoreError = getScoreError(score, assignmentMaxScore)
  const isScoreInvalid = isSubmitted && !!scoreError && (isTouched || score.trim() !== "")

  const handleSave = () => {
    setIsTouched(true)
    if (scoreError || isSaving || isReleasing) return
    onSave({ score, feedback })
  }
  const studentName = typeof student.name === "string" && student.name.trim()
    ? student.name.trim()
    : cg.studentLabel
  const studentInitials = getStudentInitials(studentName, cg.studentInitials)
  const submissionFiles = Array.isArray(student.files) ? student.files : []
  const firstFile = submissionFiles[0]
    ? getFileMeta(submissionFiles[0], cg.unnamedFile)
    : null
  const firstFileUrl = getSafeFileUrl(firstFile?.url)
  const firstFileName = getDisplayFileName(
    firstFile?.name,
    cg.unnamedFile
  )
  const submissionHeader = cg.submissionHeader
  const safeAssignmentTitle = typeof assignmentTitle === "string"
    && assignmentTitle.trim()
    ? assignmentTitle.trim()
    : cg.untitledAssignment
  const submissionText = typeof student.submissionText === "string"
    ? student.submissionText
    : ""
  const safeAvatarUrl = getSafeFileUrl(student.avatar)
  const scoreInputLabel = assignmentMaxScore === 10
    ? cg.scoreTenSystem
    : interpolate(cg.scoreMaxLabel, { maxScore: assignmentMaxScore })
  const inputIdSuffix = String(student.submissionId || student.id || "student")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
  const scoreInputId = `assignment-score-${inputIdSuffix}`
  const feedbackInputId = `assignment-feedback-${inputIdSuffix}`
  const isMutating = Boolean(isSaving || isReleasing)

  return (
    <div
      aria-busy={isMutating}
      className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-115px)] bg-gray-150 border border-border rounded-3xl overflow-hidden shadow-sm text-gray-800 animate-fade-in"
    >
      <div className="flex-1 flex flex-col bg-gray-100/50 min-h-[450px] md:min-h-0">
        <div className="h-14 bg-white border-b border-border px-6 flex items-center justify-between text-xs font-bold text-gray-500 shadow-2xs select-none">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#990011]" />
            <span className="font-extrabold text-gray-800 tracking-tight">{submissionHeader}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((value) => Math.max(50, value - 10))}
                aria-label={cg.zoomOutSubmission}
                className="hover:text-gray-700 transition-colors"
                title={cg.zoomOutSubmission}
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-gray-800 font-extrabold text-[10px] w-8 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((value) => Math.min(200, value + 10))}
                aria-label={cg.zoomInSubmission}
                className="hover:text-gray-700 transition-colors"
                title={cg.zoomInSubmission}
              >
                <ZoomIn size={14} />
              </button>
            </div>
            {firstFileUrl && (
              <a
                href={firstFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                aria-label={interpolate(cg.viewFileNamed, { fileName: firstFileName })}
                className="hover:text-gray-700 transition-colors flex items-center justify-center text-gray-400"
                title={cg.viewFile}
              >
                <Eye size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 md:p-8 flex justify-center items-start overflow-y-visible md:overflow-y-auto bg-gray-200/40">
          {!isSubmitted ? (
            <div className="w-full max-w-[620px] bg-white rounded-2xl shadow-sm border border-border p-12 text-center flex flex-col items-center justify-center gap-3">
              <X size={44} className="text-red-500 bg-red-50 p-2 rounded-full" />
              <h4 className="text-base font-extrabold text-gray-900">
                {cg.modalNotSubmittedMsg}
              </h4>
            </div>
          ) : (
            <div
              className="w-full max-w-[620px] bg-white rounded-lg shadow-md border border-border p-8 md:p-10 flex flex-col gap-6 text-[#2e2e2e] leading-relaxed transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            >
              <div className="border-b border-border pb-5">
                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                  {safeAssignmentTitle}
                </h3>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-2">
                  <span>{cg.studentLabel}: <strong className="text-gray-700 font-extrabold">{studentName}</strong></span>
                </div>
              </div>

              <div className="text-xs font-semibold text-gray-750 flex flex-col gap-4">
                <span className="text-sm font-black text-gray-900">
                  {cg.textResponseHeader}
                </span>

                <RenderHTML
                  html={submissionText}
                  className="font-sans font-medium text-gray-700 text-xs"
                  fallback={<p className="italic text-gray-400">{cg.noContentProvided}</p>}
                />

                {submissionFiles.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4 flex flex-col gap-3">
                    <span className="text-sm font-black text-gray-900">
                      {cg.submittedFilesHeader}
                    </span>
                    <div className="grid grid-cols-1 gap-3">
                      {submissionFiles.map((file, index) => {
                        const { name, url, size } = getFileMeta(file, cg.unnamedFile)
                        const safeUrl = getSafeFileUrl(url)
                        const displayName = getDisplayFileName(
                          name,
                          cg.unnamedFile
                        )
                        return (
                          <div
                            key={`${safeUrl || displayName}-${index}`}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-border rounded-xl hover:bg-gray-100/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText size={18} className={getFileIconColorClass(displayName)} />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-gray-800 truncate max-w-[200px] md:max-w-xs">{displayName}</span>
                                <span className="text-[10px] text-gray-400 font-semibold">{formatWorkspaceFileSize(size)}</span>
                              </div>
                            </div>
                            {safeUrl && (
                              <a
                                href={safeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer"
                                aria-label={interpolate(cg.viewFileNamed, { fileName: displayName })}
                                className="p-1.5 text-gray-400 hover:text-[#990011] hover:bg-[#990011]/5 rounded-lg transition-colors"
                                title={cg.viewFile}
                              >
                                <Eye size={14} />
                              </a>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-[350px] lg:w-[380px] bg-white flex flex-col justify-between border-t md:border-t-0 md:border-l border-border min-h-0 md:h-full">
        <div className="p-6 flex flex-col gap-6 overflow-y-visible md:overflow-y-auto">
          <h2 className="text-lg font-black text-gray-950 tracking-tight">
            {cg.gradingAndComment}
          </h2>

          <div className="bg-gray-50 border border-border rounded-2xl p-4 flex items-center gap-3">
            {safeAvatarUrl && !hasAvatarError ? (
              <img
                src={safeAvatarUrl}
                alt={studentName}
                referrerPolicy="no-referrer"
                onError={() => setHasAvatarError(true)}
                className="w-12 h-12 rounded-full object-cover border border-border shadow-2xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 border border-border flex items-center justify-center text-gray-500 text-sm font-extrabold uppercase shadow-2xs font-sans">
                {studentInitials}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-900 text-sm leading-snug">{studentName}</span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                {isSubmitted
                  ? `${cg.submittedAtLabel}${typeof student.time === "string" ? student.time : "—"}`
                  : cg.filterNotSubmitted}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={scoreInputId}
              className="text-xs font-black text-gray-400 tracking-wider uppercase"
            >
              {scoreInputLabel}
            </label>
            {!isSubmitted ? (
              <div className="text-xs font-bold text-gray-400 italic bg-gray-50 border border-dashed border-border rounded-xl p-4">
                {cg.modalNotSubmittedMsg}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div
                  className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-2.5 shadow-2xs transition-all ${isScoreInvalid
                    ? "border-red-500 text-red-600 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-500"
                    : "border-border focus-within:ring-2 focus-within:ring-red-100 focus-within:border-[#990011]"
                    }`}
                >
                  <input
                    id={scoreInputId}
                    type="text"
                    value={score}
                    disabled={isMutating}
                    onChange={(event) => {
                      setScore(event.target.value)
                      if (!isTouched) setIsTouched(true)
                    }}
                    onBlur={() => setIsTouched(true)}
                    inputMode="decimal"
                    aria-invalid={isScoreInvalid}
                    aria-describedby={isScoreInvalid ? `${scoreInputId}-error` : undefined}
                    placeholder="0.0"
                    className={`w-20 text-center font-black text-2xl focus:outline-none placeholder-gray-300 select-all disabled:cursor-not-allowed disabled:opacity-60 ${isScoreInvalid ? "text-red-600" : "text-[#990011]"
                      }`}
                  />
                  <span className="text-lg font-extrabold text-gray-400">/ {assignmentMaxScore}</span>
                </div>
                {isScoreInvalid && (
                  <span
                    id={`${scoreInputId}-error`}
                    role="alert"
                    className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1"
                  >
                    <span className="font-bold">•</span> {scoreError}
                  </span>
                )}
              </div>
            )}
          </div>

          {isSubmitted && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor={feedbackInputId}
                className="text-xs font-black text-gray-400 tracking-wider uppercase"
              >
                {cg.generalFeedback}
              </label>
              <textarea
                id={feedbackInputId}
                value={feedback}
                disabled={isMutating}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder={cg.modalFeedbackPlaceholder}
                rows={6}
                className="w-full px-4 py-3 border border-border rounded-2xl text-xs font-semibold text-gray-750 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] shadow-2xs resize-none leading-relaxed disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex flex-col gap-3 bg-gray-50/50">
          {studentStatus === "graded" && (
            <button
              type="button"
              onClick={() => {
                if (!isSaving && !isReleasing) onRelease()
              }}
              disabled={isSaving || isReleasing}
              className="w-full py-3 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cg.btnRelease}
            </button>
          )}
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                if (!isMutating) onBack()
              }}
              disabled={isMutating}
              className="flex-1 py-3 border border-border bg-white hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-xl text-center transition-colors shadow-2xs uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cg.btnBack}
            </button>
            {isSubmitted && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isReleasing || !!scoreError}
                className="flex-1 py-3 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {studentStatus === "graded" || studentStatus === "returned"
                  ? cg.btnRegrade
                  : cg.modalBtnSave}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentGradingWorkspace
