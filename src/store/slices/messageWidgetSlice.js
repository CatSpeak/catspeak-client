import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isOpen: false,
  activeConversationId: null,
  view: "list", // "list" | "detail"
}

const messageWidgetSlice = createSlice({
  name: "messageWidget",
  initialState,
  reducers: {
    openWidget: (state) => {
      state.isOpen = true
    },
    closeWidget: (state) => {
      state.isOpen = false
      state.activeConversationId = null
      state.view = "list"
    },
    toggleWidget: (state) => {
      state.isOpen = !state.isOpen
    },
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload
      if (action.payload) {
        state.view = "detail"
        state.isOpen = true
      }
    },
    setActiveChatPageConversation: (state, action) => {
      state.activeConversationId = action.payload
    },
    setView: (state, action) => {
      state.view = action.payload
    },
    resetWidget: () => initialState,
  },
})

export const {
  openWidget,
  closeWidget,
  toggleWidget,
  setActiveConversation,
  setActiveChatPageConversation,
  setView,
  resetWidget,
} = messageWidgetSlice.actions

export default messageWidgetSlice.reducer

