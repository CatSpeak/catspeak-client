import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { Paperclip, Smile, Send, Mic, Trash2, UploadCloud } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import useEmojiPicker from "@/shared/hooks/useEmojiPicker"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import ChatInputPreview from "./ChatInputPreview"
import MentionAutocomplete from "./mentions/MentionAutocomplete"
import { useGetConversationMembersQuery } from "@/store/api/social/conversationsApi"
import useTypingDebounce from "../hooks/useTypingDebounce"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

const formatRecordTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`
}

/**
 * ChatInput — message input bar with auto-resizing textarea, file attachments,
 * reply preview, voice audio recording with live waveform visualizer,
 * drag-and-drop file upload, clipboard image pasting (Ctrl + V), and @mentions autocomplete.
 */
const ChatInput = ({
  value = "",
  onChange,
  onSend,
  onSendVoice,
  onStartTyping,
  onStopTyping,
  replyingTo = null,
  onCancelReply,
  disabled = false,
  showLeftIcon = true,
  showRightIcons = true,
  maxLength = 500,
  conversationId = null,
  isGroup = true,
  participants = [],
}) => {
  const { t } = useLanguage()
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [isMultiline, setIsMultiline] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // ── @Mentions State ────────────────────────────────────
  const [mentionQuery, setMentionQuery] = useState(null)
  const [mentionStartIndex, setMentionStartIndex] = useState(-1)
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0)
  const [mentionedAccountIds, setMentionedAccountIds] = useState([])

  const { data: membersResponse = [] } = useGetConversationMembersQuery(
    conversationId,
    { skip: !conversationId || !isGroup },
  )

  const activeMembers = useMemo(() => {
    const list = Array.isArray(membersResponse)
      ? membersResponse
      : membersResponse?.data || []
    return list.length > 0 ? list : participants
  }, [membersResponse, participants])

  const mentionItems = useMemo(() => {
    if (mentionQuery === null) return []
    const list = []
    const cleanQ = (mentionQuery || "").toLowerCase()
    if (isGroup && (!cleanQ || "all".includes(cleanQ) || "tatca".includes(cleanQ))) {
      list.push({
        isAll: true,
        accountId: 0,
        username: "all",
        fullName: t?.chat?.mentions?.allMembers || "All members (@all)",
      })
    }
    const cleanQTrim = cleanQ.trim()
    activeMembers.forEach((m) => {
      const uName = (m.username || "").toLowerCase()
      const fName = (m.fullName || m.name || "").toLowerCase()
      if (!cleanQTrim || uName.includes(cleanQTrim) || fName.includes(cleanQTrim)) {
        list.push(m)
      }
    })
    return list
  }, [activeMembers, mentionQuery, isGroup, t])

  // ── Voice Recording State ─────────────────────────────
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [visualizerBars, setVisualizerBars] = useState([20, 35, 60, 40, 75, 50, 30, 65, 45, 80, 55, 35, 70, 40, 25])

  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)
  const recordTimerRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const recordingSecondsRef = useRef(0)

  const { insertEmoji, addRecent } = useEmojiPicker()
  const { handleTypingActivity, stopTypingImmediately } = useTypingDebounce({
    onStartTyping,
    onStopTyping,
  })

  const hasContent = value.trim().length > 0 || selectedFile !== null

  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (value === "") {
      setIsMultiline(false)
    }
  }

  // ── File Management ────────────────────────────────────
  const handleSelectedFile = useCallback((file) => {
    if (!file) return
    setSelectedFile(file)
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file)
      setFilePreviewUrl(url)
    } else {
      setFilePreviewUrl(null)
    }
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    handleSelectedFile(file)
  }

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [filePreviewUrl])

  // ── Clipboard Paste (Ctrl + V) ─────────────────────────
  const handlePaste = useCallback(
    (e) => {
      const clipboardData = e.clipboardData
      if (!clipboardData || !clipboardData.items) return

      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i]
        if (item.type.indexOf("image") !== -1 || (item.kind === "file" && item.type.startsWith("image/"))) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            handleSelectedFile(file)
            toast.success(t?.chat?.imagePasted || "Image pasted from clipboard")
            return
          }
        }
      }
    },
    [handleSelectedFile, t],
  )

  // ── Drag & Drop ────────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDraggingOver) setIsDraggingOver(true)
  }, [isDraggingOver])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) {
        handleSelectedFile(file)
      }
    },
    [handleSelectedFile],
  )

  // ── Voice Recording Logic ──────────────────────────────
  const cleanupRecording = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    analyserRef.current = null
    mediaRecorderRef.current = null
    setIsRecording(false)
    setRecordingSeconds(0)
    recordingSecondsRef.current = 0
  }, [])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupRecording()
    }
  }, [cleanupRecording])

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error(t?.chat?.voiceNotSupported || "Audio recording is not supported in this browser.")
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Setup Web Audio API Analyser for live wave visualization
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioCtx()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      // Determine best audio mime type
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ]
      let selectedMimeType = ""
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime
          break
        }
      }

      const recorder = new MediaRecorder(
        stream,
        selectedMimeType ? { mimeType: selectedMimeType } : undefined,
      )
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.start(100) // collect chunks every 100ms
      setIsRecording(true)
      setRecordingSeconds(0)
      recordingSecondsRef.current = 0

      // Timer
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1
          recordingSecondsRef.current = next
          return next
        })
      }, 1000)

      // Dynamic Audio Visualizer Loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const updateVisualizer = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)

        // Sample 16 bars from frequency spectrum
        const barsCount = 16
        const step = Math.floor(dataArray.length / barsCount) || 1
        const newBars = []
        for (let i = 0; i < barsCount; i++) {
          const val = dataArray[i * step] || 0
          // Map value (0 - 255) to height percentage (15% - 95%)
          const height = Math.max(15, Math.min(95, Math.round((val / 255) * 90) + 15))
          newBars.push(height)
        }
        setVisualizerBars(newBars)
        animationFrameRef.current = requestAnimationFrame(updateVisualizer)
      }
      animationFrameRef.current = requestAnimationFrame(updateVisualizer)
    } catch (err) {
      console.error("Failed to start voice recording:", err)
      toast.error(
        t?.chat?.micPermissionDenied ||
          "Microphone access denied. Please allow microphone permissions.",
      )
      cleanupRecording()
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    cleanupRecording()
    toast(t?.chat?.recordingCancelled || "Recording cancelled", { icon: "🗑️" })
  }

  const sendVoiceRecording = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === "inactive") return

    const durationToSend = Math.max(1, recordingSecondsRef.current)

    recorder.onstop = () => {
      const mime = recorder.mimeType || "audio/webm"
      const audioBlob = new Blob(audioChunksRef.current, { type: mime })

      if (onSendVoice) {
        onSendVoice(audioBlob, durationToSend)
      } else if (onSend) {
        const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: mime })
        onSend("", file, { audioDuration: durationToSend, messageType: "Audio" })
      }

      cleanupRecording()
    }

    recorder.stop()
  }

  // ── Mention Selection ─────────────────────────────────
  const handleSelectMention = useCallback(
    (item) => {
      if (!item || mentionStartIndex < 0) return
      const before = value.slice(0, mentionStartIndex)
      const mentionText = `@${item.username || "all"} `
      const cursorPos = textareaRef.current?.selectionStart ?? value.length
      const after = value.slice(cursorPos)
      const newValue = `${before}${mentionText}${after}`
      onChange(newValue)

      if (!item.isAll && item.accountId) {
        setMentionedAccountIds((prev) =>
          prev.includes(item.accountId) ? prev : [...prev, item.accountId],
        )
      }

      setMentionQuery(null)
      setMentionStartIndex(-1)
      setMentionSelectedIndex(0)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newPos = before.length + mentionText.length
          textareaRef.current.setSelectionRange(newPos, newPos)
        }
      }, 0)
    },
    [value, mentionStartIndex, onChange],
  )

  // ── Standard Send ──────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!hasContent) return
    stopTypingImmediately()
    onSend(value.trim(), selectedFile, { mentionedAccountIds })
    setMentionedAccountIds([])
    setMentionQuery(null)
    setMentionStartIndex(-1)
    clearSelectedFile()
  }, [
    hasContent,
    value,
    selectedFile,
    onSend,
    mentionedAccountIds,
    stopTypingImmediately,
    clearSelectedFile,
  ])

  const handleKeyDown = useCallback(
    (e) => {
      if (mentionQuery !== null && mentionItems.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setMentionSelectedIndex((prev) => (prev + 1) % mentionItems.length)
          return
        }
        if (e.key === "ArrowUp") {
          e.preventDefault()
          setMentionSelectedIndex(
            (prev) => (prev - 1 + mentionItems.length) % mentionItems.length,
          )
          return
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault()
          const chosen = mentionItems[mentionSelectedIndex] || mentionItems[0]
          if (chosen) {
            handleSelectMention(chosen)
          }
          return
        }
        if (e.key === "Escape") {
          e.preventDefault()
          setMentionQuery(null)
          setMentionStartIndex(-1)
          return
        }
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (hasContent) {
          handleSend()
        }
      }
    },
    [
      mentionQuery,
      mentionItems,
      mentionSelectedIndex,
      handleSelectMention,
      hasContent,
      handleSend,
    ],
  )

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value
      onChange(val)

      // Detect @mentions trigger
      const cursorPos = e.target.selectionStart || 0
      const textBeforeCursor = val.slice(0, cursorPos)
      const atMatch = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_\-À-ỹ]*)$/)
      if (atMatch) {
        const query = atMatch[1]
        const atPos = textBeforeCursor.lastIndexOf("@")
        setMentionQuery(query)
        setMentionStartIndex(atPos)
        setMentionSelectedIndex(0)
      } else {
        setMentionQuery(null)
        setMentionStartIndex(-1)
      }

      if (val.trim().length > 0) {
        handleTypingActivity()
      } else {
        stopTypingImmediately()
      }

      if (!isMultiline) {
        const sh = e.target.scrollHeight
        if (sh > 36 || val.includes("\n")) {
          setIsMultiline(true)
        }
      }
    },
    [onChange, isMultiline, handleTypingActivity, stopTypingImmediately],
  )

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="p-4 bg-transparent flex flex-col gap-4 relative"
    >
      {/* Mention Autocomplete Dropdown */}
      {mentionQuery !== null && (
        <MentionAutocomplete
          items={mentionItems}
          selectedIndex={mentionSelectedIndex}
          onSelect={handleSelectMention}
        />
      )}
      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-x-4 inset-y-2 z-30 bg-primary/10 border-2 border-dashed border-primary rounded-3xl flex items-center justify-center gap-3 backdrop-blur-xs pointer-events-none transition-all">
          <UploadCloud className="text-primary animate-bounce" size={28} />
          <span className="font-semibold text-primary text-sm">
            {t?.chat?.dropFilesPrompt || "Drop file or image here to attach"}
          </span>
        </div>
      )}

      {/* Replying banner */}
      {replyingTo && (
        <RepliedMessage
          senderName={
            replyingTo.sender?.name ||
            replyingTo.sender?.username ||
            t?.chat?.someone ||
            "Someone"
          }
          content={replyingTo.content || replyingTo.messageContent || ""}
          onCancel={onCancelReply}
        />
      )}

      {/* Selected Attachment preview */}
      <ChatInputPreview
        selectedFile={selectedFile}
        filePreviewUrl={filePreviewUrl}
        onClear={clearSelectedFile}
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip"
      />

      {/* ── Main Input Box / Voice Recording Bar ── */}
      {isRecording ? (
        /* Recording Mode UI */
        <div className="w-full flex items-center justify-between px-4 h-14 border-2 border-red-500/80 bg-red-50/50 dark:bg-red-950/20 rounded-[28px] shadow-sm animate-pulse-subtle">
          {/* Left: Pulsing Dot & Timer */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600" />
            </span>
            <span className="font-mono font-semibold text-red-600 dark:text-red-400 text-sm">
              {formatRecordTime(recordingSeconds)}
            </span>
          </div>

          {/* Center: Live Waveform Visualizer */}
          <div className="flex-1 flex items-center justify-center gap-[3px] px-6 h-8 overflow-hidden max-w-sm">
            {visualizerBars.map((height, idx) => (
              <div
                key={idx}
                style={{ height: `${height}%` }}
                className="w-1.5 bg-red-500/80 dark:bg-red-400 rounded-full transition-all duration-75"
              />
            ))}
          </div>

          {/* Right: Cancel & Send Buttons */}
          <div className="flex items-center gap-2">
            <IconButton
              onClick={cancelRecording}
              variant="ghost"
              aria-label="Cancel recording"
              className="text-neutral-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Trash2 size={18} />
            </IconButton>

            <button
              type="button"
              onClick={sendVoiceRecording}
              aria-label="Send voice message"
              className="w-10 h-10 rounded-full bg-cath-red-700 text-white flex items-center justify-center hover:bg-cath-red-800 transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <Send size={18} className="-translate-x-[1px] translate-y-[1px]" />
            </button>
          </div>
        </div>
      ) : (
        /* Normal Typing Input Mode */
        <div
          onClick={() => textareaRef.current?.focus()}
          onPaste={handlePaste}
          className={`w-full grid grid-cols-[auto_1fr_auto] border border-border focus-within:border-cath-red-700 transition-colors bg-white cursor-text rounded-[28px] ${
            isMultiline
              ? "pb-[3px] pt-3 min-h-[110px] gap-y-2"
              : "items-center h-14"
          } ${showLeftIcon ? "pl-2" : "pl-6"} ${showRightIcons ? "pr-1" : "pr-6"}`}
        >
          {/* Attachment button */}
          {showLeftIcon && (
            <IconButton
              variant="ghost"
              aria-label="Attach file"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              disabled={disabled}
              className={`shrink-0 ${
                isMultiline
                  ? "col-start-1 row-start-2"
                  : "col-start-1 row-start-1"
              }`}
            >
              <Paperclip />
            </IconButton>
          )}

          {/* Textarea Wrapper */}
          <div
            className={`h-full ${
              isMultiline
                ? "col-span-3 col-start-1 row-start-1 px-3"
                : "col-start-2 row-start-1 flex items-center px-1"
            }`}
          >
            <textarea
              ref={textareaRef}
              className={`bg-transparent placeholder-[#606060] resize-none focus:outline-none w-full ${
                isMultiline
                  ? "overflow-y-auto pr-4 pt-1"
                  : "overflow-y-hidden py-1"
              }`}
              placeholder={t?.chat?.typeMessagePlaceholder || "Type a message..."}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows={isMultiline ? 5 : 1}
              maxLength={maxLength}
            />
          </div>

          {/* Right controls (counter when multiline + action buttons) */}
          <div
            className={`flex items-center h-12 gap-1 ${
              isMultiline
                ? "col-start-3 row-start-2"
                : "col-start-3 row-start-1"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {isMultiline && (
              <span
                className={`text-[11px] font-mono select-none px-1 ${
                  value.length >= maxLength
                    ? "text-red-500 font-bold"
                    : value.length >= maxLength * 0.8
                    ? "text-amber-600 font-medium"
                    : "text-gray-400 opacity-75"
                }`}
                title={`${value.length} / ${maxLength} characters`}
              >
                {value.length}/{maxLength}
              </span>
            )}

            {showRightIcons && (
              <>
                {/* Emoji button */}
                <Popover
                  placement="top-right"
                  trigger={
                    <IconButton variant="ghost" aria-label="Emoji" type="button">
                      <Smile />
                    </IconButton>
                  }
                  content={() => (
                    <EmojiPickerWrapper
                      onSelect={(emoji) => {
                        insertEmoji(emoji, textareaRef, value, onChange)
                        addRecent(emoji)
                      }}
                    />
                  )}
                />

                {/* Voice Record Button */}
                <IconButton
                  onClick={startRecording}
                  disabled={disabled}
                  variant="ghost"
                  aria-label="Record voice message"
                  className="hover:text-red-600 transition-colors"
                >
                  <Mic />
                </IconButton>

                {/* Send button */}
                <IconButton
                  onClick={handleSend}
                  disabled={disabled || !hasContent}
                  variant={hasContent ? "primary" : "ghost"}
                  aria-label="Send message"
                >
                  <Send className="-translate-x-[1px] translate-y-[1px]" />
                </IconButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatInput
