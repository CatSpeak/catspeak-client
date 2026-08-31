import { baseApi } from "./baseApi"
import {
  buildQuizFormData,
  buildQuestionFormData,
} from "@/features/courses/utils/quizUtils"

// ─── Helpers for UTC to Local conversion ───────────────────────────────
const parseToLocalTimeStr = (isoString) => {
  if (!isoString) return ""
  // If it's already a simple time format like "18:00", return as-is
  if (/^\d{2}:\d{2}$/.test(isoString)) {
    return isoString
  }
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ""
  const hrs = String(date.getHours()).padStart(2, "0")
  const mins = String(date.getMinutes()).padStart(2, "0")
  return `${hrs}:${mins}`
}

const parseToLocalDateStr = (isoString) => {
  if (!isoString) return ""
  // If it's already a simple date like "2026-07-02", return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return isoString
  }
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ""
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const transformNextSession = (data) => {
  if (!data?.nextSession?.startTime) return null

  const startLocal = new Date(data.nextSession.startTime)
  if (isNaN(startLocal.getTime())) return null

  const endLocal = data.nextSession.endTime
    ? new Date(data.nextSession.endTime)
    : null
  const hasValidEnd = endLocal && !isNaN(endLocal.getTime())
  const formatTimeDigits = (dateObj) => {
    const hours = String(dateObj.getHours()).padStart(2, "0")
    const minutes = String(dateObj.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }

  return {
    ...data.nextSession,
    rawStartTime: data.nextSession.startTime,
    rawEndTime: data.nextSession.endTime,
    date: [
      startLocal.getFullYear(),
      String(startLocal.getMonth() + 1).padStart(2, "0"),
      String(startLocal.getDate()).padStart(2, "0"),
    ].join("-"),
    startTime: formatTimeDigits(startLocal),
    endTime: hasValidEnd ? formatTimeDigits(endLocal) : "",
    isLive: data.class?.status === "LIVE" || data.status === "LIVE",
  }
}

// ─── Transformers & Data Mappers ──────────────────────────────────────

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const toText = (value) => {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return ""
}

const toNullableNumber = (value, { nonNegative = false } = {}) => {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  if (!Number.isFinite(number) || (nonNegative && number < 0)) return null
  return number
}

const toTextList = (value) =>
  Array.isArray(value) ? value.map(toText).filter(Boolean) : []

const transformPerson = (person) => {
  if (!isRecord(person)) return null

  return {
    ...person,
    id: toText(person.id),
    accountId: toText(person.accountId),
    name: toText(person.name),
    fullName: toText(person.fullName),
    title: toText(person.title),
    introduction: toText(person.introduction),
    description: toText(person.description),
    avatar: toText(person.avatar),
    avatarUrl: toText(person.avatarUrl),
    avatarImageUrl: toText(person.avatarImageUrl),
  }
}

const transformTeachingProgress = (data) => {
  const source = isRecord(data?.teachingProgress) ? data.teachingProgress : {}
  const completed = toNullableNumber(
    source.completed ?? data?.completedSessions,
    { nonNegative: true },
  )
  const total = toNullableNumber(source.total ?? data?.totalSessions, {
    nonNegative: true,
  })
  const percentage = toNullableNumber(source.percentage, { nonNegative: true })

  return {
    completed,
    total,
    percentage:
      percentage === null
        ? completed !== null && total !== null && total > 0
          ? Math.min(100, Math.round((completed / total) * 100))
          : null
        : Math.min(100, percentage),
  }
}

const transformCourse = (course) => {
  if (!isRecord(course)) return null
  const id = toText(course.id)
  if (!id) return null
  const resolvedTitle =
    toText(course.name) || toText(course.title) || "Untitled Course"
  const resolvedStudents = toNullableNumber(
    course.studentCount ?? course.totalStudents,
    { nonNegative: true },
  )
  const teacher = transformPerson(course.teacher)
  const minPrice = toNullableNumber(course.minPrice ?? course.priceRange?.min, { nonNegative: true })
  const maxPrice = toNullableNumber(course.maxPrice ?? course.priceRange?.max, { nonNegative: true })
  const priceRange = (minPrice !== null || maxPrice !== null)
    ? { min: minPrice, max: maxPrice }
    : (isRecord(course.priceRange)
      ? {
        min: toNullableNumber(course.priceRange.min, { nonNegative: true }),
        max: toNullableNumber(course.priceRange.max, { nonNegative: true }),
      }
      : null)

  return {
    ...course,
    id,
    name: resolvedTitle,
    title: resolvedTitle,
    language: toText(course.language),
    levels: toTextList(course.levels),
    description: toText(course.description),
    totalSessions: toNullableNumber(course.totalSessions, {
      nonNegative: true,
    }),
    enrollmentStart: toText(course.enrollmentStart),
    enrollmentEnd: toText(course.enrollmentEnd),
    classCount: toNullableNumber(course.classCount, { nonNegative: true }),
    studentCount: resolvedStudents,
    totalStudents: resolvedStudents,
    status: toText(course.status),
    startDate: toText(course.startDate),
    endDate: toText(course.endDate),
    minPrice,
    maxPrice,
    priceRange,
    thumbnailUrl: toText(course.thumbnailUrl),
    createdAt: toText(course.createdAt),
    teacher,
    teacherId:
      teacher?.accountId ||
      toText(course.teacherId) ||
      toText(course.accountId),
  }
}

const transformClass = (cls) => {
  if (!isRecord(cls)) return null
  const id = toText(cls.id)
  if (!id) return null
  const courseId = toText(cls.courseId) || null
  const rawCourseTitle = toText(cls.courseName) || toText(cls.courseTitle)
  const resolvedCourseTitle = courseId
    ? rawCourseTitle || "Course"
    : rawCourseTitle || null
  const resolvedClassTitle =
    toText(cls.name) || toText(cls.title) || "Untitled Class"
  const resolvedStudentCount = toNullableNumber(
    cls.studentCount ?? cls.enrolledStudents,
    { nonNegative: true },
  )
  const progressSource = isRecord(cls.progress) ? cls.progress : {}
  const resolvedProgress = {
    ...progressSource,
    completedSessions: toNullableNumber(
      progressSource.completedSessions ?? cls.completedSessions,
      { nonNegative: true },
    ),
    totalSessions: toNullableNumber(
      progressSource.totalSessions ?? cls.totalSessions,
      { nonNegative: true },
    ),
    percentage: toNullableNumber(progressSource.percentage, {
      nonNegative: true,
    }),
  }
  if (resolvedProgress.percentage !== null) {
    resolvedProgress.percentage = Math.min(100, resolvedProgress.percentage)
  }
  const teacher = transformPerson(cls.teacher)
  const scheduleEntries = Array.isArray(cls.schedule)
    ? cls.schedule.filter(isRecord)
    : []
  const normalizedScheduleEntries = scheduleEntries.map((entry) => ({
    dayOfWeek: toText(entry.dayOfWeek),
    startTime: toText(entry.startTime),
    endTime: toText(entry.endTime),
  }))
  const firstSchedule = normalizedScheduleEntries[0]
  const nextSessionStart = parseToLocalTimeStr(
    toText(cls.nextSession?.startTime),
  )
  const nextSessionEnd = parseToLocalTimeStr(toText(cls.nextSession?.endTime))

  return {
    ...cls,
    id,
    courseId,
    courseName: resolvedCourseTitle,
    courseTitle: resolvedCourseTitle,
    name: resolvedClassTitle,
    title: resolvedClassTitle,
    language: toText(cls.language),
    levels: toTextList(cls.levels),
    description: toText(cls.description),
    progress: resolvedProgress,
    totalSessions: resolvedProgress.totalSessions,
    completedSessions: resolvedProgress.completedSessions,
    enrollmentStart: toText(cls.enrollmentStart),
    enrollmentEnd: toText(cls.enrollmentEnd),
    startDate: toText(cls.startDate),
    endDate: toText(cls.endDate),
    nextSession: isRecord(cls.nextSession) ? {
      ...cls.nextSession,
      rawStartTime: cls.nextSession.startTime,
      rawEndTime: cls.nextSession.endTime,
      startTime: nextSessionStart,
      endTime: nextSessionEnd,
    } : cls.nextSession,
    schedule:
      normalizedScheduleEntries.length > 0
        ? {
          days: normalizedScheduleEntries
            .map((entry) => entry.dayOfWeek)
            .filter(Boolean),
          startTime: parseToLocalTimeStr(firstSchedule?.startTime),
          endTime: parseToLocalTimeStr(firstSchedule?.endTime),
        }
        : isRecord(cls.nextSession)
          ? {
            days: [],
            startTime: nextSessionStart,
            endTime: nextSessionEnd,
          }
          : { days: [], startTime: "", endTime: "" },
    rawSchedule: normalizedScheduleEntries.map((entry) => ({
      dayOfWeek: entry.dayOfWeek,
      startTime: parseToLocalTimeStr(entry.startTime),
      endTime: parseToLocalTimeStr(entry.endTime),
    })),
    slots: toNullableNumber(cls.capacity ?? cls.slots, { nonNegative: true }),
    studentCount: resolvedStudentCount,
    enrolledStudents: resolvedStudentCount,
    tuitionFee: toNullableNumber(cls.price ?? cls.tuitionFee, {
      nonNegative: true,
    }),
    status: toText(cls.status),
    roomId: toText(cls.roomId),
    roomName: toText(cls.roomName),
    thumbnailUrl: toText(cls.thumbnailUrl),
    retentionDays: toNullableNumber(cls.retentionDays ?? cls.archiveRetentionDays, { nonNegative: true }),
    teacher,
    teacherId:
      teacher?.accountId || toText(cls.teacherId) || toText(cls.accountId),
  }
}

const transformExploreItem = (item) => {
  if (!isRecord(item)) return null
  const isClassItem = String(item?.type || "").toLowerCase() === "class"
  const title =
    toText(item.name) ||
    toText(item.title) ||
    (isClassItem ? "Untitled Class" : "Untitled Course")
  const teacher = transformPerson(item.teacher)

  return {
    ...item,
    id: toText(item.id),
    isClassItem,
    type: item.type,
    name: title,
    title,
    language: toText(item.language),
    levels: toTextList(item.levels),
    price: toNullableNumber(item.price, { nonNegative: true }),
    tuitionFee: toNullableNumber(item.price, { nonNegative: true }),
    priceMin: toNullableNumber(item.priceMin, { nonNegative: true }),
    priceMax: toNullableNumber(item.priceMax, { nonNegative: true }),
    priceRange:
      item.priceMin != null || item.priceMax != null
        ? {
          min: toNullableNumber(item.priceMin, { nonNegative: true }),
          max: toNullableNumber(item.priceMax, { nonNegative: true }),
        }
        : null,
    openClassCount: toNullableNumber(item.openClassCount, {
      nonNegative: true,
    }),
    studentCount: toNullableNumber(item.studentCount, { nonNegative: true }),
    remainingSlots: toNullableNumber(item.remainingSlots, {
      nonNegative: true,
    }),
    thumbnailUrl: toText(item.thumbnailUrl),
    createdAt: toText(item.createdAt),
    teacher: teacher
      ? {
        ...teacher,
        avatar: teacher.avatarImageUrl || teacher.avatar || teacher.avatarUrl,
      }
      : null,
  }
}

const transformPaginatedResponse = (response, itemTransformer) => {
  if (!response) {
    return {
      data: [],
      pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
    }
  }

  const outerRecord = isRecord(response) ? response : {}
  const responseData = Object.hasOwn(outerRecord, "data")
    ? outerRecord.data
    : response
  const responseRecord = isRecord(responseData) ? responseData : {}
  const rawItems = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseRecord.items)
      ? responseRecord.items
      : Array.isArray(responseRecord.data)
        ? responseRecord.data
        : []
  const data = rawItems.map(itemTransformer).filter(Boolean)
  const toPositiveInteger = (value, fallback) => {
    const number = Number(value)
    return Number.isFinite(number) && number > 0
      ? Math.floor(number)
      : fallback
  }
  const toNonNegativeInteger = (value, fallback) => {
    const number = Number(value)
    return Number.isFinite(number) && number >= 0
      ? Math.floor(number)
      : fallback
  }
  const page = toPositiveInteger(
    responseRecord.pagination?.page ??
    outerRecord.pagination?.page ??
    responseRecord.page ??
    outerRecord.page,
    1,
  )
  const pageSize = toPositiveInteger(
    responseRecord.pagination?.pageSize ??
    outerRecord.pagination?.pageSize ??
    responseRecord.pageSize ??
    outerRecord.pageSize,
    Math.max(1, rawItems.length || 10),
  )
  const totalItems = toNonNegativeInteger(
    responseRecord.pagination?.totalItems ??
    outerRecord.pagination?.totalItems ??
    responseRecord.pagination?.total ??
    outerRecord.pagination?.total ??
    responseRecord.totalCount ??
    outerRecord.totalCount ??
    responseRecord.total ??
    outerRecord.total,
    rawItems.length,
  )
  const totalPages = toPositiveInteger(
    responseRecord.pagination?.totalPages ??
    outerRecord.pagination?.totalPages ??
    responseRecord.totalPages ??
    outerRecord.totalPages,
    Math.max(1, Math.ceil(totalItems / pageSize)),
  )

  let adjustedTotalItems = totalItems
  let adjustedTotalPages = totalPages

  // Guard against backend bug where totalItems/totalPages does not account for status/search filter:
  if (page === 1 && rawItems.length < pageSize) {
    adjustedTotalItems = rawItems.length
    adjustedTotalPages = 1
  }

  return {
    data,
    pagination: { page, pageSize, totalItems: adjustedTotalItems, totalPages: adjustedTotalPages },
  }
}

