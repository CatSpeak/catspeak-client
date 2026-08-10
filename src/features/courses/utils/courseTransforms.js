import {
  formatCurrencyVND,
  getCourseGradientAndIcon,
} from "./courseUtils"
import { toLocalDateString } from "./dateUtils"
import { formatScheduleDays } from "@/shared/utils/dateUtils"

const toNonNegativeNumber = (value) => {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

const toDisplayCount = (value) => toNonNegativeNumber(value) ?? "—"

const fillTemplate = (template, values) => (
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    String(template || ""),
  )
)

const formatPrice = (value, fallback = "") => (
  toNonNegativeNumber(value) === null ? fallback : formatCurrencyVND(value)
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

export const mapTeacherCourseSummary = (
  course,
  index,
  labels = {},
  formatDate = null,
) => {
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
        : fillTemplate(labels.studentsCount, { count: studentCount })
    })(),
    createdAt: formatDate ? (formatDate(course.createdAt) || labels.tba) : (labels.tba || "—"),
    status: course.status || "",
    icon,
    gradient,
    thumbnailUrl: course.thumbnailUrl,
  }
}

export const mapTeacherClassSummary = (
  cls,
  index,
  labels = {},
  formatDate = null,
  formatScheduleTime = null,
  formatScheduleDaysFunc = null,
) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)
  const progress = getProgressPercent(cls.progress)

  const startTimeStr = cls.schedule?.startTime
  const endTimeStr = cls.schedule?.endTime
  const startDateStr = cls.startDate

  const scheduleDaysText = formatScheduleDaysFunc
    ? formatScheduleDaysFunc(cls.schedule?.days, labels.tba, " - ", startTimeStr, startDateStr)
    : formatScheduleDays(cls.schedule?.days, labels.tba, " - ")

  const startFormatted = formatScheduleTime && startTimeStr
    ? formatScheduleTime(startTimeStr, startDateStr)
    : startTimeStr

  const endFormatted = formatScheduleTime && endTimeStr
    ? formatScheduleTime(endTimeStr, startDateStr)
    : endTimeStr

  return {
    id: cls.id,
    courseId: cls.courseId,
    title: cls.name || cls.title,
    courseTitle: cls.courseId
      ? (cls.courseName || cls.courseTitle || labels.notAvailable || "—")
      : null,
    language: cls.language || "",
    levels: Array.isArray(cls.levels) ? cls.levels : [],
    schedule: scheduleDaysText,
    time: startFormatted && endFormatted
      ? `${startFormatted} - ${endFormatted}`
      : labels.tba,
    students: fillTemplate(labels.studentsRatio, {
      enrolled: toDisplayCount(cls.studentCount ?? cls.enrolledStudents),
      slots: toDisplayCount(cls.slots),
    }),
    slots: toNonNegativeNumber(cls.slots),
    progress,
    progressText: `${toDisplayCount(cls.progress?.completedSessions)}/${toDisplayCount(cls.progress?.totalSessions)}`,
    startDate: (() => {
      const raw = cls.startDate || cls.enrollmentStart || cls.created_at || cls.createdAt
      const formatted = (formatDate && raw) ? formatDate(raw) : null
      return formatted || (cls.startDate ? cls.startDate : (labels.tba || "—"))
    })(),
    endDate: (() => {
      const raw = cls.endDate || cls.enrollmentEnd
      const formatted = (formatDate && raw) ? formatDate(raw) : null
      return formatted || (cls.endDate ? cls.endDate : (labels.tba || "—"))
    })(),
    price: formatPrice(cls.tuitionFee, labels.tba),
    status: cls.status || "",
    icon,
    gradient,
    thumbnailUrl: cls.thumbnailUrl,
  }
}

