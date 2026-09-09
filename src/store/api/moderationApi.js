import { baseApi } from "./baseApi"

/**
 * Kiểm duyệt nội dung (TASK-AI-10).
 *
 * Chỉ phục vụ chat phòng meet. Mọi luồng khác — bình luận, tiêu đề reel, video —
 * đã được backend duyệt trước khi lưu, client không phải làm gì.
 *
 * Chat phòng meet là ngoại lệ vì tin đi thẳng client → LiveKit → client qua data
 * channel, không có chỗ nào bên .NET chen vào được. Nên client phải tự gọi mask
 * trước rồi mới gửi bản sạch vào phòng.
 */
export const moderationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    maskText: builder.mutation({
      query: (data) => ({
        url: "/moderation/text",
        method: "POST",
        body: data, // { text: "..." }
      }),
    }),
  }),
})

export const { useMaskTextMutation } = moderationApi
