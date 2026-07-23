import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  isConfirmingReload: false,
};

const globalTaskSlice = createSlice({
  name: "globalTask",
  initialState,
  reducers: {
    setTasks(state, action) {
      state.tasks = action.payload;
    },
    addTask(state, action) {
      const task = action.payload;
      if (!state.tasks.find((t) => t.id === task.id)) {
        state.tasks.push(task);
      }
    },
    updateTask(state, action) {
      const { id, updates } = action.payload;
      const index = state.tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...updates };
      }
    },
    removeTask(state, action) {
      const id = action.payload;
      state.tasks = state.tasks.filter((t) => t.id !== id);
    },
    revealTask(state, action) {
      const id = action.payload;
      const index = state.tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        state.tasks[index].isHidden = false;
      }
    },
    setConfirmingReload(state, action) {
      state.isConfirmingReload = action.payload;
    },
    clearTasks(state) {
      state.tasks = [];
      state.isConfirmingReload = false;
    }
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  revealTask,
  setConfirmingReload,
  clearTasks,
} = globalTaskSlice.actions;

export const selectGlobalTasks = (state) => state.globalTask.tasks;
export const selectIsConfirmingReload = (state) => state.globalTask.isConfirmingReload;

export default globalTaskSlice.reducer;