export const mapCourseTableRow = (
  course,
  index,
  labels = {},
  formatDate = null,
) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)
  const classCount = toDisplayCount(course.classCount)
  const totalStudents = toDisplayCount(course.totalStudents ?? course.studentCount)
  const minP = toNonNegativeNumber(course.priceRange?.min ?? course.price ?? course.tuitionFee)
  const maxP = toNonNegativeNumber(course.priceRange?.max ?? course.price ?? course.tuitionFee)

  const formattedPrice = (() => {
    if (minP !== null && maxP !== null) {
      return minP === maxP
        ? formatCurrencyVND(minP)
        : `${formatCurrencyVND(minP)} - ${formatCurrencyVND(maxP)}`
    }
    if (minP !== null) return formatCurrencyVND(minP)
    if (maxP !== null) return formatCurrencyVND(maxP)
    return labels.tba
  })()

  return {
    id: course.id,
    title: course.title || course.name,
    classCount: fillTemplate(labels.classCount, { count: classCount }),
    students: fillTemplate(labels.studentsCount, { count: totalStudents }),
    progress: getProgressPercent(course.progress),
    startDate: (() => {
      const raw = course.startDate || course.createdAt
      const formatted = (formatDate && raw) ? formatDate(raw) : null
      return formatted || (course.startDate ? course.startDate : (labels.tba || "—"))
    })(),
    endDate: (() => {
      const raw = course.endDate || course.enrollmentEnd
      const formatted = (formatDate && raw) ? formatDate(raw) : null
      return formatted || (course.endDate ? course.endDate : (labels.tba || "—"))
    })(),
    price: formattedPrice,
    status: course.status,
    icon,
    gradient,
    thumbnailUrl: course.thumbnailUrl,
  }
}

export const mapClassTableRow = (
  cls,
  index,
  labels = {},
  formatDate = null,
  formatScheduleTime = null,
  formatScheduleDaysFunc = null,
) => {
  const { gradient, icon } = getCourseGradientAndIcon(index)
  const progress = getProgressPercent({
    completedSessions: cls.completedSessions ?? cls.progress?.completedSessions,
    totalSessions: cls.totalSessions ?? cls.progress?.totalSessions,
  })

  const startTimeStr = cls.schedule?.startTime
  const endTimeStr = cls.schedule?.endTime
  const startDateStr = cls.startDate

  const scheduleDaysText = formatScheduleDaysFunc
    ? formatScheduleDaysFunc(cls.schedule?.days, labels.tba, " - ", startTimeStr, startDateStr)
    : formatScheduleDays(cls.schedule?.days, labels.tba, " - ")

  const startFormatted = formatScheduleTime && startTimeStr
    ? formatScheduleTime(startTimeStr, startDateStr)
    : startTimeStr

  const endFormatted = formatScheduleTime && endTimeStr
    ? formatScheduleTime(endTimeStr, startDateStr)
    : endTimeStr

  return {
    id: cls.id,
    courseTitle: cls.courseId
      ? (cls.courseTitle || cls.courseName || "—")
      : null,
    classTitle: cls.title || cls.name,
    status: cls.status,
    schedule: scheduleDaysText,
    students: fillTemplate(labels.studentsRatio, {
      enrolled: toDisplayCount(cls.enrolledStudents ?? cls.studentCount),
      slots: toDisplayCount(cls.slots),
    }),
    time: startFormatted && endFormatted
      ? `${startFormatted} - ${endFormatted}`
      : labels.tba,
    progress,
    startDate: (() => {
      const raw = cls.startDate || cls.enrollmentStart || cls.created_at || cls.createdAt
      const formatted = (formatDate && raw) ? formatDate(raw) : null
      return formatted || (cls.startDate ? cls.startDate : (labels.tba || "—"))
    })(),
    endDate: (() => {
      const raw = cls.endDate || cls.enrollmentEnd
      const formatted = (formatDate && raw) ? formatDate(raw) : null
      return formatted || (cls.endDate ? cls.endDate : (labels.tba || "—"))
    })(),
    price: formatPrice(cls.tuitionFee, labels.tba),
    icon,
    gradient,
    thumbnailUrl: cls.thumbnailUrl,
  }
}