const encodePathSegment = (value) => encodeURIComponent(String(value))
const getQuizListTagId = (classId) => `class:${String(classId)}:list`
const getQuizTagId = (classId, quizId) =>
  `class:${String(classId)}:quiz:${String(quizId)}`
const getQuizListInvalidationTags = (classId) => [
  { type: "Quizzes", id: getQuizListTagId(classId) },
  { type: "StudentQuizzes", id: getQuizListTagId(classId) },
]
const getQuizContentInvalidationTags = (classId, quizId) => [
  { type: "QuizDetail", id: getQuizTagId(classId, quizId) },
  ...getQuizListInvalidationTags(classId),
]

// ─── API Injector Slice ───────────────────────────────────────────────

const isFileValue = (value) =>
  typeof File !== "undefined" && value instanceof File

const appendFormValue = (formData, key, value) => {
  if (value === undefined || value === null || value === "") return

  if (isFileValue(value)) {
    formData.append(key, value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (item === undefined || item === null || item === "") return

      if (typeof item === "object" && !isFileValue(item)) {
        Object.entries(item).forEach(([nestedKey, nestedValue]) => {
          const camelKey =
            nestedKey.charAt(0).toLowerCase() + nestedKey.slice(1)
          const pascalKey =
            nestedKey.charAt(0).toUpperCase() + nestedKey.slice(1)

          appendFormValue(
            formData,
            `${key}[${index}].${camelKey}`,
            nestedValue,
          )
          if (camelKey !== pascalKey) {
            appendFormValue(
              formData,
              `${key}[${index}].${pascalKey}`,
              nestedValue,
            )
          }
        })
        return
      }

      appendFormValue(formData, `${key}[${index}]`, item)
      appendFormValue(formData, key, item)
    })
    return
  }

  if (typeof value === "object") {
    formData.append(key, JSON.stringify(value))
    return
  }

  formData.append(key, String(value))
}

const buildFormData = (fields) => {
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) =>
    appendFormValue(formData, key, value),
  )
  return formData
}

const buildCreateCourseFormData = (data) =>
  buildFormData({
    Name: data.title,
    Language: data.language ? data.language.toUpperCase() : "",
    Levels: Array.isArray(data.levels) ? data.levels : [],
    Description: data.description,
    Thumbnail: isFileValue(data.thumbnailUrl) ? data.thumbnailUrl : null,
  })

const buildUpdateCourseFormData = (data) =>
  buildFormData({
    Name: data.title,
    Language: data.language ? data.language.toUpperCase() : "",
    Levels: Array.isArray(data.levels) ? data.levels : [],
    Description: data.description,
    Thumbnail: isFileValue(data.thumbnailUrl) ? data.thumbnailUrl : null,
    ThumbnailUrl:
      typeof data.thumbnailUrl === "string" ? data.thumbnailUrl : null,
  })

const mapToStandardDayOfWeek = (day) => {
  if (!day) return null
  const dayStr = String(day).trim().toUpperCase()
  const mapping = {
    MON: "MON",
    TUE: "TUE",
    WED: "WED",
    THU: "THU",
    FRI: "FRI",
    SAT: "SAT",
    SUN: "SUN",
    MONDAY: "MON",
    TUESDAY: "TUE",
    WEDNESDAY: "WED",
    THURSDAY: "THU",
    FRIDAY: "FRI",
    SATURDAY: "SAT",
    SUNDAY: "SUN",
  }
  return mapping[dayStr] || null
}

const getClassSchedule = (data) => {
  if (Array.isArray(data.schedule)) {
    return data.schedule
      .map((scheduleEntry) => ({
        dayOfWeek: mapToStandardDayOfWeek(scheduleEntry?.dayOfWeek),
        startTime: scheduleEntry?.startTime || "",
        endTime: scheduleEntry?.endTime || "",
      }))
      .filter((scheduleEntry) => scheduleEntry.dayOfWeek)
  }

  return (Array.isArray(data.scheduleDays) ? data.scheduleDays : [])
    .map((day) => ({
      dayOfWeek: mapToStandardDayOfWeek(day),
      startTime: data.scheduleStartTime || "",
      endTime: data.scheduleEndTime || "",
    }))
    .filter((scheduleEntry) => scheduleEntry.dayOfWeek)
}

const parseIntegerOrNull = (value) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

const parseNumberOrNull = (value) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

const buildCreateClassFormData = (data) =>
  buildFormData({
    CourseId: parseIntegerOrNull(data.courseId),
    Name: data.title,
    Language: data.language ? data.language.toUpperCase() : "",
    Levels: data.levels || [],
    Description: data.description,
    TotalSessions:
      data.totalSessions === "" || data.totalSessions == null
        ? null
        : parseIntegerOrNull(data.totalSessions),
    EnrollmentStart: data.enrollmentStart || null,
    EnrollmentEnd: data.enrollmentEnd || null,
    StartDate: data.startDate || null,
    Capacity:
      data.slots === "" || data.slots == null
        ? null
        : parseIntegerOrNull(data.slots),
    Price:
      data.tuitionFee === "" || data.tuitionFee == null
        ? null
        : parseNumberOrNull(data.tuitionFee),
    Thumbnail: isFileValue(data.thumbnailUrl) ? data.thumbnailUrl : null,
    Schedule: getClassSchedule(data),
    CommissionPercent: parseNumberOrNull(data.commissionPercent),
    RetentionDays: parseIntegerOrNull(data.retentionDays ?? data.archiveRetentionDays),
    ArchiveRetentionDays: parseIntegerOrNull(data.retentionDays ?? data.archiveRetentionDays),
    Status: data.status || null,
    RequireMinimumAttendance: Boolean(data.requireMinimumAttendance ?? data.requireMinAttendance),
    MinimumAttendanceRate: (data.requireMinimumAttendance ?? data.requireMinAttendance)
      ? parseIntegerOrNull(data.minimumAttendanceRate ?? data.minAttendanceRate)
      : null,
    LateAttendancePolicy: data.lateAttendancePolicy ?? (data.includeLateAttendance === false ? "IgnoreLate" : "CountLate"),
  })

