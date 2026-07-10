import { baseApi } from "./baseApi"

// ─── Helpers for UTC to Local conversion ───────────────────────────────
const parseToLocalTimeStr = (isoString) => {
  if (!isoString) return ""
  // If it's already a simple time format like "18:00", return as-is
  if (/^\d{2}:\d{2}$/.test(isoString)) {
    return isoString
  }
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
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
  if (isNaN(date.getTime())) return isoString
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const transformNextSession = (data) => {
  let nextSession = null
  if (data?.nextSession) {
    const startLocal = new Date(data.nextSession.startTime)
    const endLocal = new Date(data.nextSession.endTime)
    if (!isNaN(startLocal.getTime()) && !isNaN(endLocal.getTime())) {
      // Compute countdown
      const diffMs = startLocal.getTime() - Date.now()
      const diffSec = diffMs > 0 ? Math.floor(diffMs / 1000) : 0
      const days = Math.floor(diffSec / (24 * 3600))
      const hours = Math.floor((diffSec % (24 * 3600)) / 3600)
      const minutes = Math.floor((diffSec % 3600) / 60)

      const formattedDate = startLocal.getFullYear() + "-" +
        String(startLocal.getMonth() + 1).padStart(2, "0") + "-" +
        String(startLocal.getDate()).padStart(2, "0")

      const formatTimeDigits = (dateObj) => {
        const h = String(dateObj.getHours()).padStart(2, "0")
        const m = String(dateObj.getMinutes()).padStart(2, "0")
        return `${h}:${m}`
      }

      nextSession = {
        date: formattedDate,
        startTime: formatTimeDigits(startLocal),
        endTime: formatTimeDigits(endLocal),
        isLive: data.class?.status === "LIVE" || data.status === "LIVE",
        countdown: { days, hours, minutes }
      }
    }
  }

  if (!nextSession) {
    nextSession = {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: data?.schedule?.[0]?.startTime || "19:00",
      endTime: data?.schedule?.[0]?.endTime || "21:00",
      isLive: false,
      countdown: { days: 2, hours: 0, minutes: 0 }
    }
  }
  return nextSession
}

// ─── Transformers & Data Mappers ──────────────────────────────────────

const transformCourse = (course) => {
  if (!course) return null
  const resolvedTitle = course.name || course.title || "Untitled Course"
  const resolvedStudents = course.studentCount !== undefined ? course.studentCount : (course.totalStudents || 0)
  return {
    id: course.id?.toString() || "",
    name: resolvedTitle,
    title: resolvedTitle,
    language: course.language || "English",
    levels: course.levels || ["A1"],
    description: course.description || "",
    totalSessions: course.totalSessions || 24,
    enrollmentStart: course.enrollmentStart || "",
    enrollmentEnd: course.enrollmentEnd || "",
    classCount: course.classCount || 0,
    studentCount: resolvedStudents,
    totalStudents: resolvedStudents,
    status: course.status || "OPEN",
    startDate: course.startDate || "",
    endDate: course.endDate || "",
    priceRange: course.priceRange || { min: 0, max: 0 },
    thumbnailUrl: course.thumbnailUrl || "",
    createdAt: course.createdAt || ""
  }
}

const transformClass = (cls) => {
  if (!cls) return null
  const resolvedCourseTitle = cls.courseName || cls.courseTitle || "Course"
  const resolvedClassTitle = cls.name || cls.title || "Untitled Class"
  const resolvedStudentCount = cls.studentCount !== undefined ? cls.studentCount : (cls.enrolledStudents || 0)
  const resolvedProgress = cls.progress || {
    completedSessions: cls.completedSessions || 0,
    totalSessions: cls.totalSessions || 24
  }
  return {
    id: cls.id?.toString() || "",
    courseId: cls.courseId?.toString() || null,
    courseName: resolvedCourseTitle,
    courseTitle: resolvedCourseTitle,
    name: resolvedClassTitle,
    title: resolvedClassTitle,
    language: cls.language || "English",
    levels: cls.levels || ["A1"],
    description: cls.description || "",
    progress: resolvedProgress,
    totalSessions: resolvedProgress.totalSessions,
    completedSessions: resolvedProgress.completedSessions,
    enrollmentStart: cls.enrollmentStart || "",
    enrollmentEnd: cls.enrollmentEnd || "",
    startDate: cls.startDate || "",
    endDate: cls.endDate || "",
    schedule: cls.schedule ? {
      days: cls.schedule.map(s => s.dayOfWeek),
      startTime: parseToLocalTimeStr(cls.schedule[0]?.startTime) || "00:00",
      endTime: parseToLocalTimeStr(cls.schedule[0]?.endTime) || "00:00"
    } : (cls.nextSession ? {
      days: [],
      startTime: parseToLocalTimeStr(cls.nextSession.startTime) || "00:00",
      endTime: parseToLocalTimeStr(cls.nextSession.endTime) || "00:00"
    } : { days: [], startTime: "00:00", endTime: "00:00" }),
    rawSchedule: Array.isArray(cls.schedule) ? cls.schedule.map(s => ({
      dayOfWeek: s.dayOfWeek,
      startTime: parseToLocalTimeStr(s.startTime) || "00:00",
      endTime: parseToLocalTimeStr(s.endTime) || "00:00"
    })) : [],
    slots: cls.capacity || cls.slots || 10,
    studentCount: resolvedStudentCount,
    enrolledStudents: resolvedStudentCount,
    tuitionFee: cls.price || cls.tuitionFee || 0,
    status: cls.status || "OPEN",
    roomId: cls.roomId?.toString() || "",
    roomName: cls.roomName || "",
    thumbnailUrl: cls.thumbnailUrl || ""
  }
}

const transformPaginatedResponse = (response, itemTransformer) => {
  if (!response) {
    return { data: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 } }
  }

  const responseData = response.data !== undefined ? response.data : response
  const rawItems = responseData.items || responseData.data || (Array.isArray(responseData) ? responseData : [])
  const data = rawItems.map(itemTransformer)

  const page = responseData.pagination?.page || responseData.page || 1
  const pageSize = responseData.pagination?.pageSize || responseData.pageSize || 10
  const totalItems = responseData.pagination?.totalItems || responseData.totalCount || rawItems.length
  const totalPages = responseData.pagination?.totalPages || Math.ceil(totalItems / pageSize) || 1

  return {
    data,
    pagination: { page, pageSize, totalItems, totalPages }
  }
}

// ─── API Injector Slice ───────────────────────────────────────────────

const isFileValue = (value) => typeof File !== "undefined" && value instanceof File

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
          const camelKey = nestedKey.charAt(0).toLowerCase() + nestedKey.slice(1)
          const pascalKey = nestedKey.charAt(0).toUpperCase() + nestedKey.slice(1)

          appendFormValue(formData, `${key}[${index}].${camelKey}`, nestedValue)
          if (camelKey !== pascalKey) {
            appendFormValue(formData, `${key}[${index}].${pascalKey}`, nestedValue)
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
  Object.entries(fields).forEach(([key, value]) => appendFormValue(formData, key, value))
  return formData
}

const buildCreateCourseFormData = (data) => buildFormData({
  Name: data.title,
  Language: data.language ? data.language.toUpperCase() : "",
  Description: data.description,
  Thumbnail: isFileValue(data.thumbnailUrl) ? data.thumbnailUrl : null
})

const buildUpdateCourseFormData = (data) => buildFormData({
  Name: data.title,
  Language: data.language ? data.language.toUpperCase() : "",
  Description: data.description,
  Thumbnail: isFileValue(data.thumbnailUrl) ? data.thumbnailUrl : null,
  ThumbnailUrl: typeof data.thumbnailUrl === "string" ? data.thumbnailUrl : null
})

const mapToStandardDayOfWeek = (day) => {
  if (!day) return "MON"
  const dayStr = String(day).trim().toUpperCase()
  const mapping = {
    "MON": "MON",
    "TUE": "TUE",
    "WED": "WED",
    "THU": "THU",
    "FRI": "FRI",
    "SAT": "SAT",
    "SUN": "SUN",
    "MONDAY": "MON",
    "TUESDAY": "TUE",
    "WEDNESDAY": "WED",
    "THURSDAY": "THU",
    "FRIDAY": "FRI",
    "SATURDAY": "SAT",
    "SUNDAY": "SUN"
  }
  return mapping[dayStr] || "MON"
}

const getClassSchedule = (data) => {
  if (data.schedule) {
    return data.schedule.map(s => ({
      dayOfWeek: mapToStandardDayOfWeek(s.dayOfWeek),
      startTime: s.startTime,
      endTime: s.endTime
    }))
  }

  return (data.scheduleDays || []).map(day => ({
    dayOfWeek: mapToStandardDayOfWeek(day),
    startTime: data.scheduleStartTime || "19:00",
    endTime: data.scheduleEndTime || "21:00"
  }))
}

const buildCreateClassFormData = (data) => buildFormData({
  CourseId: data.courseId ? parseInt(data.courseId) : null,
  Name: data.title,
  Language: data.language ? data.language.toUpperCase() : "",
  Levels: data.levels || [],
  Description: data.description,
  TotalSessions: parseInt(data.totalSessions || 24),
  EnrollmentStart: data.enrollmentStart || null,
  EnrollmentEnd: data.enrollmentEnd || null,
  StartDate: data.startDate || null,
  Capacity: parseInt(data.slots || 10),
  Price: parseFloat(data.tuitionFee || 0),
  Thumbnail: isFileValue(data.thumbnailUrl) ? data.thumbnailUrl : null,
  Schedule: getClassSchedule(data),
  CommissionPercent: data.commissionPercent != null ? parseFloat(data.commissionPercent) : null
})

export const coursesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Student Endpoints
    getStudentEnrolledCourses: builder.query({
      query: (params) => ({
        url: "/student/classes/my-enrollments",
        method: "GET",
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 100,
        },
      }),
      transformResponse: (response) => {
        const rawItems = response?.data || response?.items || (Array.isArray(response) ? response : [])
        // Map enrolled classes back to course structures for the StudentDashboard
        return rawItems.map(cls => ({
          id: cls.courseId?.toString() || "",
          name: cls.courseName || "Untitled Course",
          title: cls.courseName || "Untitled Course",
          language: cls.language || "English",
          levels: cls.levels || ["A1"],
          description: cls.courseName ? `Enrolled in class ${cls.name}` : "",
          totalSessions: cls.progress?.totalSessions || 24,
          classCount: 1,
          studentCount: cls.studentCount || 0,
          status: cls.status || "OPEN",
          thumbnailUrl: cls.thumbnailUrl || "",
          enrolledClassId: cls.id?.toString() || "",
          enrolledClassName: cls.name || "",
          progress: cls.progress || { completedSessions: 0, totalSessions: 24 }
        }))
      },
      providesTags: ["StudentCourses", "StudentClasses"]
    }),

    getStudentAvailableCourses: builder.query({
      query: (params) => ({
        url: "/student/courses",
        method: "GET",
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 100,
          language: params?.language,
          search: params?.search,
        },
      }),
      transformResponse: (response) => {
        const paginated = transformPaginatedResponse(response, transformCourse)
        return paginated.data
      },
      providesTags: ["StudentCourses"]
    }),

    getStudentJoinedClasses: builder.query({
      query: (params) => ({
        url: "/student/classes/my-enrollments",
        method: "GET",
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 100,
        },
      }),
      transformResponse: (response) => {
        const paginated = transformPaginatedResponse(response, transformClass)
        return paginated.data
      },
      providesTags: ["StudentClasses"]
    }),

    getStudentCourseDetail: builder.query({
      query: (id) => ({
        url: `/student/courses/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data || response
        if (!data) return null
        const transformedCourse = transformCourse(data)
        const transformedClasses = (data.classes || []).map(cls => ({
          ...transformClass(cls),
          isEnrolled: cls.isEnrolled || false,
          enrolledCount: cls.enrolledCount || 0
        }))
        const enrolledClass = transformedClasses.find(cls => cls.isEnrolled)
        return {
          ...transformedCourse,
          enrolledClassId: enrolledClass?.id || null,
          enrolledClassName: enrolledClass?.name || enrolledClass?.title || null,
          classes: transformedClasses
        }
      },
      providesTags: (result, error, id) => [{ type: "CourseDetail", id }]
    }),

    getStudentClassDetail: builder.query({
      query: (id) => ({
        url: `/student/classes/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data || response
        if (!data) return null
        return {
          ...transformClass(data),
          isEnrolled: data.isEnrolled || false,
          enrolledCount: data.enrolledCount || 0,
          nextSession: transformNextSession(data),
          teachingProgress: data.teachingProgress || {
            completed: data.completedSessions || 0,
            total: data.totalSessions || 24,
            percentage: Math.round(((data.completedSessions || 0) / (data.totalSessions || 24)) * 100)
          }
        }
      },
      providesTags: (result, error, id) => [{ type: "ClassDetail", id }]
    }),

    enrollInCourse: builder.mutation({
      query: ({ classId }) => ({
        url: "/v1/Payments/checkout",
        method: "POST",
        body: {
          paymentType: "ClassEnrollment",
          classId: parseInt(classId),
          pendingClassData: "",
          returnUrl: window.location.origin + `/workspace/courses/class/${classId}`,
          cancelUrl: window.location.href,
          planId: 0,
        },
      }),
      invalidatesTags: ["StudentCourses", "StudentClasses"]
    }),

    // 1. Overview Dashboard
    getMyCoursesOverview: builder.query({
      query: () => ({
        url: "/teacher/my-courses/overview",
        method: "GET",
      }),
      providesTags: ["Courses", "Classes"],
    }),

    // 2. Get All Courses
    getAllCourses: builder.query({
      query: (params) => ({
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
      transformResponse: (response) => transformPaginatedResponse(response, transformCourse),
      providesTags: ["Courses"],
    }),

    // 3. Get All Classes
    getAllClasses: builder.query({
      query: (params) => ({
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
      transformResponse: (response) => transformPaginatedResponse(response, transformClass),
      providesTags: ["Classes"],
    }),

    // 4. Get Course Detail
    getCourseDetail: builder.query({
      query: (id) => ({
        url: `/teacher/courses/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data || response
        if (!data) return null
        return {
          ...transformCourse(data),
          classes: (data.classes || []).map(transformClass)
        }
      },
      providesTags: (result, error, id) => [{ type: "CourseDetail", id }],
    }),

    // 5. Get Class Detail
    getClassDetail: builder.query({
      query: (id) => ({
        url: `/teacher/classes/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data || response
        if (!data) return null

        const nextSession = transformNextSession(data)

        const teachingProgress = data.teachingProgress || {
          completed: data.completedSessions || 0,
          total: data.totalSessions || 24,
          percentage: Math.round(((data.completedSessions || 0) / (data.totalSessions || 24)) * 100)
        }

        return {
          ...transformClass(data),
          nextSession,
          teachingProgress
        }
      },
      providesTags: (result, error, id) => [{ type: "ClassDetail", id }],
    }),

    // 6. Get Class Members
    getClassMembers: builder.query({
      query: ({ classId, ...params }) => ({
        url: `/teacher/classes/${classId}/members`,
        method: "GET",
        params,
      }),
      providesTags: (result, error, { classId }) => [{ type: "ClassMembers", id: classId }],
    }),

    // 7. Get Teacher Profile
    getTeacherProfile: builder.query({
      query: () => ({
        url: "/teacher/profile",
        method: "GET",
      }),
      providesTags: ["TeacherProfile"],
    }),

    // 8. Search Students pool
    searchStudents: builder.query({
      query: (q) => ({
        url: "/teacher/students/search",
        method: "GET",
        params: { q },
      }),
    }),

    // 9. Create Course
    createCourse: builder.mutation({
      query: (data) => ({
        url: "/teacher/courses",
        method: "POST",
        body: buildCreateCourseFormData(data),
        formData: true,
      }),
      transformResponse: (response) => transformCourse(response?.data || response),
      invalidatesTags: ["Courses"],
    }),

    // 9b. Update Course
    updateCourse: builder.mutation({
      query: ({ id, data }) => ({
        url: `/teacher/courses/${id}`,
        method: "PUT",
        body: buildUpdateCourseFormData(data),
        formData: true,
      }),
      transformResponse: (response) => transformCourse(response?.data || response),
      invalidatesTags: (result, error, { id }) => [
        { type: "CourseDetail", id },
        "Courses",
      ],
    }),

    // 9c. Delete Course
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/teacher/courses/${id}`,
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
        const pendingClassData = {
          courseId: data.courseId ? parseInt(data.courseId) : null,
          name: data.title || data.name,
          language: data.language ? data.language.toUpperCase() : "",
          levels: data.levels || [],
          enrollmentStart: data.enrollmentStart || null,
          enrollmentEnd: data.enrollmentEnd || null,
          startDate: data.startDate || null,
          schedule,
          capacity: parseInt(data.slots || data.capacity || 10),
          totalSessions: parseInt(data.totalSessions || 24),
          price: parseFloat(data.tuitionFee || data.price || 0),
          description: data.description || "",
          timezone: data.timezone || "Asia/Ho_Chi_Minh",
        }
        return {
          url: "/v1/Payments/checkout",
          method: "POST",
          body: {
            paymentType: "ClassOpeningFee",
            pendingClassData: JSON.stringify(pendingClassData),
            returnUrl: window.location.origin + "/workspace/courses/all-classes",
            cancelUrl: window.location.href,
            planId: 0,
            classId: 0,
          },
        }
      },
      invalidatesTags: ["Classes", "Courses"],
    }),

    // 11. Update Class
    updateClass: builder.mutation({
      query: ({ id, data }) => ({
        url: `/teacher/classes/${id}`,
        method: "PUT",
        body: buildCreateClassFormData(data),
        formData: true,
      }),
      transformResponse: (response) => transformClass(response?.data || response),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClassDetail", id },
        "Classes",
      ],
    }),

    // 12. Delete Class
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/teacher/classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Classes", "Courses"],
    }),

    // 13. Join Class Room
    joinClassRoom: builder.mutation({
      query: (classId) => ({
        url: `/teacher/classes/${classId}/join-room`,
        method: "POST",
      }),
    }),

    // 13b. Join Student Class Room
    joinStudentClassRoom: builder.mutation({
      query: (classId) => ({
        url: `/student/classes/${classId}/join-room`,
        method: "POST",
      }),
    }),


    // 14. Get Class Feed
    getClassFeed: builder.query({
      query: (classId) => ({
        url: `/teacher/classes/${classId}/feed`,
        method: "GET",
      }),
      providesTags: (result, error, classId) => [{ type: "ClassFeed", id: classId }],
    }),

    // 15. Create Class Post
    createClassPost: builder.mutation({
      query: ({ classId, content }) => ({
        url: `/teacher/classes/${classId}/feed`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { classId }) => [{ type: "ClassFeed", id: classId }],
    }),

    // 16. Get Class Grading
    getClassGrading: builder.query({
      query: (classId) => ({
        url: `/teacher/classes/${classId}/grading`,
        method: "GET",
      }),
      providesTags: (result, error, classId) => [{ type: "ClassGrading", id: classId }],
    }),

    // 17. Grade Assignment
    gradeAssignment: builder.mutation({
      query: ({ classId, assignmentId, grade }) => ({
        url: `/teacher/assignments/${assignmentId}/grade`,
        method: "POST",
        body: { classId, grade },
      }),
      invalidatesTags: (result, error, { classId }) => [{ type: "ClassGrading", id: classId }],
    }),

    // 18. Update Attendance
    updateClassMemberAttendance: builder.mutation({
      query: ({ classId, studentId, attendance }) => ({
        url: `/teacher/classes/${classId}/attendance`,
        method: "POST",
        body: { studentId, attendance },
      }),
      invalidatesTags: (result, error, { classId }) => [{ type: "ClassMembers", id: classId }],
    }),

    // ─── Materials Management ───────────────────────────────────────

    getClassMaterials: builder.query({
      async queryFn(classId, _queryApi, _extraOptions, baseQuery) {
        if (typeof classId === "string" && (classId.startsWith("c") || classId.startsWith("mock"))) {
          const mockFiles = [
            { id: "m1", name: "Syllabus_Introduction.pdf", size: 1024 * 350, fileUrl: "#", uploadedAt: "2026-06-25T10:00:00Z" },
            { id: "m2", name: "Vocabulary_Lesson_1_Travel.docx", size: 1024 * 120, fileUrl: "#", uploadedAt: "2026-06-26T12:00:00Z" },
            { id: "m3", name: "Homework_Reading_Passage.pdf", size: 1024 * 1800, fileUrl: "#", uploadedAt: "2026-06-27T15:30:00Z" }
          ]
          return { data: mockFiles }
        }
        try {
          const result = await baseQuery({
            url: `/teacher/classes/${classId}/materials`,
            method: "GET"
          })
          if (result.error) return { error: result.error }
          return { data: result.data?.data || result.data }
        } catch (error) {
          return { error: { status: 400, message: error.message } }
        }
      },
      providesTags: (result, error, classId) => [{ type: "ClassMaterials", id: classId }]
    }),

    uploadClassMaterial: builder.mutation({
      query: ({ classId, file }) => {
        const formData = new FormData()
        formData.append("file", file)
        return {
          url: `/teacher/classes/${classId}/materials`,
          method: "POST",
          body: formData
        }
      },
      invalidatesTags: (result, error, { classId }) => [{ type: "ClassMaterials", id: classId }]
    }),

    deleteClassMaterial: builder.mutation({
      query: ({ classId, materialId }) => ({
        url: `/teacher/classes/${classId}/materials/${materialId}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, { classId }) => [{ type: "ClassMaterials", id: classId }]
    }),

    // ─── Schedule ─────────────────────────────────────────────────────

    getScheduleDates: builder.query({
      query: ({ from, to, classId } = {}) => ({
        url: "/teacher/schedule/dates",
        method: "GET",
        params: { from, to, classId },
      }),
      transformResponse: (response) => {
        const rawDates = response?.dates || response?.data?.dates || (Array.isArray(response) ? response : [])
        const converted = rawDates.map(dStr => parseToLocalDateStr(dStr))
        return {
          ...response,
          dates: converted
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
        const rawSessions = response?.data || response?.items || (Array.isArray(response) ? response : [])
        const converted = rawSessions.map(session => ({
          ...session,
          startTime: parseToLocalTimeStr(session.startTime),
          endTime: parseToLocalTimeStr(session.endTime),
          date: parseToLocalDateStr(session.startTime),
          class: session.class ? {
            ...session.class,
            id: session.class.id?.toString() || ""
          } : null
        }))
        return {
          ...response,
          data: converted
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
  }),
})

export const {
  useGetStudentEnrolledCoursesQuery,
  useGetStudentAvailableCoursesQuery,
  useGetStudentJoinedClassesQuery,
  useGetStudentCourseDetailQuery,
  useGetStudentClassDetailQuery,
  useEnrollInCourseMutation,
  useGetMyCoursesOverviewQuery,
  useGetAllCoursesQuery,
  useGetAllClassesQuery,
  useGetCourseDetailQuery,
  useGetClassDetailQuery,
  useGetClassMembersQuery,
  useGetTeacherProfileQuery,
  useSearchStudentsQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetClassFeedQuery,
  useCreateClassPostMutation,
  useGetClassGradingQuery,
  useGradeAssignmentMutation,
  useUpdateClassMemberAttendanceMutation,
  // Materials hooks
  useGetClassMaterialsQuery,
  useUploadClassMaterialMutation,
  useDeleteClassMaterialMutation,
  // Schedule hooks
  useGetScheduleDatesQuery,
  useGetScheduleSessionsQuery,
  // Commission hooks
  useGetCommissionQuery,
  // Virtual Room hooks
  useJoinClassRoomMutation,
  useJoinStudentClassRoomMutation,
} = coursesApi
