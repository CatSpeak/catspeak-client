/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Globe, Users, Lock } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"
import {
  useCreateReelMutation,
  useSearchReelHashtagsQuery,
  useSearchReelMentionsQuery,
} from "@/store/api/reelsApi"

export const DESCRIPTION_TRIGGER_REGEX = /(^|[\s([{])([@#])([\p{L}\p{N}_.-]{0,50})$/u
export const DESCRIPTION_LINK_REGEX = /([@#][\p{L}\p{N}_.-]+)/gu
export const DESCRIPTION_MAX_LENGTH = 2000
export const PRIVACY_OPTIONS = [
  { value: "Public", label: "Public", icon: Globe },
  { value: "FriendsOnly", label: "Friends Only", icon: Users },
  { value: "Private", label: "Private", icon: Lock },
]

export const normalizeChallengeHashtag = (challenge) => {
  const rawHashtag = String(challenge?.hashtag || "").trim()
  if (!rawHashtag) return ""

  const hashtag = rawHashtag.replace(/^#+/, "").replace(/\s+/g, "")
  return hashtag ? `#${hashtag}` : ""
}

export const buildChallengeDescription = (lockedHashtag, value = "") => {
  const text = String(value || "").slice(0, DESCRIPTION_MAX_LENGTH)

  if (!lockedHashtag) return text

  // If the text already contains the locked hashtag, keep it as is
  if (text.includes(lockedHashtag)) {
    return text
  }

  // If text is empty or only whitespace, return the hashtag with a space
  if (!text.trim()) {
    return `${lockedHashtag} `
  }

  // If it doesn't contain the hashtag, append it at the end
  return `${text} ${lockedHashtag}`.slice(0, DESCRIPTION_MAX_LENGTH)
}

export const detectDescriptionTrigger = (value, caretPosition = value.length) => {
  const beforeCaret = value.slice(0, caretPosition)
  const match = beforeCaret.match(DESCRIPTION_TRIGGER_REGEX)

  if (!match) return null

  const marker = match[2]
  const query = match[3] || ""
  const start = beforeCaret.length - marker.length - query.length

  return {
    type: marker === "@" ? "mention" : "hashtag",
    marker,
    query,
    start,
    end: caretPosition,
  }
}

export const getHashtagName = (item) =>
  String(item?.hashtag || "")
    .replace(/^#+/, "")
    .trim()

export const getMentionUsername = (item) =>
  String(item?.username || item?.nickname || "")
    .replace(/^@+/, "")
    .replace(/\s+/g, "")
    .trim()

export const renderHighlightedDescription = (text, tokenClassName) => {
  if (!text) return null

  const parts = []
  let lastIndex = 0

  for (const match of text.matchAll(DESCRIPTION_LINK_REGEX)) {
    const token = match[0]
    const index = match.index || 0

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index))
    }

    parts.push(
      <span key={`${token}-${index}`} className={tokenClassName}>
        {token}
      </span>
    )

    lastIndex = index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

const CreateReelContext = createContext()

export const useCreateReelContext = () => useContext(CreateReelContext)

export const CreateReelProvider = ({ children, open, onClose, challenge }) => {
  const { t } = useLanguage()
  // RTK Query Mutation Hook
  const [createReel, { isLoading, isSuccess, error: apiError }] = useCreateReelMutation()
  const lockedChallengeHashtag = useMemo(() => normalizeChallengeHashtag(challenge), [challenge])

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState(() => buildChallengeDescription(lockedChallengeHashtag))
  const [activeDescriptionTrigger, setActiveDescriptionTrigger] = useState(null)
  const [debouncedDescriptionTrigger, setDebouncedDescriptionTrigger] = useState(null)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [privacy, setPrivacy] = useState("Public")

  // File states & previews
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("")
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("")
  const [coverType, setCoverType] = useState("frame") // "frame" | "custom"

  // UI Drag-and-drop active states
  const [isVideoDragging, setIsVideoDragging] = useState(false)
  const [isCoverDragging, setIsCoverDragging] = useState(false)

  // Validation / Custom error state
  const [validationErrors, setValidationErrors] = useState({})
  const [generalError, setGeneralError] = useState("")

  // Cover Frame Picker states
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)

  // Interactive Cover selector states
  const [previewMode, setPreviewMode] = useState("video") // "video" | "cover"
  const [filmstripFrames, setFilmstripFrames] = useState([])
  const [isExtractingFilmstrip, setIsExtractingFilmstrip] = useState(false)

  // Mobile Tab selector state
  const [mobileTab, setMobileTab] = useState("details") // "details" | "preview"

  // Refs
  const videoInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const videoRef = useRef(null)
  const descriptionInputRef = useRef(null)
  const descriptionHighlightRef = useRef(null)
  const filmstripRequestRef = useRef(0)
  const filmstripSourceRef = useRef("")
  const metadataSourceRef = useRef("")

  const hashtagSearchArgs = useMemo(
    () => ({
      query: debouncedDescriptionTrigger?.type === "hashtag"
        ? debouncedDescriptionTrigger.query
        : "",
      take: 8,
    }),
    [debouncedDescriptionTrigger?.type, debouncedDescriptionTrigger?.query]
  )

  const mentionSearchArgs = useMemo(
    () => ({
      query: debouncedDescriptionTrigger?.type === "mention"
        ? debouncedDescriptionTrigger.query
        : "",
      take: 8,
    }),
    [debouncedDescriptionTrigger?.type, debouncedDescriptionTrigger?.query]
  )

  const {
    data: hashtagResults = [],
    isFetching: isFetchingHashtags,
  } = useSearchReelHashtagsQuery(hashtagSearchArgs, {
    skip: !open || debouncedDescriptionTrigger?.type !== "hashtag",
  })

  const {
    data: mentionResults = [],
    isFetching: isFetchingMentions,
  } = useSearchReelMentionsQuery(mentionSearchArgs, {
    skip: !open || debouncedDescriptionTrigger?.type !== "mention",
  })

  const hashtagSuggestions = useMemo(
    () => hashtagResults.filter((item) => getHashtagName(item)),
    [hashtagResults]
  )

  const mentionSuggestions = useMemo(
    () => mentionResults.filter((item) => getMentionUsername(item)),
    [mentionResults]
  )

  const activeSuggestions = activeDescriptionTrigger?.type === "hashtag"
    ? hashtagSuggestions
    : mentionSuggestions

  const isFetchingDescriptionSuggestions = activeDescriptionTrigger?.type === "hashtag"
    ? isFetchingHashtags
    : isFetchingMentions

  const hasSettledDescriptionTrigger = Boolean(
    activeDescriptionTrigger
    && debouncedDescriptionTrigger
    && activeDescriptionTrigger.type === debouncedDescriptionTrigger.type
    && activeDescriptionTrigger.query === debouncedDescriptionTrigger.query
    && activeDescriptionTrigger.start === debouncedDescriptionTrigger.start
    && activeDescriptionTrigger.end === debouncedDescriptionTrigger.end
  )

  const showDescriptionSuggestions = hasSettledDescriptionTrigger

  useEffect(() => {
    if (!open) return
    setDescription((currentDescription) =>
      buildChallengeDescription(lockedChallengeHashtag, currentDescription)
    )
  }, [open, lockedChallengeHashtag])

  useEffect(() => {
    if (!activeDescriptionTrigger) {
      setDebouncedDescriptionTrigger(null)
      return undefined
    }

    const timer = window.setTimeout(() => {
      setDebouncedDescriptionTrigger(activeDescriptionTrigger)
    }, 180)

    return () => window.clearTimeout(timer)
  }, [activeDescriptionTrigger])

  useEffect(() => {
    setActiveSuggestionIndex(0)
  }, [activeDescriptionTrigger?.type, activeDescriptionTrigger?.query, activeSuggestions.length])

  // Auto-resize textarea whenever description changes (covers programmatic updates)
  useEffect(() => {
    const el = descriptionInputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = el.scrollHeight + "px"
  }, [description])

  // Handle closing modal and resetting form/previews
  const handleClose = useCallback(() => {
    setTitle("")
    setDescription(buildChallengeDescription(lockedChallengeHashtag))
    setActiveDescriptionTrigger(null)
    setDebouncedDescriptionTrigger(null)
    setActiveSuggestionIndex(0)
    setPrivacy("Public")
    setCoverType("frame")
    setVideoDuration(0)
    setCurrentTime(0)
    setFilmstripFrames([])
    setIsExtractingFilmstrip(false)
    setPreviewMode("video")
    setMobileTab("details")
    filmstripRequestRef.current += 1
    filmstripSourceRef.current = ""
    metadataSourceRef.current = ""

    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.src = ""
        videoRef.current.load()
      } catch (err) {
        console.warn("[CreateReelModal] Failed to reset video preview.", err)
      }
    }

    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(null)
    setVideoPreviewUrl("")

    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
    setCoverFile(null)
    setCoverPreviewUrl("")

    setIsVideoDragging(false)
    setIsCoverDragging(false)
    setValidationErrors({})
    setGeneralError("")

    onClose()
  }, [lockedChallengeHashtag, videoPreviewUrl, coverPreviewUrl, onClose])

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl)
      }
    }
  }, [videoPreviewUrl, coverPreviewUrl])

  // Handle modal success reset
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        handleClose()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, handleClose])

  // Discard/Clear video file
  const handleDiscardVideo = () => {
    setTitle("")
    setDescription(buildChallengeDescription(lockedChallengeHashtag))
    setActiveDescriptionTrigger(null)
    setDebouncedDescriptionTrigger(null)
    setActiveSuggestionIndex(0)
    setPrivacy("Public")
    setCoverType("frame")
    setVideoDuration(0)
    setCurrentTime(0)
    setFilmstripFrames([])
    setIsExtractingFilmstrip(false)
    setPreviewMode("video")
    setMobileTab("details")
    filmstripRequestRef.current += 1
    filmstripSourceRef.current = ""
    metadataSourceRef.current = ""

    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.src = ""
        videoRef.current.load()
      } catch (err) {
        console.warn("[CreateReelModal] Failed to discard video preview.", err)
      }
    }

    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(null)
    setVideoPreviewUrl("")

    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
    setCoverFile(null)
    setCoverPreviewUrl("")

    setIsVideoDragging(false)
    setIsCoverDragging(false)
    setValidationErrors({})
    setGeneralError("")
  }

  // Handle Video select
  const handleVideoSelect = (file) => {
    if (!file) return

    // Verify file type
    if (!file.type.startsWith("video/")) {
      setValidationErrors((prev) => ({ ...prev, video: t.catSpeak?.reels?.videoFormatError || "Please upload a valid video file." }))
      return
    }

    // Verify size limit (e.g. 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setValidationErrors((prev) => ({ ...prev, video: t.catSpeak?.reels?.videoSizeError || "Video file size exceeds 50MB limit." }))
      return
    }

    // Clear video error
    setValidationErrors((prev) => {
      const next = { ...prev }
      delete next.video
      return next
    })

    // Revoke previous URL if any
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }

    setVideoFile(file)
    setVideoDuration(0)
    setCurrentTime(0)
    setFilmstripFrames([])
    filmstripRequestRef.current += 1
    filmstripSourceRef.current = ""
    metadataSourceRef.current = ""
    setVideoPreviewUrl(URL.createObjectURL(file))
    setCoverType("frame") // Default cover source to frame extraction on video select
  }

  // Handle Cover select
  const handleCoverSelect = (file) => {
    if (!file) return

    // Verify file type
    if (!file.type.startsWith("image/")) {
      setValidationErrors((prev) => ({ ...prev, cover: t.catSpeak?.reels?.coverFormatError || "Please upload a valid image file." }))
      return
    }

    // Verify size limit (e.g. 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setValidationErrors((prev) => ({ ...prev, cover: t.catSpeak?.reels?.coverSizeError || "Image file size exceeds 5MB limit." }))
      return
    }

    // Clear cover error
    setValidationErrors((prev) => {
      const next = { ...prev }
      delete next.cover
      return next
    })

    // Revoke previous URL if any
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl)
    }

    setCoverFile(file)
    setCoverPreviewUrl(URL.createObjectURL(file))
  }

  // Format seconds to readable timer format (MM:SS.t)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`
  }

  // Sequential background keyframe extraction engine.
  const generateFilmstrip = useCallback(async (videoUrl, duration) => {
    if (!videoUrl || !Number.isFinite(duration) || duration <= 0) return

    const sourceKey = `${videoUrl}:${Math.round(duration * 1000)}`
    if (filmstripSourceRef.current === sourceKey) return

    const requestId = filmstripRequestRef.current + 1
    filmstripRequestRef.current = requestId
    filmstripSourceRef.current = sourceKey

    setIsExtractingFilmstrip(true)
    setFilmstripFrames([])

    let tempVideo = null
    let extractionCancelled = false

    const isStaleRequest = () => filmstripRequestRef.current !== requestId

    try {
      tempVideo = document.createElement("video")

      // Crucial: Chromium aggressively throttles video decoding for background/detached elements.
      // Appending to DOM and styling off-screen tricks the browser into fully allocating decoding resources.
      tempVideo.style.position = "fixed"
      tempVideo.style.top = "0"
      tempVideo.style.left = "-9999px"
      tempVideo.style.width = "1px"
      tempVideo.style.height = "1px"
      tempVideo.style.opacity = "0.01"
      tempVideo.style.pointerEvents = "none"
      document.body.appendChild(tempVideo)

      tempVideo.src = videoUrl
      tempVideo.muted = true
      tempVideo.playsInline = true
      tempVideo.crossOrigin = "anonymous"
      tempVideo.preload = "auto"
      tempVideo.load() // Explicitly start loading metadata and media content

      await new Promise((resolve) => {
        tempVideo.onloadedmetadata = () => resolve()
        setTimeout(resolve, 2000)
      })

      if (isStaleRequest()) {
        extractionCancelled = true
        return
      }

      const numberOfFrames = 6
      const frames = []

      for (let i = 0; i < numberOfFrames; i++) {
        if (isStaleRequest()) {
          extractionCancelled = true
          return
        }

        // Distribute frames evenly from 5% to 95% of duration
        const ratio = 0.05 + (0.9 / (numberOfFrames - 1)) * i
        const time = duration * ratio

        tempVideo.currentTime = time

        await new Promise((resolve) => {
          const onSeeked = () => {
            tempVideo.removeEventListener("seeked", onSeeked)
            resolve()
          }
          tempVideo.addEventListener("seeked", onSeeked)
          setTimeout(resolve, 800)
        })

        if (isStaleRequest()) {
          extractionCancelled = true
          return
        }

        // Draw video frame to small offscreen canvas (highly optimized)
        const canvas = document.createElement("canvas")
        const w = 120
        const h = Math.round((tempVideo.videoHeight * w) / tempVideo.videoWidth) || 170
        canvas.width = w
        canvas.height = h

        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(tempVideo, 0, 0, w, h)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.6)
          frames.push({ url: dataUrl, time })
        }
      }

      if (!isStaleRequest()) {
        setFilmstripFrames(frames)
      }
    } catch (err) {
      if (!extractionCancelled) {
        console.error("Error generating filmstrip:", err)
      }
    } finally {
      if (tempVideo) {
        tempVideo.pause()
        tempVideo.src = ""
        try {
          tempVideo.load() // Release hardware decoder resources
        } catch (err) {
          console.warn("[CreateReelModal] Failed to release filmstrip video.", err)
        }
        if (tempVideo.parentNode) {
          tempVideo.parentNode.removeChild(tempVideo)
        }
      }
      if (!isStaleRequest()) {
        setIsExtractingFilmstrip(false)
      }
    }
  }, [])

  // Handle video metadata loading once per selected source.
  const handleVideoLoadedMetadata = useCallback((e) => {
    const duration = e.target.duration
    if (!Number.isFinite(duration) || duration <= 0) return

    const sourceKey = `${videoPreviewUrl}:${Math.round(duration * 1000)}`
    setVideoDuration((currentDuration) =>
      Math.abs((currentDuration || 0) - duration) < 0.01 ? currentDuration : duration
    )

    if (metadataSourceRef.current === sourceKey) return
    metadataSourceRef.current = sourceKey

    const initialTime = Math.min(0.1, Math.max(duration - 0.01, 0))
    setCurrentTime(initialTime)
    e.target.currentTime = initialTime // Seek once to extract the default cover frame.

    // Trigger background keyframe extraction
    generateFilmstrip(videoPreviewUrl, duration)
  }, [generateFilmstrip, videoPreviewUrl])

  // Video Seeked capture frame (initial capture only)
  const handleVideoSeeked = () => {
    if (!videoRef.current) return
    // High-performance: only capture if paused and coverFile is empty
    if (videoRef.current.paused && !coverFile) {
      captureFrame()
    }
  }

  // Canvas Frame Capture pipeline (initial capture)
  const captureFrame = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    setIsCapturing(true)
    try {
      const canvas = document.createElement("canvas")
      const maxDim = 720
      let w = video.videoWidth || 640
      let h = video.videoHeight || 360
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w)
          w = maxDim
        } else {
          w = Math.round((w * maxDim) / h)
          h = maxDim
        }
      }
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0, w, h)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsCapturing(false)
            return
          }

          const file = new File([blob], "cover.jpg", { type: "image/jpeg" })
          const newUrl = URL.createObjectURL(file)

          setCoverPreviewUrl((prevUrl) => {
            if (prevUrl) {
              URL.revokeObjectURL(prevUrl)
            }
            return newUrl
          })

          setCoverFile(file)
          setIsCapturing(false)
        },
        "image/jpeg",
        0.85
      )
    } catch (err) {
      console.error("Frame capture error:", err)
      setIsCapturing(false)
    }
  }, [])

  // Drag & drop handlers for Video
  const handleVideoDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsVideoDragging(true)
    } else if (e.type === "dragleave") {
      setIsVideoDragging(false)
    }
  }

  const handleVideoDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsVideoDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoSelect(e.dataTransfer.files[0])
    }
  }

  // Drag & drop handlers for Cover
  const handleCoverDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsCoverDragging(true)
    } else if (e.type === "dragleave") {
      setIsCoverDragging(false)
    }
  }

  const handleCoverDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsCoverDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverSelect(e.dataTransfer.files[0])
    }
  }

  // Interactive Slider and Keyframe Actions
  const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const handleSliderRelease = () => {
    captureFrame()
  }

  const handleKeyframeSelect = (time) => {
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      const onSeeked = () => {
        videoRef.current.removeEventListener("seeked", onSeeked)
        captureFrame()
      }
      videoRef.current.addEventListener("seeked", onSeeked)
    }
  }

  const updateDescriptionTrigger = useCallback((value, caretPosition) => {
    setActiveDescriptionTrigger(detectDescriptionTrigger(value, caretPosition))
  }, [])

  const handleDescriptionChange = useCallback((e) => {
    const rawDescription = e.target.value
    const nextDescription = buildChallengeDescription(lockedChallengeHashtag, rawDescription)
    const rawCaretPosition = e.target.selectionStart ?? rawDescription.length

    setDescription(nextDescription)
    updateDescriptionTrigger(nextDescription, rawCaretPosition)

    if (nextDescription !== rawDescription) {
      const nextCaretPosition = Math.min(rawCaretPosition, nextDescription.length)
      window.requestAnimationFrame(() => {
        if (!descriptionInputRef.current) return
        descriptionInputRef.current.setSelectionRange(nextCaretPosition, nextCaretPosition)
      })
    }
  }, [
    lockedChallengeHashtag,
    updateDescriptionTrigger,
  ])

  const handleDescriptionCursorUpdate = useCallback((e) => {
    const input = e.currentTarget
    if (lockedChallengeHashtag) {
      const val = input.value
      const startIndex = val.indexOf(lockedChallengeHashtag)
      if (startIndex !== -1) {
        const endIndex = startIndex + lockedChallengeHashtag.length
        const selStart = input.selectionStart ?? val.length
        const selEnd = input.selectionEnd ?? selStart

        // Snap the caret if it is strictly inside the hashtag range
        if (selStart === selEnd) {
          if (selStart > startIndex && selStart < endIndex) {
            const midPoint = startIndex + Math.floor(lockedChallengeHashtag.length / 2)
            const snapPos = selStart < midPoint ? startIndex : endIndex
            input.setSelectionRange(snapPos, snapPos)
            updateDescriptionTrigger(val, snapPos)
            return
          }
        }
      }
    }
    const caretPosition = input.selectionStart ?? input.value.length
    updateDescriptionTrigger(input.value, caretPosition)
  }, [lockedChallengeHashtag, updateDescriptionTrigger])

  const handleDescriptionScroll = useCallback((e) => {
    if (!descriptionHighlightRef.current) return
    descriptionHighlightRef.current.scrollTop = e.currentTarget.scrollTop
    descriptionHighlightRef.current.scrollLeft = e.currentTarget.scrollLeft
  }, [])

  const applyDescriptionSuggestion = useCallback((item) => {
    if (!activeDescriptionTrigger) return

    const completionValue = activeDescriptionTrigger.type === "mention"
      ? getMentionUsername(item)
      : getHashtagName(item)

    if (!completionValue) return

    const completion = `${activeDescriptionTrigger.marker}${completionValue}`
    const suffix = description.slice(activeDescriptionTrigger.end)
    const separator = suffix && /^\s/.test(suffix) ? "" : " "
    const nextDescription = `${description.slice(0, activeDescriptionTrigger.start)}${completion}${separator}${suffix}`
      .slice(0, DESCRIPTION_MAX_LENGTH)
    const nextCaretPosition = Math.min(
      activeDescriptionTrigger.start + completion.length + separator.length,
      nextDescription.length
    )

    setDescription(nextDescription)
    setActiveDescriptionTrigger(null)
    setDebouncedDescriptionTrigger(null)
    setActiveSuggestionIndex(0)

    window.requestAnimationFrame(() => {
      if (!descriptionInputRef.current) return
      descriptionInputRef.current.focus()
      descriptionInputRef.current.setSelectionRange(nextCaretPosition, nextCaretPosition)
    })
  }, [activeDescriptionTrigger, description])

  const handleDescriptionKeyDown = useCallback((e) => {
    if (lockedChallengeHashtag) {
      const val = e.currentTarget.value
      const startIndex = val.indexOf(lockedChallengeHashtag)
      if (startIndex !== -1) {
        const endIndex = startIndex + lockedChallengeHashtag.length
        const selectionStart = e.currentTarget.selectionStart ?? 0
        const selectionEnd = e.currentTarget.selectionEnd ?? selectionStart
        const key = e.key
        const isPrintableInput = key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey

        const selectionOverlaps = selectionStart < endIndex && selectionEnd > startIndex
        const isProtectedBackspace = key === "Backspace" && selectionStart === selectionEnd && selectionStart === endIndex
        const isProtectedDelete = key === "Delete" && selectionStart === selectionEnd && selectionStart === startIndex

        if (selectionOverlaps) {
          const isModifyingKey = isPrintableInput || key === "Backspace" || key === "Delete" || key === "Enter"
          const isClipboardEdit = (e.metaKey || e.ctrlKey) && (key.toLowerCase() === "x" || key.toLowerCase() === "v")

          if (isModifyingKey || isClipboardEdit) {
            e.preventDefault()
            return
          }
        }

        if (isProtectedBackspace || isProtectedDelete) {
          e.preventDefault()
          return
        }
      }
    }

    if (!showDescriptionSuggestions) return

    if (e.key === "Escape") {
      setActiveDescriptionTrigger(null)
      setDebouncedDescriptionTrigger(null)
      return
    }

    if (!activeSuggestions.length) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestionIndex((index) => (index + 1) % activeSuggestions.length)
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestionIndex((index) =>
        index === 0 ? activeSuggestions.length - 1 : index - 1
      )
      return
    }

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      applyDescriptionSuggestion(activeSuggestions[activeSuggestionIndex])
    }
  }, [
    activeSuggestionIndex,
    activeSuggestions,
    applyDescriptionSuggestion,
    lockedChallengeHashtag,
    showDescriptionSuggestions,
  ])

  const handleDescriptionProtectedClipboard = useCallback((e) => {
    if (!lockedChallengeHashtag) return

    const val = e.currentTarget.value
    const startIndex = val.indexOf(lockedChallengeHashtag)
    if (startIndex === -1) return
    const endIndex = startIndex + lockedChallengeHashtag.length

    const selectionStart = e.currentTarget.selectionStart ?? 0
    const selectionEnd = e.currentTarget.selectionEnd ?? selectionStart

    const selectionOverlaps = selectionStart < endIndex && selectionEnd > startIndex
    if (selectionOverlaps) {
      e.preventDefault()
    }
  }, [lockedChallengeHashtag])

  // Form Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    // Reset errors
    setValidationErrors({})
    setGeneralError("")

    // Validate requirements
    const errors = {}
    if (!videoFile) {
      errors.video = "A video file is required."
    }
    if (!title.trim()) {
      errors.title = "A title is required."
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      const formData = new FormData()
      formData.append("Title", title.trim())
      formData.append("Description", description.trim())
      formData.append("Privacy", privacy)
      formData.append("VideoFile", videoFile)

      if (challenge?.challengeId) {
        formData.append("ChallengeId", String(challenge.challengeId))
      }

      if (coverFile) {
        formData.append("CoverFile", coverFile)
      }

      await createReel(formData).unwrap()
      toast.success("Reel uploaded successfully!")
    } catch (err) {
      console.error("Reel upload error:", err)
      const errorMessage = err?.data?.message || err?.message || "Failed to upload Reel. Please try again."
      setGeneralError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const value = {
    title, setTitle,
    description, setDescription,
    activeDescriptionTrigger, setActiveDescriptionTrigger,
    debouncedDescriptionTrigger, setDebouncedDescriptionTrigger,
    activeSuggestionIndex, setActiveSuggestionIndex,
    privacy, setPrivacy,
    videoFile, setVideoFile,
    videoPreviewUrl, setVideoPreviewUrl,
    coverFile, setCoverFile,
    coverPreviewUrl, setCoverPreviewUrl,
    coverType, setCoverType,
    isVideoDragging, setIsVideoDragging,
    isCoverDragging, setIsCoverDragging,
    validationErrors, setValidationErrors,
    generalError, setGeneralError,
    videoDuration, setVideoDuration,
    currentTime, setCurrentTime,
    isCapturing, setIsCapturing,
    previewMode, setPreviewMode,
    filmstripFrames, setFilmstripFrames,
    isExtractingFilmstrip, setIsExtractingFilmstrip,
    mobileTab, setMobileTab,
    videoInputRef, coverInputRef, videoRef,
    descriptionInputRef, descriptionHighlightRef,
    filmstripRequestRef, filmstripSourceRef, metadataSourceRef,
    hashtagSearchArgs, mentionSearchArgs,
    hashtagResults, isFetchingHashtags,
    mentionResults, isFetchingMentions,
    hashtagSuggestions, mentionSuggestions,
    activeSuggestions, isFetchingDescriptionSuggestions,
    hasSettledDescriptionTrigger, showDescriptionSuggestions,
    handleClose, handleDiscardVideo, handleVideoSelect, handleCoverSelect,
    formatTime, generateFilmstrip, handleVideoLoadedMetadata, handleVideoSeeked,
    captureFrame, handleVideoDrag, handleVideoDrop, handleCoverDrag, handleCoverDrop,
    handleSliderChange, handleSliderRelease, handleKeyframeSelect,
    updateDescriptionTrigger, handleDescriptionChange, handleDescriptionCursorUpdate,
    handleDescriptionScroll, applyDescriptionSuggestion, handleDescriptionKeyDown,
    handleDescriptionProtectedClipboard, handleSubmit,
    isLoading, isSuccess, apiError, t, lockedChallengeHashtag, createReel,
  }

  return (
    <CreateReelContext.Provider value={value}>
      {children}
    </CreateReelContext.Provider>
  )
}
