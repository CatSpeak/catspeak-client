import { createSlice } from "@reduxjs/toolkit"
import { logout } from "./authSlice"


const initialState = {
  /** Whether a call is currently active (LiveKit connected) */
  isInCall: false,
  /** Whether the user navigated away from the full call page */
  isPiP: false,
  /** LiveKit token for the active connection */
  livekitToken: null,
  /** LiveKit WebSocket server URL */
  livekitServerUrl: null,
  /** Static info about the active call */
  callInfo: {
    roomId: null,
    sessionId: null,
    callPath: null, // e.g. "/en/meet/42"
    roomData: null, // room object snapshot
    user: null,
    initMicOn: false,
    initCamOn: false,
    isAISession: false,
    showRoomSubtitles: false,
  },
  /** Breakout Rooms State */
  isBreakoutActive: false,
  breakoutRoomName: null,
  mainRoomCache: null, // caches { sessionId, livekitToken }
  parentSessionId: null,
}

const videoCallSlice = createSlice({
  name: "videoCall",
  initialState,
  reducers: {
    /**
     * Transition to in-call state. Called when the user successfully joins
     * a video session and the LiveKit token is acquired.
     */
    enterCall(state, action) {
      const {
        livekitToken,
        livekitServerUrl,
        roomId,
        sessionId,
        callPath,
        roomData,
        user,
        initMicOn,
        initCamOn,
        isAISession,
      } = action.payload

      state.isInCall = true
      state.isPiP = false
      state.livekitToken = livekitToken
      state.livekitServerUrl = livekitServerUrl ?? state.livekitServerUrl
      state.callInfo = {
        roomId,
        sessionId,
        callPath,
        roomData,
        user,
        initMicOn: initMicOn ?? false,
        initCamOn: initCamOn ?? false,
        isAISession: isAISession ?? false,
        showRoomSubtitles: false,
      }
      state.isBreakoutActive = false
      state.breakoutRoomName = null
      state.mainRoomCache = null
      state.parentSessionId = sessionId

      try {
        const roomSnapshot = {
          roomId,
          roomTitle: roomData?.name || roomData?.title || `Phòng #${roomId}`,
          callPath: callPath || `/zh/meet/${roomId}`,
          joinedAt: Date.now(),
        }
        localStorage.setItem("catspeak_last_room", JSON.stringify(roomSnapshot))
      } catch (err) {
        /* Ignored */
      }
    },

    /**
     * Toggle PiP mode (user navigated away from or returned to the call page).
     */
    setPiP(state, action) {
      state.isPiP = action.payload
    },

    /**
     * Fully leave the call and reset all state.
     */
    leaveCall() {
      return initialState
    },

    /**
     * Toggle the per-user room subtitles visibility.
     * Works for non-AI rooms (controls showRoomSubtitles).
     */
    toggleRoomSubtitles(state) {
      if (state.callInfo) {
        state.callInfo.showRoomSubtitles = !state.callInfo.showRoomSubtitles
      }
    },

    /**
     * Enter a breakout room and cache main room info.
     */
    enterBreakout(state, action) {
      const { subSessionId, roomName, token } = action.payload
      if (!state.mainRoomCache && state.callInfo) {
        state.mainRoomCache = {
          livekitToken: state.livekitToken,
          sessionId: state.callInfo.sessionId,
        }
      }
      state.isBreakoutActive = true
      state.breakoutRoomName = roomName
      state.livekitToken = token
      if (state.callInfo) {
        state.callInfo.sessionId = subSessionId
      }
    },

    /**
     * Exit breakout rooms and restore main room info.
     */
    exitBreakout(state) {
      if (state.mainRoomCache) {
        state.livekitToken = state.mainRoomCache.livekitToken
        if (state.callInfo) {
          state.callInfo.sessionId = state.mainRoomCache.sessionId
        }
        state.mainRoomCache = null
      }
      state.isBreakoutActive = false
      state.breakoutRoomName = null
    },

    /**
     * Manually update the active LiveKit token.
     */
    updateLivekitToken(state, action) {
      state.livekitToken = action.payload
    },
  },
  extraReducers: (builder) => {
    // Automatically leave the call and clear state when the user logs out
    builder.addCase(logout, () => {
      return initialState
    })
  },
})

export const {
  enterCall,
  setPiP,
  leaveCall,
  toggleRoomSubtitles,
  enterBreakout,
  exitBreakout,
  updateLivekitToken,
} = videoCallSlice.actions

export default videoCallSlice.reducer
