import React, { useState, useEffect } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ListTodo,
} from "lucide-react";
import { useGlobalTask } from "@/shared/hooks/useGlobalTask.jsx";
import { useGlobalTaskProgress } from "@/shared/hooks/useGlobalTaskProgress.jsx";

// Clean helper function to format status text
const getTaskStatusText = (task, displayProgress, t) => {
  const { status, error, stepName } = task;
  const pct = Math.floor(displayProgress);

  if (status === "SUCCESS") return t?.uploadWidget?.success || "Hoàn tất";
  if (status === "ERROR") return error || t?.uploadWidget?.error || "Lỗi tác vụ";

  if (stepName) {
    const translatedStep = t?.uploadWidget?.[stepName];
    if (translatedStep) {
      return translatedStep.replace("{{progress}}", pct);
    }
    return `${stepName} (${pct}%)`;
  }

  const template =
    status === "PROCESSING"
      ? t?.uploadWidget?.processing || "Processing... {{progress}}%"
      : t?.uploadWidget?.uploading || "Uploading... {{progress}}%";

  return template.replace("{{progress}}", pct);
};

const TaskItem = ({ task, onRemove }) => {
  const { t } = useLanguage();
  const [displayProgress, setDisplayProgress] = useState(task.progress);

  useEffect(() => {
    setDisplayProgress(task.progress);
  }, [task.progress]);

  const isSuccess = task.status === "SUCCESS";
  const isError = task.status === "ERROR";
  const isDone = isSuccess || isError;

  // Auto remove success/error items after 5 seconds
  useEffect(() => {
    if (isDone) {
      const timer = setTimeout(() => {
        onRemove(task.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDone, task.id, onRemove]);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0">
            {isSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : isError ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-cath-red-700 animate-spin" />
            )}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium text-gray-900 truncate">
              {task.title}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {getTaskStatusText(task, displayProgress, t)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${isSuccess ? "bg-green-500" : isError ? "bg-red-500" : "bg-cath-red-700"}`}
        />
      </div>
    </div>
  );
};

export const GlobalTaskProgressWidget = () => {
  useGlobalTaskProgress();
  const { tasks, removeTask } = useGlobalTask();
  const { t } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(false);

  const visibleTasks = tasks ? tasks.filter((t) => !t.isHidden) : [];

  // If there are no visible tasks, don't show the widget
  if (visibleTasks.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed z-[9999] bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 w-auto sm:w-80 rounded-xl shadow-2xl border border-gray-100 backdrop-blur-xl bg-white/90 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-cath-red-700" />
            <span className="font-semibold text-gray-900 text-sm">
              {t?.uploadWidget?.itemsCount?.replace(
                "{{count}}",
                visibleTasks.length,
              )}
            </span>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            {isMinimized ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
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
              <div className="p-3 flex flex-col gap-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {visibleTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onRemove={removeTask}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalTaskProgressWidget;
