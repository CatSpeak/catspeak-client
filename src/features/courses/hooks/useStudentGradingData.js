import { useState, useMemo, useEffect } from "react";
import {
  useGetStudentAssignmentsQuery,
  useGetStudentQuizzesQuery,
} from "@/store/api/coursesApi";
import { getQuizListFromResponse } from "../utils/quizUtils";

const STUDENT_PAGE_SIZE = 9;

const getTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getArrayFromResponse = (response) => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : null;
};

const getDisplayableItems = (items) => {
  if (!Array.isArray(items)) return [];
  const seenIds = new Set();
  return items.filter((item) => {
    if (!item || typeof item !== "object" || item.id == null) return false;
    const id = String(item.id);
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });
};

export const useStudentGradingData = ({ classId, gradingT, filterT, formatDateTime }) => {
  const [activeTab, setActiveTab] = useState("all"); // all | pending | submitted | overdue
  const [activeType, setActiveType] = useState("all"); // all | assignment | quiz
  const [studentPage, setStudentPage] = useState(1);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timerId);
  }, []);

  // Fetch queries
  const {
    currentData: assignmentsData,
    isLoading: isAssignmentsInitialLoading,
    isFetching: isAssignmentsFetching,
  } = useGetStudentAssignmentsQuery({ classId }, { skip: !classId });

  const {
    currentData: quizzesData,
    isLoading: isQuizzesInitialLoading,
    isFetching: isQuizzesFetching,
  } = useGetStudentQuizzesQuery({ classId }, { skip: !classId });

  const isAssignmentsLoading =
    isAssignmentsInitialLoading ||
    (isAssignmentsFetching && assignmentsData === undefined);
  const isQuizzesLoading =
    isQuizzesInitialLoading ||
    (isQuizzesFetching && quizzesData === undefined);

  const isLoading = isAssignmentsLoading || isQuizzesLoading;

  const rawAssignments = useMemo(
    () => getArrayFromResponse(assignmentsData),
    [assignmentsData]
  );
  const rawQuizzes = useMemo(
    () => getQuizListFromResponse(quizzesData),
    [quizzesData]
  );

  const assignments = useMemo(
    () => getDisplayableItems(rawAssignments),
    [rawAssignments]
  );
  const quizzes = useMemo(() => getDisplayableItems(rawQuizzes), [rawQuizzes]);

  // Normalize items
  const normalizedItems = useMemo(() => {
    const items = [];

    const calculateTimeRemaining = (remainingMs) => {
      if (remainingMs <= 0) return "";
      const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
      const tabT = gradingT.studentTab;
      if (days > 0)
        return tabT.timeLeftDaysHours
          .replace("{{days}}", days)
          .replace("{{hours}}", hours);
      if (hours > 0) return tabT.timeLeftHours.replace("{{hours}}", hours);
      return tabT.timeLeftMins.replace(
        "{{mins}}",
        Math.floor((remainingMs / (1000 * 60)) % 60)
      );
    };

    assignments.forEach((assignment) => {
      const submission = assignment.studentSubmission ?? null;
      const subStatus = submission?.status?.toLowerCase();
      const dueDateMs = getTimestamp(assignment.dueDate);
      const remainingMs = dueDateMs - nowMs;
      const isExpired = dueDateMs > 0 && dueDateMs < nowMs;

      let status = "pending";
      let statusLabel = filterT.statusPending;
      let scoreText = null;
      let footerText = "";
      let actionText = gradingT.studentTab.startTask;

      if (subStatus) {
        const hasScore = submission?.grade != null;
        if (subStatus === "returned" || hasScore) {
          status = "returned";
          statusLabel = gradingT.studentTab.statusReturned;
          scoreText = hasScore ? String(submission.grade) : null;
          actionText = gradingT.viewGradeBtn;
        } else if (subStatus === "graded") {
          status = "graded";
          statusLabel = filterT.statusGraded;
          footerText = gradingT.studentTab.awaitingScore;
          actionText = gradingT.studentTab.viewDetails;
        } else if (subStatus === "submitted" || subStatus === "late") {
          status = subStatus;
          statusLabel = subStatus === "late" ? gradingT.filterLate : filterT.statusSubmitted;
          footerText = gradingT.studentTab.pendingGrading;
          actionText = gradingT.studentTab.viewDetails;
        }
      } else if (isExpired) {
        status = "overdue";
        statusLabel = filterT.statusOverdue;
        actionText = gradingT.studentTab.closed;
      }

      items.push({
        type: "assignment",
        id: assignment.id,
        raw: assignment,
        title: assignment.name || gradingT.untitledAssignment,
        duration: null,
        questionCount: null,
        dueDateMs,
        createdAtMs: getTimestamp(assignment.createdAt),
        status,
        statusLabel,
        timeRemainingText: status === "pending" ? calculateTimeRemaining(remainingMs) : "",
        deadlineText: assignment.dueDate
          ? gradingT.studentTab.deadline.replace(
            "{{date}}",
            formatDateTime(assignment.dueDate)
          )
          : "",
        scoreText,
        footerText,
        actionText,
      });
    });

    quizzes.forEach((quiz) => {
      const submission = quiz.studentSubmission ?? null;
      const subStatus =
        submission?.status?.toLowerCase() ||
        (typeof quiz.recordStatus === "string"
          ? quiz.recordStatus.toLowerCase()
          : null);
      const closeTimestamp = getTimestamp(quiz.closeTime);
      const remainingMs = closeTimestamp - nowMs;
      const isExpired = closeTimestamp > 0 && closeTimestamp < nowMs;

      let status = "pending";
      let statusLabel = filterT.statusPending;
      let scoreText = null;
      let footerText = "";
      let actionText = gradingT.studentTab.startTask;

      if (subStatus) {
        const hasScore = submission?.grade != null;
        if (subStatus === "returned" || hasScore) {
          status = "returned";
          statusLabel = gradingT.studentTab.statusReturned;
          scoreText = hasScore ? String(submission.grade) : null;
          actionText = gradingT.viewGradeBtn;
        } else if (subStatus === "graded") {
          status = "graded";
          statusLabel = filterT.statusGraded;
          footerText = gradingT.studentTab.awaitingScore;
          actionText = gradingT.studentTab.viewDetails;
        } else if (subStatus === "submitted" || subStatus === "late") {
          status = subStatus;
          statusLabel = subStatus === "late" ? gradingT.filterLate : filterT.statusSubmitted;
          footerText = gradingT.studentTab.pendingGrading;
          actionText = gradingT.studentTab.viewDetails;
        }
      } else if (isExpired) {
        status = "overdue";
        statusLabel = filterT.statusOverdue;
        actionText = gradingT.studentTab.closed;
      }

      items.push({
        type: "quiz",
        id: quiz.id,
        raw: quiz,
        title: quiz.name || gradingT.untitledQuiz,
        duration: quiz.timeLimitMinutes ?? "0",
        questionCount: quiz.totalQuestions ?? 0,
        dueDateMs: closeTimestamp,
        createdAtMs: getTimestamp(quiz.createdAt),
        status,
        statusLabel,
        timeRemainingText: status === "pending" ? calculateTimeRemaining(remainingMs) : "",
        deadlineText: quiz.closeTime
          ? gradingT.studentTab.deadline.replace(
            "{{date}}",
            formatDateTime(quiz.closeTime)
          )
          : "",
        scoreText,
        footerText,
        actionText,
      });
    });

    return items;
  }, [assignments, quizzes, nowMs, formatDateTime, filterT, gradingT]);

  // Filter items based on activeTab and activeType
  const filteredItems = useMemo(() => {
    return normalizedItems
      .filter((item) => {
        let matchStatus = false;
        if (activeTab === "all") matchStatus = true;
        else if (activeTab === "pending") matchStatus = item.status === "pending";
        else if (activeTab === "submitted")
          matchStatus = item.status === "submitted" || item.status === "late";
        else if (activeTab === "graded")
          matchStatus = item.status === "graded" || item.status === "returned";
        else if (activeTab === "overdue") matchStatus = item.status === "overdue";

        const matchType = activeType === "all" || item.type === activeType;
        return matchStatus && matchType;
      })
      .sort((a, b) => {
        const getStatusWeight = (status) => {
          if (status === "pending") return 1;
          if (status === "submitted" || status === "late") return 2;
          if (status === "graded" || status === "returned") return 3;
          if (status === "overdue") return 4;
          return 5;
        };

        const weightA = getStatusWeight(a.status);
        const weightB = getStatusWeight(b.status);

        if (weightA !== weightB) {
          return weightA - weightB;
        }

        if (a.status === "pending") {
          const dateA = a.dueDateMs > 0 ? a.dueDateMs : Infinity;
          const dateB = b.dueDateMs > 0 ? b.dueDateMs : Infinity;
          return dateA - dateB;
        } else {
          const dateA = a.dueDateMs > 0 ? a.dueDateMs : 0;
          const dateB = b.dueDateMs > 0 ? b.dueDateMs : 0;
          return dateB - dateA;
        }
      });
  }, [normalizedItems, activeTab, activeType]);

  // Pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / STUDENT_PAGE_SIZE));
  const activePage = Math.min(studentPage, totalPages);

  const visibleItems = useMemo(() => {
    const start = (activePage - 1) * STUDENT_PAGE_SIZE;
    return filteredItems.slice(start, start + STUDENT_PAGE_SIZE);
  }, [activePage, filteredItems]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStudentPage(1);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setStudentPage(1);
  };

  return {
    activeTab,
    activeType,
    studentPage,
    setStudentPage,
    handleTabChange,
    handleTypeChange,
    isLoading,
    normalizedItems,
    visibleItems,
    totalItems,
    totalPages,
    activePage,
    STUDENT_PAGE_SIZE,
  };
};
