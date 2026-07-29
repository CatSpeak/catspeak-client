import {
  formatCurrencyVND,
  formatDateDayMonth,
  formatTime12h,
  formatUTCDate,
  getCourseGradientAndIcon,
} from "./courseUtils"
import { toLocalDateString } from "./dateUtils"

const SHORT_DATE_OPTIONS = { day: "2-digit", month: "short", year: "numeric" }
const NUMERIC_DATE_OPTIONS = { day: "2-digit", month: "2-digit", year: "numeric" }

const toNonNegativeNumber = (value) => {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

const toDisplayCount = (value) => toNonNegativeNumber(value) ?? "—"

const formatPrice = (value) => (
  toNonNegativeNumber(value) === null ? "TBA" : formatCurrencyVND(value)
)

export const getScheduleRange = (daysAhead = 180) => {
  const today = new Date()
  const future = new Date()
  future.setDate(today.getDate() + daysAhead)

  return {
    from: toLocalDateString(today),
    to: toLocalDateString(future),
  }
}

export const getProgressPercent = (progress) => {
  const completedSessions = toNonNegativeNumber(progress?.completedSessions)
  const totalSessions = toNonNegativeNumber(progress?.totalSessions)
  if (completedSessions === null || totalSessions === null || totalSessions === 0) {
    return null
  }
  return Math.min(100, Math.round((completedSessions / totalSessions) * 100))
}

export const filterByStatus = (list, statusFilter) => {
  if (!Array.isArray(list)) return []
  if (statusFilter === "all") return list
  return list.filter((item) => (
    String(item?.status || "").toLowerCase() === statusFilter
  ))
}

export const mapTeacherCourseSummary = (course, index) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)

  return {
    id: course.id,
    title: course.name || course.title,
    language: course.language || "",
    description: course.description || "",
    classCount: toDisplayCount(course.classCount),
    students: (() => {
      const studentCount = toNonNegativeNumber(
        course.studentCount ?? course.totalStudents
      )
      return studentCount === null
        ? "—"
        : `${studentCount} student${studentCount === 1 ? "" : "s"}`
    })(),
    createdAt: formatUTCDate(course.createdAt, "en-GB", SHORT_DATE_OPTIONS),
    status: course.status || "",
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
    courseId: cls.courseId,
    title: cls.name || cls.title,
    courseTitle: cls.courseName || cls.courseTitle || "N/A",
    language: cls.language || "",
    levels: Array.isArray(cls.levels) ? cls.levels : [],
    schedule: cls.schedule?.days?.join(" - ") || "TBA",
    time: cls.schedule?.startTime && cls.schedule?.endTime
      ? `${cls.schedule.startTime} - ${cls.schedule.endTime}`
      : "TBA",
    students: `${toDisplayCount(cls.studentCount ?? cls.enrolledStudents)} / ${toDisplayCount(cls.slots)} students`,
    slots: toNonNegativeNumber(cls.slots),
    progress,
    progressText: `${toDisplayCount(cls.progress?.completedSessions)}/${toDisplayCount(cls.progress?.totalSessions)}`,
    startDate: formatUTCDate(cls.startDate, "en-GB", SHORT_DATE_OPTIONS),
    endDate: formatUTCDate(cls.endDate, "en-GB", SHORT_DATE_OPTIONS),
    price: formatPrice(cls.tuitionFee),
    status: cls.status || "",
    icon,
    gradient,
    thumbnailUrl: cls.thumbnailUrl,
  }
}

export const mapCourseTableRow = (course, index, labels = {}) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)
  const classCount = toDisplayCount(course.classCount)
  const totalStudents = toDisplayCount(course.totalStudents ?? course.studentCount)
  const minimumPrice = toNonNegativeNumber(course.priceRange?.min)
  const maximumPrice = toNonNegativeNumber(course.priceRange?.max)

  return {
    id: course.id,
    title: course.title || course.name,
    classCount: (labels.classCount || "{{count}} classes").replace("{{count}}", classCount),
    students: (labels.studentsCount || "{{count}} students").replace("{{count}}", totalStudents),
    progress: getProgressPercent(course.progress),
    startDate: formatUTCDate(course.startDate, "en-GB", NUMERIC_DATE_OPTIONS),
    endDate: formatUTCDate(course.endDate, "en-GB", NUMERIC_DATE_OPTIONS),
    price: minimumPrice !== null && maximumPrice !== null
      ? `${formatCurrencyVND(minimumPrice)} - ${formatCurrencyVND(maximumPrice)}`
      : "TBA",
    status: course.status,
    icon,
    gradient,
    thumbnailUrl: course.thumbnailUrl,
  }
}

