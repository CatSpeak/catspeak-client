import { baseApi } from "../baseApi"

const encodePathSegment = (val) => encodeURIComponent(String(val ?? ""))

export const teacherRecordingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách video của lớp học
    // GET /api/teacher/classes/{classId}/recordings
    getClassRecordings: builder.query({
      query: (classId) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/recordings`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = response?.data ?? response
        if (Array.isArray(data?.recordings)) {
          return data.recordings
        }
        if (Array.isArray(data)) {
          return data
        }
        return []
      },
      providesTags: (result, error, classId) => [
        { type: "ClassRecordings", id: String(classId) },
        { type: "ClassRecordings", id: "LIST" },
      ],
    }),

    // 2. Lưu hoặc đăng video mới (sau khi tắt record hoặc thêm thủ công)
    // POST /api/teacher/classes/{classId}/recordings
    createClassRecording: builder.mutation({
      query: ({
        classId,
        classSessionId,
        recordingId,
        title,
        isPublished = false,
        videoUrl,
        durationSeconds,
        fileSizeBytes,
      }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/recordings`,
        method: "POST",
        body: {
          classSessionId: Number(classSessionId),
          recordingId: recordingId != null ? Number(recordingId) : null,
          title: title ? String(title).trim() : null,
          isPublished: Boolean(isPublished),
          videoUrl: String(videoUrl).trim(),
          durationSeconds: durationSeconds != null ? Number(durationSeconds) : null,
          fileSizeBytes: fileSizeBytes != null ? Number(fileSizeBytes) : null,
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: "ClassRecordings", id: String(classId) },
        { type: "ClassRecordings", id: "LIST" },
        { type: "StudentClassRecordings", id: String(classId) },
      ],
    }),

    // 3. Thay đổi trạng thái video (Đăng lên giảng đường / Gỡ xuống kho nháp)
    // PUT /api/teacher/classes/{classId}/recordings/{id}/publish-status
    updateRecordingPublishStatus: builder.mutation({
      query: ({ classId, id, isPublished }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/recordings/${encodePathSegment(id)}/publish-status`,
        method: "PUT",
        body: {
          isPublished: Boolean(isPublished),
        },
      }),
      invalidatesTags: (result, error, { classId, id }) => [
        { type: "ClassRecordings", id: String(classId) },
        { type: "ClassRecordings", id: String(id) },
        { type: "ClassRecordings", id: "LIST" },
        { type: "StudentClassRecordings", id: String(classId) },
      ],
    }),

    // 4. Xóa video khỏi danh sách
    // DELETE /api/teacher/classes/{classId}/recordings/{id}`
    deleteClassRecording: builder.mutation({
      query: ({ classId, id }) => ({
        url: `/teacher/classes/${encodePathSegment(classId)}/recordings/${encodePathSegment(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { classId, id }) => [
        { type: "ClassRecordings", id: String(classId) },
        { type: "ClassRecordings", id: String(id) },
        { type: "ClassRecordings", id: "LIST" },
        { type: "StudentClassRecordings", id: String(classId) },
      ],
    }),

    // 5. Lấy danh sách video đã đăng dành cho học viên (có phân trang)
    // GET /api/student/classes/{classId}/recordings?page=1&pageSize=10
    getStudentClassRecordings: builder.query({
      query: (arg) => {
        const classId = typeof arg === "object" ? arg.classId : arg
        const page = typeof arg === "object" ? arg?.page || 1 : 1
        const pageSize = typeof arg === "object" ? arg?.pageSize || 10 : 10
        return {
          url: `/student/classes/${encodePathSegment(classId)}/recordings`,
          method: "GET",
          params: {
            page: Number(page) || 1,
            pageSize: Number(pageSize) || 10,
          },
        }
      },
      transformResponse: (response) => {
        const data = response?.data ?? response
        return {
          recordings: Array.isArray(data?.recordings) ? data.recordings : [],
          pagination: data?.pagination || {
            page: 1,
            pageSize: 10,
            total: Array.isArray(data?.recordings) ? data.recordings.length : 0,
            totalPages: 1,
          },
        }
      },
      providesTags: (result, error, arg) => {
        const classId = typeof arg === "object" ? arg.classId : arg
        return [
          { type: "StudentClassRecordings", id: String(classId) },
          { type: "ClassRecordings", id: String(classId) },
        ]
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetClassRecordingsQuery,
  useCreateClassRecordingMutation,
  useUpdateRecordingPublishStatusMutation,
  useDeleteClassRecordingMutation,
  useGetStudentClassRecordingsQuery,
} = teacherRecordingApi
