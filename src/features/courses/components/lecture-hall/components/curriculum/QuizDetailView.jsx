import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, FileText, Timer, RefreshCcw, Eye, Play } from 'lucide-react'
import { PillButton } from '@/shared/components/ui/buttons'
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import FluentCard from '@/shared/components/ui/FluentCard'
import QuizStatusBadge from './QuizStatusBadge'

const QuizDetailView = ({ itemData, onBack, sectionData }) => {
  const { classId: routeClassId, id: routeId } = useParams()
  const classId = routeClassId || routeId
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { formatDateTime } = useTimezone()
  const [nowMs] = useState(() => Date.now())

  const targetQuizId = itemData?.itemId

  const cg = t.courses?.grading || {}
  const sq = t.courses?.grading?.studentQuiz || {}
  const dict = t.courses?.lectureHall?.curriculum || {}

  if (!itemData) {
    return (
      <div className="p-6 w-full animate-fade-in">
        <PillButton
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          className="w-fit mb-6"
          variant="secondary-no-outline"
        >
          {t.courses?.lectureHall?.postDetail?.back || "Quay lại"}
        </PillButton>
        <div className="text-center py-12 text-sm text-[#EF4444] dark:text-red-400 border border-dashed border-[#FCA5A5] dark:border-red-900/40 rounded-xl bg-[#FEF2F2] dark:bg-red-950/30">
          {sq.loadQuizErrorTitle || "Bài kiểm tra không tồn tại"}
        </div>
      </div>
    )
  }

  const quizData = itemData?.quiz || itemData

  const title = quizData?.name || dict.quiz || "Bài kiểm tra"
  const description = quizData?.description || ""

  const openTime = quizData?.openTime
  const formattedOpenTime = openTime ? formatDateTime(openTime) : null

  const closeTime = quizData?.closeTime
  const formattedCloseTime = closeTime ? formatDateTime(closeTime) : null

  const apiSubmission = quizData?.studentSubmission
  const recordStatus = typeof apiSubmission?.status === "string" ? apiSubmission.status.trim().toLowerCase() : "pending"
  const isDone = recordStatus === "submitted" || recordStatus === "graded" || recordStatus === "completed"

  const closeTimeMs = closeTime ? new Date(closeTime).getTime() : 0
  const isExpired = closeTimeMs > 0 && closeTimeMs < nowMs

  const hasTimeLimit = (
    quizData?.timeLimitMinutes !== null &&
    quizData?.timeLimitMinutes !== undefined &&
    quizData?.timeLimitMinutes !== "" &&
    Number.isFinite(Number(quizData?.timeLimitMinutes)) &&
    Number(quizData?.timeLimitMinutes) >= 0
  )

  const embeddedQuestionCount = Array.isArray(quizData?.questions) ? quizData.questions.length : undefined
  const parsedQuestionCount = Number(quizData?.questionCount ?? quizData?.totalQuestions)
  const questionCount = embeddedQuestionCount ?? (Number.isFinite(parsedQuestionCount) ? parsedQuestionCount : null)

  const remainingAttemptsNum = Number(quizData?.remainingAttempts ?? quizData?.remainingAttempt ?? quizData?.attemptsLeft)
  const hasRemainingAttempts = (
    quizData?.remainingAttempts === undefined &&
    quizData?.remainingAttempt === undefined &&
    quizData?.attemptsLeft === undefined
  ) ? true : (Number.isFinite(remainingAttemptsNum) ? remainingAttemptsNum > 0 : true)

  const maxAttemptsNum = Number(quizData?.maxAttempts ?? quizData?.totalAttempts)
  const hasMaxAttempts = Number.isFinite(maxAttemptsNum) && maxAttemptsNum > 0

  const score = apiSubmission?.score
  const showGrading = isDone && score !== undefined && score !== null

  const handleTakeQuiz = (step = "") => {
    navigate(`/workspace/courses/class/${classId}/quiz/${targetQuizId}/take${step ? `?step=${step}` : ""}`)
  }

  return (
    <div className="w-full animate-fade-in">
      <PillButton
        startIcon={<ArrowLeft size={16} />}
        onClick={onBack}
        className='w-fit'
        variant='secondary-no-outline'
      >
        {t.courses?.lectureHall?.title || "Giảng đường"}
      </PillButton>

      <div className='space-y-6'>
        {/* Quiz Info Card */}
        <FluentCard className="p-4 sm:p-6 space-y-4 bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F]">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A] dark:text-white">{title}</h1>
            <QuizStatusBadge
              classId={classId}
              quizId={targetQuizId}
              quiz={quizData}
              isCompleted={itemData?.isCompleted}
              closeTime={closeTime}
            />
          </div>

          <div className="flex flex-col gap-2 text-sm text-[#7B7979] dark:text-gray-400">
            <span className='font-semibold'>{dict.belongsTo || "Thuộc"}: {sectionData?.name || dict.generalSection || "Mục chung"}</span>

            <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-col sm:flex-row">
              {formattedOpenTime && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">{sq.opensAt || "Mở từ"} {formattedOpenTime}</span>
                </div>
              )}

              {formattedCloseTime && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="shrink-0 text-red-500 dark:text-red-400" />
                  <span className="text-red-600 dark:text-red-400">{dict.closesAtMeta ? dict.closesAtMeta.replace("{{date}}", formattedCloseTime) : `Đóng lúc ${formattedCloseTime}`}</span>
                </div>
              )}
            </div>

            <div className='flex items-center gap-4'>
              {hasTimeLimit && (
                <div className="flex items-center gap-1.5">
                  <Timer size={14} className="text-red-500 dark:text-red-400 shrink-0" />
                  <span>{cg.minsLabel ? cg.minsLabel.replace("{{mins}}", quizData.timeLimitMinutes) : `${quizData.timeLimitMinutes} phút`}</span>
                </div>
              )}

              {questionCount !== null && (
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-500 dark:text-blue-400 shrink-0" />
                  <span>{cg.questionsLabel ? cg.questionsLabel.replace("{{count}}", questionCount) : `${questionCount} câu hỏi`}</span>
                </div>
              )}
            </div>
          </div>

          {description && (
            <div
              className="text-[#5B403C] dark:text-gray-300 text-sm mb-6 whitespace-pre-wrap assignment-description-html"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </FluentCard>

        {/* Quiz Actions & Results */}
        <FluentCard className="p-4 sm:p-6 mb-6 bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-semibold text-[#1A1A1A] dark:text-white">
                {sq.quizStatus || "Trạng thái làm bài"}
              </h2>

              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <div className="flex flex-col p-3 bg-gray-50 dark:bg-[#222222] rounded-xl border border-gray-100 dark:border-[#3F3F3F]">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{sq.attemptCountLabel || "Số lần làm lại"}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {hasRemainingAttempts && Number.isFinite(remainingAttemptsNum)
                      ? (hasMaxAttempts ? (sq.attemptsLeftMeta ? sq.attemptsLeftMeta.replace("{{rem}}", remainingAttemptsNum).replace("{{max}}", maxAttemptsNum) : `Còn ${remainingAttemptsNum} / ${maxAttemptsNum} lần`) : remainingAttemptsNum)
                      : (!hasRemainingAttempts ? (sq.outOfAttempts || "0 (Hết lượt)") : (sq.unlimitedAttempts || "Không giới hạn"))
                    }
                  </span>
                </div>

                {showGrading && (
                  <div className="flex flex-col p-3 bg-[#faf0f1] dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/40">
                    <span className="text-xs font-semibold text-[#c8402e]/70 dark:text-[#FF6B6B]/70 uppercase tracking-wider mb-1">{sq.highestScore || "Điểm số cao nhất"}</span>
                    <div className="flex items-end gap-1">
                      <span className="text-lg font-black text-[#c8402e] dark:text-[#FF6B6B] leading-none">{score}</span>
                      <span className="text-xs font-bold text-[#c8402e]/60 dark:text-[#FF6B6B]/60 mb-0.5">/ 10</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {isDone && (
                <PillButton
                  variant='outline'
                  borderColor={"#1A1C1C"}
                  textColor={"#1A1C1C"}
                  roundedClass='rounded-xl'
                  onClick={() => handleTakeQuiz("result")}
                  startIcon={<Eye size={16} />}
                  className="w-full sm:w-auto"
                >
                  {cg.seeQuizResultBtn || "Xem kết quả"}
                </PillButton>
              )}

              {(!isDone || hasRemainingAttempts) && (!isExpired) && (
                <PillButton
                  onClick={handleTakeQuiz}
                  roundedClass='rounded-xl'
                  startIcon={isDone ? <RefreshCcw size={16} /> : <Play size={16} />}
                  className="w-full sm:w-auto"
                >
                  {isDone ? (cg.retakeQuizBtn || "Làm lại bài") : (cg.startQuizBtn || "Làm bài")}
                </PillButton>
              )}

              {isExpired && !hasRemainingAttempts && !isDone && (
                <span className="text-sm font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900/40">
                  {sq.cannotTakeQuiz || "Không thể làm bài"}
                </span>
              )}
            </div>
          </div>
        </FluentCard>
      </div>
    </div>
  )
}

export default QuizDetailView
