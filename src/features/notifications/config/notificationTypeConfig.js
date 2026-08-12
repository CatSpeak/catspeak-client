import { BookOpen, CalendarClock, PenSquare, CheckCircle2, RotateCw, Megaphone, Zap, UserPlus, UserCheck, GraduationCap } from "lucide-react"

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
    icon: BookOpen,
    color: "text-blue-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.class_update?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.class_update?.body, m),
    resolveUrl: (m) => `/classes/${m.classId}`,
  },
  schedule_change: {
    icon: CalendarClock,
    color: "text-orange-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.schedule_change?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.schedule_change?.body, m),
    resolveUrl: (m) => `/classes/${m.classId}`,
  },
  assignment_new: {
    icon: PenSquare,
    color: "text-emerald-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.assignment_new?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.assignment_new?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
    resolveUrl: (m) =>
      `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  assignment_update: {
    icon: CalendarClock,
    color: "text-blue-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.assignment_update?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.assignment_update?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
    resolveUrl: (m) =>
      `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  assignment_graded: {
    icon: CheckCircle2,
    color: "text-purple-500",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.assignment_graded?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.assignment_graded?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
    resolveUrl: (m) =>
      `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  assignment_regraded: {
    icon: RotateCw,
    color: "text-orange-600",
    resolveTitle: (m, t) =>
      replaceVars(getLoc(t)?.assignment_regraded?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.assignment_regraded?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/assignments/${m.assignmentId}`,
    resolveUrl: (m) =>
      `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  quiz_regraded: {
    icon: RotateCw,
    color: "text-orange-600",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.quiz_regraded?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.quiz_regraded?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/quizzes/${m.quizId}`,
    resolveUrl: (m) =>
      `/workspace/learning/class/${m.classId}?tab=grading&assignmentId=${m.assignmentId}`,
  },
  quiz_new: {
    icon: RotateCw,
    color: "text-orange-600",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.quiz_new?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.quiz_new?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/quizzes/${m.quizId}`,
    resolveUrl: (m) =>
      `/workspace/courses/class/${m.classId}/quiz/${m.quizId}/take`,
  },
  quiz_update: {
    icon: RotateCw,
    color: "text-orange-600",
    resolveTitle: (m, t) => replaceVars(getLoc(t)?.quiz_update?.title, m),
    resolveBody: (m, t) => replaceVars(getLoc(t)?.quiz_update?.body, m),
    // resolveUrl: (m) => `/classes/${m.classId}/quizzes/${m.quizId}`,
    resolveUrl: (m) =>
      `/workspace/courses/class/${m.classId}/quiz/${m.quizId}/take`,
  },
  room_invite: {
    icon: CalendarClock,
    color: "text-blue-500",
    resolveTitle: (m, t) =>
      t.rooms?.notifications?.room_invite?.title || "Lời mời tham gia phòng",
    resolveBody: (m, t) => {
      const baseText =
        t.rooms?.notifications?.room_invite?.body?.replace(
          "{inviterName}",
          m.inviterName,
        ) || `${m.inviterName || "Ai đó"} đã mời bạn tham gia phòng họp`;
      return m.roomName ? `${baseText}: ${m.roomName}` : baseText;
    },
    resolveUrl: (m) => {
      const match = window?.location?.pathname?.match(/^\/([a-z]{2})(?:\/|$)/i);
      const lang = match ? match[1] : "vi";
      return `/${lang}/meet/${m.roomId}`;
    },
  },
  friend_request: {
    icon: UserPlus,
    color: "text-pink-500",
    resolveTitle: (m, t) =>
      t.profile?.notifications?.friend_request?.title || "Yêu cầu kết bạn mới",
    resolveBody: (m, t) => {
      const name = m.userName || "Ai đó";
      return (
        t.profile?.notifications?.friend_request?.body?.replace(
          "{requesterName}",
          name,
        ) || `${name} đã gửi cho bạn một lời mời kết bạn.`
      );
    },
    resolveUrl: (m) => (m.userid ? `/profile/${m.userid}?tab=friends` : null),
    resolveAvatarUrl: (m) => m.avatarUrl || null,
  },
  FriendRequest: {
    icon: UserPlus,
    color: "text-pink-500",
    resolveTitle: (m, t) =>
      t.profile?.notifications?.friend_request?.title || "Yêu cầu kết bạn mới",
    resolveBody: (m, t) => {
      const name = m.userName || "Ai đó";
      return (
        t.profile?.notifications?.friend_request?.body?.replace(
          "{requesterName}",
          name,
        ) || `${name} đã gửi cho bạn một lời mời kết bạn.`
      );
    },
    resolveUrl: (m) => (m.userid ? `/profile/${m.userid}?tab=friends` : null),
    resolveAvatarUrl: (m) => m.avatarUrl || null,
  },
  friend_request_accepted: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    resolveTitle: (m, t) => t.profile?.notifications?.friend_request_accepted?.title || "Lời mời kết bạn đã được chấp nhận",
    resolveBody: (m, t) => {
      const name = m.userName || m.responderName || m.ResponderName || m.senderName || m.SenderName || m.name || "Ai đó";
      const suffix = t.profile?.social?.friendRequestAccepted || "đã chấp nhận lời mời kết bạn của bạn";
      return `${name} ${suffix}`;
    },
    resolveUrl: (m) => {
      return `/profile/${m.userid || m.responderId || m.ResponderId || m.accountId || m.targetAccountId}?tab=friends`
    },
  },
  FriendRequestAccepted: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    resolveTitle: (m, t) => t.profile?.notifications?.friend_request_accepted?.title || "Lời mời kết bạn đã được chấp nhận",
    resolveBody: (m, t) => {
      const name = m.userName || m.responderName || m.ResponderName || m.senderName || m.SenderName || m.name || "Ai đó";
      const suffix = t.profile?.social?.friendRequestAccepted || "đã chấp nhận lời mời kết bạn của bạn";
      return `${name} ${suffix}`;
    },
    resolveUrl: (m) => {
      return `/profile/${m.userid || m.responderId || m.ResponderId || m.accountId || m.targetAccountId}?tab=friends`
    },
  },
  friend_request_declined: {
    icon: CalendarClock,
    color: "text-gray-500",
    resolveTitle: (m, t) => t.profile?.notifications?.friend_request_declined?.title || "Lời mời kết bạn bị từ chối",
    resolveBody: (m, t) => {
      const name = m.userName || m.responderName || m.ResponderName || m.senderName || m.SenderName || m.name || "Ai đó";
      const suffix = t.profile?.social?.friendRequestDeclined || "đã từ chối lời mời kết bạn của bạn";
      return `${name} ${suffix}`;
    },
    resolveUrl: (m) => {
      return `/profile/${m.userid || m.responderId || m.ResponderId || m.accountId || m.targetAccountId}`
    },
  },
  FriendRequestDeclined: {
    icon: CalendarClock,
    color: "text-gray-500",
    resolveTitle: (m, t) => t.profile?.notifications?.friend_request_declined?.title || "Lời mời kết bạn bị từ chối",
    resolveBody: (m, t) => {
      const name = m.userName || m.responderName || m.ResponderName || m.senderName || m.SenderName || m.name || "Ai đó";
      const suffix = t.profile?.social?.friendRequestDeclined || "đã từ chối lời mời kết bạn của bạn";
      return `${name} ${suffix}`;
    },
    resolveUrl: (m) => {
      return `/profile/${m.userid || m.responderId || m.ResponderId || m.accountId || m.targetAccountId}`
    },
  },
  new_post: {
    icon: Megaphone,
    color: "text-violet-500",
    resolveTitle: (m, t) =>
      t.notifications?.new_post?.title || "Bài viết mới từ CatSpeak",
    resolveBody: (m, t) =>
      t.notifications?.new_post?.body?.replace("{postTitle}", m.title) ||
      `${m.title ? `Có bài viết mới: "${m.title}"` : "Có bài viết mới vừa được đăng!"}`,
    resolveUrl: (m) => {
      const match = window?.location?.pathname?.match(/^\/([a-z]{2})(?:\/|$)/i);
      const lang = match ? match[1] : "vi";
      return m.slug
        ? `/${lang}/cat-speak/news/${m.slug}`
        : `/${lang}/cat-speak/news`;
    },
  },
  new_challenge: {
    icon: Zap,
    color: "text-amber-500",
    resolveTitle: (m, t) =>
      t.notifications?.new_challenge?.title || "Thử thách mới!",
    resolveBody: (m, t) =>
      t.notifications?.new_challenge?.body?.replace(
        "{challengeTitle}",
        m.name,
      ) ||
      `${m.name ? `Thử thách mới: "${m.name}"${m.hashtag ? ` (${m.hashtag})` : ""} đang chờ bạn!` : "Một thử thách từ vựng mới vừa được tạo!"}`,
    resolveUrl: (m) => {
      const match = window?.location?.pathname?.match(/^\/([a-z]{2})(?:\/|$)/i);
      const lang = match ? match[1] : "vi";
      return m.challengeId
        ? `/${lang}/cat-speak/reels?challenge=${m.challengeId}`
        : `/${lang}/cat-speak/reels`;
    },
  },
  instructor_profile_approved: {
    icon: GraduationCap,
    color: "text-emerald-500",
    resolveTitle: (m, t) =>
      t.notifications?.instructor_profile_approved?.title ||
      "Hồ sơ Giảng viên đã được phê duyệt",
    resolveBody: (m, t) =>
      t.notifications?.instructor_profile_approved?.body ||
      "Bạn có thể chuyển sang tài khoản Giáo viên ngay bây giờ.",
    resolveUrl: () => "/setting/instructor",
  },
}

export function resolveNotification(notif, t) {
  console.log(notif);
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
