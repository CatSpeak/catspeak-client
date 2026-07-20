import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uploads: [],
  isConfirmingReload: false,
};

const globalUploadSlice = createSlice({
  name: "globalUpload",
  initialState,
  reducers: {
    setUploads(state, action) {
      state.uploads = action.payload;
    },
    addUpload(state, action) {
      const task = action.payload;
      if (!state.uploads.find((u) => u.id === task.id)) {
        state.uploads.push(task);
      }
    },
    updateUpload(state, action) {
      const { id, updates } = action.payload;
      const index = state.uploads.findIndex((u) => u.id === id);
      if (index !== -1) {
        state.uploads[index] = { ...state.uploads[index], ...updates };
      }
    },
    removeUpload(state, action) {
      const id = action.payload;
      state.uploads = state.uploads.filter((u) => u.id !== id);
    },
    revealUpload(state, action) {
      const id = action.payload;
      const index = state.uploads.findIndex((u) => u.id === id);
      if (index !== -1) {
        state.uploads[index].isHidden = false;
      }
    },
    setConfirmingReload(state, action) {
      state.isConfirmingReload = action.payload;
    }
  },
});

export const {
  setUploads,
  addUpload,
  updateUpload,
  removeUpload,
  revealUpload,
  setConfirmingReload,
} = globalUploadSlice.actions;

export const selectGlobalUploads = (state) => state.globalUpload.uploads;
export const selectIsConfirmingReload = (state) => state.globalUpload.isConfirmingReload;

export default globalUploadSlice.reducer;
