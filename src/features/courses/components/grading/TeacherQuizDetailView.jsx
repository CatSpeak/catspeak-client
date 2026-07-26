import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  useGetTeacherQuizDetailQuery,
  useGetTeacherQuizStudentsQuery,
  useGetTeacherQuizStatsQuery,
  usePublishTeacherQuizMutation,
  useCloseTeacherQuizMutation,
  useDeleteTeacherQuizMutation,
  useExportTeacherQuizReportMutation,
  useGradeTeacherEssayMutation,
} from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { getQuizObjectFromResponse } from "@/features/courses/utils/quizUtils"
import {
  Pencil,
  MoreVertical,
  HelpCircle,
  Clock,
  Calendar,
  CheckSquare,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flag,
  Play,
  Pause,
  ArrowLeft,
  Users,
  BarChart2,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  X,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts"

// Custom Recharts Tooltip
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2.5 rounded-xl shadow-lg border border-gray-100 text-xs">
        <p className="font-bold text-gray-900">Khoảng điểm: {label}</p>
        <p className="text-[#990011] font-semibold mt-0.5">
          Số học sinh: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

// Status Badge Component
const StatusBadge = ({ status }) => {
  const lower = String(status || "").toLowerCase()
  if (lower === "published" || lower === "open" || lower === "đang mở") {
    return (
      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Đang mở
      </span>
    )
  }
  if (lower === "draft" || lower === "bản nháp") {
    return (
      <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Bản nháp
      </span>
    )
  }
  return (
    <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Đã đóng
    </span>
  )
}

// Date Range Formatter
const formatDateRange = (openTime, closeTime) => {
  if (!openTime && !closeTime) return "Không giới hạn"
  const format = (dStr) => {
    if (!dStr) return ""
    const d = new Date(dStr)
    if (Number.isNaN(d.getTime())) return ""
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    return `${day}/${month}`
  }
  const start = format(openTime)
  const end = format(closeTime)
  if (start && end) return `${start} - ${end}`
  if (start) return `Từ ${start}`
  if (end) return `Hạn ${end}`
  return "N/A"
}

// Relative Time Helper ("Last update: 3 min ago")
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "3 min ago"
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return "3 min ago"
  const diffMs = Date.now() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}

