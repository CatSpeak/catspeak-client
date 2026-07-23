import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { baseApi } from "./api/baseApi"
import authReducer from "./slices/authSlice"
import messageWidgetReducer from "./slices/messageWidgetSlice"
import serverStatusReducer from "./slices/serverStatusSlice"
import videoCallReducer from "./slices/videoCallSlice"
import notificationReducer from "./slices/notificationSlice"
import reelUploadReducer from "./slices/reelUploadSlice"
import recordingProcessReducer from "./slices/recordingProcessSlice"
import globalTaskReducer from "./slices/globalTaskSlice"

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    messageWidget: messageWidgetReducer,
    serverStatus: serverStatusReducer,
    videoCall: videoCallReducer,
    notification: notificationReducer,
    reelUpload: reelUploadReducer,
    recordingProcess: recordingProcessReducer,
    globalTask: globalTaskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
})

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch)

export default store
