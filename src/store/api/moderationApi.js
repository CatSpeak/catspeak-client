import { baseApi } from "./baseApi"

/**
 * Kiểm duyệt nội dung (TASK-AI-10).
 *
 * Endpoint này nằm bên catspeak-api và chuyển tiếp tới dịch vụ kiểm duyệt. Client
 * gọi nó ở những luồng KHÔNG có chỗ nào phía server chen kiểm duyệt vào được:
 *
 *   - chat phòng meet — tin đi client → LiveKit → client qua data channel
 *   - chat 1-1, bài post, bình luận post, thư (stories) — đi tới `Catspeak Social
 *     API`, một microservice riêng ngoài tầm ba repo của nhóm AI
 *
 * Reel (tiêu đề, mô tả, video, ảnh bìa) và bình luận reel thì KHÔNG dùng đường này:
 * catspeak-api đã duyệt trước khi lưu, client không phải làm gì.
 *
 * Cách dùng: `maskBody` trong shared/utils/moderation.js, đừng gọi hook này thẳng.
 */
export const moderationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    maskText: builder.mutation({
      query: (data) => ({
        url: "/moderation/text",
        method: "POST",
        body: data, // { text, context } — context: xem shared/utils/moderationContext.js
      }),
    }),
    // Nhắc dịch vụ kiểm duyệt nạp sẵn model — xem shared/utils/moderationWarmup.js.
    warmModeration: builder.mutation({
      query: (data) => ({
        url: "/moderation/warm",
        method: "POST",
        body: data, // { kinds: ["text"] | ["text", "text-zh"] }
      }),
    }),
  }),
})

export const { useMaskTextMutation } = moderationApi