const buildAnalyticsQueryParams = (params = {}) => {
  const mapping = {
    groupBy: "GroupBy",
    GroupBy: "GroupBy",
    period: "Period",
    Period: "Period",
    compare: "Compare",
    Compare: "Compare",
    customStartDate: "CustomStartDate",
    CustomStartDate: "CustomStartDate",
    customEndDate: "CustomEndDate",
    CustomEndDate: "CustomEndDate",
    compareCustomStartDate: "CompareCustomStartDate",
    CompareCustomStartDate: "CompareCustomStartDate",
    compareCustomEndDate: "CompareCustomEndDate",
    CompareCustomEndDate: "CompareCustomEndDate",
    startDate: "StartDate",
    StartDate: "StartDate",
    endDate: "EndDate",
    EndDate: "EndDate",
    compareStartDate: "CompareStartDate",
    CompareStartDate: "CompareStartDate",
    compareEndDate: "CompareEndDate",
    CompareEndDate: "CompareEndDate",
    courseId: "CourseId",
    CourseId: "CourseId",
    classId: "ClassId",
    ClassId: "ClassId",
    includeStandaloneClasses: "IncludeStandaloneClasses",
    IncludeStandaloneClasses: "IncludeStandaloneClasses",
    page: "Page",
    Page: "Page",
    pageSize: "PageSize",
    PageSize: "PageSize",
    sortBy: "SortBy",
    SortBy: "SortBy",
    sortOrder: "SortOrder",
    SortOrder: "SortOrder",
  }

  const queryParams = {}
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      const targetKey = mapping[key] || key
      queryParams[targetKey] = val
    }
  })
  return queryParams
}

const buildDashboardQueryParams = (params = {}) => {
  const mapping = {
    periodType: "PeriodType",
    PeriodType: "PeriodType",
    fromDate: "FromDate",
    FromDate: "FromDate",
    toDate: "ToDate",
    ToDate: "ToDate",
    compareType: "CompareType",
    CompareType: "CompareType",
    courseId: "CourseId",
    CourseId: "CourseId",
    classId: "ClassId",
    ClassId: "ClassId",
  }

  const queryParams = {}
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      const targetKey = mapping[key] || key
      queryParams[targetKey] = val
    }
  })
  return queryParams
}

