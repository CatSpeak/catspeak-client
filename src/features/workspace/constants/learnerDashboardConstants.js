/**
 * Constants and Enumerations for Student Learning Dashboard
 * Aligned with SRS specifications (t.iu2fmqm1k59p) and CatSpeak design tokens
 */

export const PERIOD_PRESETS = {
  TODAY: "today",
  WEEK: "week",
  MONTH: "month",
  QUARTER: "quarter",
  YEAR: "year",
  ALL: "all",
}

export const TIME_GRANULARITY = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
}

export const STB_PRESETS = {
  TODAY: "today",
  WEEK: "week",
  MONTH: "month",
}

export const STB_THRESHOLDS = {
  EXCELLENT: 70, // >= 70% Green
  GOOD: 50,      // >= 50% Yellow
  // < 50% Red (Need to improve)
}

export const STB_STATUS = {
  EXCELLENT: {
    labelVi: "Xuất sắc",
    labelEn: "Excellent",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    color: "#059669",
  },
  GOOD: {
    labelVi: "Tốt",
    labelEn: "Good",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
    color: "#D97706",
  },
  NEEDS_IMPROVEMENT: {
    labelVi: "Cần cải thiện",
    labelEn: "Need to improve",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
    color: "#E11D48",
  },
}

export const ACTIVITY_TYPES = {
  ROOM_SESSION: "room_session",
  LESSON_COMPLETE: "lesson_complete",
  VIDEO_POST: "video_post",
  ARTICLE_POST: "article_post",
  CHALLENGE_JOIN: "challenge_join",
}

export const ALL_COURSES_FILTER_ID = "ALL_COURSES"