// Student Initials Helper
const getStudentInitials = (name) => {
  if (!name || typeof name !== "string") return "HS"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Submission Status Helper
const getSubmissionStatus = (student) => {
  const statusRaw = String(student.submissionStatus || student.status || "").toLowerCase()
  if (statusRaw.includes("muộn") || statusRaw.includes("late")) {
    return { label: "Nộp muộn", style: "bg-[#FDF2F2] text-[#E02424] border border-pink-100" }
  }
  if (
    statusRaw.includes("chưa") ||
    statusRaw.includes("not") ||
    statusRaw.includes("unsubmitted") ||
    (student.score == null && !statusRaw.includes("nộp") && !statusRaw.includes("submitted"))
  ) {
    return { label: "Chưa nộp", style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" }
  }
  return { label: "Đã nộp", style: "bg-[#ECFDF5] text-[#059669] border border-emerald-100" }
}

// Grading Status Helper
const getGradingStatus = (student) => {
  const gradingRaw = String(student.gradingStatus || student.essayStatus || "").toLowerCase()
  if (
    gradingRaw.includes("chưa") ||
    gradingRaw.includes("ungraded") ||
    gradingRaw.includes("draft") ||
    gradingRaw.includes("chờ")
  ) {
    return { label: "Chưa chấm", style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" }
  }
  if (
    gradingRaw.includes("đã") ||
    gradingRaw.includes("graded") ||
    gradingRaw.includes("finalized") ||
    (student.score !== null && student.score !== undefined && student.score !== "–")
  ) {
    return { label: "Đã chấm", style: "bg-[#ECFDF5] text-[#059669] border border-emerald-100" }
  }
  return { label: "Chưa chấm", style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" }
}

// Custom Audio Player Bar
const AudioPlayerBar = ({ src }) => {
  const audioRef = React.useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => { })
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (secs) => {
    if (!secs || Number.isNaN(secs)) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div className="mt-3 mb-3 w-full bg-gray-50 border border-gray-150 p-3.5 rounded-2xl flex items-center gap-3">
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
      {/* Play / Pause Button placed to the left side of progress bar */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
        aria-label={isPlaying ? "Tạm dừng" : "Phát âm thanh"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current text-white" />
        ) : (
          <Play className="w-4 h-4 fill-current text-white ml-0.5" />
        )}
      </button>

      {/* Progress Track & Time Labels (Full width) */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div
          className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            if (audioRef.current && duration) {
              const newTime = pct * duration
              audioRef.current.currentTime = newTime
              setCurrentTime(newTime)
            }
          }}
        >
          <div
            className="bg-[#990011] h-full transition-all duration-150 rounded-full"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        {/* Time Labels */}
        <div className="flex justify-between text-[11px] text-gray-500 font-bold px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

// Student Attempt Review Modal for Teacher
const StudentAttemptReviewModal = ({ submission, quizQuestions, onClose, classId, quizId }) => {
  const [gradeEssay] = useGradeTeacherEssayMutation()
  const [essayScores, setEssayScores] = useState({})
  const [essayComments, setEssayComments] = useState({})
  const [savingQuestionId, setSavingQuestionId] = useState(null)

  const studentName = submission.studentName || submission.name || "Học viên"
  const studentCode = submission.studentCode || submission.studentId || "N/A"
  const scoreDisplay = submission.score !== null && submission.score !== undefined ? submission.score : "—"

  // Merge questions from submission or quizDetail
  const displayQuestions = (submission.questions && submission.questions.length > 0)
    ? submission.questions
    : (quizQuestions || [])

  const handleGrade = async (questionId, isDraft) => {
    const scoreVal = parseFloat(essayScores[questionId])
    const commentVal = essayComments[questionId] || ""
    if (Number.isNaN(scoreVal)) {
      toast.error("Vui lòng nhập điểm số hợp lệ")
      return
    }

    setSavingQuestionId(questionId)
    try {
      await gradeEssay({
        classId,
        quizId,
        questionId,
        studentId: submission.studentId || submission.id,
        attemptNumber: submission.attemptNumber || 1,
        score: scoreVal,
        comment: commentVal,
        isDraft,
      }).unwrap()
      toast.success(isDraft ? "Đã lưu nháp điểm" : "Đã hoàn tất chấm điểm")
    } catch (err) {
      toast.error("Không thể lưu điểm chấm")
    } finally {
      setSavingQuestionId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-6 border border-gray-100">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              Xem chi tiết bài làm: <span className="text-[#990011]">{studentName}</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium">Mã học viên: {studentCode}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs">
          <div>
            <span className="text-gray-400 font-medium block">Điểm số</span>
            <span className="text-base font-bold text-[#990011]">{scoreDisplay}</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium block">Trạng thái nộp</span>
            <span className="font-bold text-gray-800">{getSubmissionStatus(submission).label}</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium block">Trạng thái chấm</span>
            <span className="font-bold text-gray-800">{getGradingStatus(submission).label}</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium block">Thời gian làm bài</span>
            <span className="font-bold text-gray-800">
              {submission.timeSpentSeconds ? `${Math.floor(submission.timeSpentSeconds / 60)} phút` : "N/A"}
            </span>
          </div>
        </div>

        {/* Questions Review List */}
        <div className="flex flex-col gap-5">
          <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Danh sách câu hỏi & câu trả lời ({displayQuestions.length})
          </h4>

          {displayQuestions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Không có dữ liệu chi tiết câu hỏi.</p>
          ) : (
            displayQuestions.map((q, idx) => {
              const points = q.points ?? 5
              const imageUrl = q.mediaUrl || q.imageUrl
              const audioUrl = q.audioUrl
              const type = q.type || "MultipleChoiceSingle"
              const options = Array.isArray(q.options) ? q.options : []
              const studentOpts = Array.isArray(q.studentOptions) ? q.studentOptions.map(String) : []
              const correctAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers.map(String) : []
              const isCorrect = q.isCorrect === true
              const isWrong = q.isCorrect === false
              const isEssay = type === "Essay"

              return (
                <div key={q.questionId || q.id || idx} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-2xs">
                  {/* Question Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#990011]">Câu {idx + 1} ({points} điểm)</span>
                    {isCorrect && <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-0.5 rounded-full">Đúng (+{q.pointsEarned ?? points})</span>}
                    {isWrong && <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">Sai (0 điểm)</span>}
                    {isEssay && <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{q.status || "Tự luận"}</span>}
                  </div>

                  {/* Image on top (Small scale, un-cropped) */}
                  {imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-gray-150 bg-gray-50/50 p-2 flex justify-center">
                      <img
                        src={imageUrl}
                        alt={`Minh họa câu hỏi ${idx + 1}`}
                        className="max-h-48 max-w-xs sm:max-w-sm w-auto h-auto object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {/* Audio Player below image (Play button on left, full width progress bar) */}
                  {audioUrl && (
                    <AudioPlayerBar src={audioUrl} />
                  )}

                  {/* Question Content */}
                  {q.content && (
                    <div className="text-xs font-bold text-gray-800 leading-relaxed">
                      <RenderHTML html={q.content} />
                    </div>
                  )}

                  {/* MCQ Options */}
                  {options.length > 0 && (
                    <div className="space-y-2 text-xs">
                      {options.map((opt, optIdx) => {
                        const strIdx = String(optIdx)
                        const isStudentPick = studentOpts.includes(strIdx) || studentOpts.includes(opt)
                        const isRightOpt = correctAnswers.includes(strIdx) || correctAnswers.includes(opt)

                        let style = "bg-gray-50 border-gray-150 text-gray-700"
                        if (isStudentPick && isRightOpt) style = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                        else if (isStudentPick && !isRightOpt) style = "bg-red-50 border-red-300 text-red-900 font-bold"
                        else if (!isStudentPick && isRightOpt) style = "bg-blue-50 border-blue-200 text-blue-900 font-bold"

                        return (
                          <div key={optIdx} className={`p-3 border rounded-xl flex items-center justify-between ${style}`}>
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {isStudentPick && <span className="text-[10px] font-black uppercase tracking-wider">(Đã chọn)</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Essay Answer & Grading */}
                  {isEssay && (
                    <div className="flex flex-col gap-3 pt-2 border-t border-gray-100 text-xs">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <span className="font-bold text-gray-500 block mb-1">Bài làm của học sinh:</span>
                        <p className="text-gray-800 font-medium whitespace-pre-wrap">{q.studentFillText || q.answerText || "(Chưa có bài làm)"}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-700">Điểm chấm:</span>
                          <input
                            type="number"
                            step="0.5"
                            max={points}
                            value={essayScores[q.questionId || q.id] ?? q.essayScore ?? ""}
                            onChange={(e) => setEssayScores((prev) => ({ ...prev, [q.questionId || q.id]: e.target.value }))}
                            placeholder="0"
                            className="w-20 px-3 py-1.5 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-[#990011]"
                          />
                          <span className="text-gray-400 font-semibold">/ {points}</span>
                        </div>

                        <input
                          type="text"
                          value={essayComments[q.questionId || q.id] ?? q.essayComment ?? ""}
                          onChange={(e) => setEssayComments((prev) => ({ ...prev, [q.questionId || q.id]: e.target.value }))}
                          placeholder="Nhận xét cho học sinh..."
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-[#990011]"
                        />

                        <button
                          type="button"
                          disabled={savingQuestionId === (q.questionId || q.id)}
                          onClick={() => handleGrade(q.questionId || q.id, false)}
                          className="px-4 py-1.5 bg-[#990011] hover:bg-[#80000e] text-white font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {savingQuestionId === (q.questionId || q.id) ? "Đang lưu..." : "Lưu điểm"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#990011] hover:bg-[#80000e] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  )
}

// Single Question Display Card
const QuestionDetailCard = ({ question, index }) => {
  const [isFlagged, setIsFlagged] = useState(false)

  const points = question.points ?? question.score ?? 5
  const content = question.content || question.title || question.questionText || ""
  const options = Array.isArray(question.options) ? question.options : []
  const correctAnswers = Array.isArray(question.correctAnswers)
    ? question.correctAnswers.map((a) => String(a).trim())
    : []

  const type = question.type || "MultipleChoiceSingle"
  const imageUrl = question.imageUrl || question.mediaUrl
  const audioUrl = question.audioUrl

  // Check if option is marked as correct
  const isOptionCorrect = (opt, optIdx) => {
    if (correctAnswers.length === 0) return false
    const letter = String.fromCharCode(65 + optIdx)
    const strOpt = String(opt).trim()
    return (
      correctAnswers.includes(strOpt) ||
      correctAnswers.includes(letter) ||
      correctAnswers.includes(String(optIdx))
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative mb-4">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold text-[#990011]">
          Câu hỏi {index + 1}
        </h4>
        <div className="flex items-center gap-3">
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-lg">
            {points} điểm
          </span>
          <button
            type="button"
            onClick={() => setIsFlagged(!isFlagged)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${isFlagged
              ? "border-red-500 bg-red-50 text-red-500"
              : "border-red-200 text-red-500 hover:bg-red-50"
              }`}
            title="Đánh dấu"
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Image Media Preview (Full size ratio, Image on top) */}
      {imageUrl && (
        <div className="mb-3 rounded-2xl overflow-hidden border border-gray-100 flex justify-center bg-gray-50 p-2">
          <img
            src={imageUrl}
            alt={`Minh họa câu hỏi ${index + 1}`}
            className="max-h-48 max-w-xs sm:max-w-sm w-auto h-auto object-contain rounded-xl"
          />
        </div>
      )}

      {/* Audio Media Player Bar (Audio play button on left, full width progress bar) */}
      {audioUrl && (
        <div className="mb-3">
          <AudioPlayerBar src={audioUrl} />
        </div>
      )}

      {/* Content / Prompt */}
      {content && (
        <div className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
          <RenderHTML html={content} />
        </div>
      )}

      {/* Choice Options List */}
      {options.length > 0 && (
        <div className="space-y-3 mt-4">
          {options.map((opt, optIdx) => {
            const isCorrect = isOptionCorrect(opt, optIdx)
            const prefixLetter = String.fromCharCode(65 + optIdx)
            const hasPrefix = typeof opt === "string" && /^[A-Z]\.\s/.test(opt.trim())
            const displayText = hasPrefix ? opt : `${prefixLetter}. ${opt}`

            return (
              <div
                key={optIdx}
                className={`w-full p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium transition-all ${isCorrect
                  ? "bg-red-50/50 border-red-300 text-red-900"
                  : "bg-gray-50/70 border-gray-100 text-gray-700"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isCorrect ? "border-[#990011]" : "border-gray-300"
                    }`}
                >
                  {isCorrect && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#990011]" />
                  )}
                </div>
                <span>{displayText}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Essay / Text Question info */}
      {type === "Essay" && (
        <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 font-medium">
          Câu hỏi tự luận (Chấm thủ công) • Giới hạn từ: {question.maxWordCount || 500} từ
        </div>
      )}
    </div>
  )
}

// Main Teacher Quiz Detail View Component
const TeacherQuizDetailView = ({ classId, quizId, onEdit, onBack }) => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [activeTab, setActiveTab] = useState("overview")
  const [isQuestionsCollapsed, setIsQuestionsCollapsed] = useState(false)
  const [visibleQuestionsCount, setVisibleQuestionsCount] = useState(1)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Submissions search & modal state
  const [submissionSearch, setSubmissionSearch] = useState("")
  const [selectedStudentSubmission, setSelectedStudentSubmission] = useState(null)

  // Fetch Quiz Detail
  const {
    data: detailResponse,
    isLoading: isQuizLoading,
    isError: isQuizError,
    refetch: refetchQuiz,
  } = useGetTeacherQuizDetailQuery(
    { classId, quizId },
    { skip: !classId || !quizId }
  )
  const quizDetail = getQuizObjectFromResponse(detailResponse)

  // Fetch Students / Submissions from API
  const {
    data: studentsResponse,
    isLoading: isStudentsLoading,
  } = useGetTeacherQuizStudentsQuery(
    { classId, quizId, search: submissionSearch },
    { skip: !classId || !quizId || activeTab !== "submissions" }
  )

  // Fetch Stats from API
  const {
    data: statsResponse,
    isLoading: isStatsLoading,
  } = useGetTeacherQuizStatsQuery(
    { classId, quizId },
    { skip: !classId || !quizId || activeTab !== "stats" }
  )

  // Export Report Mutation
  const [exportQuizReport, { isLoading: isExporting }] = useExportTeacherQuizReportMutation()

  // Mutations
  const [publishQuiz, { isLoading: isPublishing }] = usePublishTeacherQuizMutation()
  const [closeQuiz, { isLoading: isClosing }] = useCloseTeacherQuizMutation()
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteTeacherQuizMutation()

  if (isQuizLoading) {
    return (
      <div className="flex justify-center items-center min-h-[450px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (isQuizError || !quizDetail) {
    return (
      <div className="mx-auto flex min-h-[400px] max-w-md flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-sm font-semibold text-gray-700">
          Không thể tải thông tin bài kiểm tra.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={refetchQuiz}
            className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const questions = Array.isArray(quizDetail.questions) ? quizDetail.questions : []
  const totalQuestions = questions.length
  const timeLimit = quizDetail.timeLimitMinutes
  const maxAttempts = quizDetail.maxAttempts

  // Extract student submission list from API
  const rawStudentsData = (
    studentsResponse && typeof studentsResponse === "object" && "data" in studentsResponse
  ) ? studentsResponse.data : studentsResponse
  const studentsList = Array.isArray(rawStudentsData)
    ? rawStudentsData
    : (Array.isArray(studentsResponse) ? studentsResponse : [])

  // Extract stats data from API or fallback
  const rawStatsData = (
    statsResponse && typeof statsResponse === "object" && "data" in statsResponse
  ) ? statsResponse.data : statsResponse
  const statsData = (
    rawStatsData && typeof rawStatsData === "object" && !Array.isArray(rawStatsData)
  ) ? rawStatsData : (
    statsResponse && typeof statsResponse === "object" && !Array.isArray(statsResponse)
      ? statsResponse
      : null
  )

  const distributionList = Array.isArray(statsData?.distribution)
    ? statsData.distribution
    : [
      { range: "0-2", count: 0 },
      { range: "2-4", count: 1 },
      { range: "4-6", count: 0 },
      { range: "6-8", count: 0 },
      { range: "8-10", count: 0 },
    ]

  const topMissedList = Array.isArray(statsData?.topMissedQuestions)
    ? statsData.topMissedQuestions
    : [
      { questionNumber: 1, questionSnippet: "yes", correctPercent: 0 },
      { questionNumber: 2, questionSnippet: "Multiple?", correctPercent: 0 },
      { questionNumber: 3, questionSnippet: "Truth or Dare?", correctPercent: 0 },
      { questionNumber: 5, questionSnippet: "Write 500 words about your hometown", correctPercent: 0 },
      { questionNumber: 4, questionSnippet: "Are you ___?", correctPercent: 100 },
    ]

  const handlePublish = async () => {
    try {
      await publishQuiz({ classId, quizId }).unwrap()
      toast.success("Đã đăng bài kiểm tra thành công")
      refetchQuiz()
    } catch (err) {
      toast.error("Không thể đăng bài kiểm tra")
    }
  }

  const handleClose = async () => {
    try {
      await closeQuiz({ classId, quizId }).unwrap()
      toast.success("Đã đóng bài kiểm tra")
      refetchQuiz()
    } catch (err) {
      toast.error("Không thể đóng bài kiểm tra")
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) {
      try {
        await deleteQuiz({ classId, quizId }).unwrap()
        toast.success("Đã xóa bài kiểm tra")
        if (onBack) onBack()
        else navigate(`/workspace/courses/class/${classId}`)
      } catch (err) {
        toast.error("Không thể xóa bài kiểm tra")
      }
    }
  }

  const handleExportReport = async () => {
    try {
      const blob = await exportQuizReport({ classId, quizId }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Thong_ke_quiz_${quizId}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Đã xuất báo cáo thành công")
    } catch (err) {
      toast.error("Không thể xuất báo cáo")
    }
  }

  return (
    <div className="w-full mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <button type="button" className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>
            Trang chủ
          </button>
          <span>/</span>
          <button type="button" className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>
            Khóa học của tôi
          </button>
          <span>/</span>
          <button type="button" className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses/all")}>
            Toàn bộ khóa học
          </button>
          <span>/</span>
          <button
            type="button"
            className="cursor-pointer hover:underline"
            onClick={() => {
              if (quizDetail?.courseId) {
                navigate(`/workspace/courses/details/${encodeURIComponent(String(quizDetail.courseId))}`)
              } else {
                navigate("/workspace/courses")
              }
            }}
          >
            Chi tiết khóa học
          </button>
          <span>/</span>
          <button
            type="button"
            className="cursor-pointer hover:underline"
            onClick={onBack || (() => navigate(`/workspace/courses/class/${classId}`))}
          >
            Chi tiết lớp học
          </button>
          <span>/</span>
          <span className="text-[#990011] font-semibold truncate max-w-xs sm:max-w-md">
            {quizDetail.name || quizDetail.title || "Chi tiết bài kiểm tra"}
          </span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {quizDetail.name || quizDetail.title || "Kiểm tra từ vựng Unit 5"}
            </h1>
            <StatusBadge status={quizDetail.status} />
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Edit Button */}
            <button
              type="button"
              onClick={onEdit}
              className="border border-[#990011]/30 hover:border-[#990011] text-[#990011] bg-white hover:bg-red-50/50 px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all active:scale-98"
            >
              <Pencil className="w-3.5 h-3.5 text-[#990011]" />
              <span>Chỉnh sửa</span>
            </button>

            {/* Ellipsis Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                aria-label="Tùy chọn khác"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 text-xs font-medium">
                  {quizDetail.status === "Draft" && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        handlePublish()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-emerald-600 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đăng bài kiểm tra</span>
                    </button>
                  )}
                  {quizDetail.status !== "Closed" && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleClose()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-amber-600 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Đóng bài kiểm tra</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleDelete()
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa bài kiểm tra</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Số câu hỏi */}
          <div className="bg-gray-50/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Số câu hỏi</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {totalQuestions} câu
              </p>
            </div>
          </div>

          {/* Card 2: Thời gian */}
          <div className="bg-gray-50/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Thời gian</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {timeLimit} phút
              </p>
            </div>
          </div>

          {/* Card 3: Thời hạn */}
          <div className="bg-gray-50/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Thời hạn</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {formatDateRange(quizDetail.openTime, quizDetail.closeTime)}
              </p>
            </div>
          </div>

          {/* Card 4: Số lần nộp */}
          <div className="bg-gray-50/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Số lần nộp</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {maxAttempts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6 flex gap-8">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-1 text-sm transition-colors cursor-pointer font-bold ${activeTab === "overview"
            ? "border-b-2 border-[#990011] text-[#990011]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Tổng quan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("submissions")}
          className={`pb-3 px-1 text-sm transition-colors cursor-pointer font-bold ${activeTab === "submissions"
            ? "border-b-2 border-[#990011] text-[#990011]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Danh sách nộp bài
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`pb-3 px-1 text-sm transition-colors cursor-pointer font-bold ${activeTab === "stats"
            ? "border-b-2 border-[#990011] text-[#990011]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Thống kê
        </button>
        <button
          type="button"
          onClick={onEdit}
          className={`pb-3 px-1 text-sm transition-colors cursor-pointer font-bold ${activeTab === "edit"
            ? "border-b-2 border-[#990011] text-[#990011]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Chỉnh sửa
        </button>
      </div>

      {/* TAB CONTENT: Overview (Tổng quan) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Mô tả Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">Mô tả</h3>
              <div className="text-sm text-gray-600 leading-relaxed">
                {quizDetail.description ? (
                  <RenderHTML html={quizDetail.description} />
                ) : (
                  "Bài kiểm tra đánh giá từ vựng thuộc Unit 5: Môi trường và Cuộc sống. Học sinh cần hoàn thành bài kiểm tra trong thời gian quy định. Không sử dụng tài liệu bên ngoài hoặc ChatGPT."
                )}
              </div>
            </div>

            {/* Danh sách câu hỏi Section */}
            <div>
              {/* Header line */}
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-base font-bold text-gray-900">
                  Danh sách câu hỏi ({totalQuestions})
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQuestionsCollapsed(!isQuestionsCollapsed)}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>{isQuestionsCollapsed ? "Mở rộng" : "Thu gọn"}</span>
                  {isQuestionsCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Questions Container */}
              {!isQuestionsCollapsed && (
                <div>
                  {questions.length > 0 ? (
                    questions.slice(0, visibleQuestionsCount).map((q, idx) => (
                      <QuestionDetailCard key={q.id || idx} question={q} index={idx} />
                    ))
                  ) : (
                    // Fallback question representation if array is empty
                    [
                      {
                        id: "sample-1",
                        points: 5,
                        type: "MultipleChoiceSingle",
                        content:
                          "Dựa vào đoạn âm thanh và hình ảnh minh họa dưới đây, hãy chọn đáp án mô tả chính xác nhất hành động đang diễn ra.",
                        imageUrl:
                          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
                        audioUrl: "",
                        options: [
                          "The students are packing up their bags to leave the library.",
                          "They are collaborating on a project and reviewing notes.",
                          "The students are packing up their bags to leave the library.",
                          "The students are packing up their bags to leave the library.",
                        ],
                        correctAnswers: ["They are collaborating on a project and reviewing notes."],
                      },
                    ]
                      .slice(0, visibleQuestionsCount)
                      .map((q, idx) => (
                        <QuestionDetailCard key={q.id || idx} question={q} index={idx} />
                      ))
                  )}

                  {/* Expand / View More questions button */}
                  {totalQuestions > visibleQuestionsCount ? (
                    <div className="text-center pt-2 pb-4">
                      <button
                        type="button"
                        onClick={() => setVisibleQuestionsCount(totalQuestions)}
                        className="text-xs font-bold text-[#990011] inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>
                          Xem thêm {totalQuestions - visibleQuestionsCount} câu hỏi...
                        </span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : totalQuestions > 1 ? (
                    <div className="text-center pt-2 pb-4">
                      <button
                        type="button"
                        onClick={() => setVisibleQuestionsCount(1)}
                        className="text-xs font-bold text-gray-500 inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Thu gọn danh sách câu hỏi</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Cấu hình bài kiểm tra
              </h3>

              <div className="divide-y divide-gray-100 text-xs">
                {/* Xáo trộn câu hỏi */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">Xáo trộn câu hỏi</span>
                  <span
                    className={
                      quizDetail.shuffleQuestions
                        ? "text-[#990011] font-bold"
                        : "text-gray-900 font-bold"
                    }
                  >
                    {quizDetail.shuffleQuestions ? "Có" : "Không"}
                  </span>
                </div>

                {/* Xáo trộn đáp án */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">Xáo trộn đáp án</span>
                  <span
                    className={
                      quizDetail.shuffleOptions
                        ? "text-[#990011] font-bold"
                        : "text-gray-900 font-bold"
                    }
                  >
                    {quizDetail.shuffleOptions ? "Có" : "Không"}
                  </span>
                </div>

                {/* Hiển thị đáp án sau khi nộp */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">
                    Hiển thị đáp án sau khi nộp
                  </span>
                  <span
                    className={
                      quizDetail.showAnswersAfterSubmission
                        ? "text-[#990011] font-bold"
                        : "text-gray-900 font-bold"
                    }
                  >
                    {quizDetail.showAnswersAfterSubmission ? "Có" : "Không"}
                  </span>
                </div>

                {/* Cho phép nộp muộn */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">Cho phép nộp muộn</span>
                  <span
                    className={
                      quizDetail.allowLateSubmission
                        ? "text-[#990011] font-bold"
                        : "text-gray-900 font-bold"
                    }
                  >
                    {quizDetail.allowLateSubmission ? "Có" : "Không"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Submissions (Danh sách nộp bài) */}
      {activeTab === "submissions" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          {/* Header & Search */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-gray-900">
              Danh sách nộp bài
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
                placeholder="Tìm kiếm học sinh..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#990011]"
              />
            </div>
          </div>

          {isStudentsLoading ? (
            <div className="py-12 text-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] text-gray-700 font-semibold border-b border-gray-200">
                    <th className="py-4 px-5 border-r border-gray-200">
                      <div className="flex items-center justify-between gap-2">
                        <span>Thông tin học viên</span>
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#990011] stroke-[2.5]" />
                      </div>
                    </th>
                    <th className="py-4 px-5 border-r border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <span>Trạng thái nộp</span>
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#990011] stroke-[2.5]" />
                      </div>
                    </th>
                    <th className="py-4 px-5 border-r border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <span>Thời gian chấm</span>
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#990011] stroke-[2.5]" />
                      </div>
                    </th>
                    <th className="py-4 px-5 border-r border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <span>Điểm số</span>
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#990011] stroke-[2.5]" />
                      </div>
                    </th>
                    <th className="py-4 px-5 text-center">
                      <span>Hành động</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {studentsList.length > 0 ? (
                    studentsList.map((st, idx) => {
                      const subStatus = getSubmissionStatus(st)
                      const gradStatus = getGradingStatus(st)
                      const studentName = st.studentName || st.name || `Học viên ${idx + 1}`
                      const initials = getStudentInitials(studentName)
                      const timeAgo = formatTimeAgo(st.updatedAt || st.submittedAt)
                      const displayScore =
                        st.score !== null && st.score !== undefined && st.score !== ""
                          ? st.score
                          : "–"

                      return (
                        <tr
                          key={st.studentId || st.id || idx}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          {/* Col 1: Student info */}
                          <td className="py-4 px-5 border-r border-gray-200">
                            <div className="flex items-center gap-3">
                              {st.avatar ? (
                                <img
                                  src={st.avatar}
                                  alt={studentName}
                                  className="w-12 h-12 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-sm flex items-center justify-center shrink-0">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <h5 className="font-bold text-gray-900 text-sm">
                                  {studentName}
                                </h5>
                                <div className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span>Last update: {timeAgo}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Submission status */}
                          <td className="py-4 px-5 border-r border-gray-200 text-center">
                            <span
                              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full inline-block ${subStatus.style}`}
                            >
                              {subStatus.label}
                            </span>
                          </td>

                          {/* Col 3: Grading status */}
                          <td className="py-4 px-5 border-r border-gray-200 text-center">
                            <span
                              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full inline-block ${gradStatus.style}`}
                            >
                              {gradStatus.label}
                            </span>
                          </td>

                          {/* Col 4: Score */}
                          <td className="py-4 px-5 border-r border-gray-200 text-center text-sm font-semibold text-gray-800">
                            {displayScore}
                          </td>

                          {/* Col 5: Action */}
                          <td className="py-4 px-5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentSubmission(st)}
                              className="w-8 h-8 rounded-full text-[#990011] hover:bg-red-50 inline-flex items-center justify-center transition-colors cursor-pointer"
                              title="Xem bài làm"
                            >
                              <Eye className="w-4.5 h-4.5 text-[#990011]" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-gray-400 text-xs font-medium"
                      >
                        Chưa có học sinh nào nộp bài
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Student Submission Attempt Review Modal */}
      {selectedStudentSubmission && (
        <StudentAttemptReviewModal
          submission={selectedStudentSubmission}
          quizQuestions={quizDetail?.questions}
          classId={classId}
          quizId={quizId}
          onClose={() => setSelectedStudentSubmission(null)}
        />
      )}

      {/* TAB CONTENT: Stats (Thống kê) */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* Title & Export Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Thống kê: {quizDetail.name || quizDetail.title || "Kiểm tra từ vựng Unit 5"}
              </h2>
              <button
                type="button"
                onClick={handleExportReport}
                disabled={isExporting}
                className="bg-[#990011] hover:bg-[#80000e] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{isExporting ? "Đang xuất..." : "Xuất báo cáo"}</span>
              </button>
            </div>

            {/* 4 Stat Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: Điểm TB */}
              <div className="bg-gray-50/70 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-700 shrink-0">
                  Σ
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Điểm TB</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">
                    {statsData?.averageScore ?? 7.2}
                  </p>
                </div>
              </div>

              {/* Card 2: Tỷ lệ hoàn thành */}
              <div className="bg-gray-50/70 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Tỷ lệ hoàn thành</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">
                    {statsData?.completionRate ?? 90}%
                  </p>
                </div>
              </div>

              {/* Card 3: Điểm cao nhất */}
              <div className="bg-gray-50/70 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                  <TrendingUp className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Điểm cao nhất</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">
                    {statsData?.highestScore ?? 10}
                  </p>
                </div>
              </div>

              {/* Card 4: Điểm thấp nhất */}
              <div className="bg-gray-50/70 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                  <TrendingDown className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Điểm thấp nhất</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">
                    {statsData?.lowestScore ?? 2}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Left (Score Distribution) + Right (Top Missed Questions) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Phân bố điểm số */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Phân bố điểm số
              </h3>

              {/* Recharts Bar Chart */}
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distributionList}
                    margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="quizBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#990011" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#d44856" stopOpacity={0.65} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="range"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#374151", fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      domain={[0, (dataMax) => Math.max(20, dataMax)]}
                      ticks={[0, 5, 10, 15, 20]}
                    />
                    <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                    <Bar
                      dataKey="count"
                      fill="url(#quizBarGradient)"
                      radius={[8, 8, 0, 0]}
                      barSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Column: Câu hỏi sai nhiều nhất */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-base font-bold text-gray-900 mb-6">
                Câu hỏi sai nhiều nhất
              </h3>

              {topMissedList.length > 0 ? (
                <div className="divide-y divide-gray-100 space-y-3">
                  {topMissedList.map((q, idx) => (
                    <div key={idx} className="pt-3 first:pt-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">
                          Câu {q.questionNumber}
                        </h4>
                        <span className="text-xs font-bold text-[#990011]">
                          {q.correctPercent}% đúng
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-1">
                        {q.questionSnippet}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">
                  Không có câu hỏi sai nhiều
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherQuizDetailView
