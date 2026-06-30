import { baseApi } from "./baseApi"

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
      startTime: cls.schedule[0]?.startTime || "00:00",
      endTime: cls.schedule[0]?.endTime || "00:00"
    } : (cls.nextSession ? {
      days: [],
      startTime: cls.nextSession.startTime || "00:00",
      endTime: cls.nextSession.endTime || "00:00"
    } : { days: [], startTime: "00:00", endTime: "00:00" }),
    rawSchedule: Array.isArray(cls.schedule) ? cls.schedule.map(s => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime || "00:00",
      endTime: s.endTime || "00:00"
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

        const nextSession = data.nextSession || {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: data.schedule?.[0]?.startTime || "19:00",
          endTime: data.schedule?.[0]?.endTime || "21:00",
          isLive: false,
          countdown: { days: 2, hours: 0, minutes: 0 }
        }

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

    // 10. Create Class
    createClass: builder.mutation({
      query: (data) => ({
        url: "/teacher/classes",
        method: "POST",
        body: buildCreateClassFormData(data),
        formData: true,
      }),
      transformResponse: (response) => transformClass(response?.data || response),
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

    // 12a. Join Class Room
    joinClassRoom: builder.mutation({
      query: (classId) => ({
        url: `/teacher/classes/${classId}/join-room`,
        method: "POST",
      }),
    }),

    // 12b. Create Instructor Room
    createInstructorRoom: builder.mutation({
      query: ({ accountId, roomName, topic, description }) => ({
        url: `/v1/InstructorRooms/create/${accountId}`,
        method: "POST",
        body: { roomName, topic, description },
      }),
    }),

    // 13. Check Schedule Conflict
    checkScheduleConflict: builder.mutation({
      query: (schedule) => ({
        url: "/teacher/schedule/check-conflict",
        method: "POST",
        body: schedule,
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
      query: (classId) => ({
        url: `/teacher/classes/${classId}/materials`,
        method: "GET"
      }),
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
      providesTags: ["Schedule"],
    }),

    getScheduleSessions: builder.query({
      query: ({ from, to, classId, language, status } = {}) => ({
        url: "/teacher/schedule/sessions",
        method: "GET",
        params: { from, to, classId, language, status },
      }),
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
  useCheckScheduleConflictMutation,
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
  useCreateInstructorRoomMutation,
  useJoinClassRoomMutation,
} = coursesApi
