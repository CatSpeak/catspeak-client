import { baseApi } from "./baseApi"

// [Moderation] API kiểm duyệt nội dung (feature/text-image-classifier)
// Dùng cho chat phòng meet: mask từ vi phạm thành ★ TRƯỚC khi gửi vào LiveKit
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
