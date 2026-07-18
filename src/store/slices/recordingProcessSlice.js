import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  recordings: {}, // egressId -> { egressId, meetingId, progress, status, error, createdAt }
}

const recordingProcessSlice = createSlice({
  name: "recordingProcess",
  initialState,
  reducers: {
    addRecording(state, action) {
      const { egressId, meetingId } = action.payload
      state.recordings[egressId] = {
        egressId,
        meetingId,
        progress: 0,
        status: "processing", // processing, success, failed
        error: null,
        createdAt: Date.now(),
      }
    },
    updateRecordingProgress(state, action) {
      const { egressId, progress } = action.payload
      if (state.recordings[egressId]) {
        state.recordings[egressId].progress = progress
      }
    },
    recordingSuccess(state, action) {
      const { egressId } = action.payload
      if (state.recordings[egressId]) {
        state.recordings[egressId].status = "success"
        state.recordings[egressId].progress = 100
      }
    },
    recordingFailed(state, action) {
      const { egressId, error } = action.payload
      if (state.recordings[egressId]) {
        state.recordings[egressId].status = "failed"
        state.recordings[egressId].progress = 100
        state.recordings[egressId].error = error
      }
    },
    removeRecording(state, action) {
      const egressId = action.payload
      delete state.recordings[egressId]
    },
    clearCompletedRecordings(state) {
      Object.keys(state.recordings).forEach((egressId) => {
        const rec = state.recordings[egressId]
        if (rec.status === "success" || rec.status === "failed") {
          delete state.recordings[egressId]
        }
      })
    },
  },
})

export const {
  addRecording,
  updateRecordingProgress,
  recordingSuccess,
  recordingFailed,
  removeRecording,
  clearCompletedRecordings,
} = recordingProcessSlice.actions

export default recordingProcessSlice.reducer
