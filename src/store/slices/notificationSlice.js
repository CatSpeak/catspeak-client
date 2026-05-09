import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  // Per-conversation unread counts: { [conversationId]: number }
  unreadMessages: {},
  // Total unread messages (sum of all conversations)
  totalUnreadMessages: 0,
  // Friend online status: { [userId]: boolean }
  friendOnlineStatus: {},
}

/** Recalculate total from the unread map */
function recalcTotal(state) {
  state.totalUnreadMessages = Object.values(state.unreadMessages).reduce(
    (sum, count) => sum + count,
    0,
  )
}

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    incrementUnread: (state, action) => {
      const conversationId = action.payload
      state.unreadMessages[conversationId] =
        (state.unreadMessages[conversationId] || 0) + 1
      recalcTotal(state)
    },
    clearUnread: (state, action) => {
      const conversationId = action.payload
      delete state.unreadMessages[conversationId]
      recalcTotal(state)
    },
    clearAllUnread: (state) => {
      state.unreadMessages = {}
      state.totalUnreadMessages = 0
    },
    setFriendOnlineStatus: (state, action) => {
      const { userId, isOnline } = action.payload
      state.friendOnlineStatus[userId] = isOnline
    },
  },
})

export const {
  incrementUnread,
  clearUnread,
  clearAllUnread,
  setFriendOnlineStatus,
} = notificationSlice.actions

// Selectors
export const selectUnreadForConversation = (conversationId) => (state) =>
  state.notification.unreadMessages[conversationId] || 0
export const selectTotalUnread = (state) =>
  state.notification.totalUnreadMessages
export const selectFriendOnlineStatus = (userId) => (state) =>
  state.notification.friendOnlineStatus[userId] ?? false

export default notificationSlice.reducer
