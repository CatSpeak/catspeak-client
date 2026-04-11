import { baseApi } from "./baseApi"

// Rooms API slice
export const roomsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all rooms created by the current user
    getRooms: builder.query({
      query: ({
        page = 1,
        pageSize = 10,
        roomType,
        languageType,
        requiredLevels,
        categories,
        topics,
      } = {}) => {
        const params = new URLSearchParams({
          page,
          pageSize,
        })
        if (roomType) params.append("roomType", roomType)
        if (languageType) {
          if (Array.isArray(languageType)) {
            languageType.forEach((lang) => params.append("languageTypes", lang))
          } else {
            params.append("languageTypes", languageType)
          }
        }
        if (categories) {
          if (Array.isArray(categories)) {
            params.append("categories", categories.join(", "))
          } else {
            params.append("categories", categories)
          }
        }
        if (requiredLevels) {
          if (Array.isArray(requiredLevels)) {
            requiredLevels.forEach((level) =>
              params.append("requiredLevels", level),
            )
          } else {
            params.append("requiredLevels", requiredLevels)
          }
        }
        if (topics) {
          if (Array.isArray(topics)) {
            topics.forEach((topic) => params.append("topics", topic))
          } else {
            params.append("topics", topics)
          }
        }

        return `/rooms?${params.toString()}`
      },
      providesTags: ["Rooms"],
    }),

    // Get a single room by ID
    getRoomById: builder.query({
      query: (id) => `/rooms/${id}`,
      providesTags: (result, error, id) => [{ type: "Rooms", id }],
    }),

    // Create a new room
    createRoom: builder.mutation({
      query: (roomData) => ({
        url: "/rooms",
        method: "POST",
        body: roomData,
      }),
      invalidatesTags: ["Rooms"],
    }),

    // Delete a room
    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rooms"],
    }),

    // Verify if user can join a room (password check for private rooms)
    verifyJoinRoom: builder.mutation({
      query: ({ roomId, password }) => ({
        url: "/rooms/verify-join",
        method: "POST",
        body: { roomId, ...(password ? { password } : {}) },
      }),
    }),
  }),
})

// Export hooks for usage in components
export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useVerifyJoinRoomMutation,
} = roomsApi
