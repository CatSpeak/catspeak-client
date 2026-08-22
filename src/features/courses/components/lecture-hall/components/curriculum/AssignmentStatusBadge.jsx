import React from 'react';
import { useLanguage } from "@/shared/context/LanguageContext";

const AssignmentStatusBadge = ({ status, isCompleted, submittedAt, deadline }) => {
  const { t } = useLanguage();
  const cg = t.courses?.grading || {};
  const cd = t.courses?.classDetail || {};

  const rawStatus = status || "pending";
  const normalizedStatus = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : "pending";
  
  const isDone = ["completed", "submitted", "graded", "late", "returned"].includes(normalizedStatus) || isCompleted;

  if (!isDone && normalizedStatus !== "late" && normalizedStatus !== "returned") {
    return (
      <span className="bg-red-50 text-red-700 text-[10px] font-extrabold px-2.5 py-1 rounded border border-red-100 uppercase tracking-wide whitespace-nowrap">
        {cd.statusNotSubmitted || "Chưa nộp"}
      </span>
    );
  }

  let displayStatus = normalizedStatus;
  if (normalizedStatus === "graded" || normalizedStatus === "submitted" || normalizedStatus === "completed" || isCompleted) {
    const submittedAtMs = submittedAt ? new Date(submittedAt).getTime() : 0;
    const dueAtMs = deadline ? new Date(deadline).getTime() : 0;
    const isSubmissionLate = submittedAtMs > 0 && dueAtMs > 0 ? submittedAtMs > dueAtMs : false;
    displayStatus = isSubmissionLate ? "late" : "submitted";
  }

  if (displayStatus === "returned") {
    return (
      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wide whitespace-nowrap">
        {cg.filterReturned || "Đã trả điểm"}
      </span>
    );
  }
  
  if (displayStatus === "late") {
    return (
      <span className="bg-red-50 text-red-700 text-[10px] font-extrabold px-2.5 py-1 rounded border border-red-100 uppercase tracking-wide whitespace-nowrap">
        {cg.filterLate || "Nộp muộn"}
      </span>
    );
  }
  
  return (
    <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded border border-blue-100 uppercase tracking-wide whitespace-nowrap">
      {cd.statusNeedsGrading || "Đã nộp"}
    </span>
  );
};

export default AssignmentStatusBadge;
