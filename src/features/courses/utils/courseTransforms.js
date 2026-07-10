import {
  formatCurrencyVND,
  formatDateDayMonth,
  formatTime12h,
  formatUTCDate,
  getCourseGradientAndIcon,
} from "./courseUtils"

export const STUDENT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80",
]

const SHORT_DATE_OPTIONS = { day: "2-digit", month: "short", year: "numeric" }
const NUMERIC_DATE_OPTIONS = { day: "2-digit", month: "2-digit", year: "numeric" }

export const getScheduleRange = (daysAhead = 180) => {
  const today = new Date()
  const future = new Date()
  future.setDate(today.getDate() + daysAhead)

  return {
    from: today.toISOString().split("T")[0],
    to: future.toISOString().split("T")[0],
  }
}

export const getProgressPercent = (progress) => {
  if (!progress?.totalSessions) return 0
  return Math.round((progress.completedSessions / progress.totalSessions) * 100)
}

export const filterByStatus = (list, statusFilter) => {
  if (statusFilter === "all") return list
  return list.filter((item) => item.status?.toLowerCase() === statusFilter)
}

export const mapTeacherCourseSummary = (course, index) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)

  return {
    id: course.id,
    title: course.name || course.title,
    language: course.language || "English",
    description: course.description || "",
    classCount: course.classCount || 0,
    students: `${course.studentCount || course.totalStudents || 0} student${(course.studentCount || course.totalStudents || 0) !== 1 ? "s" : ""}`,
    createdAt: formatUTCDate(course.createdAt, "en-GB", SHORT_DATE_OPTIONS),
    status: course.status || "OPEN",
    icon,
    gradient,
    thumbnailUrl: course.thumbnailUrl,
  }
}

export const mapTeacherClassSummary = (cls, index) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)
  const progress = getProgressPercent(cls.progress)

  return {
    id: cls.id,
    title: cls.name || cls.title,
    courseTitle: cls.courseName || cls.courseTitle || "N/A",
    language: cls.language || "English",
    levels: cls.levels || [],
    schedule: cls.schedule?.days?.join(" - ") || "TBA",
    time: cls.schedule ? `${cls.schedule.startTime} - ${cls.schedule.endTime}` : "TBA",
    students: `${cls.studentCount || cls.enrolledStudents || 0} / ${cls.slots || 10} students`,
    slots: cls.slots || 0,
    progress,
    progressText: `${cls.progress?.completedSessions || 0}/${cls.progress?.totalSessions || 24}`,
    startDate: formatUTCDate(cls.startDate, "en-GB", SHORT_DATE_OPTIONS),
    endDate: formatUTCDate(cls.endDate, "en-GB", SHORT_DATE_OPTIONS),
    price: formatCurrencyVND(cls.tuitionFee),
    status: cls.status || "OPEN",
    icon,
    gradient,
    thumbnailUrl: cls.thumbnailUrl,
  }
}

export const mapCourseTableRow = (course, index, labels = {}) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)
  const classCount = course.classCount || 0
  const totalStudents = course.totalStudents || course.studentCount || 0

  return {
    id: course.id,
    title: course.title || course.name,
    classCount: (labels.classCount || "{{count}} classes").replace("{{count}}", classCount),
    students: (labels.studentsCount || "{{count}} students").replace("{{count}}", totalStudents),
    progress: course.status === "ARCHIVED" ? 100 : course.status === "OPEN" ? 0 : 54,
    startDate: formatUTCDate(course.startDate, "en-GB", NUMERIC_DATE_OPTIONS),
    endDate: formatUTCDate(course.endDate, "en-GB", NUMERIC_DATE_OPTIONS),
    price: `${formatCurrencyVND(course.priceRange?.min)} - ${formatCurrencyVND(course.priceRange?.max)}`,
    status: course.status,
    icon,
    gradient,
    thumbnailUrl: course.thumbnailUrl,
  }
}

export const mapClassTableRow = (cls, index, labels = {}) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)
  const progress = cls.totalSessions ? Math.round((cls.completedSessions / cls.totalSessions) * 100) : 0

  return {
    id: cls.id,
    courseTitle: cls.courseTitle || cls.courseName || "N/A",
    classTitle: cls.title || cls.name,
    status: cls.status,
    schedule: cls.schedule?.days?.join(", ") || "TBA",
    students: (labels.studentsRatio || "{{enrolled}} / {{slots}} students")
      .replace("{{enrolled}}", cls.enrolledStudents || cls.studentCount || 0)
      .replace("{{slots}}", cls.slots || 0),
    time: cls.schedule ? `${cls.schedule.startTime} - ${cls.schedule.endTime}` : "TBA",
    progress,
    startDate: formatUTCDate(cls.startDate, "en-GB", NUMERIC_DATE_OPTIONS),
    endDate: formatUTCDate(cls.endDate, "en-GB", NUMERIC_DATE_OPTIONS),
    price: formatCurrencyVND(cls.tuitionFee),
    icon,
    gradient,
    thumbnailUrl: cls.thumbnailUrl,
  }
}

export const mapUpcomingSession = (session, index, classes = []) => {
  const classId = session.class?.id?.toString() || ""
  const matchedClass = classes.find((cls) => String(cls.id) === classId)
  const sessionLanguage = session.class?.language
    ? session.class.language.charAt(0) + session.class.language.slice(1).toLowerCase()
    : matchedClass?.language || "English"

  return {
    id: `sess-${classId}-${session.sessionNumber || index}`,
    classId,
    title: session.class?.name || matchedClass?.title || matchedClass?.name || "Untitled Session",
    time: `${formatTime12h(session.startTime)} - ${formatTime12h(session.endTime)}`,
    date: formatDateDayMonth(session.date),
    status: session.class?.status || matchedClass?.status || "UPCOMING",
    language: sessionLanguage,
    levels: matchedClass?.levels || ["B2"],
    avatars: STUDENT_AVATARS,
    studentCount: matchedClass?.slots || matchedClass?.studentCount || 0,
  }
}

export const mapUpcomingSessions = (sessions = [], classes = [], limit = 3) => (
  sessions.slice(0, limit).map((session, index) => mapUpcomingSession(session, index, classes))
)

const matchesSearch = (item, query, keys) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return keys.some((key) => String(item[key] || "").toLowerCase().includes(normalizedQuery))
}

const matchesLevel = (item, levelFilter) => (
  levelFilter === "all" || item.levels?.includes(levelFilter)
)

const matchesLanguage = (item, langFilter) => (
  langFilter === "all" || String(item.language || "").toLowerCase() === langFilter.toLowerCase()
)

export const filterStudentCourses = (courses, filters) => (
  courses.filter((course) => (
    matchesSearch(course, filters.searchQuery, ["title", "description"]) &&
    matchesLevel(course, filters.levelFilter) &&
    matchesLanguage(course, filters.langFilter)
  ))
)

export const filterStudentClasses = (classes, filters) => (
  classes.filter((cls) => (
    matchesSearch(cls, filters.searchQuery, ["title", "courseName"]) &&
    matchesLevel(cls, filters.levelFilter) &&
    matchesLanguage(cls, filters.langFilter)
  ))
)
