import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  page: 1,
}

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload
    },
    incrementPage: (state) => {
      state.page += 1
    },
    resetPage: (state) => {
      state.page = 1
    },
  },
})

export const { setPage, incrementPage, resetPage } = newsSlice.actions

export const selectNewsPage = (state) => state.news.page

export default newsSlice.reducer
