import { useState } from "react"
import { Eye, FileText, Search, X, ZoomIn, ZoomOut } from "lucide-react"

import { useLanguage } from "@/shared/context/LanguageContext"

import { getFileMeta } from "../../../utils/assignmentUtils"
import { formatFileSize, getFileIconColorClass } from "../../../utils/courseUtils"
import { getStudentInitials } from "../../../utils/submissionUtils"

const AssignmentGradingWorkspace = ({
  assignmentTitle,
  assignmentMaxScore,
  student,
  onBack,
  onSave,
  onRelease,
}) => {
  const { language, t } = useLanguage()
  const cg = t.courses?.grading || {}
  const [score, setScore] = useState(() => (
    student.score !== null && student.score !== undefined ? student.score.toString() : ""
  ))
  const [feedback, setFeedback] = useState(student.feedback || "")
  const [zoomLevel, setZoomLevel] = useState(100)

  const isSubmitted = student.status !== "not_submitted"
  const studentInitials = getStudentInitials(student.name)
  const firstFile = student.files?.[0] ? getFileMeta(student.files[0]) : null
  const cleanFileName = firstFile?.name
    || `Bai_tap_tieng_anh_HK1_${student.name.replace(/\s+/g, "")}.pdf`
  const scoreInputLabel = assignmentMaxScore === 10
    ? (cg.scoreTenSystem || "Điểm (Hệ số 10)")
    : language === "zh"
      ? `分数 (满分 ${assignmentMaxScore})`
      : language === "vi"
        ? `Điểm (Tối đa ${assignmentMaxScore})`
        : `Score (max ${assignmentMaxScore})`
  const scoreInputId = `assignment-score-${student.submissionId || student.id}`
  const feedbackInputId = `assignment-feedback-${student.submissionId || student.id}`

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-105px)] bg-gray-150 border border-gray-200 rounded-3xl overflow-hidden shadow-sm text-gray-800 animate-fade-in">
      <div className="flex-1 flex flex-col bg-gray-100/50 min-h-[450px] md:min-h-0">
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
                onClick={() => setZoomLevel((value) => Math.max(50, value - 10))}
                className="hover:text-gray-700 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-gray-800 font-extrabold text-[10px] w-8 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((value) => Math.min(200, value + 10))}
                className="hover:text-gray-700 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>
            {firstFile && (
              <a
                href={firstFile.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-gray-700 transition-colors flex items-center justify-center text-gray-400"
                title="View"
              >
                <Eye size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 md:p-8 flex justify-center items-start overflow-y-visible md:overflow-y-auto bg-gray-200/40">
          {!isSubmitted ? (
            <div className="w-full max-w-[620px] bg-white rounded-2xl shadow-sm border border-gray-150 p-12 text-center flex flex-col items-center justify-center gap-3">
              <X size={44} className="text-red-500 bg-red-50 p-2 rounded-full" />
              <h4 className="text-base font-extrabold text-gray-900">
                {cg.modalNotSubmittedMsg || "Học viên chưa nộp bài tập này."}
              </h4>
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
                  <span>Student: <strong className="text-gray-700 font-extrabold">{student.name}</strong></span>
                  <span>•</span>
                  <span>Class: <strong className="text-gray-700 font-extrabold">ENG-301</strong></span>
                </div>
              </div>

              <div className="text-xs font-semibold text-gray-750 flex flex-col gap-4">
                <span className="text-sm font-black text-gray-900">Part 1: Essay</span>

                {student.submissionText ? (
                  <p className="whitespace-pre-line leading-relaxed font-sans font-medium text-gray-700">
                    {student.submissionText}
                  </p>
                ) : (
                  <p className="italic text-gray-400">No submission content provided.</p>
                )}

                {student.files?.length > 0 && (
                  <div className="mt-4 border-t border-gray-150 pt-4 flex flex-col gap-3">
                    <span className="text-sm font-black text-gray-900">Part 2: Submitted Files</span>
                    <div className="grid grid-cols-1 gap-3">
                      {student.files.map((file, index) => {
                        const { name, url, size } = getFileMeta(file)
                        return (
                          <div
                            key={url || `${name}-${index}`}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-150 rounded-xl hover:bg-gray-100/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText size={18} className={getFileIconColorClass(name)} />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-gray-800 truncate max-w-[200px] md:max-w-xs">{name}</span>
                                <span className="text-[10px] text-gray-400 font-semibold">{formatFileSize(size)}</span>
                              </div>
                            </div>
                            {url && (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-gray-400 hover:text-[#990011] hover:bg-[#990011]/5 rounded-lg transition-colors"
                                title={language === "vi" ? "Xem trực tiếp" : "View file"}
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

      <div className="w-full md:w-[350px] lg:w-[380px] bg-white flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 min-h-0 md:h-full">
        <div className="p-6 flex flex-col gap-6 overflow-y-visible md:overflow-y-auto">
          <h2 className="text-lg font-black text-gray-950 tracking-tight">
            {cg.gradingAndComment || "Chấm điểm & Nhận xét"}
          </h2>

          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex items-center gap-3">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-2xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 text-sm font-extrabold uppercase shadow-2xs font-sans">
                {studentInitials}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-900 text-sm leading-snug">{student.name}</span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                {isSubmitted ? `Đã nộp: ${student.time}` : (cg.filterNotSubmitted || "Chưa nộp")}
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
              <div className="text-xs font-bold text-gray-400 italic bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
                {cg.modalNotSubmittedMsg || "Học viên chưa nộp bài tập này."}
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-2xs focus-within:ring-2 focus-within:ring-red-100 focus-within:border-[#990011] transition-all">
                <input
                  id={scoreInputId}
                  type="text"
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  placeholder="0.0"
                  className="w-20 text-center font-black text-2xl text-[#990011] focus:outline-none placeholder-gray-300 select-all"
                />
                <span className="text-lg font-extrabold text-gray-400">/ {assignmentMaxScore}</span>
              </div>
            )}
          </div>

          {isSubmitted && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor={feedbackInputId}
                className="text-xs font-black text-gray-400 tracking-wider uppercase"
              >
                {cg.generalFeedback || "Nhận xét chung"}
              </label>
              <textarea
                id={feedbackInputId}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder={cg.modalFeedbackPlaceholder || "Ghi nhận xét cho học viên..."}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-750 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] shadow-2xs resize-none leading-relaxed"
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex flex-col gap-3 bg-gray-50/50">
          {student.status === "graded" && (
            <button
              type="button"
              onClick={onRelease}
              className="w-full py-3 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-sm uppercase tracking-wider"
            >
              {cg.btnRelease || "Trả về kết quả"}
            </button>
          )}
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-xl text-center transition-colors shadow-2xs uppercase tracking-wider"
            >
              {cg.btnBack || "Quay về"}
            </button>
            {isSubmitted && (
              <button
                type="button"
                onClick={() => onSave({ score, feedback })}
                className="flex-1 py-3 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-sm uppercase tracking-wider"
              >
                {student.status === "graded" || student.status === "returned"
                  ? (cg.btnRegrade || "Chấm lại bài")
                  : (cg.modalBtnSave || "Lưu điểm")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentGradingWorkspace
