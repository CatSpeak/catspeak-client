import { store } from "@/store"
import {
  addTask,
  updateTask,
  removeTask,
} from "@/store/slices/globalTaskSlice"
import { reelsApi } from "@/store/api/reelsApi"

const fileCache = new Map()
const xhrCache = new Map()

export const uploadReelInBackground = (formData, file, coverFile) => {
  const id = "reel-upload-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7)

  // Store raw files in memory cache for preview/retry purposes
  fileCache.set(id, { file, coverFile })

  const title = formData.get("Title") || "Tải lên Reel mới"
  const challengeId = formData.get("ChallengeId")
  formData.append("TaskId", id)

  // 1. Dispatch start to globalTaskSlice
  store.dispatch(
    addTask({
      id,
      title,
      status: "UPLOADING",
      progress: 0,
      timestamp: Date.now(),
      isUploadTask: true,
    })
  )

  // 2. Perform native XHR upload
  const xhr = new XMLHttpRequest()
  xhrCache.set(id, xhr)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api"
  xhr.open("POST", `${apiBaseUrl}/Reels`)

  // Attach auth token
  const token = store.getState().auth.token
  if (token) {
    xhr.setRequestHeader("Authorization", `Bearer ${token}`)
  }

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable && e.total > 0) {
      const progress = Math.round((e.loaded / e.total) * 80)
      store.dispatch(updateTask({ id, updates: { progress: Math.min(progress, 80) } }))
    }
  }

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      store.dispatch(updateTask({ id, updates: { progress: 100, status: "SUCCESS" } }))
      
      // Invalidate reels query cache to auto-reload feeds
      const tags = [
        { type: "Reels", id: "FEED" },
        { type: "Reels", id: "USER_REELS" },
      ]
      if (challengeId) {
        tags.push({ type: "Reels", id: `CHALLENGE_${challengeId}` })
      }
      store.dispatch(reelsApi.util.invalidateTags(tags))
    } else {
      let errMsg = "Tải lên thất bại"
      try {
        const res = JSON.parse(xhr.responseText)
        errMsg = res.message || errMsg
      } catch {}
      store.dispatch(updateTask({ id, updates: { status: "ERROR", error: errMsg } }))
    }
    cleanupCache(id)
  }

  xhr.onerror = () => {
    store.dispatch(updateTask({ id, updates: { status: "ERROR", error: "Lỗi kết nối mạng" } }))
    cleanupCache(id)
  }

  xhr.onabort = () => {
    cleanupCache(id)
  }

  xhr.send(formData)
}

export const cancelReelUpload = (id) => {
  const xhr = xhrCache.get(id)
  if (xhr) {
    xhr.abort()
  }
  store.dispatch(removeTask(id))
  cleanupCache(id)
}

const cleanupCache = (id) => {
  const cached = fileCache.get(id)
  if (cached?.coverUrl) {
    URL.revokeObjectURL(cached.coverUrl)
  }
  fileCache.delete(id)
  xhrCache.delete(id)
}
