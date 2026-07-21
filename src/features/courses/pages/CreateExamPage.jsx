import React, { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import { useGetClassDetailQuery } from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import ReactDatePicker from "react-datepicker"
import "@/shared/styles/react-datepicker.css"
import { Editor } from "@tinymce/tinymce-react"
import {
  ChevronRight,
  Calendar,
  Trash2,
  Copy,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Menu,
  Cloud,
  Timer,
  Pause,
  Play,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Flag,
} from "lucide-react"

const PREVIEW_LOCALES = {
  vi: {
    bannerText: "Đây là chế độ xem trước của bài kiểm tra",
    backToEdit: "Quay lại chỉnh sửa",
    confirmPublish: "Xác nhận & Đăng bài",
    autoSaved: "Đã lưu tự động lúc",
    progress: "Tiến độ",
    questionsList: "Danh sách câu hỏi",
    unanswered: "Chưa làm",
    answered: "Đã làm",
    current: "Đang làm",
    flagged: "Đặt cờ",
    prevQuestion: "Câu trước",
    nextQuestion: "Câu sau",
    markReview: "Đánh dấu xem lại",
    unmarkReview: "Bỏ đánh dấu",
    essayPlaceholder: "Nhập câu trả lời của bạn ở đây...",
    unnamedExam: "Bài kiểm tra chưa đặt tên",
    emptyQuestions: "Chưa có câu hỏi nào được thêm.",
    points: "điểm",
  },
  en: {
    bannerText: "This is a preview mode of the exam",
    backToEdit: "Back to Edit",
    confirmPublish: "Confirm & Publish",
    autoSaved: "Auto-saved at",
    progress: "Progress",
    questionsList: "Questions List",
    unanswered: "Unanswered",
    answered: "Answered",
    current: "Current",
    flagged: "Flagged",
    prevQuestion: "Previous",
    nextQuestion: "Next",
    markReview: "Mark for review",
    unmarkReview: "Unmark",
    essayPlaceholder: "Enter your answer here...",
    unnamedExam: "Untitled Exam",
    emptyQuestions: "No questions added yet.",
    points: "pts",
  },
  zh: {
    bannerText: "这是考试的预览模式",
    backToEdit: "返回编辑",
    confirmPublish: "确认并发布",
    autoSaved: "自动保存于",
    progress: "进度",
    questionsList: "题目列表",
    unanswered: "未答",
    answered: "已答",
    current: "当前",
    flagged: "标记",
    prevQuestion: "上一题",
    nextQuestion: "下一题",
    markReview: "标记复查",
    unmarkReview: "取消标记",
    essayPlaceholder: "在此输入您的答案...",
    unnamedExam: "未命名考试",
    emptyQuestions: "尚未添加任何题目。",
    points: "分",
  }
}

const CreateExamForm = ({ id, classData, language, t }) => {
  const navigate = useNavigate()
  const c = t.courses || {}
  const ce = c.createExam || {}

  // Form states
  const [title, setTitle] = useState("")
  const [editorText, setEditorText] = useState("")

  // Date-Time states
  const [openDate, setOpenDate] = useState(null)
  const [closeDate, setCloseDate] = useState(null)

  // Question state
  const [questions, setQuestions] = useState([
    {
      id: "q-1",
      type: "mcq",
      score: 2.5,
      content: "Hardly _________ the meeting when the power went out unexpectedly.",
      options: ["had we started", "we started", "did we start"],
      correctOption: 0,
      required: true,
    },
    {
      id: "q-2",
      type: "essay",
      score: 2.5,
      content: "Talk about your hobby.",
      required: true,
    }
  ])

  // Drag states
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [draggableIndex, setDraggableIndex] = useState(null)
  const lastScrollTimeRef = useRef(0)

  // Collapse state
  const [collapsedQuestions, setCollapsedQuestions] = useState({})

  const toggleCollapse = (qId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }))
  }

  // Preview Mode states
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewCurrentIndex, setPreviewCurrentIndex] = useState(0)
  const [previewAnswers, setPreviewAnswers] = useState({})
  const [previewFlagged, setPreviewFlagged] = useState({})
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(2700)
  const [autoSaveTimeStr, setAutoSaveTimeStr] = useState("10:42 AM")
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(12)

  // Sidebar configuration states
  const [duration, setDuration] = useState("45")
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleOptions, setShuffleOptions] = useState(true)
  const [showAnswers, setShowAnswers] = useState(true)
  const [autoGrading, setAutoGrading] = useState(false)
  const [scoreScale, setScoreScale] = useState("scale10") // scale10, scale100
  const [resultRelease, setResultRelease] = useState("manual") // manual, automatic
  const [publishStatus, setPublishStatus] = useState("now") // now, draft
  const [postToFeed, setPostToFeed] = useState(true)


  // Question management handlers
  const handleAddQuestion = () => {
    const newId = `q-${Date.now()}`
    setQuestions((prev) => [
      ...prev,
      {
        id: newId,
        type: "mcq",
        score: 1.0,
        content: "",
        options: ["Đáp án A", "Đáp án B"],
        correctOption: 0,
        required: true,
      }
    ])
    toast.success(language === "vi" ? "Đã thêm câu hỏi mới" : "New question added")
  }

  const handleCopyQuestion = (index) => {
    const qToCopy = questions[index]
    const newId = `q-${Date.now()}`
    const copiedQ = {
      ...qToCopy,
      id: newId,
      options: qToCopy.options ? [...qToCopy.options] : undefined,
    }
    const updated = [...questions]
    updated.splice(index + 1, 0, copiedQ)
    setQuestions(updated)
    toast.success(language === "vi" ? "Đã sao chép câu hỏi" : "Question copied")
  }

  const handleDeleteQuestion = (index) => {
    if (questions.length <= 1) {
      toast.error(language === "vi" ? "Phải có ít nhất một câu hỏi" : "Must have at least one question")
      return
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index))
    toast.success(language === "vi" ? "Đã xóa câu hỏi" : "Question deleted")
  }

  const handleQuestionTypeChange = (index, type) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q
        if (type === "essay") {
          return {
            id: q.id,
            type: "essay",
            score: q.score,
            content: q.content,
            required: q.required,
          }
        } else {
          return {
            id: q.id,
            type: "mcq",
            score: q.score,
            content: q.content,
            options: ["Đáp án A", "Đáp án B"],
            correctOption: 0,
            required: q.required,
          }
        }
      })
    )
  }

  const handleQuestionContentChange = (index, val) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, content: val } : q))
    )
  }

  const handleScoreChange = (index, val) => {
    const num = parseFloat(val) || 0
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, score: num } : q))
    )
  }

  const handleRequiredToggle = (index) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, required: !q.required } : q))
    )
  }

  // MCQ Option handlers
  const handleAddOption = (qIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q
        return {
          ...q,
          options: [...q.options, `Đáp án ${String.fromCharCode(65 + q.options.length)}`],
        }
      })
    )
  }

  const handleRemoveOption = (qIdx, optIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q
        if (q.options.length <= 2) {
          toast.error(language === "vi" ? "Phải có ít nhất 2 đáp án" : "Must have at least 2 options")
          return q
        }
        const updatedOptions = q.options.filter((_, idx) => idx !== optIdx)
        let correctIdx = q.correctOption
        if (correctIdx === optIdx) {
          correctIdx = 0
        } else if (correctIdx > optIdx) {
          correctIdx--
        }
        return {
          ...q,
          options: updatedOptions,
          correctOption: correctIdx,
        }
      })
    )
  }

  const handleOptionTextChange = (qIdx, optIdx, val) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q
        const updatedOptions = [...q.options]
        updatedOptions[optIdx] = val
        return {
          ...q,
          options: updatedOptions,
        }
      })
    )
  }

  const handleCorrectOptionSelect = (qIdx, optIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q
        return {
          ...q,
          correctOption: optIdx,
        }
      })
    )
  }

  // Move questions up/down
  const handleMoveQuestion = (index, direction) => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === questions.length - 1) return

    const targetIdx = direction === "up" ? index - 1 : index + 1
    const updated = [...questions]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    setQuestions(updated)
  }

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()

    // Throttle scrolling to prevent infinite instant scrolling loop
    const now = e.timeStamp
    if (now - lastScrollTimeRef.current > 50) {
      const threshold = 120 // px from screen edge
      const clientY = e.clientY
      const viewHeight = window.innerHeight

      if (clientY < threshold) {
        // Dragging near top -> scroll up (speed relative to proximity to edge)
        const distance = threshold - clientY
        const speed = Math.max(4, Math.min(20, Math.floor(distance / 6)))
        window.scrollBy(0, -speed)
        lastScrollTimeRef.current = now
      } else if (viewHeight - clientY < threshold) {
        // Dragging near bottom -> scroll down
        const distance = threshold - (viewHeight - clientY)
        const speed = Math.max(4, Math.min(20, Math.floor(distance / 6)))
        window.scrollBy(0, speed)
        lastScrollTimeRef.current = now
      }
    }

    if (draggedIndex === null || draggedIndex === index) return

    const updated = [...questions]
    const draggedItem = updated[draggedIndex]
    updated.splice(draggedIndex, 1)
    updated.splice(index, 0, draggedItem)

    setDraggedIndex(index)
    setQuestions(updated)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDraggableIndex(null)
  }

  // Total score calculation
  const totalScoreVal = questions.reduce((sum, q) => sum + (q.score || 0), 0)

  // Save/Submit Actions
  const handleCancel = () => {
    navigate(`/workspace/courses/class/${id}`)
  }

  const handleSaveDraft = () => {
    toast.success(ce.successDraft || "Đã lưu bản nháp bài kiểm tra")
    navigate(`/workspace/courses/class/${id}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error(language === "vi" ? "Vui lòng nhập tên bài kiểm tra" : "Please enter the exam name")
      return
    }
    toast.success(ce.successCreate || "Tạo bài kiểm tra thành công!")
    navigate(`/workspace/courses/class/${id}`)
  }

  const handlePreview = () => {
    setIsPreviewMode(true)
    setPreviewCurrentIndex(0)
    // Initialize timer duration
    setPreviewTimeRemaining(parseInt(duration, 10) * 60 || 2700)

    // Set dynamic save time
    const now = new Date()
    let hours = now.getHours()
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12
    const minutes = now.getMinutes().toString().padStart(2, "0")
    setAutoSaveTimeStr(`${hours}:${minutes} ${ampm}`)
  }

  // Timer Effect
  useEffect(() => {
    if (!isPreviewMode) return
    const timer = setInterval(() => {
      setPreviewTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isPreviewMode])

  // Audio Playback Effect
  const audioDuration = 30
  useEffect(() => {
    let interval
    if (isPreviewMode && isAudioPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= audioDuration) {
            setIsAudioPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPreviewMode, isAudioPlaying])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSelectOption = (qId, optIdx) => {
    setPreviewAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
    }))
  }

  const getQuestionBtnClass = (qId, idx) => {
    const isCurrent = previewCurrentIndex === idx
    const isFlagged = previewFlagged[qId] === true

    const targetQ = questions[idx]
    const isAnswered = targetQ.type === "mcq"
      ? previewAnswers[qId] !== undefined
      : (previewAnswers[qId]?.trim().length > 0)

    if (isCurrent) {
      return "w-10 h-10 rounded-full flex items-center justify-center bg-[#990011] text-white font-extrabold decoration-2 shadow-xs cursor-pointer select-none"
    }
    if (isFlagged) {
      return "w-10 h-10 rounded-full flex items-center justify-center border-2 border-red-500 text-red-500 font-extrabold bg-white hover:bg-red-50/10 cursor-pointer shadow-xs select-none"
    }
    if (isAnswered) {
      return "w-10 h-10 rounded-full flex items-center justify-center bg-red-50/70 border border-red-200 text-[#990011] font-extrabold hover:bg-red-50 cursor-pointer shadow-xs select-none"
    }
    return "w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-150 text-gray-700 font-extrabold hover:bg-gray-100 cursor-pointer shadow-xs select-none"
  }

  if (isPreviewMode) {
    const currentQuestion = questions[previewCurrentIndex]
    const p = PREVIEW_LOCALES[language] || PREVIEW_LOCALES.en
    const answeredCount = questions.filter((q) =>
      q.type === "mcq"
        ? previewAnswers[q.id] !== undefined
        : (previewAnswers[q.id]?.trim().length > 0)
    ).length

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-805 -mx-4 -mt-6">
        {/* ─── Top Yellow/Orange Banner ─── */}
        <div className="bg-[#f2a93b] text-gray-900 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm select-none shrink-0">
          <span className="text-sm font-extrabold tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-650 rounded-full animate-pulse" />
            {p.bannerText}
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className="px-4 py-2 border border-gray-900 text-gray-900 rounded-full hover:bg-black/5 transition-all font-bold text-xs select-none cursor-pointer"
            >
              {p.backToEdit}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-[#990011] hover:bg-[#80000e] text-white rounded-full transition-all active:scale-95 font-bold text-xs shadow-sm cursor-pointer"
            >
              {p.confirmPublish}
            </button>
          </div>
        </div>

        {/* ─── Sub-header Row ─── */}
        <div className="bg-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 shadow-xs shrink-0 select-none">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
              {title || p.unnamedExam}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
              <Cloud size={14} className="text-gray-400" />
              <span>{p.autoSaved} {autoSaveTimeStr}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 self-end md:self-auto">
            <div className="flex flex-col gap-1 w-32 sm:w-44 text-right">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                <span>{p.progress}</span>
                <span className="text-gray-900">{answeredCount}/{questions.length}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#990011] transition-all duration-300"
                  style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="px-4 py-2 bg-red-50/20 border border-red-100 rounded-2xl flex items-center gap-2 text-[#990011] font-black tracking-wider text-lg shadow-2xs">
              <Timer size={20} className="animate-pulse" />
              <span>{formatTime(previewTimeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* ─── Main Columns Body ─── */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col lg:flex-row gap-6">

          {/* Left Area: Active Question card */}
          <div className="flex-1 flex flex-col gap-6">
            {questions.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center text-gray-400 font-bold shadow-xs">
                {p.emptyQuestions}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 flex flex-col gap-6 shadow-xs">

                {/* Card Title & Score info */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 select-none">
                  <h2 className="text-lg font-black text-[#990011] tracking-tight">
                    {language === "vi" ? `Câu hỏi ${previewCurrentIndex + 1}` : `${p.questionsList} ${previewCurrentIndex + 1}`}
                  </h2>
                  <span className="px-3.5 py-1.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-500">
                    {currentQuestion.score} {p.points}
                  </span>
                </div>

                {/* Question text content */}
                <p className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.content}
                </p>

                {/* Mock Audio and illustration if Question 1 */}
                {previewCurrentIndex === 0 && (
                  <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full select-none">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-h-[300px]">
                      <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop"
                        alt="Library students"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Audio Player Container */}
                    <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex flex-col gap-3">
                      {/* Audio track line */}
                      <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-[#990011] transition-all"
                          style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                        />
                      </div>

                      {/* Audio player actions */}
                      <div className="flex justify-between items-center text-xs font-extrabold text-gray-400">
                        <span>0:{audioProgress.toString().padStart(2, "0")}</span>
                        <button
                          type="button"
                          onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                          className="w-8 h-8 rounded-full bg-white border border-gray-150 flex items-center justify-center text-gray-655 hover:text-[#990011] active:scale-95 transition-all shadow-xs cursor-pointer"
                        >
                          {isAudioPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                        </button>
                        <span>0:{audioDuration}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Options/Answers selection list */}
                {currentQuestion.type === "mcq" ? (
                  <div className="flex flex-col gap-3">
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = previewAnswers[currentQuestion.id] === optIdx
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                          className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer select-none transition-all active:scale-[0.99] ${isSelected
                            ? "border-[#990011] bg-red-50/10"
                            : "border-gray-200 bg-gray-50/50 hover:bg-gray-150/30"
                            }`}
                        >
                          <div className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all shrink-0 ${isSelected ? "border-[#990011] bg-red-50/10" : "border-gray-300"
                            }`}>
                            {isSelected && <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />}
                          </div>
                          <span className={`text-xs font-bold ${isSelected ? "text-[#990011]" : "text-gray-700"}`}>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* Essay Answer Area */
                  <textarea
                    value={previewAnswers[currentQuestion.id] || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      setPreviewAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))
                    }}
                    placeholder={p.essayPlaceholder}
                    className="w-full p-4 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] min-h-[140px] resize-y transition-all"
                  />
                )}

              </div>
            )}
          </div>

          {/* Right Area: Questions Grid sidebar */}
          <div className="w-full lg:w-80 shrink-0 select-none">
            <div className="bg-white rounded-3xl border border-gray-150 p-6 flex flex-col gap-5 shadow-xs">
              <div className="flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-3">
                <LayoutGrid size={18} className="text-[#990011]" />
                <h3 className="text-sm font-black tracking-tight">{p.questionsList}</h3>
              </div>

              {/* Grid map */}
              <div className="grid grid-cols-5 gap-3 max-w-[280px] sm:max-w-none mx-auto lg:mx-0">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setPreviewCurrentIndex(idx)}
                    className={getQuestionBtnClass(q.id, idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="h-px bg-gray-100 my-1" />

              {/* Legend details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px] font-bold text-gray-500 pl-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-700 text-[10px]" />
                  <span>{p.unanswered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-50/70 border border-red-200 flex items-center justify-center text-[#990011] text-[10px]" />
                  <span>{p.answered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#990011] text-white flex items-center justify-center text-[10px] underline decoration-1" />
                  <span>{p.current}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border-2 border-red-500 text-red-500 bg-white flex items-center justify-center text-[10px]" />
                  <span>{p.flagged}</span>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-1" />

              {/* Navigation controls */}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={previewCurrentIndex === 0}
                  onClick={() => setPreviewCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="flex-1 py-2.5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-1 hover:shadow-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  <ArrowLeft size={12} />
                  <span>{p.prevQuestion}</span>
                </button>
                <button
                  type="button"
                  disabled={previewCurrentIndex === questions.length - 1}
                  onClick={() => setPreviewCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="flex-1 py-2.5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-1 hover:shadow-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  <span>{p.nextQuestion}</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Flag for review control */}
              {questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const qId = currentQuestion.id
                    setPreviewFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }))
                  }}
                  className="w-full py-2.5 border border-[#990011] text-[#990011] hover:bg-red-50/20 font-extrabold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer mt-1"
                >
                  <Flag size={12} />
                  <span>{previewFlagged[currentQuestion.id] ? p.unmarkReview : p.markReview}</span>
                </button>
              )}

            </div>
          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {/* ─── Breadcrumbs ─── */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>
            {t.nav?.home || "Trang chủ"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>
            {c.title || "Khóa học của tôi"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses/all")}>
            {c.allCourses?.title || "Toàn bộ khóa học"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/courses/details/${classData.courseId || ""}`)}>
            {t.courses?.student?.courseDetails || "Chi tiết khóa học"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/courses/class/${id}`)}>
            {t.courses?.student?.classDetails || "Chi tiết lớp học"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-[#990011] font-semibold">
            {ce.pageTitle || "Tạo bài kiểm tra"}
          </span>
        </div>
      </div>

      {/* ─── Page Title ─── */}
      <h1 className="text-3xl font-black text-gray-950 tracking-tight">
        {ce.pageTitle || "Tạo bài kiểm tra mới"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ─── Main Form Panel (Left) ─── */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {/* Card: Base Info */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-800">
                {ce.examNameLabel || "Tên bài kiểm tra"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={ce.examNamePlaceholder || "Nhập tên bài kiểm tra (VD: Bài kiểm tra giữa kỳ)"}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-800">
                {ce.descriptionLabel || "Mô tả / Hướng dẫn"}
              </label>

              <Editor
                tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
                value={editorText}
                onEditorChange={(newVal) => setEditorText(newVal)}
                init={{
                  height: 185,
                  menubar: false,
                  statusbar: false,
                  plugins: ["autolink", "lists", "link", "charmap", "emoticons"],
                  toolbar:
                    "bold italic underline strikethrough | emoticons link | bullist numlist",
                  placeholder: ce.descriptionPlaceholder || "Nhập hướng dẫn chi tiết cho học sinh...",
                  skin: "oxide",
                  setup: (editor) => {
                    editor.on("focus", () => { })
                  },
                }}
              />
            </div>
          </div>

          {/* Heading: Questions list */}
          <div className="flex justify-between items-center px-2">
            <h2 className="text-lg font-bold text-gray-800">
              {ce.questionsList || "Danh sách câu hỏi"}
            </h2>
            <span className="text-sm font-semibold text-gray-500">
              {ce.totalScore || "Tổng điểm"}: <span className="text-[#990011] font-bold">{totalScoreVal}</span>
            </span>
          </div>

          {/* Questions Container */}
          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                draggable={draggableIndex === idx}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`relative bg-white border rounded-3xl overflow-hidden flex shadow-xs group transition-all duration-200 ${draggedIndex === idx
                  ? "opacity-40 border-dashed border-[#990011] scale-[0.99] bg-red-50/5"
                  : "border-gray-150 border-solid"
                  }`}
              >

                {/* Left drag-bar */}
                <div className="w-12 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-4 gap-1.5 select-none shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(idx, "up")}
                    disabled={idx === 0}
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${idx === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500"}`}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <div
                    onMouseDown={() => setDraggableIndex(idx)}
                    onMouseUp={() => setDraggableIndex(null)}
                    onMouseLeave={() => setDraggableIndex(null)}
                    className="text-gray-300 cursor-grab active:cursor-grabbing p-1"
                    title="Drag to reorder"
                  >
                    <Menu size={16} />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(idx, "down")}
                    disabled={idx === questions.length - 1}
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${idx === questions.length - 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500"}`}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Main Card Content */}
                <div className="flex-1 p-5 md:p-6 flex flex-col gap-4">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Collapse/Expand Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleCollapse(q.id)}
                        className="p-1 hover:bg-gray-150 rounded-lg text-gray-500 hover:text-gray-700 transition-colors cursor-pointer shrink-0"
                        title={collapsedQuestions[q.id] ? "Mở rộng" : "Thu gọn"}
                      >
                        {collapsedQuestions[q.id] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                      </button>

                      <span className="text-sm font-extrabold text-gray-800 select-none">
                        {ce.question || "Câu"} {idx + 1}
                      </span>
                      {/* Dropdown Type */}
                      <div className="relative">
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionTypeChange(idx, e.target.value)}
                          className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-100 focus:border-[#990011] appearance-none cursor-pointer"
                        >
                          <option value="mcq">{ce.mcqOption || "Trắc nghiệm (Một đáp án)"}</option>
                          <option value="essay">{ce.essayOption || "Tự luận"}</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Points field */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-gray-500">{ce.point || "Điểm"}:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={q.score}
                        onChange={(e) => handleScoreChange(idx, e.target.value)}
                        className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs font-extrabold focus:outline-none focus:ring-1 focus:ring-red-100 focus:border-[#990011]"
                      />
                    </div>
                  </div>

                  {collapsedQuestions[q.id] ? (
                    /* Collapsed summary of question text */
                    <div className="text-xs font-semibold text-gray-450 truncate max-w-[280px] sm:max-w-md md:max-w-2xl pl-8 leading-tight select-none italic pb-2">
                      {q.content ? q.content : (language === "vi" ? "(Chưa nhập nội dung câu hỏi)" : "(No question content yet)")}
                    </div>
                  ) : (
                    /* Expanded full editor fields */
                    <>
                      {/* Content input */}
                      <textarea
                        value={q.content}
                        onChange={(e) => handleQuestionContentChange(idx, e.target.value)}
                        placeholder={language === "vi" ? "Nhập nội dung câu hỏi..." : "Enter question content..."}
                        className="w-full p-3 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] resize-none h-18 transition-all"
                      />

                      {/* Type-Specific Options Area */}
                      {q.type === "mcq" ? (
                        <div className="flex flex-col gap-3 pl-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-3 group/opt">
                              {/* Radio Selection */}
                              <button
                                type="button"
                                onClick={() => handleCorrectOptionSelect(idx, optIdx)}
                                className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all shrink-0 ${q.correctOption === optIdx ? "border-[#990011] bg-red-50/10" : "border-gray-300 hover:border-gray-400"
                                  }`}
                              >
                                {q.correctOption === optIdx && (
                                  <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />
                                )}
                              </button>

                              {/* Option Input */}
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionTextChange(idx, optIdx, e.target.value)}
                                placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                                className={`flex-1 px-3 py-2 border rounded-xl text-xs focus:outline-none transition-all ${q.correctOption === optIdx
                                  ? "border-red-200 bg-red-50/10 focus:ring-1 focus:ring-red-100 focus:border-[#990011]"
                                  : "border-gray-200 focus:ring-1 focus:ring-red-100 focus:border-gray-300"
                                  }`}
                              />

                              {/* Remove option button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(idx, optIdx)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                title="Delete option"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}

                          {/* Add Option Trigger */}
                          <button
                            type="button"
                            onClick={() => handleAddOption(idx)}
                            className="text-xs font-bold text-[#990011] flex items-center gap-1.5 hover:underline pl-8"
                          >
                            <Plus size={14} />
                            <span>{ce.addOption || "Thêm lựa chọn"}</span>
                          </button>
                        </div>
                      ) : (
                        /* Essay Mockup View */
                        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs text-gray-400 font-medium italic">
                          {language === "vi" ? "Vùng học viên nhập câu trả lời tự luận." : "Student essay response area."}
                        </div>
                      )}

                      <div className="h-px bg-gray-100 w-full my-1" />

                      {/* Actions footer of card */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {/* Copy */}
                          <button
                            type="button"
                            onClick={() => handleCopyQuestion(idx)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                            title="Copy question"
                          >
                            <Copy size={16} />
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(idx)}
                            className="p-2 text-gray-400 hover:text-red-650 hover:bg-red-55/20 rounded-xl transition-all"
                            title="Delete question"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Required Switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500">
                            {ce.requiredLabel || "Bắt buộc"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRequiredToggle(idx)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${q.required ? "bg-[#990011]" : "bg-gray-200"
                              }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${q.required ? "translate-x-4" : "translate-x-0"
                                }`}
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                </div>

              </div>
            ))}
          </div>

          {/* Dashed button: Add new question */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="border-2 border-dashed border-red-100 hover:border-[#990011] bg-red-50/10 hover:bg-red-50/20 transition-all rounded-3xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-[#990011] group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="text-sm font-bold text-[#990011] tracking-wide">
              {ce.addQuestion || "Thêm câu hỏi mới"}
            </span>
          </button>
        </div>

        {/* ─── Settings Panel (Right) ─── */}
        <div className="w-full lg:w-[320px] bg-white border border-gray-150 rounded-3xl p-6 flex flex-col gap-5 shadow-sm shrink-0 lg:sticky lg:top-4">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
            {ce.sidebarTitle || "Cấu hình bài kiểm tra"}
          </h2>

          {/* Time Limit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-800">
              {ce.durationLabel || "Thời gian làm bài (Phút)"}
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] font-bold"
              placeholder="Min"
            />
          </div>

          {/* Open Time */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-gray-800">
              {ce.openTimeLabel || "Thời gian mở"}
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none z-10" />
              <ReactDatePicker
                selected={openDate}
                onChange={(date) => setOpenDate(date)}
                showTimeSelect
                dateFormat="dd/MM/yyyy, hh:mm aa"
                placeholderText="mm/dd/yyyy, --:-- --"
                wrapperClassName="w-full"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] text-xs cursor-pointer"
              />
            </div>
          </div>

          {/* Close Time */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-gray-800">
              {ce.closeTimeLabel || "Thời gian đóng"}
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none z-10" />
              <ReactDatePicker
                selected={closeDate}
                onChange={(date) => setCloseDate(date)}
                showTimeSelect
                dateFormat="dd/MM/yyyy, hh:mm aa"
                placeholderText="mm/dd/yyyy, --:-- --"
                wrapperClassName="w-full"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] text-xs cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Advanced Settings */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              {ce.advancedSettings || "Cài đặt nâng cao"}
            </span>

            {/* Shuffle Questions */}
            <div className="flex justify-between items-center gap-3">
              <span className="text-xs font-semibold text-gray-750">
                {ce.shuffleQuestions || "Xáo trộn câu hỏi"}
              </span>
              <button
                type="button"
                onClick={() => setShuffleQuestions(!shuffleQuestions)}
                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${shuffleQuestions ? "bg-[#990011]" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${shuffleQuestions ? "translate-x-3.5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Shuffle Answers */}
            <div className="flex justify-between items-center gap-3">
              <span className="text-xs font-semibold text-gray-750">
                {ce.shuffleOptions || "Xáo trộn đáp án"}
              </span>
              <button
                type="button"
                onClick={() => setShuffleOptions(!shuffleOptions)}
                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${shuffleOptions ? "bg-[#990011]" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${shuffleOptions ? "translate-x-3.5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Show Answer After Submission */}
            <div className="flex justify-between items-center gap-3">
              <span className="text-xs font-semibold text-gray-750">
                {ce.showAnswers || "Hiển thị đáp án sau khi nộp"}
              </span>
              <button
                type="button"
                onClick={() => setShowAnswers(!showAnswers)}
                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showAnswers ? "bg-[#990011]" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${showAnswers ? "translate-x-3.5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Auto Grade */}
            <div className="flex justify-between items-center gap-3">
              <span className="text-xs font-semibold text-gray-750">
                {ce.autoGrading || "Chấm điểm tự động"}
              </span>
              <button
                type="button"
                onClick={() => setAutoGrading(!autoGrading)}
                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoGrading ? "bg-[#990011]" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${autoGrading ? "translate-x-3.5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Score Scale Dropdown */}
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-bold text-gray-800">
                {ce.scoreScale || "Thang điểm"}
              </label>
              <div className="relative">
                <select
                  value={scoreScale}
                  onChange={(e) => setScoreScale(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] appearance-none cursor-pointer"
                >
                  <option value="scale10">{ce.scale10 || "Thang điểm 10"}</option>
                  <option value="scale100">{ce.scale100 || "Thang điểm 100"}</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Result Release Dropdown */}
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-bold text-gray-800">
                {ce.resultRelease || "Công bố kết quả"}
              </label>
              <div className="relative">
                <select
                  value={resultRelease}
                  onChange={(e) => setResultRelease(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] appearance-none cursor-pointer"
                >
                  <option value="manual">{ce.releaseManual || "Công bố thủ công"}</option>
                  <option value="automatic">{ce.releaseAutomatic || "Tự động công bố sau khi chấm"}</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Publish Status */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-gray-800">
              {ce.publishStatus || "Trạng thái đăng"}
            </span>

            <div className="flex flex-col gap-2.5">
              {/* Radio: Now */}
              <div
                onClick={() => setPublishStatus("now")}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <button
                  type="button"
                  className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all ${publishStatus === "now" ? "border-[#990011]" : "border-gray-300"
                    }`}
                >
                  {publishStatus === "now" && <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />}
                </button>
                <span className="text-xs font-semibold text-gray-750">
                  {ce.publishNow || "Đăng ngay"}
                </span>
              </div>

              {/* Radio: Draft */}
              <div
                onClick={() => setPublishStatus("draft")}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <button
                  type="button"
                  className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all ${publishStatus === "draft" ? "border-[#990011]" : "border-gray-300"
                    }`}
                >
                  {publishStatus === "draft" && <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />}
                </button>
                <span className="text-xs font-semibold text-gray-750">
                  {ce.saveDraft || "Lưu nháp"}
                </span>
              </div>
            </div>
          </div>

          {/* Post to Bulletin board */}
          <div className="bg-red-50/20 border border-red-100 rounded-2xl p-4 flex justify-between items-center shadow-xs">
            <span className="text-xs font-bold text-gray-800">
              {ce.postToFeed || "Đăng lên bảng tin lớp học"}
            </span>
            <button
              type="button"
              onClick={() => setPostToFeed(!postToFeed)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${postToFeed ? "bg-[#990011]" : "bg-gray-200"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${postToFeed ? "translate-x-4" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>

      </form>

      {/* ─── Footer Buttons ─── */}
      <div className="flex justify-between items-center py-4 border-t border-gray-150 mt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="text-xs font-extrabold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-wider"
        >
          {ce.btnCancel || "Hủy"}
        </button>

        <div className="flex items-center gap-3">
          {/* Preview button */}
          <button
            type="button"
            onClick={handlePreview}
            className="p-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-all active:scale-95 shadow-xs"
            title={language === "vi" ? "Xem trước" : "Preview"}
          >
            <Eye size={18} />
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="h-10 px-5 border border-[#990011] text-[#990011] hover:bg-red-50/50 font-extrabold text-xs rounded-xl transition-all active:scale-95 shadow-xs"
          >
            {ce.btnSaveDraft || "Lưu nháp"}
          </button>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-6 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 shadow-md"
          >
            {ce.btnCreate || "Tạo bài kiểm tra"}
          </button>
        </div>
      </div>

    </div>
  )
}

const CreateExamPage = () => {
  const { id } = useParams()
  const { language, t } = useLanguage()

  // Fetch Class Details via RTK Query to construct proper Breadcrumbs
  const { data: detailResponse, isLoading: isClassLoading } = useGetClassDetailQuery(id)

  if (isClassLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  const classData = detailResponse?.data || detailResponse || {}

  return (
    <CreateExamForm
      key={id}
      id={id}
      classData={classData}
      language={language}
      t={t}
    />
  )
}

export default CreateExamPage
