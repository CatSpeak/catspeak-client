import { baseApi } from "./baseApi"

export const recordingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Recording APIs ──────────────────────────────────────────────────
    startRecording: builder.mutation({
      query: ({ roomName, sessionId }) => ({
        url: "/livekit/start-recording",
        method: "POST",
        body: { roomName, sessionId },
      }),
      // Storage will change once recording completes (via webhook),
      // but we invalidate proactively so the UI can refetch if needed.
      invalidatesTags: ["Storage"],
    }),
    stopRecording: builder.mutation({
      query: (egressId) => ({
        url: "/livekit/stop-recording",
        method: "POST",
        body: { egressId },
      }),
      // A new recording entry will appear in the list once processing finishes.
      invalidatesTags: ["Recordings", "Storage"],
    }),

    // ── Recording Management APIs ───────────────────────────────────────
    getMyRecordings: builder.query({
      query: () => "/livekit/my-recordings",
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "Recordings", id: r.recordingId })),
              { type: "Recordings", id: "LIST" },
            ]
          : [{ type: "Recordings", id: "LIST" }],
    }),
    getMyRecordingById: builder.query({
      query: (recordingId) => `/livekit/my-recordings/${recordingId}`,
      providesTags: (result, error, recordingId) => [
        { type: "Recordings", id: recordingId },
      ],
    }),
    deleteRecording: builder.mutation({
      query: (recordingId) => ({
        url: `/livekit/my-recordings/${recordingId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, recordingId) => [
        { type: "Recordings", id: recordingId },
        { type: "Recordings", id: "LIST" },
        "Storage",
      ],
    }),

    // ── Storage API ─────────────────────────────────────────────────────
    getStorage: builder.query({
      query: () => "/livekit/storage",
      providesTags: ["Storage"],
    }),

    // ── Google Drive API ────────────────────────────────────────────────
    uploadRecordingToDrive: builder.mutation({
      query: ({ recordingId, googleAccessToken }) => ({
        url: `/livekit/my-recordings/${recordingId}/upload-drive`,
        method: "POST",
        body: { googleAccessToken },
      }),
      invalidatesTags: (result, error, { recordingId }) => [
        { type: "Recordings", id: recordingId },
        { type: "Recordings", id: "LIST" },
        "Storage",
      ],
    }),
    getRecordingsBySession: builder.query({
      query: (sessionId) => `/livekit/recordings/session/${sessionId}`,
      providesTags: ["Recordings"],
    }),
  }),
})

export const {
  useStartRecordingMutation,
  useStopRecordingMutation,
  useGetMyRecordingsQuery,
  useGetMyRecordingByIdQuery,
  useDeleteRecordingMutation,
  useGetStorageQuery,
  useUploadRecordingToDriveMutation,
  useGetRecordingsBySessionQuery,
} = recordingsApi
