import { BookOpen, CalendarClock, PenSquare, CheckCircle2, RotateCw } from "lucide-react"

const replaceVars = (text, m) => {
  if (!text) return text;
  return text
    .replace(/{className}/g, m.className || "Không rõ")
    .replace(/{assignmentName}/g, m.assignmentName || "Không rõ")
    .replace(/{quizName}/g, m.quizName || "Không rõ");
}

const getLoc = (t) => t.courses?.notifications || t.courses?.lectureHall?.notifications;

export const NOTIFICATION_TYPES = {
  class_update: {
    icon: BookOpen, color: "text-blue-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.class_update?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.class_update?.body, m),
    resolveUrl: (m) => `/classes/${m.classId}`,
  },
  schedule_change: {
    icon: CalendarClock, color: "text-orange-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.schedule_change?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.schedule_change?.body, m),
    resolveUrl: (m) => `/classes/${m.classId}`,
  },
  assignment_new: {
    icon: PenSquare, color: "text-emerald-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.assignment_new?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.assignment_new?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
    resolveUrl: (m) => `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  assignment_update: {
    icon: CalendarClock, color: "text-blue-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.assignment_update?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.assignment_update?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
    resolveUrl: (m) => `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  assignment_graded: {
    icon: CheckCircle2, color: "text-purple-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.assignment_graded?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.assignment_graded?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
    resolveUrl: (m) => `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  assignment_regraded: {
    icon: RotateCw, color: "text-orange-600",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.assignment_regraded?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.assignment_regraded?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
    resolveUrl: (m) => `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  quiz_regraded: {
    icon: RotateCw, color: "text-orange-600",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.quiz_regraded?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.quiz_regraded?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/quizzes/${m.quizId}`,
    resolveUrl: (m) => `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  quiz_new: {
    icon: RotateCw, color: "text-orange-600",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.quiz_new?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.quiz_new?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/quizzes/${m.quizId}`,
    resolveUrl: (m) => `/workspace/courses/class/${m.classId}/quiz/${m.quizId}/take`,
  },
  quiz_update: {
    icon: RotateCw, color: "text-orange-600",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.quiz_update?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.quiz_update?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/quizzes/${m.quizId}`,
    resolveUrl: (m) => `/workspace/courses/class/${m.classId}/quiz/${m.quizId}/take`,
  },
}

export function resolveNotification(notif, t) {
  const cfg = NOTIFICATION_TYPES[notif.type]
  if (!cfg) return { ...notif, resolvedTitle: notif.title, resolvedBody: notif.body, resolvedUrl: notif.actionUrl }

  const meta = notif.metadata || {}
  const resolvedTitle = cfg.resolveTitle(meta, t);
  const resolvedBody = cfg.resolveBody(meta, t);
  return {
    ...notif,
    resolvedTitle: resolvedTitle || notif.title,
    resolvedBody: resolvedBody || notif.body,
    resolvedUrl: cfg.resolveUrl(meta) || notif.actionUrl,
    icon: cfg.icon,
    color: cfg.color,
  }
}

export function getNotificationType(type) {
  return NOTIFICATION_TYPES[type] || { icon: null, label: "", color: "text-blue-500" }
}
