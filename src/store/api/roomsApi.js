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

    // Get game history for a specific room
    getGameHistory: builder.query({
      query: (roomId) => ({
        url: `/games/${roomId}/history`,
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
    muteParticipant: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/rooms/${id}/moderation/mute`,
        method: "POST",
        body,
      }),
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

    // Get real-time participant speaking stats for a room
    getSpeakingStats: builder.query({
      query: (roomName) => `/rooms/${encodeURIComponent(roomName)}/speaking-stats`,
      providesTags: (result, error, roomName) => [
        { type: "Rooms", id: `SpeakingStats-${roomName}` },
      ],
    }),

    // Get real-time speaking statistics for all active breakout rooms (and main room)
    getBreakoutSpeakingStats: builder.query({
      query: (arg) => {
        let sessionId
        let breakoutRooms = []
        let parentLivekitRoomName = ""
        let parentRoomId = null
        let includeMainRoom = true

        if (typeof arg === "object" && arg !== null) {
          sessionId = arg.sessionId
          breakoutRooms = arg.breakoutRooms || []
          parentLivekitRoomName = arg.parentLivekitRoomName || ""
          parentRoomId = arg.parentRoomId || null
          if (arg.includeMainRoom !== undefined) {
            includeMainRoom = arg.includeMainRoom
          }
        } else {
          sessionId = arg
        }

        return {
          url: `/rooms/${sessionId}/breakout/speaking-stats`,
          method: "POST",
          body: {
            parent_room_id: parentRoomId,
            parent_livekit_room_name: parentLivekitRoomName,
            breakout_rooms: breakoutRooms.map((r) => ({
              session_id: r.sessionId ?? r.session_id,
              room_id: r.roomId ?? r.room_id ?? null,
              room_name: r.roomName ?? r.room_name ?? "",
              livekit_room_name: r.liveKitRoomName ?? r.livekit_room_name ?? "",
            })),
            include_main_room: includeMainRoom,
          },
        }
      },
      providesTags: (result, error, arg) => {
        const sessionId = typeof arg === "object" && arg !== null ? arg.sessionId : arg
        return [{ type: "Breakout", id: `${sessionId}-SpeakingStats` }]
      },
    }),

    // Class Speaking Analytics (Post-session aggregate data)
    getClassSpeakingAnalytics: builder.query({
      query: (classId) => `/rooms/class/${encodeURIComponent(classId)}/speaking-analytics`,
      transformResponse: (res) => {
        const raw = res?.data ?? res
        if (!raw || typeof raw !== "object") return raw

        const students = (raw.students || []).map((s) => ({
          ...s,
          id: String(s.id ?? s.account_id ?? s.accountId ?? ""),
          accountId: s.account_id ?? s.accountId,
          account_id: s.account_id ?? s.accountId,
          name: s.name || `Student ${s.account_id ?? s.accountId ?? s.id}`,
          initial: s.initial || (s.name ? s.name.trim().slice(0, 1).toUpperCase() : "S"),
          avatarBg: s.avatar_bg ?? s.avatarBg ?? "bg-gray-100 text-gray-700 border border-gray-200",
          avgStbPercent: s.avg_stb_percent ?? s.avgStbPercent ?? 0,
          avg_stb_percent: s.avg_stb_percent ?? s.avgStbPercent ?? 0,
          barLevel: s.bar_level ?? s.barLevel ?? 1,
          bar_level: s.bar_level ?? s.barLevel ?? 1,
          barColor: s.bar_color ?? s.barColor ?? "bg-[#16a34a]",
          bar_color: s.bar_color ?? s.barColor ?? "bg-[#16a34a]",
          barTrackWidth: s.bar_track_width ?? s.barTrackWidth ?? "40%",
          bar_track_width: s.bar_track_width ?? s.barTrackWidth ?? "40%",
          sessionsMet: s.sessions_met ?? s.sessionsMet ?? 0,
          sessions_met: s.sessions_met ?? s.sessionsMet ?? 0,
          sessionsUnmet: s.sessions_unmet ?? s.sessionsUnmet ?? 0,
          sessions_unmet: s.sessions_unmet ?? s.sessionsUnmet ?? 0,
          trend: s.trend || "stable",
          status: s.status || "normal",
          totalWords: s.total_words ?? s.totalWords ?? 0,
          total_words: s.total_words ?? s.totalWords ?? 0,
        }))

        const sessions = (raw.sessions || []).map((sess) => ({
          ...sess,
          sessionNumber: sess.session_number ?? sess.sessionNumber ?? 1,
          session_number: sess.session_number ?? sess.sessionNumber ?? 1,
          sessionId: sess.session_id ?? sess.sessionId ?? "",
          session_id: sess.session_id ?? sess.sessionId ?? "",
          title: sess.title || `Session ${sess.session_number ?? sess.sessionNumber ?? 1}`,
          topic: sess.topic || `Session ${sess.session_number ?? sess.sessionNumber ?? 1} Topic: Practical Speaking & Discussion`,
          date: sess.date || "",
          startTime: sess.start_time ?? sess.startTime ?? "",
          start_time: sess.start_time ?? sess.startTime ?? "",
          endTime: sess.end_time ?? sess.endTime ?? "",
          end_time: sess.end_time ?? sess.endTime ?? "",
          teacherSpeechPercent: sess.teacher_speech_percent ?? sess.teacherSpeechPercent ?? 0,
          teacher_speech_percent: sess.teacher_speech_percent ?? sess.teacherSpeechPercent ?? 0,
          studentSpeechPercent: sess.student_speech_percent ?? sess.studentSpeechPercent ?? 0,
          student_speech_percent: sess.student_speech_percent ?? sess.studentSpeechPercent ?? 0,
          studentCount: sess.student_count ?? sess.studentCount ?? (sess.students_detail?.length || 0),
          student_count: sess.student_count ?? sess.studentCount ?? (sess.students_detail?.length || 0),
          lowSpeakingCount: sess.low_speaking_count ?? sess.lowSpeakingCount ?? 0,
          low_speaking_count: sess.low_speaking_count ?? sess.lowSpeakingCount ?? 0,
          avgStbScore: sess.avg_stb_score ?? sess.avgStbScore ?? 0,
          avg_stb_score: sess.avg_stb_score ?? sess.avgStbScore ?? 0,
          healthStatus: sess.health_status ?? sess.healthStatus ?? "good",
          health_status: sess.health_status ?? sess.healthStatus ?? "good",
          studentsDetail: (sess.students_detail || sess.studentsDetail || []).map((sd) => ({
            ...sd,
            name: sd.name || "Student",
            percent: sd.percent ?? sd.avg_stb_percent ?? 0,
            words: sd.words ?? sd.total_words ?? 0,
            isMet: sd.is_met ?? sd.isMet ?? true,
            is_met: sd.is_met ?? sd.isMet ?? true,
          })),
        }))

        return {
          ...raw,
          id: String(raw.id ?? raw.class_id ?? raw.classId ?? ""),
          classId: raw.class_id ?? raw.classId ?? null,
          class_id: raw.class_id ?? raw.classId ?? null,
          totalStudents: raw.total_students ?? raw.totalStudents ?? students.length,
          total_students: raw.total_students ?? raw.totalStudents ?? students.length,
          totalSessions: raw.total_sessions ?? raw.totalSessions ?? sessions.length,
          total_sessions: raw.total_sessions ?? raw.totalSessions ?? sessions.length,
          avgClassStb: raw.avg_class_stb ?? raw.avgClassStb ?? 0,
          avg_class_stb: raw.avg_class_stb ?? raw.avgClassStb ?? 0,
          belowThresholdCount: raw.below_threshold_count ?? raw.belowThresholdCount ?? 0,
          below_threshold_count: raw.below_threshold_count ?? raw.belowThresholdCount ?? 0,
          thresholdRate: raw.threshold_rate ?? raw.thresholdRate ?? 25,
          threshold_rate: raw.threshold_rate ?? raw.thresholdRate ?? 25,
          students,
          sessions,
        }
      },
      providesTags: (result, error, classId) => [{ type: "Rooms", id: `ClassAnalytics-${classId}` }],
    }),

    // Dedicated Students Speaking Analytics for "Theo học viên" Tab & Class KPIs
    getClassStudentsSpeakingAnalytics: builder.query({
      query: (classId) => `/rooms/class/${encodeURIComponent(classId)}/students-speaking-analytics`,
      transformResponse: (res) => {
        const raw = res?.data ?? res
        if (!raw || typeof raw !== "object") return raw

        const students = (raw.students || []).map((s) => ({
          ...s,
          id: String(s.id ?? s.account_id ?? s.accountId ?? ""),
          accountId: s.account_id ?? s.accountId,
          account_id: s.account_id ?? s.accountId,
          name: s.name || `Student ${s.account_id ?? s.accountId ?? s.id}`,
          initial: s.initial || (s.name ? s.name.trim().slice(0, 1).toUpperCase() : "S"),
          avatarBg: s.avatar_bg ?? s.avatarBg ?? "bg-gray-100 text-gray-700 border border-gray-200",
          avgStbPercent: s.avg_stb_percent ?? s.avgStbPercent ?? 0,
          avg_stb_percent: s.avg_stb_percent ?? s.avgStbPercent ?? 0,
          barLevel: s.bar_level ?? s.barLevel ?? 1,
          bar_level: s.bar_level ?? s.barLevel ?? 1,
          barColor: s.bar_color ?? s.barColor ?? "bg-[#16a34a]",
          bar_color: s.bar_color ?? s.barColor ?? "bg-[#16a34a]",
          barTrackWidth: s.bar_track_width ?? s.barTrackWidth ?? "40%",
          bar_track_width: s.bar_track_width ?? s.barTrackWidth ?? "40%",
          sessionsMet: s.sessions_met ?? s.sessionsMet ?? 0,
          sessions_met: s.sessions_met ?? s.sessionsMet ?? 0,
          sessionsUnmet: s.sessions_unmet ?? s.sessionsUnmet ?? 0,
          sessions_unmet: s.sessions_unmet ?? s.sessionsUnmet ?? 0,
          trend: s.trend || "stable",
          status: s.status || "normal",
          totalWords: s.total_words ?? s.totalWords ?? 0,
          total_words: s.total_words ?? s.totalWords ?? 0,
        }))

        return {
          ...raw,
          id: String(raw.id ?? raw.class_id ?? raw.classId ?? ""),
          classId: raw.class_id ?? raw.classId ?? null,
          class_id: raw.class_id ?? raw.classId ?? null,
          totalStudents: raw.total_students ?? raw.totalStudents ?? students.length,
          total_students: raw.total_students ?? raw.totalStudents ?? students.length,
          totalSessions: raw.total_sessions ?? raw.totalSessions ?? 0,
          total_sessions: raw.total_sessions ?? raw.totalSessions ?? 0,
          avgClassStb: raw.avg_class_stb ?? raw.avgClassStb ?? 0,
          avg_class_stb: raw.avg_class_stb ?? raw.avgClassStb ?? 0,
          belowThresholdCount: raw.below_threshold_count ?? raw.belowThresholdCount ?? 0,
          below_threshold_count: raw.below_threshold_count ?? raw.belowThresholdCount ?? 0,
          thresholdRate: raw.threshold_rate ?? raw.thresholdRate ?? 25,
          threshold_rate: raw.threshold_rate ?? raw.thresholdRate ?? 25,
          students,
        }
      },
      providesTags: (result, error, classId) => [{ type: "Rooms", id: `ClassStudentsAnalytics-${classId}` }],
    }),

    // Dedicated Sessions Speaking Analytics for "Theo buổi" Tab
    getClassSessionsSpeakingAnalytics: builder.query({
      query: (classId) => `/rooms/class/${encodeURIComponent(classId)}/sessions-speaking-analytics`,
      transformResponse: (res) => {
        const raw = res?.data ?? res
        if (!raw || typeof raw !== "object") return raw

        const sessions = (raw.sessions || []).map((sess) => ({
          ...sess,
          sessionNumber: sess.session_number ?? sess.sessionNumber ?? 1,
          session_number: sess.session_number ?? sess.sessionNumber ?? 1,
          sessionId: sess.session_id ?? sess.sessionId ?? "",
          session_id: sess.session_id ?? sess.sessionId ?? "",
          createdAt: sess.created_at ?? sess.createdAt ?? null,
          created_at: sess.created_at ?? sess.createdAt ?? null,
          updatedAt: sess.updated_at ?? sess.updatedAt ?? null,
          updated_at: sess.updated_at ?? sess.updatedAt ?? null,
          teacherSpeechPercent: sess.teacher_speech_percent ?? sess.teacherSpeechPercent ?? 0,
          teacher_speech_percent: sess.teacher_speech_percent ?? sess.teacherSpeechPercent ?? 0,
          studentSpeechPercent: sess.student_speech_percent ?? sess.studentSpeechPercent ?? 0,
          student_speech_percent: sess.student_speech_percent ?? sess.studentSpeechPercent ?? 0,
          studentCount: sess.student_count ?? sess.studentCount ?? 0,
          student_count: sess.student_count ?? sess.studentCount ?? 0,
          lowSpeakingCount: sess.low_speaking_count ?? sess.lowSpeakingCount ?? 0,
          low_speaking_count: sess.low_speaking_count ?? sess.lowSpeakingCount ?? 0,
          avgStbScore: sess.avg_stb_score ?? sess.avgStbScore ?? 0,
          avg_stb_score: sess.avg_stb_score ?? sess.avgStbScore ?? 0,
          healthStatus: sess.health_status ?? sess.healthStatus ?? "good",
          health_status: sess.health_status ?? sess.healthStatus ?? "good",
        }))

        return {
          ...raw,
          id: String(raw.id ?? raw.class_id ?? raw.classId ?? ""),
          classId: raw.class_id ?? raw.classId ?? null,
          class_id: raw.class_id ?? raw.classId ?? null,
          totalSessions: raw.total_sessions ?? raw.totalSessions ?? sessions.length,
          total_sessions: raw.total_sessions ?? raw.totalSessions ?? sessions.length,
          sessions,
        }
      },
      providesTags: (result, error, classId) => [{ type: "Rooms", id: `ClassSessionsAnalytics-${classId}` }],
    }),

    // Student Speaking History in Class
    getStudentSpeakingHistory: builder.query({
      query: ({ classId, studentId }) =>
        `/rooms/class/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}/speaking-history`,
      transformResponse: (res) => {
        const raw = res?.data ?? res
        if (!raw || typeof raw !== "object") return raw
        return {
          ...raw,
          studentId: String(raw.student_id ?? raw.studentId ?? ""),
          studentName: raw.student_name ?? raw.studentName ?? "",
          classId: String(raw.class_id ?? raw.classId ?? ""),
          totalSessions: raw.total_sessions ?? raw.totalSessions ?? 0,
          classExpectedRate: raw.class_expected_rate ?? raw.classExpectedRate ?? 25,
          avgSpeechPercent: raw.avg_speech_percent ?? raw.avgSpeechPercent ?? 0,
          metRecentCount: raw.met_recent_count ?? raw.metRecentCount ?? 0,
          recentTotal: raw.recent_total ?? raw.recentTotal ?? 0,
          totalWords: raw.total_words ?? raw.totalWords ?? 0,
          avgWordsPerSession: raw.avg_words_per_session ?? raw.avgWordsPerSession ?? 0,
          trend: raw.trend ?? "stable",
          trendText: raw.trend_text ?? raw.trendText ?? "Ổn định",
          recentSessionNumber: raw.recent_session_number ?? raw.recentSessionNumber ?? 0,
          recentSessionPercent: raw.recent_session_percent ?? raw.recentSessionPercent ?? 0,
          warningMessage: raw.warning_message ?? raw.warningMessage ?? null,
          sessions: (raw.sessions || []).map((sess) => ({
            ...sess,
            sessionNumber: sess.session_number ?? sess.sessionNumber ?? 1,
            sessionId: sess.session_id ?? sess.sessionId ?? "",
            createdAt: sess.created_at ?? sess.createdAt ?? null,
            created_at: sess.created_at ?? sess.createdAt ?? null,
            updatedAt: sess.updated_at ?? sess.updatedAt ?? null,
            updated_at: sess.updated_at ?? sess.updatedAt ?? null,
            durationSeconds: sess.duration_seconds ?? sess.durationSeconds ?? (sess.duration_minutes ? sess.duration_minutes * 60 : 0),
            durationMinutes: sess.duration_minutes ?? sess.durationMinutes ?? 0,
            percent: sess.percent ?? sess.speech_percent ?? sess.speechPercent ?? 0,
            speechPercent: sess.speech_percent ?? sess.speechPercent ?? 0,
            words: sess.words ?? 0,
            wpm: sess.wpm ?? 0,
            expectedRate: sess.expected_rate ?? sess.expectedRate ?? 25,
            expectedPercent: sess.expected_percent ?? sess.expectedRate ?? 25,
            isMet: sess.is_met ?? sess.isMet ?? true,
            status: sess.status ?? "normal",
          })),
        }
      },
      providesTags: (result, error, { classId, studentId }) => [
        { type: "Rooms", id: `StudentAnalytics-${classId}-${studentId}` },
      ],
    }),

    // Single Session Speaking Stats (for SessionAnalyticsDetailPage)
    getSessionSpeakingStats: builder.query({
      query: (arg) => {
        const sessionId = typeof arg === "object" && arg !== null ? (arg.sessionId || arg.session_id) : arg
        return `/rooms/session/${encodeURIComponent(sessionId)}/speaking-stats`
      },
      transformResponse: (res) => {
        const raw = res?.data ?? res
        if (!raw || typeof raw !== "object") return raw
        return {
          ...raw,
          sessionId: raw.session_id ?? raw.sessionId ?? "",
          session_id: raw.session_id ?? raw.sessionId ?? "",
          roomId: raw.room_id ?? raw.roomId ?? null,
          room_id: raw.room_id ?? raw.roomId ?? null,
          classId: raw.class_id ?? raw.classId ?? null,
          class_id: raw.class_id ?? raw.classId ?? null,
          createdAt: raw.created_at ?? raw.createdAt ?? null,
          created_at: raw.created_at ?? raw.createdAt ?? null,
          updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
          updated_at: raw.updated_at ?? raw.updatedAt ?? null,
          hasAnySpeechData: raw.has_any_speech_data ?? raw.hasAnySpeechData ?? false,
          overview: {
            totalWords: raw.overview?.total_words ?? raw.overview?.totalWords ?? 0,
            totalDurationSeconds: raw.overview?.total_duration_seconds ?? raw.overview?.totalDurationSeconds ?? 0,
            totalStudentWords: raw.overview?.total_student_words ?? raw.overview?.totalStudentWords ?? 0,
            totalStudentDurationSeconds: raw.overview?.total_student_duration_seconds ?? raw.overview?.totalStudentDurationSeconds ?? 0,
            studentCount: raw.overview?.student_count ?? raw.overview?.studentCount ?? 0,
          },
          teacherTalkRatio: {
            teacherPercent: raw.teacher_talk_ratio?.teacher_percent ?? raw.teacher_talk_ratio?.teacherPercent ?? 0,
            studentPercent: raw.teacher_talk_ratio?.student_percent ?? raw.teacher_talk_ratio?.studentPercent ?? 0,
            status: raw.teacher_talk_ratio?.status ?? "ideal",
            teacherDurationSeconds: raw.teacher_talk_ratio?.teacher_duration_seconds ?? raw.teacher_talk_ratio?.teacherDurationSeconds ?? 0,
            teacherWords: raw.teacher_talk_ratio?.teacher_words ?? raw.teacher_talk_ratio?.teacherWords ?? 0,
          },
          fairShare: {
            expectedSharePercent: raw.fair_share?.expected_share_percent ?? raw.fair_share?.expectedSharePercent ?? 0,
            lowSpeakingCount: raw.fair_share?.low_speaking_count ?? raw.fair_share?.lowSpeakingCount ?? 0,
            hasWarning: raw.fair_share?.has_warning ?? raw.fair_share?.hasWarning ?? false,
          },
          participants: (raw.participants || []).map((p) => ({
            ...p,
            participantId: p.participant_id ?? p.participantId ?? "",
            accountId: p.account_id ?? p.accountId ?? null,
            name: p.name || `Student ${p.account_id ?? p.accountId ?? ""}`,
            role: p.role ?? "student",
            isTeacher: p.is_teacher ?? p.isTeacher ?? false,
            stats: {
              words: p.stats?.words ?? 0,
              durationSeconds: p.stats?.duration_seconds ?? p.stats?.durationSeconds ?? 0,
              wpm: p.stats?.wpm ?? 0,
            },
            balance: {
              stbScore: p.balance?.stb_score ?? p.balance?.stbScore ?? 0,
              timePercent: p.balance?.time_percent ?? p.balance?.timePercent ?? 0,
              wordCountPercent: p.balance?.word_count_percent ?? p.balance?.wordCountPercent ?? 0,
              sharePercent: p.balance?.share_percent ?? p.balance?.sharePercent ?? 0,
              ratioOfExpected: p.balance?.ratio_of_expected ?? p.balance?.ratioOfExpected ?? 0,
              status: p.balance?.status ?? "normal",
            },
            isThresholdMet: p.is_threshold_met ?? p.isThresholdMet ?? true,
          })),
        }
      },
      providesTags: (result, error, arg) => {
        const sessionId = typeof arg === "object" && arg !== null ? arg.sessionId : arg
        return [{ type: "Rooms", id: `SessionSpeakingStats-${sessionId}` }]
      },
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
  useGetBannedParticipantsQuery,
  useUnbanParticipantMutation,
  useInviteToRoomMutation,
  // Speaking Stats
  useGetSpeakingStatsQuery,
  useGetBreakoutSpeakingStatsQuery,
  useLazyGetBreakoutSpeakingStatsQuery,
  useGetClassSpeakingAnalyticsQuery,
  useGetClassStudentsSpeakingAnalyticsQuery,
  useGetClassSessionsSpeakingAnalyticsQuery,
  useGetStudentSpeakingHistoryQuery,
  useGetSessionSpeakingStatsQuery,
  // My Rooms & Bookmarks & Advanced Room Creation
  useGetMyRoomsQuery,
  useLazyGetMyRoomsQuery,
  useToggleBookmarkRoomMutation,
  useCreateAdvancedRoomMutation,
} = roomsApi;
