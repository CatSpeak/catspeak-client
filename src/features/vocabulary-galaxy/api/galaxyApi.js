import { baseApi } from "@/store/api/baseApi"

/**
 * API dữ liệu Galaxy gọn (FE-07 <-> BE-05). Bật bằng VITE_FF_GALAXY_API=1.
 *
 *   GET /v1/flashcards/galaxy
 *   200 {
 *     clusters: [{ id, label, color? }],
 *     words:    [{ id, word, pinyin, meaning, cluster_id, galaxy_state }]  // 0..3, hoặc trường FSRS thô (fsrs_state, stability)
 *   }
 *
 * Không có definition/audio trong payload. Server trả ETag: fetch dùng HTTP cache mặc định nên
 * trình duyệt tự gửi If-None-Match và nhận 304 — FE không cần code thêm.
 */
export const galaxyApi = baseApi.enhanceEndpoints({ addTagTypes: ["Galaxy"] }).injectEndpoints({
  endpoints: (builder) => ({
    getGalaxy: builder.query({
      query: () => "/v1/flashcards/galaxy",
      providesTags: ["Galaxy"],
      keepUnusedDataFor: 300,
    }),
  }),
  overrideExisting: false,
})

export const { useGetGalaxyQuery } = galaxyApi
