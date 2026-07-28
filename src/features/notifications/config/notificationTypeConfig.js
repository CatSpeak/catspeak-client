import { BookOpen, CalendarClock, PenSquare, CheckCircle2, RotateCw } from "lucide-react"

export const NOTIFICATION_TYPES = {
  class_update: {
    icon: BookOpen, color: "text-blue-500",
    resolveTitle: (m, t) => t.courses?.notifications?.class_update?.title,
    resolveBody: (m, t) => t.courses?.notifications?.class_update?.body?.replace("{className}", m.className),
    resolveUrl: (m) => `/classes/${m.classId}`,
  },
  schedule_change: {
    icon: CalendarClock, color: "text-orange-500",
    resolveTitle: (m, t) => t.courses?.notifications?.schedule_change?.title,
    resolveBody: (m, t) => t.courses?.notifications?.schedule_change?.body?.replace("{className}", m.className),
    resolveUrl: (m) => `/classes/${m.classId}`,
  },
  assignment_new: {
    icon: PenSquare, color: "text-emerald-500",
    resolveTitle: (m, t) => t.courses?.notifications?.assignment_new?.title,
    resolveBody: (m, t) => t.courses?.notifications?.assignment_new?.body?.replace("{assignmentName}", m.assignmentName),
    resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
  },
  assignment_graded: {
    icon: CheckCircle2, color: "text-purple-500",
    resolveTitle: (m, t) => t.courses?.notifications?.assignment_graded?.title,
    resolveBody: (m, t) => t.courses?.notifications?.assignment_graded?.body?.replace("{assignmentName}", m.assignmentName),
    resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
  },
  assignment_regraded: {
    icon: RotateCw, color: "text-orange-600",
    resolveTitle: (m, t) => t.courses?.notifications?.assignment_regraded?.title,
    resolveBody: (m, t) => t.courses?.notifications?.assignment_regraded?.body?.replace("{assignmentName}", m.assignmentName),
    resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
  },
  quiz_regraded: {
    icon: RotateCw, color: "text-orange-600",
    resolveTitle: (m, t) => t.courses?.notifications?.quiz_regraded?.title,
    resolveBody: (m, t) => t.courses?.notifications?.quiz_regraded?.body?.replace("{quizName}", m.quizName),
    resolveUrl: (m) => `/classes/${m.classId}/quizzes/${m.quizId}`,
  },
}

export function resolveNotification(notif, t) {
  const cfg = NOTIFICATION_TYPES[notif.type]
  if (!cfg) return { ...notif, resolvedTitle: notif.title, resolvedBody: notif.body, resolvedUrl: notif.actionUrl }

  const meta = notif.metadata || {}
  return {
    ...notif,
    resolvedTitle: cfg.resolveTitle(meta, t) || notif.title,
    resolvedBody: cfg.resolveBody(meta, t) || notif.body,
    resolvedUrl: cfg.resolveUrl(meta) || notif.actionUrl,
    icon: cfg.icon,
    color: cfg.color,
  }
}

export function getNotificationType(type) {
  return NOTIFICATION_TYPES[type] || { icon: null, label: "", color: "text-blue-500" }
}
