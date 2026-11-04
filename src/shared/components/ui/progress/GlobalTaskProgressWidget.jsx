import React, { useState, useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ListTodo,
  X,
} from "lucide-react"
import { useGlobalTask } from "@/shared/hooks/useGlobalTask.jsx"
import { useGlobalTaskProgress } from "@/shared/hooks/useGlobalTaskProgress.jsx"
import { useSelector } from "react-redux"
import { selectCurrentToken } from "@/store/slices/authSlice"
import IconButton from "@/shared/components/ui/buttons/IconButton"

// Clean helper function to format task title in user language
const getTaskTitleText = (task, t) => {
  const rawTitle = task.title || ""
  const taskId = task.id || ""
  const taskType = task.taskType || ""
  const lowerTitle = rawTitle.toLowerCase()
  const lowerType = taskType.toLowerCase()

  // 1. Reel upload task
  if (
    taskId.startsWith("reel-upload-") ||
    taskType === "ReelUpload" ||
    lowerType.includes("reel") ||
    lowerTitle.includes("reel")
  ) {
    return t?.catSpeak?.reels?.createReelTitle || "Đăng Reel mới"
  }

  // 2. Instructor application submission task
  if (
    taskId.includes("instructor") ||
    lowerTitle.includes("instructor") ||
    lowerTitle.includes("giảng viên") ||
    lowerTitle.includes("hồ sơ")
  ) {
    return t?.uploadWidget?.instructorTaskTitle || "Gửi hồ sơ giảng viên"
  }

  // 3. Recording processing task
  if (
    taskId.includes("rec") ||
    task.isRecording ||
    lowerTitle.includes("record") ||
    lowerTitle.includes("ghi hình") ||
    lowerTitle.includes("bản ghi")
  ) {
    return t?.uploadWidget?.recordingTaskTitle || "Đang xử lý bản ghi hình"
  }

  return rawTitle || "Tác vụ hệ thống"
}

// Clean helper function to format status text
const getTaskStatusText = (task, displayProgress, t) => {
  const { status, error } = task
  const pct = Math.floor(displayProgress)

  if (status === "SUCCESS") return t?.uploadWidget?.success || "Hoàn tất"
  if (status === "ERROR") return error || t?.uploadWidget?.error || "Lỗi tác vụ"

  const template =
    status === "PROCESSING"
      ? t?.uploadWidget?.processing || "Đang xử lý... {{progress}}%"
      : t?.uploadWidget?.uploading || "Đang tiến hành... {{progress}}%"

  return template.replace("{{progress}}", pct)
}

const TaskItem = ({ task, onRemove }) => {
  const { t } = useLanguage()
  const [prevProgress, setPrevProgress] = useState(task.progress)
  const [displayProgress, setDisplayProgress] = useState(task.progress)

  if (task.progress !== prevProgress) {
    setPrevProgress(task.progress)
    setDisplayProgress(task.progress)
  }

  const isSuccess = task.status === "SUCCESS"
  const isError = task.status === "ERROR"
  const isDone = isSuccess || isError

  // Auto remove success/error items after 5 seconds
  useEffect(() => {
    if (isDone) {
      const timer = setTimeout(() => {
        onRemove(task.id)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isDone, task.id, onRemove])

  return (
    <div className="flex flex-col justify-between px-4 py-2.5 min-h-[72px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="flex-shrink-0">
            {isSuccess ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : isError ? (
              <AlertCircle className="w-6 h-6 text-red-500" />
            ) : (
              <Loader2 className="w-6 h-6 text-cath-red-700 dark:text-red-400 animate-spin" />
            )}
          </div>

          <div className="flex flex-col truncate">
            <span className="text-base text-gray-900 dark:text-white truncate">
              {getTaskTitleText(task, t)}
            </span>
            <span className="text-sm text-gray-500 dark:text-[#AAAAAA] truncate">
              {getTaskStatusText(task, displayProgress, t)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-gray-200 dark:bg-[#272727] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${isSuccess ? "bg-green-500" : isError ? "bg-red-500" : "bg-cath-red-700"}`}
        />
      </div>
    </div>
  )
}

export const GlobalTaskProgressWidget = () => {
  const token = useSelector(selectCurrentToken)
  useGlobalTaskProgress()
  const { tasks, removeTask } = useGlobalTask()
  const { t } = useLanguage()
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [lastTaskCount, setLastTaskCount] = useState(0)

  const visibleTasks = tasks ? tasks.filter((t) => !t.isHidden) : []

  // Auto re-show when a new task is added after the user dismissed the widget.
  if (visibleTasks.length !== lastTaskCount) {
    if (visibleTasks.length > lastTaskCount) {
      setIsDismissed(false)
      setIsMinimized(false)
    }
    setLastTaskCount(visibleTasks.length)
  }

  // If user is not logged in, dismissed, or there are no visible tasks, don't show the widget
  const isVisible = Boolean(token && !isDismissed && visibleTasks.length > 0)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="global-task-progress-widget"
          transition={{ duration: 0.25, ease: "easeInOut" }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        className="fixed z-[9999] bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] rounded-xl shadow-2xl border border-border dark:border-[#3F3F3F] backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 h-[56px] pl-4 pr-1 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border-b border-border dark:border-[#3F3F3F]">
          <div
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center cursor-pointer flex-1 min-w-0"
          >
            <span className="font-semibold text-gray-900 dark:text-white text-base">
              {t?.uploadWidget?.itemsCount?.replace(
                "{{count}}",
                visibleTasks.length,
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              title={
                isMinimized
                  ? t?.uploadWidget?.expand || "Mở rộng"
                  : t?.uploadWidget?.collapse || "Thu gọn"
              }
              aria-label={
                isMinimized
                  ? t?.uploadWidget?.expand || "Mở rộng"
                  : t?.uploadWidget?.collapse || "Thu gọn"
              }
            >
              {isMinimized ? <ChevronUp /> : <ChevronDown />}
            </IconButton>
            <IconButton
              variant="ghost"
              onClick={() => setIsDismissed(true)}
              title={t?.uploadWidget?.close || "Đóng"}
              aria-label={t?.uploadWidget?.close || "Đóng"}
              innerClassName="hover:!text-red-500 dark:hover:!text-red-400"
            >
              <X />
            </IconButton>
          </div>
        </div>

        {/* Task List */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600">
                {visibleTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onRemove={removeTask} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GlobalTaskProgressWidget
