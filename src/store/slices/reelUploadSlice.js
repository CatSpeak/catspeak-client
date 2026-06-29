import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  uploads: {}, // id -> { id, title, size, progress, status, error, coverUrl }
}

const reelUploadSlice = createSlice({
  name: "reelUpload",
  initialState,
  reducers: {
    addUpload(state, action) {
      const { id, title, size, coverUrl } = action.payload
      state.uploads[id] = {
        id,
        title,
        size,
        coverUrl,
        progress: 0,
        status: "uploading", // uploading, success, failed
        error: null,
      }
    },
    updateProgress(state, action) {
      const { id, progress } = action.payload
      if (state.uploads[id]) {
        state.uploads[id].progress = progress
      }
    },
    uploadSuccess(state, action) {
      const { id } = action.payload
      if (state.uploads[id]) {
        state.uploads[id].status = "success"
        state.uploads[id].progress = 100
      }
    },
    uploadFailed(state, action) {
      const { id, error } = action.payload
      if (state.uploads[id]) {
        state.uploads[id].status = "failed"
        state.uploads[id].error = error
      }
    },
    removeUpload(state, action) {
      const id = action.payload
      delete state.uploads[id]
    },
  },
})

export const {
  addUpload,
  updateProgress,
  uploadSuccess,
  uploadFailed,
  removeUpload,
} = reelUploadSlice.actions

export default reelUploadSlice.reducer
