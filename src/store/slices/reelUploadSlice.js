import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { reelsApi } from "../api/reelsApi"

let activeXhr = null

export const uploadReel = createAsyncThunk(
  "reelUpload/uploadReel",
  async ({ formData, title, challengeId }, { dispatch, getState, rejectWithValue }) => {
    // Cancel any existing upload before starting a new one
    if (activeXhr) {
      try {
        activeXhr.abort()
      } catch (e) {
        console.warn("Error aborting previous upload:", e)
      }
    }

    const token = getState().auth?.token
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api"
    const uploadUrl = `${baseUrl}/Reels`

    try {
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        activeXhr = xhr

        xhr.open("POST", uploadUrl)

        // Set authentication headers
        if (token) {
          xhr.setRequestHeader("authorization", `Bearer ${token}`)
        }

        // Set community language headers if matched
        const match = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/i)
        if (match) {
          xhr.setRequestHeader("X-Community-Lang", match[1])
        }

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            dispatch(updateProgress(progress))
          }
        }

        xhr.onload = () => {
          activeXhr = null
          if (xhr.status >= 200 && xhr.status < 300) {
            // Invalidate Reels queries to trigger auto-refresh of lists
            dispatch(
              reelsApi.util.invalidateTags([
                { type: "Reels", id: "FEED" },
                { type: "Reels", id: "USER_REELS" },
                challengeId ? { type: "Reels", id: `CHALLENGE_${challengeId}` } : null,
              ].filter(Boolean))
            )
            resolve()
          } else {
            let errorMessage = "Failed to upload Reel. Please try again."
            try {
              const resData = JSON.parse(xhr.responseText)
              errorMessage = resData?.message || resData?.Message || errorMessage
            } catch (e) {
              // ignore json parsing errors
            }
            reject(errorMessage)
          }
        }

        xhr.onerror = () => {
          activeXhr = null
          reject("Network error. Please check your connection.")
        }

        xhr.onabort = () => {
          activeXhr = null
          reject("Upload cancelled")
        }

        xhr.send(formData)
      })
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

const initialState = {
  isUploading: false,
  progress: 0,
  title: "",
  error: null,
  success: false,
  showCompleted: false,
  isMinimized: false,
}

const reelUploadSlice = createSlice({
  name: "reelUpload",
  initialState,
  reducers: {
    updateProgress: (state, action) => {
      state.progress = action.payload
    },
    cancelUpload: (state) => {
      if (activeXhr) {
        try {
          activeXhr.abort()
        } catch (e) {
          console.warn("Error aborting upload on cancel:", e)
        }
        activeXhr = null
      }
      state.isUploading = false
      state.progress = 0
      state.title = ""
      state.error = "Upload cancelled"
      state.success = false
      state.showCompleted = false
    },
    dismissCompleted: (state) => {
      state.showCompleted = false
      state.success = false
      state.error = null
    },
    toggleMinimize: (state) => {
      state.isMinimized = !state.isMinimized
    },
    clearUploadError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadReel.pending, (state, action) => {
        state.isUploading = true
        state.progress = 0
        state.title = action.meta.arg.title || "Video"
        state.error = null
        state.success = false
        state.showCompleted = false
        state.isMinimized = false
      })
      .addCase(uploadReel.fulfilled, (state) => {
        state.isUploading = false
        state.progress = 100
        state.success = true
        state.showCompleted = true
      })
      .addCase(uploadReel.rejected, (state, action) => {
        state.isUploading = false
        if (action.payload === "Upload cancelled") {
          state.error = "Upload cancelled"
        } else {
          state.error = action.payload || action.error?.message || "Failed to upload Reel."
        }
        state.progress = 0
        state.success = false
      })
  },
})

export const { updateProgress, cancelUpload, dismissCompleted, toggleMinimize, clearUploadError } = reelUploadSlice.actions
export default reelUploadSlice.reducer