export const coursesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public Explore Endpoints
    getExploreCourses: builder.query({
      query: (params) => ({
        url: "/explore/courses",
        method: "GET",
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 24,
          search: params?.search ? params.search.trim() : undefined,
          sort:
            params?.sort && params.sort !== "default" ? params.sort : undefined,
          language:
            params?.language && params.language !== "all"
              ? params.language.toLowerCase() === "zh"
                ? "chinese"
                : params.language.toLowerCase() === "en"
                  ? "english"
                  : params.language.toLowerCase()
              : undefined,
          minPrice:
            params?.minPrice != null && !isNaN(Number(params.minPrice))
              ? Number(params.minPrice)
              : undefined,
          maxPrice:
            params?.maxPrice != null && !isNaN(Number(params.maxPrice))
              ? Number(params.maxPrice)
              : undefined,
          type:
            params?.type && params.type !== "all"
              ? params.type === "courses"
                ? "course"
                : params.type === "classes"
                  ? "class"
                  : String(params.type).toLowerCase()
              : undefined,
          enrollmentStatus:
            params?.enrollmentStatus &&
            params.enrollmentStatus !== "all"
              ? String(params.enrollmentStatus).toLowerCase()
              : undefined,
        },
        extraOptions: { skipAuthHeader: true },
      }),
      transformResponse: (response) =>
        transformPaginatedResponse(response, transformExploreItem),
      providesTags: ["ExploreCatalog"],
    }),

    // Student Endpoints
    getStudentAvailableCourses: builder.query({
      query: (params) => ({
        url: "/student/courses",
        method: "GET",
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 100,
          language: params?.language
            ? params.language.toUpperCase()
            : undefined,
          search: params?.search,
        },
      }),
      transformResponse: (response) => {
        return transformPaginatedResponse(response, transformCourse)
      },
      providesTags: ["StudentCourses"],
    }),

    getStudentAvailableClasses: builder.query({
      query: (params) => ({
        url: "/student/classes",
        method: "GET",
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 100,
          language: params?.language
            ? params.language.toUpperCase()
            : undefined,
          search: params?.search,
        },
      }),
      transformResponse: (response) =>
        transformPaginatedResponse(response, transformClass),
      providesTags: ["StudentClasses"],
    }),

    getStudentJoinedClasses: builder.query({
      async queryFn(params, queryApi, extraOptions, baseQuery) {
        const pageSize = params?.pageSize || 100
        const fetchPage = async (page) => {
          const result = await baseQuery(
            {
              url: "/student/classes/my-enrollments",
              method: "GET",
              params: { page, pageSize },
            },
            queryApi,
            extraOptions,
          )
          if (result.error) return result
          return {
            data: transformPaginatedResponse(result.data, transformClass),
          }
        }

        const firstPage = await fetchPage(
          params?.all === true ? 1 : params?.page || 1,
        )
        if (firstPage.error || params?.all !== true) return firstPage

        const totalPages = firstPage.data.pagination.totalPages
        if (totalPages > 100) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "The enrollment list is too large to aggregate safely.",
            },
          }
        }

        const items = [...firstPage.data.data]
        for (let page = 2; page <= totalPages; page += 1) {
          const nextPage = await fetchPage(page)
          if (nextPage.error) return nextPage
          items.push(...nextPage.data.data)
        }

        const uniqueItems = []
        const seenIds = new Set()
        items.forEach((item) => {
          const itemId = item?.id
          if (!itemId || seenIds.has(itemId)) return
          seenIds.add(itemId)
          uniqueItems.push(item)
        })

        return {
          data: {
            data: uniqueItems,
            pagination: {
              page: 1,
              pageSize: uniqueItems.length || pageSize,
              totalItems: uniqueItems.length,
              totalPages: 1,
            },
          },
        }
      },
      providesTags: ["StudentClasses"],
    }),

    getStudentCompletedClasses: builder.query({
      query: () => ({
        url: "/student/classes/completed",
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : []
        return {
          data: items.map((cls) => transformClass(cls)).filter(Boolean),
        }
      },
      providesTags: ["StudentClasses"],
    }),

    getExploreCourseDetail: builder.query({
      query: (id) => ({
        url: `/explore/courses/${encodePathSegment(id)}`,
        method: "GET",
        extraOptions: { skipAuthHeader: true },
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        if (!data || typeof data !== "object" || Array.isArray(data))
          return null
        const transformedCourse = transformCourse(data)
        if (!transformedCourse) return null
        const transformedClasses = Array.isArray(data.classes)
          ? data.classes
            .map((cls) => {
              const transformedClass = transformClass(cls)
              return transformedClass
                ? {
                  ...transformedClass,
                  isEnrolled: cls.isEnrolled === true,
                  enrolledCount: cls.enrolledCount ?? null,
                }
                : null
            })
            .filter(Boolean)
          : []
        const enrolledClass = transformedClasses.find((cls) => cls.isEnrolled)
        return {
          ...transformedCourse,
          enrolledClassId: enrolledClass?.id || null,
          enrolledClassName:
            enrolledClass?.name || enrolledClass?.title || null,
          classes: transformedClasses,
        }
      },
      providesTags: (result, error, id) => [
        { type: "CourseDetail", id: String(id) },
      ],
    }),

    getExploreClassDetail: builder.query({
      query: (id) => ({
        url: `/explore/classes/${encodePathSegment(id)}`,
        method: "GET",
        extraOptions: { skipAuthHeader: true },
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        if (!data || typeof data !== "object" || Array.isArray(data))
          return null
        const transformedClass = transformClass(data)
        if (!transformedClass) return null
        return {
          ...transformedClass,
          isEnrolled: data.isEnrolled === true,
          enrolledCount: data.enrolledCount ?? null,
          nextSession: transformNextSession(data),
          teachingProgress: transformTeachingProgress(data),
        }
      },
      providesTags: (result, error, id) => [
        { type: "ClassDetail", id: String(id) },
      ],
    }),

    getStudentCourseDetail: builder.query({
      query: (id) => ({
        url: `/student/courses/${encodePathSegment(id)}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        if (!data || typeof data !== "object" || Array.isArray(data))
          return null
        const transformedCourse = transformCourse(data)
        if (!transformedCourse) return null
        const transformedClasses = Array.isArray(data.classes)
          ? data.classes
            .map((cls) => {
              const transformedClass = transformClass(cls)
              return transformedClass
                ? {
                  ...transformedClass,
                  isEnrolled: cls.isEnrolled === true,
                  enrolledCount: cls.enrolledCount ?? null,
                }
                : null
            })
            .filter(Boolean)
          : []
        const enrolledClass = transformedClasses.find((cls) => cls.isEnrolled)
        return {
          ...transformedCourse,
          enrolledClassId: enrolledClass?.id || null,
          enrolledClassName:
            enrolledClass?.name || enrolledClass?.title || null,
          classes: transformedClasses,
        }
      },
      providesTags: (result, error, id) => [
        { type: "CourseDetail", id: String(id) },
      ],
    }),

    getStudentClassDetail: builder.query({
      query: (id) => ({
        url: `/student/classes/${encodePathSegment(id)}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        if (!data || typeof data !== "object" || Array.isArray(data))
          return null
        const transformedClass = transformClass(data)
        if (!transformedClass) return null
        return {
          ...transformedClass,
          isEnrolled: data.isEnrolled === true,
          enrolledCount: data.enrolledCount ?? null,
          nextSession: transformNextSession(data),
          teachingProgress: transformTeachingProgress(data),
        }
      },
      providesTags: (result, error, id) => [
        { type: "ClassDetail", id: String(id) },
      ],
    }),

    enrollInCourse: builder.mutation({
      async queryFn({ classId, confirmScheduleConflict }, _queryApi, _extraOptions, baseQuery) {
        const numericClassId = Number(classId)

        if (!Number.isSafeInteger(numericClassId) || numericClassId <= 0) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "A valid class ID is required to enroll.",
            },
          }
        }

        return baseQuery({
          url: "/v1/Payments/checkout",
          method: "POST",
          body: {
            paymentType: "ClassEnrollment",
            classId: numericClassId,
            pendingClassData: "",
            confirmScheduleConflict: confirmScheduleConflict === true,
            returnUrl:
              window.location.origin +
              `/workspace/learning/class/${encodePathSegment(numericClassId)}`,
            cancelUrl: window.location.origin + window.location.pathname,
            planId: 0,
          },
        })
      },
      invalidatesTags: (result, error, { classId, courseId }) => [
        "StudentCourses",
        "StudentClasses",
        { type: "ClassDetail", id: String(classId) },
        ...(courseId == null
          ? []
          : [{ type: "CourseDetail", id: String(courseId) }]),
      ],
    }),

    // 2. Get All Courses
    getAllCourses: builder.query({
      query: (params = {}) => ({
        url: "/teacher/courses",
        method: "GET",
        params: {
          language: params.language,
          status: params.status,
          search: params.search,
          page: params.page,
          pageSize: params.pageSize,
        },
      }),
      transformResponse: (response) =>
        transformPaginatedResponse(response, transformCourse),
      providesTags: ["Courses"],
    }),

    // 3. Get All Classes
    getAllClasses: builder.query({
      query: (params = {}) => ({
        url: "/teacher/classes",
        method: "GET",
        params: {
          courseId: params.courseId ? parseInt(params.courseId) : undefined,
          language: params.language,
          status: params.status,
          search: params.search,
          page: params.page,
          pageSize: params.pageSize,
        },
      }),
      transformResponse: (response) =>
        transformPaginatedResponse(response, transformClass),
      providesTags: ["Classes"],
    }),

    // 4. Get Course Detail
    getCourseDetail: builder.query({
      query: (id) => ({
        url: `/teacher/courses/${encodePathSegment(id)}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        if (!data || typeof data !== "object" || Array.isArray(data))
          return null
        const transformedCourse = transformCourse(data)
        if (!transformedCourse) return null
        return {
          ...transformedCourse,
          classes: Array.isArray(data.classes)
            ? data.classes.map(transformClass).filter(Boolean)
            : [],
        }
      },
      providesTags: (result, error, id) => [
        { type: "CourseDetail", id: String(id) },
      ],
    }),

    // 5. Get Class Detail
    getClassDetail: builder.query({
      query: (id) => ({
        url: `/teacher/classes/${encodePathSegment(id)}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        if (!data || typeof data !== "object" || Array.isArray(data))
          return null
        const transformedClass = transformClass(data)
        if (!transformedClass) return null

        const nextSession = transformNextSession(data)
        const teachingProgress = transformTeachingProgress(data)

        return {
          ...transformedClass,
          nextSession,
          teachingProgress,
        }
      },
      providesTags: (result, error, id) => [
        { type: "ClassDetail", id: String(id) },
      ],
    }),

    // 9. Create Course
    createCourse: builder.mutation({
      query: (data) => ({
        url: "/teacher/courses",
        method: "POST",
        body: buildCreateCourseFormData(data),
        formData: true,
      }),
      transformResponse: (response) =>
        transformCourse(response?.data || response),
      invalidatesTags: ["Courses"],
    }),

    // 9b. Update Course
    updateCourse: builder.mutation({
      query: ({ id, data }) => ({
        url: `/teacher/courses/${encodePathSegment(id)}`,
        method: "PUT",
        body: buildUpdateCourseFormData(data),
        formData: true,
      }),
      transformResponse: (response) =>
        transformCourse(response?.data || response),
      invalidatesTags: (result, error, { id }) => [
        { type: "CourseDetail", id: String(id) },
        "Courses",
      ],
    }),

    // 9c. Delete Course
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/teacher/courses/${encodePathSegment(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),

    // 10. Create Class via Payment Checkout (ClassOpeningFee)
    // The old POST /teacher/classes endpoint is removed.
    // Class creation now goes through the PayOS payment checkout flow.
    // - capacity <= 6: free → class created immediately (response has classId)
    // - capacity > 6: paid → response has checkoutUrl for PayOS redirect
    createClass: builder.mutation({
      query: (data) => {
        const schedule = getClassSchedule(data)
        const fallbackCancelUrl =
          window.location.origin + window.location.pathname
        let cancelUrl = fallbackCancelUrl
        if (typeof data.cancelUrl === "string" && data.cancelUrl.trim()) {
          try {
            const parsedCancelUrl = new URL(
              data.cancelUrl,
              window.location.origin,
            )
            if (parsedCancelUrl.origin === window.location.origin) {
              cancelUrl = parsedCancelUrl.href
            }
          } catch {
            // Fall back to the current same-origin form URL.
          }
        }
        const pendingClassData = {
          courseId: parseIntegerOrNull(data.courseId),
          name: data.title || data.name,
          language: data.language ? data.language.toUpperCase() : "",
          levels: data.levels || [],
          enrollmentStart: data.enrollmentStart || null,
          enrollmentEnd: data.enrollmentEnd || null,
          startDate: data.startDate || null,
          retentionDays: parseIntegerOrNull(data.retentionDays ?? data.archiveRetentionDays),
          archiveRetentionDays: parseIntegerOrNull(data.retentionDays ?? data.archiveRetentionDays),
          schedule,
          capacity: parseIntegerOrNull(data.slots ?? data.capacity),
          totalSessions: parseIntegerOrNull(data.totalSessions),
          price: parseNumberOrNull(data.tuitionFee ?? data.price),
          description: data.description || "",
          timezone: data.timezone || "Asia/Ho_Chi_Minh",
          requireMinimumAttendance: Boolean(data.requireMinimumAttendance ?? data.requireMinAttendance),
          minimumAttendanceRate: (data.requireMinimumAttendance ?? data.requireMinAttendance)
            ? parseIntegerOrNull(data.minimumAttendanceRate ?? data.minAttendanceRate)
            : null,
          lateAttendancePolicy: data.lateAttendancePolicy ?? (data.includeLateAttendance === false ? "IgnoreLate" : "CountLate"),
        }
        return {
          url: "/v1/Payments/checkout",
          method: "POST",
          body: {
            paymentType: "ClassOpeningFee",
            pendingClassData: JSON.stringify(pendingClassData),
            returnUrl:
              window.location.origin + "/workspace/classes/all-classes",
            cancelUrl,
            planId: 0,
            classId: 0,
          },
        }
      },
      invalidatesTags: (result, error, data) => [
        "Classes",
        "Courses",
        "Schedule",
        { type: "CourseDetail", id: String(data.courseId) },
      ],
    }),

    // 11. Update Class
    updateClass: builder.mutation({
      query: ({ id, data }) => ({
        url: `/teacher/classes/${encodePathSegment(id)}`,
        method: "PUT",
        body: buildCreateClassFormData(data),
        formData: true,
      }),
      transformResponse: (response) =>
        transformClass(response?.data || response),
      invalidatesTags: (result, error, { id, courseId, data }) => [
        { type: "ClassDetail", id: String(id) },
        ...((courseId ?? data?.courseId) == null
          ? []
          : [
            {
              type: "CourseDetail",
              id: String(courseId ?? data.courseId),
            },
          ]),
        "Classes",
        "StudentClasses",
        "Schedule",
      ],
    }),

    // 12. Delete Class
    deleteClass: builder.mutation({
      query: (arg) => {
        const id = isRecord(arg) ? arg.id : arg
        return {
          url: `/teacher/classes/${encodePathSegment(id)}`,
          method: "DELETE",
        }
      },
      invalidatesTags: (result, error, arg) => {
        const id = isRecord(arg) ? arg.id : arg
        const courseId = isRecord(arg) ? arg.courseId : null
        return [
          "Classes",
          "Courses",
          "StudentClasses",
          "Schedule",
          { type: "ClassDetail", id: String(id) },
          ...(courseId == null
            ? []
            : [{ type: "CourseDetail", id: String(courseId) }]),
        ]
      },
    }),

    // 13. Join Class Room
    joinClassRoom: builder.mutation({
      query: (classId) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/join-room`,
        method: "POST",
      }),
    }),

    // 13b. Join Student Class Room
    joinStudentClassRoom: builder.mutation({
      query: (classId) => ({
        url: `/student/classes/${encodePathSegment(classId)}/join-room`,
        method: "POST",
      }),
    }),

    // 14. Invite to Class
    inviteToClass: builder.mutation({
      query: ({ classId, accountIds, accountId }) => {
        const resolvedAccountIds = Array.isArray(accountIds)
          ? accountIds.map(Number).filter((id) => !isNaN(id) && id > 0)
          : (accountId != null ? [Number(accountId)] : (accountIds != null ? [Number(accountIds)] : []))
        return {
          url: `/teacher/classes/${encodePathSegment(classId)}/invite`,
          method: "POST",
          body: {
            accountIds: resolvedAccountIds,
          },
        }
      },
    }),

    // 16. Get Teacher Assignments
    getTeacherAssignments: builder.query({
      query: ({ classId, status, search, onlyUnassigned }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments`,
        method: "GET",
        params: { status, search, onlyUnassigned },
      }),
      providesTags: (result, error, { classId }) => [
        { type: "ClassGrading", id: `class-${classId}` },
      ],
    }),

    // 17. Get Student Assignments
    getStudentAssignments: builder.query({
      query: ({ classId }) => ({
        url: `/student/classes/${encodePathSegment(classId)}/assignments`,
        method: "GET",
      }),
      providesTags: (result, error, { classId }) => [
        { type: "ClassGrading", id: `student-${classId}` },
      ],
    }),

    // 18. Get Student Assignment By ID
    getStudentAssignmentById: builder.query({
      query: ({ classId, assignmentId }) => ({
        url: `/student/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}`,
        method: "GET",
      }),
      providesTags: (result, error, { assignmentId }) => [
        { type: "ClassGrading", id: `student-assignment-${assignmentId}` },
      ],
    }),

    // 19. Get Current Student Submission
    getMyAssignmentSubmission: builder.query({
      query: ({ classId, assignmentId }) => ({
        url: `/student/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}/my-submission`,
        method: "GET",
      }),
      providesTags: (result, error, { assignmentId }) => [
        { type: "ClassGrading", id: `my-submission-${assignmentId}` },
      ],
    }),

    // 20. Submit / Resubmit Assignment
    submitAssignment: builder.mutation({
      query: ({ classId, assignmentId, formData }) => ({
        url: `/student/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}/submit`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { classId, assignmentId }) => [
        { type: "ClassGrading", id: `student-${classId}` },
        { type: "ClassGrading", id: `my-submission-${assignmentId}` },
      ],
    }),

    // 21. Get Assignment By ID
    getAssignmentById: builder.query({
      query: ({ classId, assignmentId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}`,
        method: "GET",
      }),
      providesTags: (result, error, { assignmentId }) => [
        { type: "ClassGrading", id: `assignment-${assignmentId}` },
      ],
    }),

    // 22. Create Assignment (multipart/form-data)
    createAssignment: builder.mutation({
      query: ({ classId, formData }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "ClassGrading", id: `class-${classId}` },
        { type: "ClassGrading", id: `student-${classId}` },
        { type: "ClassDetail", id: classId },
      ],
    }),

    // 23. Update Assignment (multipart/form-data)
    updateAssignment: builder.mutation({
      query: ({ classId, assignmentId, formData }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { classId, assignmentId }) => [
        { type: "ClassGrading", id: `class-${classId}` },
        { type: "ClassGrading", id: `student-${classId}` },
        { type: "ClassGrading", id: `assignment-${assignmentId}` },
        { type: "ClassGrading", id: `student-assignment-${assignmentId}` },
        { type: "ClassDetail", id: classId },
      ],
    }),

    // 24. Close Assignment
    closeAssignment: builder.mutation({
      query: ({ classId, assignmentId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}/close`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { classId, assignmentId }) => [
        { type: "ClassGrading", id: `class-${classId}` },
        { type: "ClassGrading", id: `assignment-${assignmentId}` },
      ],
    }),

    // 25. Open/Reopen Assignment
    openAssignment: builder.mutation({
      query: ({ classId, assignmentId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}/open`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { classId, assignmentId }) => [
        { type: "ClassGrading", id: `class-${classId}` },
        { type: "ClassGrading", id: `assignment-${assignmentId}` },
      ],
    }),

    // Delete Assignment
    deleteAssignment: builder.mutation({
      query: ({ classId, assignmentId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { classId, assignmentId }) => [
        { type: "ClassGrading", id: `class-${classId}` },
        { type: "ClassGrading", id: `assignment-${assignmentId}` },
      ],
    }),

    // 26. Get Assignment Submissions
    getAssignmentSubmissions: builder.query({
      query: ({ classId, assignmentId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}/submissions`,
        method: "GET",
      }),
      providesTags: (result, error, { assignmentId }) => [
        { type: "ClassGrading", id: `submissions-${assignmentId}` },
      ],
    }),

    // 27. Grade Submission
    gradeSubmission: builder.mutation({
      query: ({ classId, assignmentId, submissionId, grade, comment }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}/submissions/${encodePathSegment(submissionId)}/grade`,
        method: "POST",
        body: { grade, comment },
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: "ClassGrading", id: `assignment-${assignmentId}` },
        { type: "ClassGrading", id: `submissions-${assignmentId}` },
      ],
    }),

    // 28. Return Submission
    returnSubmission: builder.mutation({
      query: ({ classId, assignmentId, submissionId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}/submissions/${encodePathSegment(submissionId)}/return`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: "ClassGrading", id: `assignment-${assignmentId}` },
        { type: "ClassGrading", id: `submissions-${assignmentId}` },
      ],
    }),

    // 29. Bulk Return Submissions
    bulkReturnSubmissions: builder.mutation({
      query: ({ classId, assignmentId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}/bulk-return`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: "ClassGrading", id: `assignment-${assignmentId}` },
        { type: "ClassGrading", id: `submissions-${assignmentId}` },
      ],
    }),

    downloadAssignmentGradeSheet: builder.mutation({
      query: ({ classId, assignmentId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/assignments/${encodePathSegment(assignmentId)}/grade-sheet`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ─── Materials Management ───────────────────────────────────────

    getClassMaterials: builder.query({
      query: (classId) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/materials`,
        method: "GET",
      }),
      providesTags: (result, error, classId) => [
        { type: "ClassMaterials", id: classId },
      ],
    }),

    uploadClassMaterial: builder.mutation({
      query: ({ classId, file }) => {
        const formData = new FormData()
        formData.append("file", file)
        return {
          url: `/teacher/classes/${encodePathSegment(classId)}/materials`,
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: (result, error, { classId }) => [
        { type: "ClassMaterials", id: classId },
      ],
    }),

    deleteClassMaterial: builder.mutation({
      query: ({ classId, materialId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/materials/${encodePathSegment(materialId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "ClassMaterials", id: classId },
      ],
    }),

    // ─── Schedule ─────────────────────────────────────────────────────

    getScheduleDates: builder.query({
      query: ({ from, to, classId } = {}) => ({
        url: "/teacher/schedule/dates",
        method: "GET",
        params: { from, to, classId },
      }),
      transformResponse: (response) => {
        const responseRecord = isRecord(response) ? response : {}
        const rawDates = Array.isArray(responseRecord.dates)
          ? responseRecord.dates
          : Array.isArray(responseRecord.data?.dates)
            ? responseRecord.data.dates
            : Array.isArray(response)
              ? response
              : []
        const converted = rawDates
          .map((dateValue) => parseToLocalDateStr(dateValue))
          .filter(Boolean)
        return {
          ...responseRecord,
          dates: converted,
        }
      },
      providesTags: ["Schedule"],
    }),

    getScheduleSessions: builder.query({
      query: ({ from, to, classId, language, status } = {}) => ({
        url: "/teacher/schedule/sessions",
        method: "GET",
        params: { from, to, classId, language, status },
      }),
      transformResponse: (response) => {
        const responseRecord = isRecord(response) ? response : {}
        const rawSessions = Array.isArray(responseRecord.data)
          ? responseRecord.data
          : Array.isArray(responseRecord.items)
            ? responseRecord.items
            : Array.isArray(response)
              ? response
              : []
        const converted = rawSessions.filter(isRecord).map((session) => ({
          ...session,
          rawStartTime: session.startTime,
          rawEndTime: session.endTime,
          startTime: parseToLocalTimeStr(session.startTime),
          endTime: parseToLocalTimeStr(session.endTime),
          date: parseToLocalDateStr(session.startTime),
          class: session.class
            ? {
              ...session.class,
              id: session.class.id?.toString() || "",
            }
            : null,
        }))
        return {
          ...responseRecord,
          data: converted,
        }
      },
      providesTags: ["Schedule"],
    }),

    getTeacherScheduleSessionsLeft: builder.query({
      query: (params = {}) => {
        const pageSize = typeof params === "number" ? params : params?.pageSize
        return {
          url: "/teacher/schedule/sessions/left",
          method: "GET",
          params: pageSize ? { pageSize } : undefined,
        }
      },
      transformResponse: (response) => {
        const responseRecord = isRecord(response) ? response : {}
        const rawSessions = Array.isArray(responseRecord.data)
          ? responseRecord.data
          : Array.isArray(response)
            ? response
            : []
        return {
          totalSessionsRemaining: Number(responseRecord.totalSessionsRemaining ?? rawSessions.length) || 0,
          data: rawSessions,
        }
      },
      providesTags: ["Schedule"],
    }),

    getStudentScheduleSessions: builder.query({
      query: ({ from, to, classId, language, status } = {}) => ({
        url: "/student/schedule/sessions",
        method: "GET",
        params: { from, to, classId, language, status },
      }),
      transformResponse: (response) => {
        const responseRecord = isRecord(response) ? response : {}
        const rawSessions = Array.isArray(responseRecord.data)
          ? responseRecord.data
          : Array.isArray(responseRecord.items)
            ? responseRecord.items
            : Array.isArray(response)
              ? response
              : []
        const converted = rawSessions.filter(isRecord).map((session) => ({
          ...session,
          rawStartTime: session.startTime,
          rawEndTime: session.endTime,
          startTime: parseToLocalTimeStr(session.startTime),
          endTime: parseToLocalTimeStr(session.endTime),
          date: parseToLocalDateStr(session.startTime),
          class: session.class
            ? {
              ...session.class,
              id: session.class.id?.toString() || "",
            }
            : null,
        }))
        return {
          ...responseRecord,
          data: converted,
        }
      },
      providesTags: ["Schedule"],
    }),

    // ─── Commission ───────────────────────────────────────────────────

    getCommission: builder.query({
      query: () => ({
        url: "/teacher/commission",
        method: "GET",
      }),
      providesTags: ["Commission"],
    }),

    // ─── Curriculum / Lecture Hall ─────────────────────────────────────

    // Get curriculum by class
    getCurriculumByClass: builder.query({
      query: (classId) => ({
        url: `/teacher/classes/${classId}/curriculum`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        if (!data) return []

        const rawSections =
          data.sections ?? data.items ?? (Array.isArray(data) ? data : [])

        return rawSections.map((section) => {
          const rawItems =
            section.items ?? section.contents ?? section.lessons ?? []

          return {
            id: section.id?.toString() || "",
            name: section.name || section.title || "Untitled Section",
            description: section.description || section.subtitle || "",
            isVisibleToStudents:
              section.isVisibleToStudents ?? section.isHidden === false,
            items: rawItems
              .filter((item) => {
                if (item.itemType === "BulletinBoard" && !item.bulletinBoard)
                  return false
                if (item.itemType === "Link" && !item.link) return false
                if (item.itemType === "Material" && !item.material)
                  return false
                if (item.itemType === "Assignment" && !item.assignment)
                  return false
                if (item.itemType === "Quiz" && !item.quiz) return false
                return true
              })
              .map((item) => {
                const itemTypeMap = {
                  BulletinBoard: "bulletinBoard",
                  Link: "link",
                  Material: "material",
                  Assignment: "assignment",
                  Quiz: "quiz",
                }
                const type = item.itemType
                  ? itemTypeMap[item.itemType] || item.itemType.toLowerCase()
                  : (item.type || item.contentType || "material").toLowerCase()

                let title = item.title || item.name || "Untitled"
                let meta = item.meta || item.description || ""
                let metaType = item.metaType || "none"
                let content = item.content || ""
                let fileUrl = ""
                let fileName = ""

                if (item.itemType === "BulletinBoard" && item.bulletinBoard) {
                  title = item.bulletinBoard.title || title
                  // metaType = "clock"
                  meta = item.bulletinBoard.content
                } else if (item.itemType === "Link" && item.link) {
                  title = item.link.title || title
                  meta = item.link.url || meta
                } else if (item.itemType === "Material" && item.material) {
                  // title = item.material.title || item.material.name || title
                  title = item.material.fileName
                  const ext = item.material.fileUrl
                    ? item.material.fileUrl.split(".").pop().toUpperCase()
                    : "FILE"
                  const sizeBytes =
                    item.material.fileSize || item.material.size || 0
                  let sizeStr = ""
                  if (sizeBytes > 0) {
                    if (sizeBytes < 1024) sizeStr = `${sizeBytes} B`
                    else if (sizeBytes < 1024 * 1024)
                      sizeStr = `${(sizeBytes / 1024).toFixed(1)} KB`
                    else
                      sizeStr = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                  }
                  meta = sizeStr ? `${ext} - ${sizeStr}` : ext
                  metaType = "file"
                  fileUrl = item.material.fileUrl || item.material.url || ""
                  fileName = item.material.fileName || item.material.name || ""
                } else if (item.itemType === "Assignment" && item.assignment) {
                  title = item.assignment.name
                  metaType = "clock"
                } else if (item.itemType === "Quiz" && item.quiz) {
                  title = item.quiz.name
                  metaType = "clock"
                }

                return {
                  ...item,
                  id: item.id?.toString() || "",
                  itemId: item.itemId?.toString() || "",
                  type,
                  content,
                  title,
                  meta,
                  metaType,
                  fileUrl,
                  fileName,
                  isVisibleToStudents:
                    item.isVisibleToStudents ?? item.isHidden === false,
                  dueDate: item.assignment?.dueDate,
                  openTime: item.quiz?.openTime,
                  closeTime: item.quiz?.closeTime,
                }
              }),
          }
        })
      },
      providesTags: (result, error, classId) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Get curriculum by class (Student view)
    getStudentCurriculumByClass: builder.query({
      query: (classId) => ({
        url: `/student/classes/${classId}/curriculum`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        if (!data) return []

        const rawSections =
          data.sections ?? data.items ?? (Array.isArray(data) ? data : [])

        return rawSections.map((section) => {
          const rawItems =
            section.items ?? section.contents ?? section.lessons ?? []

          return {
            id: section.id?.toString() || "",
            name: section.name || section.title || "Untitled Section",
            description: section.description || section.subtitle || "",
            isVisibleToStudents: section.isVisibleToStudents ?? true,
            items: rawItems
              .filter((item) => {
                if (item.itemType === "BulletinBoard" && !item.bulletinBoard)
                  return false
                if (item.itemType === "Link" && !item.link) return false
                if (item.itemType === "Material" && !item.material)
                  return false
                if (item.itemType === "Assignment" && !item.assignment)
                  return false
                if (item.itemType === "Quiz" && !item.quiz) return false
                return true
              })
              .map((item) => {
                const itemTypeMap = {
                  BulletinBoard: "bulletinBoard",
                  Link: "link",
                  Material: "material",
                  Assignment: "assignment",
                  Quiz: "quiz",
                }
                const type = item.itemType
                  ? itemTypeMap[item.itemType] || item.itemType.toLowerCase()
                  : (item.type || item.contentType || "material").toLowerCase()

                let title = item.title || item.name || "Untitled"
                let meta = item.meta || item.description || ""
                let metaType = item.metaType || "none"
                let content = item.content || ""
                let fileUrl = ""

                if (item.itemType === "BulletinBoard" && item.bulletinBoard) {
                  title = item.bulletinBoard.title || title
                  // metaType = "clock"
                  meta = item.bulletinBoard.content
                } else if (item.itemType === "Link" && item.link) {
                  title = item.link.title || title
                  meta = item.link.url || meta
                } else if (item.itemType === "Material" && item.material) {
                  // title = item.material.title || item.material.name || title
                  title = item.material.fileName
                  const ext = item.material.fileUrl
                    ? item.material.fileUrl.split(".").pop().toUpperCase()
                    : "FILE"
                  const sizeBytes =
                    item.material.fileSize || item.material.size || 0
                  let sizeStr = ""
                  if (sizeBytes > 0) {
                    if (sizeBytes < 1024) sizeStr = `${sizeBytes} B`
                    else if (sizeBytes < 1024 * 1024)
                      sizeStr = `${(sizeBytes / 1024).toFixed(1)} KB`
                    else
                      sizeStr = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                  }
                  meta = sizeStr ? `${ext} • ${sizeStr}` : ext
                  metaType = "file"
                  fileUrl = item.material.fileUrl || item.material.url || ""
                } else if (item.itemType === "Assignment" && item.assignment) {
                  title = item.assignment.name
                  metaType = "clock"
                } else if (item.itemType === "Quiz" && item.quiz) {
                  title = item.quiz.name
                  metaType = "clock"
                }

                return {
                  ...item,
                  id: item.id?.toString() || "",
                  itemId: item.itemId?.toString() || "",
                  type,
                  content,
                  title,
                  meta,
                  metaType,
                  fileUrl,
                  isVisibleToStudents: item.isVisibleToStudents ?? true,
                  dueDate: item.assignment?.dueDate,
                  openTime: item.quiz?.openTime,
                  closeTime: item.quiz?.closeTime,
                }
              }),
          }
        })
      },
      providesTags: (result, error, classId) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Create a new section in a class curriculum
    createCurriculumSection: builder.mutation({
      query: ({ classId, name, description, isVisibleToStudents = true }) => ({
        url: `/teacher/classes/${classId}/curriculum/sections`,
        method: "POST",
        body: {
          name,
          description: description || null,
          isVisibleToStudents,
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "ClassDetail", id: classId },
        { type: "Curriculum", id: classId },
      ],
    }),

    // Update a section in a class curriculum
    updateCurriculumSection: builder.mutation({
      query: ({
        classId,
        sectionId,
        name,
        description,
        isVisibleToStudents = true,
      }) => ({
        url: `/teacher/classes/${classId}/curriculum/sections/${sectionId}`,
        method: "PUT",
        body: { name, description, isVisibleToStudents },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Delete a section in a class curriculum
    deleteCurriculumSection: builder.mutation({
      query: ({ classId, sectionId }) => ({
        url: `/teacher/classes/${classId}/curriculum/sections/${sectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Create a bulletin board in a section
    createBulletinBoard: builder.mutation({
      query: ({
        classId,
        sectionId,
        title,
        content,
        allowStudentReply = true,
        isVisibleToStudents = true,
      }) => ({
        url: `/teacher/classes/${classId}/curriculum/sections/${sectionId}/bulletin-boards`,
        method: "POST",
        body: { title, content, allowStudentReply, isVisibleToStudents },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Update a bulletin board in a section
    updateBulletinBoard: builder.mutation({
      query: ({
        classId,
        boardId,
        title,
        content,
        allowStudentReply,
        isVisibleToStudents,
      }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/${boardId}`,
        method: "PUT",
        body: { title, content, allowStudentReply, isVisibleToStudents },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Get a bulletin board detail
    getBulletinBoardDetail: builder.query({
      query: ({ classId, boardId }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/${boardId}`,
        method: "GET",
      }),
      providesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Upload material to a section
    uploadMaterialToSection: builder.mutation({
      query: ({
        classId,
        sectionId,
        files,
        title,
        isVisibleToStudents = true,
      }) => {
        const formData = new FormData()
        files.forEach((file) => {
          formData.append("Files", file)
        })
        if (title) formData.append("Title", title)
        formData.append("IsVisibleToStudents", isVisibleToStudents)
        return {
          url: `/teacher/classes/${classId}/curriculum/sections/${sectionId}/materials`,
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Add link to a section
    addLinkToSection: builder.mutation({
      query: ({
        classId,
        sectionId,
        title,
        url,
        isVisibleToStudents = true,
      }) => ({
        url: `/teacher/classes/${classId}/curriculum/sections/${sectionId}/links`,
        method: "POST",
        body: { title, url, isVisibleToStudents },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Update a link in a curriculum section
    updateCurriculumLink: builder.mutation({
      query: ({ classId, linkId, ...data }) => ({
        url: `/teacher/classes/${classId}/curriculum/links/${linkId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Add assignments to a section
    addAssignmentToSection: builder.mutation({
      query: ({ classId, sectionId, assignmentIds }) => ({
        url: `/teacher/classes/${classId}/curriculum/sections/${sectionId}/assignments`,
        method: "POST",
        body: { assignmentIds },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Add quizzes to a section
    addQuizToSection: builder.mutation({
      query: ({ classId, sectionId, quizIds }) => ({
        url: `/teacher/classes/${classId}/curriculum/sections/${sectionId}/quizzes`,
        method: "POST",
        body: { quizIds },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Change visibility of an item in a section
    changeVisibilityOfItem: builder.mutation({
      query: ({ classId, itemId, isVisibleToStudents }) => ({
        url: `/teacher/classes/${classId}/curriculum/items/${itemId}/visibility?isVisible=${isVisibleToStudents}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Delete item in a section
    deleteItemInCurriculum: builder.mutation({
      query: ({ classId, itemId }) => ({
        url: `/teacher/classes/${classId}/curriculum/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Get list posts in a bulletin board (Student)
    getStudentListPostsInBulletinBoard: builder.query({
      query: ({ classId, boardId, page = 1, pageSize = 10, search }) => ({
        url: `/student/classes/${classId}/curriculum/bulletin-boards/${boardId}/posts`,
        method: "GET",
        params: { page, pageSize, search },
      }),
      transformResponse: (response) =>
        transformPaginatedResponse(response, (item) => item),
      providesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Get post detail (Student)
    getStudentPostDetail: builder.query({
      query: ({ classId, postId }) => ({
        url: `/student/classes/${classId}/curriculum/bulletin-boards/posts/${postId}`,
        method: "GET",
      }),
      providesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Create comment in a bulletin board (Student)
    createStudentCommentInBulletinBoard: builder.mutation({
      query: ({ classId, postId, content }) => ({
        url: `/student/classes/${classId}/curriculum/bulletin-boards/posts/${postId}/replies`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Get list posts in a bulletin board
    getListPostsInBulletinBoard: builder.query({
      query: ({ classId, boardId, page = 1, pageSize = 10, search }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/${boardId}/posts`,
        method: "GET",
        params: { page, pageSize, search },
      }),
      transformResponse: (response) =>
        transformPaginatedResponse(response, (item) => item),
      providesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Create a post in a bulletin board
    createPostInBulletinBoard: builder.mutation({
      query: ({ classId, boardId, formData }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/${boardId}/posts`,
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Get post detail
    getPostDetail: builder.query({
      query: ({ classId, postId }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/posts/${postId}`,
        method: "GET",
      }),
      providesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Update a post in a bulletin board
    updatePostInBulletinBoard: builder.mutation({
      query: ({ classId, postId, formData }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/posts/${postId}`,
        method: "PUT",
        body: formData,
        formData: true,
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Delete a post in a bulletin board
    deletePostInBulletinBoard: builder.mutation({
      query: ({ classId, postId }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Create comment in a bulletin board
    createCommentInBulletinBoard: builder.mutation({
      query: ({ classId, postId, content }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/posts/${postId}/replies`,
        method: "POST",
        body: {
          content,
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Get comment detail
    getCommentDetail: builder.query({
      query: ({ classId, commentId }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/comments/${commentId}`,
        method: "GET",
      }),
      providesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Update a comment in a bulletin board
    updateCommentInBulletinBoard: builder.mutation({
      query: ({ classId, commentId, content, isVisibleToStudents = true }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/comments/${commentId}`,
        method: "PUT",
        body: {
          content,
          isVisibleToStudents,
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Delete a comment in a bulletin board
    deleteCommentInBulletinBoard: builder.mutation({
      query: ({ classId, commentId }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // Create a reply in a comment
    createReplyInComment: builder.mutation({
      query: ({ classId, commentId, content, isVisibleToStudents = true }) => ({
        url: `/teacher/classes/${classId}/curriculum/bulletin-boards/comments/${commentId}/replies`,
        method: "POST",
        body: {
          content,
          isVisibleToStudents,
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "Curriculum", id: classId },
      ],
    }),

    // ─── Teacher Quiz Endpoints ────────────────────────────────────────

    getTeacherQuizzes: builder.query({
      query: ({ classId, search, onlyUnassigned }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes`,
        method: "GET",
        params: { search, onlyUnassigned },
      }),
      providesTags: (result, error, { classId }) => {
        const listTag = {
          type: "Quizzes",
          id: getQuizListTagId(classId),
        }
        if (!Array.isArray(result?.data)) return [listTag]

        const quizTags = result.data
          .filter((quiz) => quiz?.id != null)
          .map((quiz) => ({
            type: "Quizzes",
            id: getQuizTagId(classId, quiz.id),
          }))

        return [...quizTags, listTag]
      },
    }),

    getTeacherQuizDetail: builder.query({
      query: ({ classId, quizId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}`,
        method: "GET",
      }),
      providesTags: (result, error, { classId, quizId }) => [
        { type: "QuizDetail", id: getQuizTagId(classId, quizId) },
      ],
    }),

    createTeacherQuiz: builder.mutation({
      query: ({ classId, ...body }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes`,
        method: "POST",
        body: buildQuizFormData(body),
      }),
      invalidatesTags: (result, error, { classId }) =>
        getQuizListInvalidationTags(classId),
    }),

    updateTeacherQuiz: builder.mutation({
      query: ({ classId, quizId, ...body }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}`,
        method: "PUT",
        body: buildQuizFormData(body, { isUpdate: true }),
      }),
      invalidatesTags: (result, error, { classId, quizId }) =>
        getQuizContentInvalidationTags(classId, quizId),
    }),

    deleteTeacherQuiz: builder.mutation({
      query: ({ classId, quizId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { classId, quizId }) => [
        ...getQuizContentInvalidationTags(classId, quizId),
        { type: "QuizGrading", id: getQuizTagId(classId, quizId) },
        { type: "QuizStats", id: getQuizTagId(classId, quizId) },
        { type: "QuizStudents", id: getQuizTagId(classId, quizId) },
        { type: "StudentQuizResult", id: getQuizTagId(classId, quizId) },
      ],
    }),

    addTeacherQuestion: builder.mutation({
      query: ({ classId, quizId, ...body }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/questions`,
        method: "POST",
        body: buildQuestionFormData(body),
      }),
      invalidatesTags: (result, error, { classId, quizId }) =>
        getQuizContentInvalidationTags(classId, quizId),
    }),

    updateTeacherQuestion: builder.mutation({
      query: ({ classId, quizId, questionId, ...body }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/questions/${encodePathSegment(questionId)}`,
        method: "PUT",
        body: buildQuestionFormData(body),
      }),
      invalidatesTags: (result, error, { classId, quizId }) =>
        getQuizContentInvalidationTags(classId, quizId),
    }),

    deleteTeacherQuestion: builder.mutation({
      query: ({ classId, quizId, questionId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/questions/${encodePathSegment(questionId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { classId, quizId }) =>
        getQuizContentInvalidationTags(classId, quizId),
    }),

    reorderTeacherQuestions: builder.mutation({
      query: ({ classId, quizId, questionIds }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/questions/reorder`,
        method: "PUT",
        body: questionIds,
      }),
      invalidatesTags: (result, error, { classId, quizId }) =>
        getQuizContentInvalidationTags(classId, quizId),
    }),

    cloneTeacherQuestion: builder.mutation({
      query: ({ classId, quizId, questionId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/questions/${encodePathSegment(questionId)}/clone`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { classId, quizId }) =>
        getQuizContentInvalidationTags(classId, quizId),
    }),

    publishTeacherQuiz: builder.mutation({
      query: ({ classId, quizId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/publish`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { classId, quizId }) =>
        getQuizContentInvalidationTags(classId, quizId),
    }),

    closeTeacherQuiz: builder.mutation({
      query: ({ classId, quizId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/close`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { classId, quizId }) =>
        getQuizContentInvalidationTags(classId, quizId),
    }),

    previewTeacherQuiz: builder.mutation({
      query: ({ classId, quizId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/preview`,
        method: "POST",
      }),
    }),

    downloadQuizTemplate: builder.mutation({
      query: () => ({
        url: `/teacher/quizzes/template`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    importTeacherQuestions: builder.mutation({
      query: ({ classId, quizId, formData }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/import`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { classId, quizId }) =>
        getQuizContentInvalidationTags(classId, quizId),
    }),

    importTeacherQuestionsPreview: builder.mutation({
      query: ({ classId, quizId, formData }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/questions/import-preview`,
        method: "POST",
        body: formData,
      }),
    }),

    getTeacherQuizGrading: builder.query({
      query: ({ classId, quizId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/grading`,
        method: "GET",
      }),
      providesTags: (result, error, { classId, quizId }) => [
        { type: "QuizGrading", id: getQuizTagId(classId, quizId) },
      ],
    }),

    gradeTeacherEssay: builder.mutation({
      query: ({ classId, quizId, questionId, ...body }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/grading/${encodePathSegment(questionId)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { classId, quizId }) => [
        { type: "QuizGrading", id: getQuizTagId(classId, quizId) },
        { type: "QuizStats", id: getQuizTagId(classId, quizId) },
        { type: "QuizStudents", id: getQuizTagId(classId, quizId) },
        { type: "StudentQuizResult", id: getQuizTagId(classId, quizId) },
      ],
    }),

    getTeacherQuizStats: builder.query({
      query: ({ classId, quizId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/stats`,
        method: "GET",
      }),
      providesTags: (result, error, { classId, quizId }) => [
        { type: "QuizStats", id: getQuizTagId(classId, quizId) },
      ],
    }),

    getTeacherQuizStudents: builder.query({
      query: ({ classId, quizId, search = "", page = 1, pageSize = 20 }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/students`,
        method: "GET",
        params: { search, page, pageSize },
      }),
      providesTags: (result, error, { classId, quizId }) => [
        { type: "QuizStudents", id: getQuizTagId(classId, quizId) },
      ],
    }),

    exportTeacherQuizReport: builder.mutation({
      query: ({ classId, quizId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/export`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    getTeacherStudentAttempt: builder.query({
      query: ({ classId, quizId, studentId }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/students/${encodePathSegment(studentId)}/attempt`,
        method: "GET",
      }),
      providesTags: (result, error, { classId, quizId }) => [
        { type: "QuizStudents", id: getQuizTagId(classId, quizId) },
      ],
    }),

    // ─── Student Quiz Endpoints ────────────────────────────────────────

    getStudentQuizzes: builder.query({
      query: ({ classId }) => ({
        url: `/student/classes/${encodePathSegment(classId)}/quizzes`,
        method: "GET",
      }),
      providesTags: (result, error, { classId }) => [
        { type: "StudentQuizzes", id: getQuizListTagId(classId) },
      ],
    }),

    startStudentQuizAttempt: builder.mutation({
      query: ({ classId, quizId }) => ({
        url: `/student/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/start`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { classId, quizId }) => [
        { type: "StudentQuizzes", id: getQuizListTagId(classId) },
        { type: "StudentQuizResult", id: getQuizTagId(classId, quizId) },
      ],
    }),

    saveStudentQuizAnswers: builder.mutation({
      query: ({ classId, quizId, answers }) => ({
        url: `/student/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/answer`,
        method: "PUT",
        body: { answers },
      }),
    }),

    submitStudentQuizAttempt: builder.mutation({
      query: ({ classId, quizId, ...body }) => ({
        url: `/student/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/submit`,
        method: "POST",
        body: body || {},
      }),
      invalidatesTags: (result, error, { classId, quizId }) => [
        { type: "StudentQuizzes", id: getQuizListTagId(classId) },
        { type: "StudentQuizResult", id: getQuizTagId(classId, quizId) },
      ],
    }),

    getStudentQuizResult: builder.query({
      query: ({ classId, quizId, attempt }) => ({
        url: `/student/classes/${encodePathSegment(classId)}/quizzes/${encodePathSegment(quizId)}/result`,
        method: "GET",
        params: attempt != null ? { attempt } : undefined,
      }),
      providesTags: (result, error, { classId, quizId }) => [
        { type: "StudentQuizResult", id: getQuizTagId(classId, quizId) },
      ],
    }),

    getTeacherClassTeachingTasksCombined: builder.query({
      query: (classId) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/teaching-tasks/combined`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response
        if (Array.isArray(response?.data)) return response.data
        if (Array.isArray(response?.items)) return response.items
        if (Array.isArray(response?.result)) return response.result
        if (Array.isArray(response?.value)) return response.value
        if (Array.isArray(response?.data?.items)) return response.data.items
        if (Array.isArray(response?.data?.tasks)) return response.data.tasks
        return []
      },
      providesTags: (result, error, classId) => [
        { type: "TeachingTasks", id: classId },
      ],
    }),

    getTeacherCourseTeachingTasksCombined: builder.query({
      query: (courseId) => ({
        url: `/teacher/courses/${encodePathSegment(courseId)}/teaching-tasks/combined`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response
        if (Array.isArray(response?.data)) return response.data
        if (Array.isArray(response?.items)) return response.items
        if (Array.isArray(response?.result)) return response.result
        if (Array.isArray(response?.value)) return response.value
        if (Array.isArray(response?.data?.items)) return response.data.items
        if (Array.isArray(response?.data?.tasks)) return response.data.tasks
        return []
      },
      providesTags: (result, error, courseId) => [
        { type: "TeachingTasks", id: courseId },
      ],
    }),

    getTeacherAllTeachingTasksCombined: builder.query({
      query: (params) => {
        const queryStr = new URLSearchParams()
        if (params?.page) queryStr.append("page", params.page)
        if (params?.limit) queryStr.append("limit", params.limit)
        if (params?.status) queryStr.append("status", params.status)
        return {
          url: `/teacher/teaching-tasks/combined?${queryStr.toString()}`,
          method: "GET",
        }
      },
      transformResponse: (response) => {
        // Return the whole object which contains Items, TotalCount, Page, PageSize, TotalPages
        return response
      },
    }),

    // ─── Analytics Endpoints ──────────────────────────────────────────

    // 1. AnalyticsCourseClass
    getAnalyticsCourseClassOverview: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/course-class/overview",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsCourseClassEffectiveness: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/course-class/course-effectiveness",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsCourseClassStandaloneClasses: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/course-class/standalone-classes",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsCourseClassHotClasses: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/course-class/hot-classes",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    exportAnalyticsCourseClass: builder.mutation({
      query: (params) => ({
        url: "/teacher/analytics/course-class/export",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // 2. AnalyticsQuality
    getAnalyticsQualityOverview: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/quality/overview",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsQualityRatingTrend: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/quality/rating-trend",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsQualityRatingDistribution: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/quality/rating-distribution",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsQualityByClass: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/quality/by-class",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    exportAnalyticsQuality: builder.mutation({
      query: (params) => ({
        url: "/teacher/analytics/quality/export",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // 3. AnalyticsRevenue
    getAnalyticsRevenueOverview: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/revenue/overview",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsRevenueTrend: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/revenue/trend",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsRevenueByClass: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/revenue/by-class",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsRevenueTopClasses: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/revenue/top-classes",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    exportAnalyticsRevenue: builder.mutation({
      query: (params) => ({
        url: "/teacher/analytics/revenue/export",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // 4. AnalyticsStudents
    getAnalyticsStudentsOverview: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/students/overview",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsStudentsGrowth: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/students/growth",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsStudentsByClass: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/students/by-class",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    getAnalyticsStudentsByCourse: builder.query({
      query: (params) => ({
        url: "/teacher/analytics/students/by-course",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    exportAnalyticsStudents: builder.mutation({
      query: (params) => ({
        url: "/teacher/analytics/students/export",
        method: "GET",
        params: buildAnalyticsQueryParams(params),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // 5. Dashboard
    getDashboard: builder.query({
      query: (params) => ({
        url: "/teacher/dashboard",
        method: "GET",
        params: buildDashboardQueryParams(params),
      }),
      providesTags: ["Analytics"],
    }),

    exportDashboard: builder.mutation({
      query: (params) => ({
        url: "/teacher/dashboard/export",
        method: "GET",
        params: buildDashboardQueryParams(params),
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
})

export const {
  useGetExploreCoursesQuery,
  useGetExploreCourseDetailQuery,
  useGetExploreClassDetailQuery,
  useGetStudentAvailableCoursesQuery,
  useGetStudentAvailableClassesQuery,
  useGetStudentJoinedClassesQuery,
  useGetStudentCompletedClassesQuery,
  useGetStudentCourseDetailQuery,
  useGetStudentClassDetailQuery,
  useEnrollInCourseMutation,
  useGetAllCoursesQuery,
  useGetAllClassesQuery,
  useLazyGetAllClassesQuery,
  useGetCourseDetailQuery,
  useGetClassDetailQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,

  useGetTeacherAssignmentsQuery,
  useGetStudentAssignmentsQuery,
  useGetStudentAssignmentByIdQuery,
  useGetMyAssignmentSubmissionQuery,
  useSubmitAssignmentMutation,
  useGetAssignmentByIdQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useCloseAssignmentMutation,
  useOpenAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
  useReturnSubmissionMutation,
  useBulkReturnSubmissionsMutation,
  useDownloadAssignmentGradeSheetMutation,
  useGetClassMaterialsQuery,
  useUploadClassMaterialMutation,
  useDeleteClassMaterialMutation,
  useGetScheduleDatesQuery,
  useGetScheduleSessionsQuery,
  useGetTeacherScheduleSessionsLeftQuery,
  useGetStudentScheduleSessionsQuery,
  useGetCommissionQuery,
  useJoinClassRoomMutation,
  useJoinStudentClassRoomMutation,
  useInviteToClassMutation,
  useGetCurriculumByClassQuery,
  useGetStudentCurriculumByClassQuery,
  useCreateCurriculumSectionMutation,
  useUpdateCurriculumSectionMutation,
  useDeleteCurriculumSectionMutation,
  useUpdateCurriculumLinkMutation,
  useUploadMaterialToSectionMutation,
  useAddLinkToSectionMutation,
  useCreateBulletinBoardMutation,
  useUpdateBulletinBoardMutation,
  useGetBulletinBoardDetailQuery,
  useAddAssignmentToSectionMutation,
  useAddQuizToSectionMutation,
  useChangeVisibilityOfItemMutation,
  useDeleteItemInCurriculumMutation,
  useGetListPostsInBulletinBoardQuery,
  useCreatePostInBulletinBoardMutation,
  useGetPostDetailQuery,
  useUpdatePostInBulletinBoardMutation,
  useDeletePostInBulletinBoardMutation,
  useCreateCommentInBulletinBoardMutation,
  useGetCommentDetailQuery,
  useUpdateCommentInBulletinBoardMutation,
  useDeleteCommentInBulletinBoardMutation,
  useCreateReplyInCommentMutation,
  useGetStudentListPostsInBulletinBoardQuery,
  useGetStudentPostDetailQuery,
  useCreateStudentCommentInBulletinBoardMutation,
  // Teacher Quiz Hooks
  useGetTeacherQuizzesQuery,
  useGetTeacherQuizDetailQuery,
  useCreateTeacherQuizMutation,
  useUpdateTeacherQuizMutation,
  useDeleteTeacherQuizMutation,
  useAddTeacherQuestionMutation,
  useUpdateTeacherQuestionMutation,
  useDeleteTeacherQuestionMutation,
  useReorderTeacherQuestionsMutation,
  useCloneTeacherQuestionMutation,
  usePublishTeacherQuizMutation,
  useCloseTeacherQuizMutation,
  usePreviewTeacherQuizMutation,
  useDownloadQuizTemplateMutation,
  useImportTeacherQuestionsMutation,
  useImportTeacherQuestionsPreviewMutation,
  useGetTeacherQuizGradingQuery,
  useGradeTeacherEssayMutation,
  useGetTeacherQuizStatsQuery,
  useGetTeacherQuizStudentsQuery,
  useGetTeacherStudentAttemptQuery,
  useExportTeacherQuizReportMutation,
  // Student Quiz Hooks
  useGetStudentQuizzesQuery,
  useStartStudentQuizAttemptMutation,
  useSaveStudentQuizAnswersMutation,
  useSubmitStudentQuizAttemptMutation,
  useGetStudentQuizResultQuery,
  useLazyGetStudentQuizResultQuery,
  // Teaching Tasks Hooks
  useGetTeacherClassTeachingTasksCombinedQuery,
  useGetTeacherCourseTeachingTasksCombinedQuery,
  useGetTeacherAllTeachingTasksCombinedQuery,
  // Analytics Hooks
  useGetAnalyticsCourseClassOverviewQuery,
  useGetAnalyticsCourseClassEffectivenessQuery,
  useGetAnalyticsCourseClassStandaloneClassesQuery,
  useGetAnalyticsCourseClassHotClassesQuery,
  useExportAnalyticsCourseClassMutation,
  useGetAnalyticsQualityOverviewQuery,
  useGetAnalyticsQualityRatingTrendQuery,
  useGetAnalyticsQualityRatingDistributionQuery,
  useGetAnalyticsQualityByClassQuery,
  useExportAnalyticsQualityMutation,
  useGetAnalyticsRevenueOverviewQuery,
  useGetAnalyticsRevenueTrendQuery,
  useGetAnalyticsRevenueByClassQuery,
  useGetAnalyticsRevenueTopClassesQuery,
  useExportAnalyticsRevenueMutation,
  useGetAnalyticsStudentsOverviewQuery,
  useGetAnalyticsStudentsGrowthQuery,
  useGetAnalyticsStudentsByClassQuery,
  useGetAnalyticsStudentsByCourseQuery,
  useExportAnalyticsStudentsMutation,
  // Dashboard Hooks
  useGetDashboardQuery,
  useExportDashboardMutation,
} = coursesApi