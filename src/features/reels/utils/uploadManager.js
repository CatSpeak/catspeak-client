import { store } from "@/store"
import {
  addUpload,
  updateProgress,
  uploadSuccess,
  uploadFailed,
  removeUpload,
} from "@/store/slices/reelUploadSlice"
import { reelsApi } from "@/store/api/reelsApi"

const fileCache = new Map()
const xhrCache = new Map()

export const uploadReelInBackground = (formData, file, coverFile) => {
  const id = "reel-upload-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7)

  // Store raw files in memory cache for preview/retry purposes
  fileCache.set(id, { file, coverFile })

  const title = formData.get("Title") || "Untitled Reel"
  const size = file.size
  const challengeId = formData.get("ChallengeId")

  // Generate cover preview url
  const coverUrl = coverFile ? URL.createObjectURL(coverFile) : null

  // 1. Dispatch start to Redux
  store.dispatch(addUpload({ id, title, size, coverUrl }))

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
      const progress = Math.round((e.loaded / e.total) * 100)
      // Limit to 99% during transfer, 100% is set on response load
      store.dispatch(updateProgress({ id, progress: Math.min(progress, 99) }))
    }
  }

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      store.dispatch(uploadSuccess({ id }))
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
      let errorMsg = "Upload failed"
      try {
        const resJson = JSON.parse(xhr.responseText)
        errorMsg = resJson.message || errorMsg
      } catch (err) {}
      store.dispatch(uploadFailed({ id, error: errorMsg }))
    }
    cleanupCache(id)
  }

  xhr.onerror = () => {
    store.dispatch(uploadFailed({ id, error: "Network error encountered." }))
    cleanupCache(id)
  };

  xhr.onabort = () => {
    cleanupCache(id)
  };

  xhr.send(formData)
}

export const cancelReelUpload = (id) => {
  const xhr = xhrCache.get(id)
  if (xhr) {
    xhr.abort()
  }
  store.dispatch(removeUpload(id))
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
