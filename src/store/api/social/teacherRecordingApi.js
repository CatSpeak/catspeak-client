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
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetClassRecordingsQuery,
  useCreateClassRecordingMutation,
  useUpdateRecordingPublishStatusMutation,
  useDeleteClassRecordingMutation,
} = teacherRecordingApi
