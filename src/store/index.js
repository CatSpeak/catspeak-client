import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { baseApi } from "./api/baseApi"
import { socialApi } from "./api/social/socialApi"
import authReducer, { logout } from "./slices/authSlice"
import messageWidgetReducer from "./slices/messageWidgetSlice"
import serverStatusReducer from "./slices/serverStatusSlice"
import videoCallReducer from "./slices/videoCallSlice"
import notificationReducer from "./slices/notificationSlice"
import reelUploadReducer from "./slices/reelUploadSlice"
import recordingProcessReducer from "./slices/recordingProcessSlice"
import globalTaskReducer from "./slices/globalTaskSlice"
import newsReducer from "./slices/newsSlice"

const appReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  [socialApi.reducerPath]: socialApi.reducer,
  auth: authReducer,
  messageWidget: messageWidgetReducer,
  serverStatus: serverStatusReducer,
  videoCall: videoCallReducer,
  notification: notificationReducer,
  reelUpload: reelUploadReducer,
  recordingProcess: recordingProcessReducer,
  globalTask: globalTaskReducer,
  news: newsReducer,
})

const rootReducer = (state, action) => {
  if (logout.match(action)) {
    const serverStatus = state?.serverStatus
    return appReducer(serverStatus ? { serverStatus } : undefined, action)
  }
  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, socialApi.middleware),
  devTools: import.meta.env.DEV,
})

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch)

export default store
