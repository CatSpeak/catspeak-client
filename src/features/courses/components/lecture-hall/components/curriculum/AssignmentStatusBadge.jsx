import React, { useState } from 'react';
import { useLanguage } from "@/shared/context/LanguageContext";
import { getSubmissionStatus, getAssignmentTimeline } from "@/features/courses/utils/assignmentUtils";

const AssignmentStatusBadge = ({ assignment, submission: propSubmission, isCompleted }) => {
  const { t } = useLanguage();
  const cg = t.courses?.grading || {};
  const cd = t.courses?.classDetail || {};
  const [nowMs] = useState(() => Date.now());

  const submission = propSubmission || assignment?.studentSubmission || assignment?.mySubmission || assignment?.submission || null;
  const submissionStatus = getSubmissionStatus(submission);

  const submittedAtMs = submission?.submittedAt ? new Date(submission.submittedAt).getTime() : 0;
  const dueAtMs = assignment?.dueDate ? new Date(assignment.dueDate).getTime() : 0;
  const isSubmissionLate = submittedAtMs > 0 && dueAtMs > 0 ? submittedAtMs > dueAtMs : false;

  const displayStatus = submissionStatus === "graded"
    ? (isSubmissionLate ? "late" : "submitted")
    : submissionStatus;

  const { isExpired } = getAssignmentTimeline(assignment || {}, nowMs);

  if (displayStatus === "not_submitted") {
    if (isCompleted) {
      return (
        <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900/40 uppercase tracking-wider whitespace-nowrap">
          {cd.statusNeedsGrading || "Đã nộp"}
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="bg-red-50 dark:bg-red-950/30 text-red-655 dark:text-red-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900/40 uppercase tracking-wider whitespace-nowrap">
          {cg.badgeExpired || "Hết hạn"}
        </span>
      );
    }
    return (
      <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/40 uppercase tracking-wider whitespace-nowrap">
        {cd.statusNotSubmitted || "Chưa nộp"}
      </span>
    );
  }

  if (displayStatus === "submitted" || displayStatus === "late") {
    return (
      <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900/40 uppercase tracking-wider whitespace-nowrap">
        {displayStatus === "late" ? (cg.filterLate || "Nộp muộn") : (cd.statusNeedsGrading || "Đã nộp")}
      </span>
    );
  }

  if (displayStatus === "returned") {
    return (
      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40 uppercase tracking-wider whitespace-nowrap">
        {cg.filterReturned || "Đã trả điểm"}
      </span>
    );
  }

  return (
    <span className="bg-gray-50 dark:bg-[#222222] text-gray-400 dark:text-gray-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-gray-200 dark:border-[#3F3F3F] uppercase tracking-wider whitespace-nowrap">
      {displayStatus || "—"}
    </span>
  );
};

export default AssignmentStatusBadge;
