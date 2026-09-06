import { baseApi } from "./baseApi";

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
        roomName,
      } = {}) => {
        const params = new URLSearchParams({
          page,
          pageSize,
        });
        if (roomType) params.append("roomType", roomType);
        if (roomName) params.append("roomName", roomName);
        if (languageType) {
          if (Array.isArray(languageType)) {
            languageType.forEach((lang) =>
              params.append("languageTypes", lang),
            );
          } else {
            params.append("languageTypes", languageType);
          }
        }
        if (categories) {
          if (Array.isArray(categories)) {
            categories.forEach((cat) => params.append("categories", cat));
          } else {
            params.append("categories", categories);
          }
        }
        if (requiredLevels) {
          if (Array.isArray(requiredLevels)) {
            requiredLevels.forEach((level) =>
              params.append("requiredLevels", level),
            );
          } else {
            params.append("requiredLevels", requiredLevels);
          }
        }
        if (topics) {
          if (Array.isArray(topics)) {
            topics.forEach((topic) => params.append("topics", topic));
          } else {
            params.append("topics", topics);
          }
        }

        return `/rooms?${params.toString()}`;
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

    // Create a 1:1 AI tutor session. Returns { roomId }.
    createAISession: builder.mutation({
      query: (body) => ({
        url: "/rooms/ai-session",
        method: "POST",
        body,
      }),
    }),

    // --- Breakout Rooms ---
    setupBreakoutGroups: builder.mutation({
      query: ({
        sessionId,
        groups,
        timerDuration,
        allowParticipantChangeRoom,
        maxParticipantsPerRoom,
      }) => ({
        url: `/rooms/${sessionId}/breakout/setup`,
        method: "POST",
        body: {
          groups,
          timerDuration,
          allowParticipantChangeRoom,
          maxParticipantsPerRoom,
        },
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: "Breakout", id: sessionId },
      ],
    }),

    getBreakoutStatus: builder.query({
      query: (sessionId) => `/rooms/${sessionId}/breakout/status`,
      providesTags: (result, error, sessionId) => [
        { type: "Breakout", id: sessionId },
      ],
    }),

    startBreakoutRooms: builder.mutation({
      query: (sessionId) => ({
        url: `/rooms/${sessionId}/breakout/start`,
        method: "POST",
      }),
      invalidatesTags: (result, error, sessionId) => [
        { type: "Breakout", id: sessionId },
      ],
    }),

    stopBreakoutRooms: builder.mutation({
      query: (sessionId) => ({
        url: `/rooms/${sessionId}/breakout/stop`,
        method: "POST",
      }),
      invalidatesTags: (result, error, sessionId) => [
        { type: "Breakout", id: sessionId },
      ],
    }),

    joinBreakoutRoom: builder.mutation({
      query: ({ sessionId, subSessionId }) => ({
        url: `/rooms/${sessionId}/breakout/join/${subSessionId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: "Breakout", id: sessionId },
      ],
    }),

    moveParticipant: builder.mutation({
      query: ({ sessionId, accountId, targetSubSessionId }) => ({
        url: `/rooms/${sessionId}/breakout/move`,
        method: "POST",
        body: { accountId, targetSubSessionId },
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: "Breakout", id: sessionId },
      ],
    }),

    studentSwitchBreakoutRoom: builder.mutation({
      query: ({ sessionId, targetSubSessionId }) => ({
        url: `/rooms/${sessionId}/breakout/switch/${targetSubSessionId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: "Breakout", id: sessionId },
      ],
    }),

    toggleAllowChangeRoom: builder.mutation({
      query: ({ sessionId, allowParticipantChangeRoom }) => ({
        url: `/rooms/${sessionId}/breakout/toggle-allow-change`,
        method: "POST",
        body: { allowParticipantChangeRoom },
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: "Breakout", id: sessionId },
      ],
    }),

    broadcastBreakoutNotification: builder.mutation({
      query: ({ sessionId, message }) => ({
        url: `/rooms/${sessionId}/breakout/broadcast`,
        method: "POST",
        body: { message },
      }),
    }),

    // Get game history for a specific room
    getGameHistory: builder.query({
      query: ({
        roomId,
        page = 1,
        pageSize = 4,
        startDate = null,
        endDate = null,
      }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        return {
          url: `/games/${roomId}/history?${params.toString()}`,
        };
      },
    }),

    // --- Pro Custom Rooms ---
    // Get current user's custom rooms and usage quota
    getMyCustomRooms: builder.query({
      query: () => "/rooms/my-custom-rooms",
      providesTags: ["CustomRooms"],
    }),

    // Create a new Pro Custom Room
    createCustomRoom: builder.mutation({
      query: (body) => ({
        url: "/rooms/custom",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CustomRooms", "Rooms"],
    }),

    // Update an existing Pro Custom Room
    updateCustomRoom: builder.mutation({
      query: ({ id, data }) => ({
        url: `/rooms/custom/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "CustomRooms", id },
        "CustomRooms",
        "Rooms",
      ],
    }),

    // Delete (soft delete) a Pro Custom Room
    deleteCustomRoom: builder.mutation({
      query: (id) => ({
        url: `/rooms/custom/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomRooms", "Rooms"],
    }),

    // --- Co-host foundation (ticket 01) ---
    getRoomCoHost: builder.query({
      query: (id) => `/rooms/${id}/co-host`,
      providesTags: (result, error, id) => [{ type: "CoHost", id }],
    }),
    assignRoomCoHost: builder.mutation({
      query: ({ id, coHostAccountId, permissions }) => ({
        url: `/rooms/${id}/co-host`,
        method: "POST",
        body: { coHostAccountId, permissions },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "CoHost", id },
        "Rooms",
        "CustomRooms",
      ],
    }),
    updateRoomCoHost: builder.mutation({
      query: ({ id, permissions }) => ({
        url: `/rooms/${id}/co-host`,
        method: "PUT",
        body: { permissions },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "CoHost", id },
        "Rooms",
        "CustomRooms",
      ],
    }),
    revokeRoomCoHost: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}/co-host`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "CoHost", id },
        "Rooms",
        "CustomRooms",
      ],
    }),

    // --- Host Moderation ---
    // Kick a participant from a room
    kickParticipant: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/rooms/${id}/moderation/kick`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BannedParticipants", id },
      ],
    }),

    // Mute audio/video track of a participant
    // Ticket 02: body { targetAccountId, trackSid?, trackKind?: 'audio'|'video', muted }
    muteParticipant: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/rooms/${id}/moderation/mute`,
        method: "POST",
        body,
      }),
    }),

    // Ticket 02: mute all mics at once (verify sender holds mute_all, excludes self)
    muteAllParticipants: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}/moderation/mute-all`,
        method: "POST",
      }),
    }),

    // Ticket 02: session-level self-unmute gate (default open)
    getSelfUnmutePolicy: builder.query({
      query: (id) => `/rooms/${id}/moderation/self-unmute-policy`,
      providesTags: (result, error, id) => [{ type: "SelfUnmutePolicy", id }],
    }),
    updateSelfUnmutePolicy: builder.mutation({
      query: ({ id, allow }) => ({
        url: `/rooms/${id}/moderation/self-unmute-policy`,
        method: "PUT",
        body: { allow },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SelfUnmutePolicy", id },
      ],
    }),

    // Get list of banned participants for a room
    getBannedParticipants: builder.query({
      query: (id) => `/rooms/${id}/moderation/banned-participants`,
      providesTags: (result, error, id) => [{ type: "BannedParticipants", id }],
    }),

    // Unban a participant from rejoining a room
    unbanParticipant: builder.mutation({
      query: ({ id, targetAccountId }) => ({
        url: `/rooms/${id}/moderation/unban`,
        method: "POST",
        body: { targetAccountId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "BannedParticipants", id }],
    }),

    // --- Ticket 03: waiting queue ---
    // Class pre-fills client-side from Pending enrollments; Custom fills on knock.
    getWaitingQueue: builder.query({
      query: (id) => `/rooms/${id}/waiting`,
      providesTags: (result, error, id) => [{ type: "WaitingQueue", id }],
    }),
    getMyWaitingStatus: builder.query({
      query: (id) => `/rooms/${id}/waiting/me`,
      providesTags: (result, error, id) => [{ type: "WaitingQueue", id }],
    }),
    knockWaiting: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}/waiting/knock`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "WaitingQueue", id }],
    }),
    admitWaiting: builder.mutation({
      query: ({ id, targetAccountId }) => ({
        url: `/rooms/${id}/waiting/admit`,
        method: "POST",
        body: { targetAccountId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "WaitingQueue", id }],
    }),
    rejectWaiting: builder.mutation({
      query: ({ id, targetAccountId }) => ({
        url: `/rooms/${id}/waiting/reject`,
        method: "POST",
        body: { targetAccountId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "WaitingQueue", id }],
    }),

    // --- Ticket 04: room lock + end live for all ---
    // Lock persists until manually unlocked; end closes the live session only.
    getRoomLock: builder.query({
      query: (id) => `/rooms/${id}/lock`,
      providesTags: (result, error, id) => [{ type: "RoomLock", id }],
    }),
    updateRoomLock: builder.mutation({
      query: ({ id, locked }) => ({
        url: `/rooms/${id}/lock`,
        method: "PUT",
        body: { locked },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "RoomLock", id }],
    }),
    endLiveSession: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}/end-live`,
        method: "POST",
      }),
    }),



    // Invite user(s) to a room
    inviteToRoom: builder.mutation({
      query: ({ roomId, accountIds, accountId }) => {
        const resolvedAccountIds = Array.isArray(accountIds)
          ? accountIds.map(Number).filter((id) => !isNaN(id) && id > 0)
          : (accountId != null ? [Number(accountId)] : (accountIds != null ? [Number(accountIds)] : []))
        return {
          url: `/rooms/${roomId}/invite`,
          method: "POST",
          body: {
            accountIds: resolvedAccountIds,
          },
        }
      },
    }),

    // --- My Rooms, Bookmarks & Advanced Room Creation ---

    // 1. API: Lấy danh sách phòng theo Tab (Get My Rooms)
    // Mục đích: Hiển thị danh sách các phòng mình đã tạo (Tab Created) hoặc phòng đã lưu (Tab Bookmark) kèm bộ lọc, tìm kiếm và phân trang
    getMyRooms: builder.query({
      query: ({
        tab = "created",
        search,
        roomType,
        visibility,
        activity,
        language,
        sort = "newest",
        page = 1,
        pageSize = 10,
      } = {}) => {
        const params = new URLSearchParams();
        if (tab) params.append("tab", tab);
        if (search) params.append("search", search);
        if (roomType && roomType !== "All") params.append("roomType", roomType);
        if (visibility && visibility !== "All")
          params.append("visibility", visibility);
        if (activity && activity !== "All") params.append("activity", activity);
        if (language && language !== "All") params.append("language", language);
        if (sort) params.append("sort", sort);
        if (page !== undefined && page !== null) params.append("page", page);
        if (pageSize !== undefined && pageSize !== null)
          params.append("pageSize", pageSize);

        return `/rooms/my-rooms?${params.toString()}`;
      },
      providesTags: ["Rooms", "CustomRooms"],
    }),

    // 2. API: Lưu / Bỏ lưu phòng (Toggle Bookmark)
    // Mục đích: Đánh dấu lưu hoặc bỏ lưu một phòng ở khu vực Community
    toggleBookmarkRoom: builder.mutation({
      query: (id) => {
        const roomId = typeof id === "object" ? (id?.id ?? id?.roomId) : id;
        return {
          url: `/rooms/${roomId}/bookmark`,
          method: "POST",
        };
      },
      invalidatesTags: ["Rooms", "CustomRooms"],
    }),

    // 3. API: Tạo phòng nâng cao (Create New Room)
    // Mục đích: Tạo phòng mới với các trường nâng cao (maxParticipants, privacy, password, languageType, topic, roomType, description, thumbnail)
    createAdvancedRoom: builder.mutation({
      query: (roomData) => {
        let body = roomData;
        if (
          !(roomData instanceof FormData) &&
          typeof roomData === "object" &&
          roomData !== null
        ) {
          const formData = new FormData();
          Object.entries(roomData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(key, value);
            }
          });
          body = formData;
        }
        return {
          url: "/rooms/create",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Rooms", "CustomRooms"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useVerifyJoinRoomMutation,
  useCreateAISessionMutation,
  useSetupBreakoutGroupsMutation,
  useGetBreakoutStatusQuery,
  useStartBreakoutRoomsMutation,
  useStopBreakoutRoomsMutation,
  useJoinBreakoutRoomMutation,
  useMoveParticipantMutation,
  useStudentSwitchBreakoutRoomMutation,
  useToggleAllowChangeRoomMutation,
  useBroadcastBreakoutNotificationMutation,
  useGetGameHistoryQuery,
  // Custom Rooms
  useGetMyCustomRoomsQuery,
  useCreateCustomRoomMutation,
  useUpdateCustomRoomMutation,
  useDeleteCustomRoomMutation,
  // Host Moderation
  useKickParticipantMutation,
  useMuteParticipantMutation,
  useMuteAllParticipantsMutation,
  useGetSelfUnmutePolicyQuery,
  useUpdateSelfUnmutePolicyMutation,
  useGetBannedParticipantsQuery,
  useUnbanParticipantMutation,
  useInviteToRoomMutation,
  // Ticket 03: waiting queue
  useGetWaitingQueueQuery,
  useGetMyWaitingStatusQuery,
  useKnockWaitingMutation,
  useAdmitWaitingMutation,
  useRejectWaitingMutation,
  // Ticket 04: room lock + end live
  useGetRoomLockQuery,
  useUpdateRoomLockMutation,
  useEndLiveSessionMutation,
  // Co-host foundation
  useGetRoomCoHostQuery,
  useLazyGetRoomCoHostQuery,
  useAssignRoomCoHostMutation,
  useUpdateRoomCoHostMutation,
  useRevokeRoomCoHostMutation,
  // My Rooms & Bookmarks & Advanced Room Creation
  useGetMyRoomsQuery,
  useLazyGetMyRoomsQuery,
  useToggleBookmarkRoomMutation,
  useCreateAdvancedRoomMutation,
} = roomsApi;