export const mapUpcomingSession = (
  session,
  index,
  classes = [],
  formatDate = null,
  formatScheduleTime = null,
) => {
  if (!session || typeof session !== "object" || Array.isArray(session)) {
    return null
  }
  const classId = session.class?.id?.toString() || session.id?.toString() || ""
  if (!classId) return null
  const matchedClass = classes.find((cls) => String(cls.id) === classId)
  const rawSessionLanguage = session.class?.language || session.language
  const sessionLanguage = typeof rawSessionLanguage === "string"
    ? rawSessionLanguage.charAt(0) + rawSessionLanguage.slice(1).toLowerCase()
    : matchedClass?.language || ""

  const ns = session.nextSession || matchedClass?.nextSession || {}
  const schedObj = Array.isArray(session.schedule)
    ? session.schedule[0]
    : (Array.isArray(matchedClass?.schedule) ? matchedClass.schedule[0] : (session.schedule || matchedClass?.schedule))

  const fallbackStart = schedObj?.startTime || ns.startTime || session.startTime
  const fallbackEnd = schedObj?.endTime || ns.endTime || session.endTime
  const fallbackDate = ns.date || session.date || session.startDate || matchedClass?.startDate
  const sessionDate = typeof fallbackDate === "string" ? fallbackDate.split("T")[0] : null

  const startFormatted = formatScheduleTime
    ? formatScheduleTime(fallbackStart, sessionDate)
    : (fallbackStart || "—")
  const endFormatted = formatScheduleTime
    ? formatScheduleTime(fallbackEnd, sessionDate)
    : (fallbackEnd || "")

  const timeStr = startFormatted && endFormatted
    ? `${startFormatted} - ${endFormatted}`
    : (startFormatted || endFormatted || "—")

  const dateFormatted = formatDate
    ? formatDate(sessionDate || fallbackDate, "—", fallbackStart)
    : (fallbackDate || "—")

  return {
    id: `sess-${classId}-${session.sessionNumber || index}`,
    classId,
    title: session.class?.name || session.name || matchedClass?.title || matchedClass?.name || "—",
    time: timeStr,
    date: dateFormatted,
    status: session.class?.status || session.status || matchedClass?.status || "",
    language: sessionLanguage,
    levels: Array.isArray(session.levels) ? session.levels : (Array.isArray(matchedClass?.levels) ? matchedClass.levels : []),
    studentCount: toNonNegativeNumber(session.studentCount ?? matchedClass?.studentCount),
  }
}

export const mapUpcomingSessions = (
  sessions = [],
  classes = [],
  limit = 3,
  formatDate = null,
  formatScheduleTime = null,
) => (
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
      formatDate,
      formatScheduleTime,
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

export const mapTeachingTask = (task, labels = {}) => {
  if (!task || typeof task !== "object") return null
  const isQuiz = task.taskType === "QuizGrading" || Boolean(task.quizId)

  const pendingText = task.pendingCount
    ? fillTemplate(labels.pendingCount, { count: task.pendingCount })
    : ""
  const subtitleParts = [task.className, pendingText].filter(Boolean)
  const rawStatus = String(task.status || "urgent").trim()
  const normalizedStatus = rawStatus.toLowerCase()
  const displayStatus = normalizedStatus === "urgent"
    ? labels.urgent
    : normalizedStatus === "required"
      ? labels.required
      : labels.unknown

  return {
    id: `${task.taskType || "task"}-${task.assignmentId || 0}-${task.quizId || 0}-${task.classId || 0}-${task.createdAt || ""}`,
    title: task.taskName || (isQuiz ? labels.gradeQuiz : labels.gradeAssignment),
    subtitle: subtitleParts.join(" • "),
    status: displayStatus,
    badge: displayStatus,
    badgeClass: normalizedStatus === "urgent"
      ? "bg-[#FFE4E6] text-[#E11D48]"
      : normalizedStatus === "required"
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
