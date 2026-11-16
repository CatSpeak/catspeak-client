import React, { useState } from 'react';
import { useLanguage } from "@/shared/context/LanguageContext";

const QuizStatusBadge = ({ quiz, isCompleted, closeTime }) => {
  const [nowMs] = useState(() => Date.now());
  const { t } = useLanguage();
  const cg = t.courses?.grading || {};

  let status = quiz?.studentSubmission?.status || quiz?.recordStatus;

  const rawStatus = status || "todo";
  const recordStatus = typeof rawStatus === "string" ? rawStatus.trim().toLowerCase() : rawStatus;

  const isDone = recordStatus === "completed" || recordStatus === "submitted" || recordStatus === "graded" || isCompleted;
  const isInProgress = recordStatus === "inprogress";

  if (isDone) {
    return (
      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap">
        {cg.quizStatusSubmitted || "Đã làm"}
      </span>
    );
  }

  if (isInProgress) {
    return (
      <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/40 text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
        {cg.quizStatusInProgress || "Đang làm"}
      </span>
    );
  }

  const closeTimeMs = closeTime ? new Date(closeTime).getTime() : 0;
  const isExpired = closeTimeMs > 0 && closeTimeMs < nowMs;

  if (isExpired) {
    return (
      <span className="bg-red-50 dark:bg-red-950/30 text-red-655 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900/40 text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap">
        {cg.badgeExpired || "Hết hạn"}
      </span>
    );
  }

  return (
    <span className="bg-red-50 dark:bg-red-950/30 text-red-655 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900/40 text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap">
      {cg.quizStatusToDo || "Chưa làm"}
    </span>
  );
};

export default QuizStatusBadge;
