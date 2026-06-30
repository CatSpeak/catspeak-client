import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  UploadCloud,
  Video,
  Image,
  Trash2,
  Globe,
  Users,
  Lock,
  AlertCircle,
  Film,
  Heart,
  MessageCircle,
  Share,
  Music,
  X,
  Hash,
  Loader2,
} from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput } from "@/shared/components/ui/inputs"
import Avatar from "@/shared/components/ui/Avatar"
import { toast } from "react-hot-toast"
import { uploadReelInBackground } from "../utils/uploadManager"
import {
  useCreateReelMutation,
  useSearchReelHashtagsQuery,
  useSearchReelMentionsQuery,
} from "@/store/api/reelsApi"

const DESCRIPTION_TRIGGER_REGEX = /(^|[\s([{])([@#])([\p{L}\p{N}_.-]{0,50})$/u
const DESCRIPTION_LINK_REGEX = /([@#][\p{L}\p{N}_.-]+)/gu
const DESCRIPTION_MAX_LENGTH = 2000
const PRIVACY_OPTIONS = [
  { value: "Public", label: "Public", icon: Globe },
  { value: "FriendsOnly", label: "Friends Only", icon: Users },
  { value: "Private", label: "Private", icon: Lock },
]

const normalizeChallengeHashtag = (challenge) => {
  const rawHashtag = String(challenge?.hashtag || "").trim()
  if (!rawHashtag) return ""

  const hashtag = rawHashtag.replace(/^#+/, "").replace(/\s+/g, "")
  return hashtag ? `#${hashtag}` : ""
}

const buildChallengeDescription = (lockedHashtag, value = "") => {
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

const detectDescriptionTrigger = (value, caretPosition = value.length) => {
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

const getHashtagName = (item) =>
  String(item?.hashtag || "")
    .replace(/^#+/, "")
    .trim()

const getMentionUsername = (item) =>
  String(item?.username || item?.nickname || "")
    .replace(/^@+/, "")
    .replace(/\s+/g, "")
    .trim()

const renderHighlightedDescription = (text, tokenClassName) => {
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
      </span>,
    )

    lastIndex = index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

const CreateReelModal = ({ open, onClose, challenge = null }) => {
  // RTK Query Mutation Hook
  const [createReel, { isLoading, isSuccess, error: apiError }] =
    useCreateReelMutation()
  const lockedChallengeHashtag = useMemo(
    () => normalizeChallengeHashtag(challenge),
    [challenge],
  )

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState(() =>
    buildChallengeDescription(lockedChallengeHashtag),
  )
  const [activeDescriptionTrigger, setActiveDescriptionTrigger] = useState(null)
  const [debouncedDescriptionTrigger, setDebouncedDescriptionTrigger] =
    useState(null)
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
      query:
        debouncedDescriptionTrigger?.type === "hashtag"
          ? debouncedDescriptionTrigger.query
          : "",
      take: 8,
    }),
    [debouncedDescriptionTrigger?.type, debouncedDescriptionTrigger?.query],
  )

  const mentionSearchArgs = useMemo(
    () => ({
      query:
        debouncedDescriptionTrigger?.type === "mention"
          ? debouncedDescriptionTrigger.query
          : "",
      take: 8,
    }),
    [debouncedDescriptionTrigger?.type, debouncedDescriptionTrigger?.query],
  )

  const { data: hashtagResults = [], isFetching: isFetchingHashtags } =
    useSearchReelHashtagsQuery(hashtagSearchArgs, {
      skip: !open || debouncedDescriptionTrigger?.type !== "hashtag",
    })

  const { data: mentionResults = [], isFetching: isFetchingMentions } =
    useSearchReelMentionsQuery(mentionSearchArgs, {
      skip: !open || debouncedDescriptionTrigger?.type !== "mention",
    })

  const hashtagSuggestions = useMemo(
    () => hashtagResults.filter((item) => getHashtagName(item)),
    [hashtagResults],
  )

  const mentionSuggestions = useMemo(
    () => mentionResults.filter((item) => getMentionUsername(item)),
    [mentionResults],
  )

  const activeSuggestions =
    activeDescriptionTrigger?.type === "hashtag"
      ? hashtagSuggestions
      : mentionSuggestions

  const isFetchingDescriptionSuggestions =
    activeDescriptionTrigger?.type === "hashtag"
      ? isFetchingHashtags
      : isFetchingMentions

  const hasSettledDescriptionTrigger = Boolean(
    activeDescriptionTrigger &&
    debouncedDescriptionTrigger &&
    activeDescriptionTrigger.type === debouncedDescriptionTrigger.type &&
    activeDescriptionTrigger.query === debouncedDescriptionTrigger.query &&
    activeDescriptionTrigger.start === debouncedDescriptionTrigger.start &&
    activeDescriptionTrigger.end === debouncedDescriptionTrigger.end,
  )

  const showDescriptionSuggestions = hasSettledDescriptionTrigger

  useEffect(() => {
    if (!open) return
    setDescription((currentDescription) =>
      buildChallengeDescription(lockedChallengeHashtag, currentDescription),
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
  }, [
    activeDescriptionTrigger?.type,
    activeDescriptionTrigger?.query,
    activeSuggestions.length,
  ])

  // No longer locking prefix at the front, cursor will snap to hashtag boundaries dynamically

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
      setValidationErrors((prev) => ({
        ...prev,
        video: "Please upload a valid video file.",
      }))
      return
    }

    // Verify size limit (e.g. 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setValidationErrors((prev) => ({
        ...prev,
        video: "Video file size exceeds 50MB limit.",
      }))
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
      setValidationErrors((prev) => ({
        ...prev,
        cover: "Please upload a valid image file.",
      }))
      return
    }

    // Verify size limit (e.g. 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setValidationErrors((prev) => ({
        ...prev,
        cover: "Image file size exceeds 5MB limit.",
      }))
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
        const h =
          Math.round((tempVideo.videoHeight * w) / tempVideo.videoWidth) || 170
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
          console.warn(
            "[CreateReelModal] Failed to release filmstrip video.",
            err,
          )
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
  const handleVideoLoadedMetadata = useCallback(
    (e) => {
      const duration = e.target.duration
      if (!Number.isFinite(duration) || duration <= 0) return

      const sourceKey = `${videoPreviewUrl}:${Math.round(duration * 1000)}`
      setVideoDuration((currentDuration) =>
        Math.abs((currentDuration || 0) - duration) < 0.01
          ? currentDuration
          : duration,
      )

      if (metadataSourceRef.current === sourceKey) return
      metadataSourceRef.current = sourceKey

      const initialTime = Math.min(0.1, Math.max(duration - 0.01, 0))
      setCurrentTime(initialTime)
      e.target.currentTime = initialTime // Seek once to extract the default cover frame.

      // Trigger background keyframe extraction
      generateFilmstrip(videoPreviewUrl, duration)
    },
    [generateFilmstrip, videoPreviewUrl],
  )

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
        0.85,
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

  const handleDescriptionChange = useCallback(
    (e) => {
      const rawDescription = e.target.value
      const nextDescription = buildChallengeDescription(
        lockedChallengeHashtag,
        rawDescription,
      )
      const rawCaretPosition = e.target.selectionStart ?? rawDescription.length

      setDescription(nextDescription)
      updateDescriptionTrigger(nextDescription, rawCaretPosition)

      if (nextDescription !== rawDescription) {
        const nextCaretPosition = Math.min(
          rawCaretPosition,
          nextDescription.length,
        )
        window.requestAnimationFrame(() => {
          if (!descriptionInputRef.current) return
          descriptionInputRef.current.setSelectionRange(
            nextCaretPosition,
            nextCaretPosition,
          )
        })
      }
    },
    [lockedChallengeHashtag, updateDescriptionTrigger],
  )

  const handleDescriptionCursorUpdate = useCallback(
    (e) => {
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
              const midPoint =
                startIndex + Math.floor(lockedChallengeHashtag.length / 2)
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
    },
    [lockedChallengeHashtag, updateDescriptionTrigger],
  )

  const handleDescriptionScroll = useCallback((e) => {
    if (!descriptionHighlightRef.current) return
    descriptionHighlightRef.current.scrollTop = e.currentTarget.scrollTop
    descriptionHighlightRef.current.scrollLeft = e.currentTarget.scrollLeft
  }, [])

  const applyDescriptionSuggestion = useCallback(
    (item) => {
      if (!activeDescriptionTrigger) return

      const completionValue =
        activeDescriptionTrigger.type === "mention"
          ? getMentionUsername(item)
          : getHashtagName(item)

      if (!completionValue) return

      const completion = `${activeDescriptionTrigger.marker}${completionValue}`
      const suffix = description.slice(activeDescriptionTrigger.end)
      const separator = suffix && /^\s/.test(suffix) ? "" : " "
      const nextDescription =
        `${description.slice(0, activeDescriptionTrigger.start)}${completion}${separator}${suffix}`.slice(
          0,
          DESCRIPTION_MAX_LENGTH,
        )
      const nextCaretPosition = Math.min(
        activeDescriptionTrigger.start + completion.length + separator.length,
        nextDescription.length,
      )

      setDescription(nextDescription)
      setActiveDescriptionTrigger(null)
      setDebouncedDescriptionTrigger(null)
      setActiveSuggestionIndex(0)

      window.requestAnimationFrame(() => {
        if (!descriptionInputRef.current) return
        descriptionInputRef.current.focus()
        descriptionInputRef.current.setSelectionRange(
          nextCaretPosition,
          nextCaretPosition,
        )
      })
    },
    [activeDescriptionTrigger, description],
  )

  const handleDescriptionKeyDown = useCallback(
    (e) => {
      if (lockedChallengeHashtag) {
        const val = e.currentTarget.value
        const startIndex = val.indexOf(lockedChallengeHashtag)
        if (startIndex !== -1) {
          const endIndex = startIndex + lockedChallengeHashtag.length
          const selectionStart = e.currentTarget.selectionStart ?? 0
          const selectionEnd = e.currentTarget.selectionEnd ?? selectionStart
          const key = e.key
          const isPrintableInput =
            key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey

          const selectionOverlaps =
            selectionStart < endIndex && selectionEnd > startIndex
          const isProtectedBackspace =
            key === "Backspace" &&
            selectionStart === selectionEnd &&
            selectionStart === endIndex
          const isProtectedDelete =
            key === "Delete" &&
            selectionStart === selectionEnd &&
            selectionStart === startIndex

          if (selectionOverlaps) {
            const isModifyingKey =
              isPrintableInput ||
              key === "Backspace" ||
              key === "Delete" ||
              key === "Enter"
            const isClipboardEdit =
              (e.metaKey || e.ctrlKey) &&
              (key.toLowerCase() === "x" || key.toLowerCase() === "v")

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
        setActiveSuggestionIndex(
          (index) => (index + 1) % activeSuggestions.length,
        )
        return
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveSuggestionIndex((index) =>
          index === 0 ? activeSuggestions.length - 1 : index - 1,
        )
        return
      }

      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        applyDescriptionSuggestion(activeSuggestions[activeSuggestionIndex])
      }
    },
    [
      activeSuggestionIndex,
      activeSuggestions,
      applyDescriptionSuggestion,
      lockedChallengeHashtag,
      showDescriptionSuggestions,
    ],
  )

  const handleDescriptionProtectedClipboard = useCallback(
    (e) => {
      if (!lockedChallengeHashtag) return

      const val = e.currentTarget.value
      const startIndex = val.indexOf(lockedChallengeHashtag)
      if (startIndex === -1) return
      const endIndex = startIndex + lockedChallengeHashtag.length

      const selectionStart = e.currentTarget.selectionStart ?? 0
      const selectionEnd = e.currentTarget.selectionEnd ?? selectionStart

      const selectionOverlaps =
        selectionStart < endIndex && selectionEnd > startIndex
      if (selectionOverlaps) {
        e.preventDefault()
      }
    },
    [lockedChallengeHashtag],
  )

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
      formData.append(
        "Description",
        buildChallengeDescription(lockedChallengeHashtag, description).trim(),
      )
      formData.append("Privacy", privacy)
      formData.append("VideoFile", videoFile)

      if (challenge?.challengeId) {
        formData.append("ChallengeId", String(challenge.challengeId))
      }

      if (coverFile) {
        formData.append("CoverFile", coverFile)
      }

      uploadReelInBackground(formData, videoFile, coverFile)
      toast.success("Upload started in background", { icon: "📤" })
      handleClose()
    } catch (err) {
      setGeneralError("Failed to initiate background upload. Please try again.")
    }
  }

  const renderDescriptionSuggestion = (item, index) => {
    const isActive = index === activeSuggestionIndex

    if (activeDescriptionTrigger?.type === "mention") {
      const username = getMentionUsername(item)
      const displayName = item.nickname || username

      return (
        <button
          key={`mention-${item.accountId || username}`}
          type="button"
          role="option"
          aria-selected={isActive}
          onMouseDown={(event) => {
            event.preventDefault()
            applyDescriptionSuggestion(item)
          }}
          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
            isActive
              ? "bg-red-50 text-[#990011]"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Avatar
            size={30}
            src={item.avatarUrl}
            name={displayName}
            alt={displayName}
            className="shrink-0"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {displayName}
            </span>
            <span className="block truncate text-xs text-gray-500">
              @{username}
            </span>
          </span>
        </button>
      )
    }

    const hashtagName = getHashtagName(item)

    return (
      <button
        key={`hashtag-${hashtagName}`}
        type="button"
        role="option"
        aria-selected={isActive}
        onMouseDown={(event) => {
          event.preventDefault()
          applyDescriptionSuggestion(item)
        }}
        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
          isActive
            ? "bg-red-50 text-[#990011]"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isActive ? "bg-white" : "bg-gray-100"}`}
        >
          <Hash size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            #{hashtagName}
          </span>
          <span className="block truncate text-xs text-gray-500">
            {item.isChallenge ? "Challenge" : `${item.useCount || 0} uses`}
          </span>
        </span>
      </button>
    )
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Film size={20} className="text-[#990011]" />
          <span>Upload Reel</span>
        </div>
      }
      className="max-w-4xl w-full"
      bodyClassName="p-4 sm:p-6 overflow-y-auto h-[calc(100vh-76px)] min-[426px]:h-auto min-[426px]:max-h-[80vh] scrollbar-thin flex flex-col"
    >
      {/* Dynamic Keyframes Injector */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes mockMarquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }
        .animate-shake {
          animation: mockShake 0.4s ease-in-out;
        }
        @keyframes mockShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fadeIn {
          animation: mockFadeIn 0.3s ease-out forwards;
        }
        @keyframes mockFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cover-slider-range::-webkit-slider-runnable-track {
          background: #e5e7eb;
          height: 6px;
          border-radius: 9999px;
        }
        .cover-slider-range::-webkit-slider-thumb {
          background: #990011;
          border: 2px solid #ffffff;
          border-radius: 9999px;
          width: 16px;
          height: 16px;
          margin-top: -5px;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .cover-slider-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
      `,
        }}
      />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* API Error Notification */}
        {(generalError || apiError) && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-sm animate-shake">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Upload failed</p>
              <p className="opacity-90">
                {generalError ||
                  "Something went wrong. Please check your file formats and network."}
              </p>
            </div>
          </div>
        )}

        {!videoPreviewUrl ? (
          /* STEP 0: NO VIDEO UPLOADED - Drag and drop zone */
          <div className="flex flex-col gap-2">
            <div
              onDragEnter={handleVideoDrag}
              onDragOver={handleVideoDrag}
              onDragLeave={handleVideoDrag}
              onDrop={handleVideoDrop}
              onClick={() => videoInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl h-[360px] cursor-pointer transition-all duration-300 ${
                isVideoDragging
                  ? "border-[#990011] bg-red-50/30 scale-[0.99] shadow-inner"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <input
                type="file"
                ref={videoInputRef}
                onChange={(e) => handleVideoSelect(e.target.files?.[0])}
                accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                className="hidden"
              />

              <div className="p-4 bg-white rounded-full shadow-md text-gray-400 mb-4 transition-transform hover:scale-105">
                <UploadCloud size={36} className="text-[#990011]" />
              </div>

              <p className="font-bold text-sm text-gray-700 text-center px-4">
                Drag and drop your video here to upload
              </p>
              <p className="text-xs text-gray-400 text-center mt-1 px-4">
                or click to browse files
              </p>

              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 text-[10px] text-gray-400">
                <span>MP4, WebM or MOV</span>
                <span>•</span>
                <span>5 minutes</span>
                <span>•</span>
                <span>Up to 150MB</span>
              </div>
            </div>

            {validationErrors.video && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1 font-semibold">
                <AlertCircle size={12} />
                {validationErrors.video}
              </span>
            )}
          </div>
        ) : (
          /* STEP 1: VIDEO UPLOADED - SIMULTANEOUS DETAILS & LIVE PREVIEW */
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Top Video Uploaded Success Card */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                  <Video size={18} />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate pr-2">
                    {videoFile.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 font-semibold">
                    <span className="text-emerald-600 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Uploaded
                    </span>
                    <span>•</span>
                    <span>
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDiscardVideo}
                className="p-2 border border-gray-200 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-full shadow-sm transition-all active:scale-95 shrink-0"
                title="Discard video"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mobile View Toggle Segment Tabs (Only visible on mobile/tablet viewports) */}
            <div className="flex md:hidden bg-gray-100 p-1 rounded-2xl mb-1 border border-gray-200/40">
              <button
                type="button"
                onClick={() => setMobileTab("details")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  mobileTab === "details"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("preview")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  mobileTab === "preview"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Live Preview
              </button>
            </div>

            {/* Side-by-side editing layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 items-start">
              {/* Left Column (Details and Cover thumbnail selector) */}
              <div
                className={`md:col-span-2 flex-col gap-5 text-left ${mobileTab === "details" ? "flex" : "hidden md:flex"}`}
              >
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Details
                </h3>

                {/* Title */}
                <TextInput
                  id="title"
                  label="Title"
                  placeholder="Give your Reel a catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="square"
                  maxLength={100}
                  showCount
                  error={validationErrors.title}
                  required
                  className="rounded-xl border-gray-300"
                />

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Description
                  </label>
                  <div className="relative">
                    <div className="relative rounded-xl border border-gray-300 bg-white shadow-sm transition-colors hover:border-[#990011] focus-within:border-[#990011] focus-within:ring-1 focus-within:ring-[#990011]">
                      <div
                        ref={descriptionHighlightRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl p-3 text-sm leading-5 text-gray-800"
                        style={{
                          fontFamily: "inherit",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {renderHighlightedDescription(
                          description,
                          "text-[#2b5db0]",
                        )}
                      </div>
                      <textarea
                        ref={descriptionInputRef}
                        id="description"
                        placeholder="What's this video about? Add tags like #catspeak..."
                        value={description}
                        onChange={(e) => {
                          handleDescriptionChange(e)
                          // Auto-resize textarea to fit content
                          const el = e.target
                          el.style.height = "auto"
                          el.style.height = el.scrollHeight + "px"
                        }}
                        onKeyDown={handleDescriptionKeyDown}
                        onKeyUp={handleDescriptionCursorUpdate}
                        onClick={handleDescriptionCursorUpdate}
                        onSelect={handleDescriptionCursorUpdate}
                        onCut={handleDescriptionProtectedClipboard}
                        onPaste={handleDescriptionProtectedClipboard}
                        onScroll={handleDescriptionScroll}
                        onBlur={() => {
                          window.setTimeout(() => {
                            setActiveDescriptionTrigger(null)
                            setDebouncedDescriptionTrigger(null)
                          }, 120)
                        }}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        rows={3}
                        className="relative z-10 min-h-[84px] w-full resize-none rounded-xl bg-transparent p-3 text-sm leading-5 text-transparent caret-gray-900 outline-none placeholder:text-gray-400"
                        style={{
                          fontFamily: "inherit",
                          overflowY: "hidden",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      />
                    </div>

                    {showDescriptionSuggestions && (
                      <div
                        role="listbox"
                        className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
                      >
                        {isFetchingDescriptionSuggestions ? (
                          <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
                            <Loader2
                              size={15}
                              className="animate-spin text-[#990011]"
                            />
                            <span>Searching...</span>
                          </div>
                        ) : activeSuggestions.length > 0 ? (
                          activeSuggestions.map((item, index) =>
                            renderDescriptionSuggestion(item, index),
                          )
                        ) : (
                          <div className="px-3 py-3 text-sm text-gray-500">
                            No matches found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="self-end px-2 text-[10px] text-gray-400 font-semibold">
                    {description.length} / {DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>

                {/* Privacy Badge Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Privacy
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRIVACY_OPTIONS.map((item) => {
                      const IconComponent = item.icon
                      const isSelected = privacy === item.value
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setPrivacy(item.value)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 ${
                            isSelected
                              ? "border-[#990011] bg-red-50/40 text-[#990011] shadow-sm font-medium scale-[1.01]"
                              : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50/50"
                          }`}
                        >
                          <IconComponent
                            size={14}
                            className={
                              isSelected
                                ? "text-[#990011] mb-1"
                                : "text-gray-400 mb-1"
                            }
                          />
                          <span className="text-xs font-semibold">
                            {item.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Cover selection layout */}
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <Image size={15} className="text-gray-500" />
                      Cover Thumbnail
                    </label>
                    <div className="flex bg-gray-200/85 p-0.5 rounded-lg text-[9px] font-bold shadow-sm">
                      <button
                        type="button"
                        onClick={() => setCoverType("frame")}
                        className={`px-2.5 py-0.5 rounded-md transition-all ${coverType === "frame" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        Extract Frame
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverType("custom")}
                        className={`px-2.5 py-0.5 rounded-md transition-all ${coverType === "custom" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        Custom Image
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 border border-gray-200/60 rounded-2xl mt-1.5 animate-fadeIn">
                    {/* Video Player Container (always mounted, hidden if coverType !== 'frame') */}
                    <div
                      className={`relative aspect-[9/16] h-[160px] sm:h-[180px] rounded-xl overflow-hidden bg-black border border-gray-200/80 shadow-sm shrink-0 flex items-center justify-center mx-auto sm:mx-0 ${
                        coverType !== "frame"
                          ? "absolute -left-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none"
                          : ""
                      }`}
                    >
                      <video
                        ref={videoRef}
                        src={
                          coverType === "frame" ? videoPreviewUrl : undefined
                        }
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        onDurationChange={handleVideoLoadedMetadata}
                        onSeeked={handleVideoSeeked}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[9px] font-mono text-white px-1.5 py-0.5 rounded border border-white/10 select-none">
                        {formatTime(currentTime)}
                      </div>
                      {isCapturing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[0.5px]">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {coverType === "frame" ? (
                      /* Frame Picker Controls & Filmstrip */
                      <div className="flex-1 flex flex-col justify-between gap-3 text-left">
                        {/* Title & Scrubbing timeline */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 tracking-wider">
                            <span>SCRUB VIDEO TIMELINE</span>
                            <span className="font-mono text-[#990011]">
                              {formatTime(currentTime)} /{" "}
                              {formatTime(videoDuration)}
                            </span>
                          </div>

                          <input
                            type="range"
                            min="0.1"
                            max={videoDuration || 100}
                            step="0.01"
                            value={currentTime}
                            onChange={handleSliderChange}
                            onMouseUp={handleSliderRelease}
                            onTouchEnd={handleSliderRelease}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#990011] focus:outline-none shadow-inner cover-slider-range"
                          />
                        </div>

                        {/* Quick Keyframes Filmstrip */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                            Quick Keyframes
                          </span>

                          {isExtractingFilmstrip ? (
                            <div className="flex items-center justify-center h-14 bg-white border border-gray-150 rounded-xl gap-2 shadow-sm">
                              <div className="w-3.5 h-3.5 border-2 border-[#990011] border-t-transparent rounded-full animate-spin" />
                              <span className="text-[10px] text-gray-400 font-bold">
                                Extracting keyframes...
                              </span>
                            </div>
                          ) : filmstripFrames.length > 0 ? (
                            <div className="grid grid-cols-6 gap-1 bg-white p-1 border border-gray-150 rounded-xl shadow-sm">
                              {filmstripFrames.map((frame, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() =>
                                    handleKeyframeSelect(frame.time)
                                  }
                                  className={`relative aspect-[9/16] rounded-md overflow-hidden bg-gray-100 border transition-all duration-200 hover:scale-[1.03] ${
                                    Math.abs(currentTime - frame.time) < 0.15
                                      ? "border-[#990011] ring-1 ring-[#990011] scale-[1.01]"
                                      : "border-transparent hover:border-gray-300"
                                  }`}
                                >
                                  <img
                                    src={frame.url}
                                    alt={`Keyframe ${index + 1}`}
                                    className="w-full h-full object-cover select-none"
                                  />
                                  <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[5px] font-mono text-center text-white bg-black/60 rounded p-0.2 select-none">
                                    {formatTime(frame.time)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-14 bg-white border border-gray-150 rounded-xl shadow-sm">
                              <span className="text-[10px] text-gray-400 font-bold">
                                No frames available
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-[9px] text-gray-400 leading-normal font-medium mt-1">
                          Scrub the timeline or select a quick keyframe to
                          auto-update the cover image. Your chosen frame will be
                          uploaded as the Reel's cover thumbnail.
                        </p>
                      </div>
                    ) : (
                      /* Custom Image Selection Controls */
                      <div className="flex-1 flex flex-col sm:flex-row gap-4 items-center w-full">
                        <div className="relative w-[84px] h-[120px] rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-sm shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                          {coverPreviewUrl ? (
                            <img
                              src={coverPreviewUrl}
                              alt="Custom Cover Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="text-gray-300" size={24} />
                          )}
                        </div>

                        <div className="flex-1 text-left flex flex-col justify-center py-1 w-full">
                          {!coverPreviewUrl ||
                          coverFile?.name === "cover.jpg" ? (
                            <div
                              onDragEnter={handleCoverDrag}
                              onDragOver={handleCoverDrag}
                              onDragLeave={handleCoverDrag}
                              onDrop={handleCoverDrop}
                              onClick={() => coverInputRef.current?.click()}
                              className={`border border-dashed rounded-xl h-[96px] flex flex-col items-center justify-center cursor-pointer transition-all duration-250 ${
                                isCoverDragging
                                  ? "border-[#990011] bg-red-50/30"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-white"
                              }`}
                            >
                              <input
                                type="file"
                                ref={coverInputRef}
                                onChange={(e) =>
                                  handleCoverSelect(e.target.files?.[0])
                                }
                                accept="image/png,image/jpeg,image/webp,image/jpg"
                                className="hidden"
                              />
                              <UploadCloud
                                size={18}
                                className="text-[#990011] mb-1"
                              />
                              <p className="text-[10px] font-bold text-gray-700">
                                Upload custom cover
                              </p>
                              <p className="text-[8px] text-gray-400 mt-0.5">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-[#990011] font-bold uppercase tracking-wider">
                                Custom Image Uploaded
                              </span>
                              <div className="text-xs font-bold text-gray-700 truncate max-w-[200px] mt-0.5">
                                {coverFile?.name}
                              </div>
                              <div className="text-[9px] text-gray-400 font-semibold font-mono">
                                {(coverFile?.size / (1024 * 1024)).toFixed(2)}{" "}
                                MB
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setCoverFile(null)
                                  if (coverPreviewUrl)
                                    URL.revokeObjectURL(coverPreviewUrl)
                                  setCoverPreviewUrl("")
                                  setCoverType("frame") // Revert back to frame extraction
                                  // Seek back to 0.1 to reset default frame preview
                                  if (videoRef.current?.readyState > 0) {
                                    videoRef.current.currentTime = 0.1
                                  }
                                }}
                                className="mt-2 self-start px-2.5 py-1 text-[10px] bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold transition-colors flex items-center gap-1 shadow-sm border border-red-100/50 active:scale-95"
                              >
                                <Trash2 size={11} />
                                Remove Image
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (Live Mockup Preview) */}
              <div
                className={`flex-col gap-4 text-left border-l-0 md:border-l border-gray-100 pl-0 md:pl-6 h-full ${mobileTab === "preview" ? "flex" : "hidden md:flex"}`}
              >
                <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    Preview
                  </h3>

                  {/* Live Feed Mode Tabs selector */}
                  <div className="flex bg-gray-200/60 p-0.5 rounded-lg text-[9px] font-bold shadow-sm mt-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("video")}
                      className={`flex-1 py-1 rounded-md transition-all ${
                        previewMode === "video"
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Video Playback
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("cover")}
                      className={`flex-1 py-1 rounded-md transition-all ${
                        previewMode === "cover"
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Cover Thumbnail
                    </button>
                  </div>
                </div>

                {/* Simulated Phone Mockup */}
                <div className="flex justify-center py-2 shrink-0 select-none scale-90 sm:scale-100 origin-center transition-transform duration-300">
                  <div className="relative w-[210px] h-[410px] bg-black rounded-[32px] border-[6px] border-gray-800 shadow-xl overflow-hidden select-none transition-transform duration-300 hover:scale-[1.01]">
                    {/* Notch bezel */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-gray-800 rounded-b-xl z-30 flex items-center justify-between px-4 text-[7px] text-white/95 font-semibold">
                      <span className="font-mono">9:41</span>
                      <div className="flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full flex items-center justify-center text-[5px]">
                          ⚡
                        </span>
                        <div className="w-2.5 h-1.2 border border-white/60 rounded-[2px] p-0.2 flex items-center">
                          <div className="w-full h-full bg-white rounded-[0.5px]" />
                        </div>
                      </div>
                    </div>

                    {/* Feed backdrop preview (looping muted video or static cover) */}
                    <div className="absolute inset-0 w-full h-full z-0 bg-gray-950">
                      {previewMode === "video" ? (
                        <video
                          src={videoPreviewUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover brightness-[0.80] transition-all duration-300"
                        />
                      ) : coverPreviewUrl ? (
                        <img
                          src={coverPreviewUrl}
                          alt="Live Mock Backdrop"
                          className="w-full h-full object-cover brightness-[0.80] transition-all duration-300 animate-fadeIn"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-950 to-red-950 flex flex-col items-center justify-center p-3 text-center">
                          <Video
                            className="text-gray-700 mb-1 animate-pulse"
                            size={24}
                          />
                          <span className="text-[9px] text-gray-500">
                            Thumbnail Previewing
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Feed Tabs overlay */}
                    <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 text-[9px] font-bold text-white/60 z-10">
                      <span className="cursor-pointer hover:text-white">
                        Following
                      </span>
                      <span className="text-white relative flex flex-col items-center">
                        For You
                        <span className="absolute -bottom-0.5 w-1 h-1 bg-white rounded-full" />
                      </span>
                    </div>

                    {/* Interaction Icons overlay */}
                    <div className="absolute right-2 bottom-12 flex flex-col items-center gap-3 z-10">
                      <div className="relative mb-1">
                        <div className="w-7 h-7 rounded-full border border-white bg-[#990011] flex items-center justify-center font-bold text-[9px] text-white">
                          C
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 border border-white text-white rounded-full w-3 h-3 flex items-center justify-center text-[7px] font-bold shadow-sm">
                          +
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 shadow-sm cursor-pointer active:scale-95 transition-all">
                          <Heart
                            size={14}
                            className="text-white fill-white/10"
                          />
                        </div>
                        <span className="text-[8px] text-white/90 font-medium mt-0.5">
                          1.2K
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 shadow-sm cursor-pointer active:scale-95 transition-all">
                          <MessageCircle
                            size={14}
                            className="text-white fill-white/10"
                          />
                        </div>
                        <span className="text-[8px] text-white/90 font-medium mt-0.5">
                          0
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 shadow-sm cursor-pointer active:scale-95 transition-all">
                          <Share size={12} className="text-white" />
                        </div>
                        <span className="text-[8px] text-white/90 font-medium mt-0.5">
                          Share
                        </span>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/20 flex items-center justify-center animate-[spin_4s_linear_infinite] mt-1 shadow-md">
                        <Music size={10} className="text-white/80" />
                      </div>
                    </div>

                    {/* Metadata overlays */}
                    <div className="absolute bottom-0 left-0 right-10 p-3 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 flex flex-col gap-1 text-left text-white/95">
                      <span className="font-bold text-[9px] flex items-center gap-0.5">
                        @you
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center text-[5px] text-white">
                          ✓
                        </span>
                      </span>

                      <p className="text-[9px] leading-relaxed font-semibold line-clamp-1">
                        <span className="text-[#990011] font-bold mr-1">
                          #{privacy}
                        </span>
                        {title || "Untitled Reel"}
                      </p>

                      {description && (
                        <p className="text-[8px] text-white/80 line-clamp-2 leading-relaxed opacity-90 whitespace-pre-wrap break-words">
                          {renderHighlightedDescription(
                            description,
                            "font-bold text-sky-200",
                          )}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-[7px] text-white/60 mt-0.5 overflow-hidden w-full whitespace-nowrap">
                        <Music size={8} className="shrink-0" />
                        <div className="overflow-hidden w-full relative">
                          <div
                            className="inline-block whitespace-nowrap pl-1 text-[7px] text-white/80 animate-marquee"
                            style={{
                              animation: "mockMarquee 8s linear infinite",
                              display: "inline-block",
                            }}
                          >
                            Original Audio - you • Original Audio - you •
                            Original Audio - you •&nbsp;
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM FORM BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
          <PillButton
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="h-10 px-5 !border-gray-300 hover:!bg-gray-50 !text-gray-600 font-semibold"
          >
            Discard
          </PillButton>
          <PillButton
            type="submit"
            loading={isLoading}
            loadingText="Posting..."
            disabled={!videoFile || isLoading}
            className="h-10 px-6 font-semibold shadow-sm shadow-red-950/10"
            bgColor="#990011"
            textColor="#ffffff"
          >
            Post
          </PillButton>
        </div>
      </form>
    </Modal>
  )
}

export default CreateReelModal
