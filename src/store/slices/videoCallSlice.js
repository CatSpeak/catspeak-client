import { createSlice } from "@reduxjs/toolkit"

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
    callPath: null, // e.g. "/en/meet/42"
    roomData: null, // room object snapshot
    user: null,
    initMicOn: false,
    initCamOn: false,
  },
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
        callPath,
        roomData,
        user,
        initMicOn,
        initCamOn,
      } = action.payload

      state.isInCall = true
      state.isPiP = false
      state.livekitToken = livekitToken
      state.livekitServerUrl = livekitServerUrl ?? state.livekitServerUrl
      state.callInfo = {
        roomId,
        callPath,
        roomData,
        user,
        initMicOn: initMicOn ?? false,
        initCamOn: initCamOn ?? false,
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
  },
})

export const { enterCall, setPiP, leaveCall } =
  videoCallSlice.actions

export default videoCallSlice.reducer