export const mapClassTableRow = (cls, index, labels = {}) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)
  const progress = getProgressPercent({
    completedSessions: cls.completedSessions ?? cls.progress?.completedSessions,
    totalSessions: cls.totalSessions ?? cls.progress?.totalSessions,
  })

  return {
    id: cls.id,
    courseTitle: cls.courseTitle || cls.courseName || "—",
    classTitle: cls.title || cls.name,
    status: cls.status,
    schedule: cls.schedule?.days?.join(", ") || "TBA",
    students: (labels.studentsRatio || "{{enrolled}} / {{slots}} students")
      .replace("{{enrolled}}", String(toDisplayCount(cls.enrolledStudents ?? cls.studentCount)))
      .replace("{{slots}}", String(toDisplayCount(cls.slots))),
    time: cls.schedule?.startTime && cls.schedule?.endTime
      ? `${cls.schedule.startTime} - ${cls.schedule.endTime}`
      : "TBA",
    progress,
    startDate: formatUTCDate(cls.startDate, "en-GB", NUMERIC_DATE_OPTIONS),
    endDate: formatUTCDate(cls.endDate, "en-GB", NUMERIC_DATE_OPTIONS),
    price: formatPrice(cls.tuitionFee),
    icon,
    gradient,
    thumbnailUrl: cls.thumbnailUrl,
  }
}

export const mapUpcomingSession = (session, index, classes = []) => {
  if (!session || typeof session !== "object" || Array.isArray(session)) {
    return null
  }
  const classId = session.class?.id?.toString() || ""
  if (!classId) return null
  const matchedClass = classes.find((cls) => String(cls.id) === classId)
  const rawSessionLanguage = session.class?.language
  const sessionLanguage = typeof rawSessionLanguage === "string"
    ? rawSessionLanguage.charAt(0) + rawSessionLanguage.slice(1).toLowerCase()
    : matchedClass?.language || ""

  return {
    id: `sess-${classId}-${session.sessionNumber || index}`,
    classId,
    title: session.class?.name || matchedClass?.title || matchedClass?.name || "Untitled Session",
    time: `${formatTime12h(session.startTime)} - ${formatTime12h(session.endTime)}`,
    date: formatDateDayMonth(session.date),
    status: session.class?.status || matchedClass?.status || "",
    language: sessionLanguage,
    levels: Array.isArray(matchedClass?.levels) ? matchedClass.levels : [],
    studentCount: toNonNegativeNumber(matchedClass?.studentCount),
  }
}

export const mapUpcomingSessions = (sessions = [], classes = [], limit = 3) => (
  (Array.isArray(sessions) ? sessions : [])
    .slice()
    .sort((left, right) => {
      const getStartTime = (session) => {
        const directTime = new Date(session?.startTime || "").getTime()
        if (Number.isFinite(directTime)) return directTime

        const date = String(session?.date || "").slice(0, 10)
        const time = String(session?.startTime || "").slice(0, 8)
        const combinedTime = new Date(`${date}T${time}`).getTime()
        return Number.isFinite(combinedTime)
          ? combinedTime
          : Number.POSITIVE_INFINITY
      }
      return getStartTime(left) - getStartTime(right)
    })
    .map((session, index) => mapUpcomingSession(
      session,
      index,
      Array.isArray(classes) ? classes : [],
    ))
    .filter(Boolean)
    .slice(0, limit)
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

export const mapTeachingTask = (task) => {
  if (!task || typeof task !== "object") return null
  const isQuiz = task.taskType === "QuizGrading" || Boolean(task.quizId)

  const pendingText = task.pendingCount
    ? `${task.pendingCount} pending`
    : ""
  const subtitleParts = [task.className, pendingText].filter(Boolean)
  const displayStatus = task.status || "Urgent"

  return {
    id: `${task.taskType || "task"}-${task.assignmentId || 0}-${task.quizId || 0}-${task.classId || 0}-${task.createdAt || ""}`,
    title: task.taskName || (isQuiz ? "Chấm bài kiểm tra" : "Chấm bài nộp"),
    subtitle: subtitleParts.join(" • "),
    status: displayStatus,
    badge: displayStatus,
    badgeClass: String(displayStatus).toLowerCase() === "urgent"
      ? "bg-[#FFE4E6] text-[#E11D48]"
      : String(displayStatus).toLowerCase() === "required"
        ? "bg-[#FEF3C7] text-[#D97706]"
        : "bg-[#E8F8F0] text-[#15803D]",
    iconColor: isQuiz ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600",
    taskType: task.taskType,
    assignmentId: task.assignmentId,
    quizId: task.quizId,
    classId: task.classId,
    courseId: task.courseId,
    rawTask: task,
  }
}
