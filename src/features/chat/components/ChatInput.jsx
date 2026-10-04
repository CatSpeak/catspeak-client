import { useState, useRef, useCallback } from "react"
import {
  Paperclip,
  Smile,
  Send,
  Mic,
  UploadCloud,
  Plus,
} from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"
import MenuList from "@/shared/components/ui/MenuList"
import MenuItem from "@/shared/components/ui/MenuItem"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import useEmojiPicker from "@/shared/hooks/useEmojiPicker"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import ChatInputPreview from "./ChatInputPreview"
import MentionAutocomplete from "./mentions/MentionAutocomplete"
import ChatInputVoiceBar from "./ChatInputVoiceBar"
import useVoiceRecorder from "../hooks/useVoiceRecorder"
import useMentionAutocomplete from "../hooks/useMentionAutocomplete"
import useTypingDebounce from "../hooks/useTypingDebounce"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getMessagePreview } from "../utils/messagePreviewUtils"
import toast from "react-hot-toast"

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
  compact = false,
  isWidget = false,
}) => {
  const isCompact = compact || isWidget
  const { t } = useLanguage()
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [isMultiline, setIsMultiline] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // ── Voice Recording Hook ──────────────────────────────
  const {
    isRecording,
    isReviewing,
    recordingSeconds,
    visualizerBars,
    reviewBars,
    isPlaying,
    playbackCurrentTime,
    startRecording,
    stopRecording,
    cancelRecording,
    sendVoiceRecording,
    togglePlayPreview,
    seekPreview,
  } = useVoiceRecorder({ onSendVoice, onSend })

  // ── @Mentions Autocomplete Hook ───────────────────────
  const {
    mentionQuery,
    mentionItems,
    mentionSelectedIndex,
    mentionedAccountIds,
    handleSelectMention,
    checkMentionTrigger,
    handleMentionKeyDown,
    resetMentions,
  } = useMentionAutocomplete({
    value,
    onChange,
    conversationId,
    isGroup,
    participants,
    textareaRef,
  })

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
        if (
          item.type.indexOf("image") !== -1 ||
          (item.kind === "file" && item.type.startsWith("image/"))
        ) {
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
  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isDraggingOver) setIsDraggingOver(true)
    },
    [isDraggingOver],
  )

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

  // ── Standard Send ──────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!hasContent) return
    stopTypingImmediately()
    onSend(value.trim(), selectedFile, { mentionedAccountIds })
    resetMentions()
    clearSelectedFile()
  }, [
    hasContent,
    value,
    selectedFile,
    onSend,
    mentionedAccountIds,
    resetMentions,
    clearSelectedFile,
    stopTypingImmediately,
  ])

  const handleKeyDown = useCallback(
    (e) => {
      if (handleMentionKeyDown(e)) {
        return
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (hasContent) {
          handleSend()
        }
      }
    },
    [handleMentionKeyDown, hasContent, handleSend],
  )

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value
      onChange(val)
      checkMentionTrigger(val, e.target.selectionStart || 0)

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
    [onChange, checkMentionTrigger, isMultiline, handleTypingActivity, stopTypingImmediately],
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
          content={getMessagePreview(replyingTo, t)}
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
      {isRecording || isReviewing ? (
        <ChatInputVoiceBar
          isRecording={isRecording}
          isReviewing={isReviewing}
          recordingSeconds={recordingSeconds}
          visualizerBars={visualizerBars}
          reviewBars={reviewBars}
          isPlaying={isPlaying}
          playbackCurrentTime={playbackCurrentTime}
          onStop={stopRecording}
          onCancel={cancelRecording}
          onSend={sendVoiceRecording}
          onTogglePlay={togglePlayPreview}
          onSeek={seekPreview}
        />
      ) : (
        /* Normal Typing Input Mode */
        <div
          onClick={() => textareaRef.current?.focus()}
          onPaste={handlePaste}
          className={`w-full grid grid-cols-[auto_1fr_auto] border border-border focus-within:border-cath-red-700 transition-colors bg-white cursor-text rounded-[28px] ${
            isMultiline
              ? "pb-[3px] pt-3 min-h-[110px] gap-y-2"
              : "items-center h-14"
          } ${showLeftIcon ? "pl-1" : "pl-6"} ${showRightIcons ? "pr-1" : "pr-6"}`}
        >
          {/* Attachment / Action button */}
          {showLeftIcon &&
            (isCompact ? (
              <Popover
                placement="top-left"
                className={`shrink-0 ${
                  isMultiline
                    ? "col-start-1 row-start-2"
                    : "col-start-1 row-start-1"
                }`}
                trigger={
                  <IconButton
                    variant="ghost"
                    aria-label={t?.chat?.attachFile || "Add attachment or action"}
                    title={t?.chat?.attachFile || "Add attachment or action"}
                    type="button"
                    disabled={disabled}
                  >
                    <Plus />
                  </IconButton>
                }
                content={(close) => (
                  <MenuList className="w-48 shadow-lg">
                    <MenuItem
                      icon={<Paperclip size={18} />}
                      label={t?.messages?.attach || t?.chat?.attachFile || "Attach file"}
                      onClick={() => {
                        close()
                        fileInputRef.current?.click()
                      }}
                    />
                    <MenuItem
                      icon={<Mic size={18} />}
                      label={t?.chat?.voiceMessage || "Voice message"}
                      onClick={() => {
                        close()
                        startRecording()
                      }}
                    />
                  </MenuList>
                )}
              />
            ) : (
              <IconButton
                variant="ghost"
                aria-label={t?.chat?.attachFile || "Attach file"}
                title={t?.chat?.attachFile || "Attach file"}
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
            ))}

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
              placeholder={
                t?.chat?.typeMessagePlaceholder || "Type a message..."
              }
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
                title={(t?.chat?.charCount || "{{current}} / {{max}} characters")
                  .replace(/\{\{current\}\}|\{current\}/g, value.length)
                  .replace(/\{\{max\}\}|\{max\}/g, maxLength)}
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
                    <IconButton
                      variant="ghost"
                      aria-label={t?.chat?.chooseEmoji || "Choose emoji"}
                      title={t?.chat?.chooseEmoji || "Choose emoji"}
                      type="button"
                    >
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

                {/* Voice Record Button (full mode only; centralized in the + menu for compact mode) */}
                {!isCompact && (
                  <IconButton
                    onClick={startRecording}
                    disabled={disabled}
                    variant="ghost"
                    aria-label={t?.chat?.recordVoiceNote || "Record voice note"}
                    title={t?.chat?.recordVoiceNote || "Record voice note"}
                  >
                    <Mic />
                  </IconButton>
                )}

                {/* Send button */}
                <IconButton
                  onClick={handleSend}
                  disabled={disabled || !hasContent}
                  variant={hasContent ? "primary" : "ghost"}
                  aria-label={t?.chat?.sendMessage || "Send message"}
                  title={t?.chat?.sendMessage || "Send message"}
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
