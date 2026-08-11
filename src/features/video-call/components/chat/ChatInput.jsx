import React, { useState, useRef, useCallback } from "react"
import { Send, Smile, Sparkles } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Switch from "@/shared/components/ui/inputs/Switch"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import useEmojiPicker from "@/shared/hooks/useEmojiPicker"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import { toast } from "react-hot-toast"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { useAiSend } from "@/features/video-call/hooks/useAiSend"
import {
  getRoomSetting,
  ROOM_SETTING_KEYS,
} from "@/features/video-call/utils/roomSettingHelpers"
import MentionPopover from "./MentionPopover"
import { parseMetadata } from "@/features/video-call/hooks/useParticipantList"

const ChatInput = ({
  onSendMessage,
  isConnected,
  onAiMessageSent,
  isAiInput,
  replyTarget,
  onCancelReply,
}) => {
  const [message, setMessage] = useState("")
  const [isPrivateAi, setIsPrivateAi] = useState(false)
  const [isMultiline, setIsMultiline] = useState(false)
  const sendingRef = useRef(false)
  const editableRef = useRef(null)
  const savedSelectionRef = useRef(null)  // saves caret when editable loses focus
  const textareaRef = editableRef // alias kept for emoji hook compat
  const { t } = useLanguage()
  const { sendAiMessage, isBlocked: isAiBlocked } = useAiSend()
  const { insertEmoji, addRecent } = useEmojiPicker()
  const { room, id: roomIdFromContext, user, participants = [], isHost: isHostFromContext } = useGlobalVideoCall()
  const currentRoomId = room?.id || roomIdFromContext
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  // ── Mention Autocomplete State ──
  const [mentionState, setMentionState] = useState({
    isOpen: false,
    query: "",
    matchIndex: -1,
    selectedIndex: 0,
  })

  // Filter participants for mention matching (exclude local user & STT agents)
  const availableMentionParticipants = React.useMemo(() => {
    if (!participants) return []
    return participants.filter((p) => {
      if (p.isLocal) return false
      const meta = parseMetadata(p.metadata)
      const isAgent = meta.is_stt_agent === true || p.identity?.startsWith("agent-")
      return !isAgent
    })
  }, [participants])

  const allMentionItem = React.useMemo(() => ({
    isAll: true,
    name: "All",
    identity: "all",
  }), [])

  const filteredMentions = React.useMemo(() => {
    if (!mentionState.isOpen) return []
    const q = mentionState.query.toLowerCase().trim()

    const matchesAll =
      !q ||
      "all".includes(q) ||
      "tất cả".includes(q) ||
      "tat ca".includes(q) ||
      "everyone".includes(q)

    const list = availableMentionParticipants.filter((p) => {
      const meta = parseMetadata(p.metadata)
      const name = (p.name || meta.nickname || meta.username || p.identity || "").toLowerCase()
      const email = (meta.email || "").toLowerCase()
      return name.includes(q) || email.includes(q)
    })

    return matchesAll ? [allMentionItem, ...list] : list
  }, [mentionState.isOpen, mentionState.query, availableMentionParticipants, allMentionItem])

  // Detect @ mention trigger at current input position
  const updateMentionTrigger = (text, caretPos) => {
    if (!text || caretPos <= 0 || isAiInput) {
      setMentionState((prev) => ({ ...prev, isOpen: false }))
      return
    }

    const textBeforeCaret = text.slice(0, caretPos)
    const match = /(?:^|\s)@([a-zA-Z0-9_\-À-ỹ]*)$/.exec(textBeforeCaret)

    if (match) {
      const query = match[1]
      const matchIndex = caretPos - query.length - 1
      setMentionState({
        isOpen: true,
        query,
        matchIndex,
        selectedIndex: 0,
      })
    } else {
      setMentionState((prev) => ({ ...prev, isOpen: false }))
    }
  }

  // ── Contenteditable helpers ──
  /** Save current selection (called on blur so emoji picker doesn't lose caret) */
  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
    }
  }

  /** Restore previously saved selection */
  const restoreSelection = () => {
    const sel = window.getSelection()
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedSelectionRef.current)
    }
  }

  /** Get plain text from the contenteditable div */
  const getPlainText = () => editableRef.current?.innerText?.replace(/\n$/, "") || ""

  /** Get caret offset (character index) within the contenteditable's innerText */
  const getCaretOffset = () => {
    const el = editableRef.current
    if (!el) return 0
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return 0
    const range = sel.getRangeAt(0).cloneRange()
    range.selectNodeContents(el)
    range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset)
    return range.toString().length
  }

  /** Set caret to absolute character offset inside the contenteditable */
  const setCaretOffset = (offset) => {
    const el = editableRef.current
    if (!el) return
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let remaining = offset
    let node = walker.nextNode()
    while (node) {
      if (remaining <= node.textContent.length) {
        const range = document.createRange()
        range.setStart(node, remaining)
        range.collapse(true)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
        return
      }
      remaining -= node.textContent.length
      node = walker.nextNode()
    }
    // fallback: end of element
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
  }

  const handleContentInput = () => {
    const newText = getPlainText()
    setMessage(newText)
    updateMentionTrigger(newText, getCaretOffset())

    const cleaned = newText.trim()
    if (!cleaned) {
      setIsMultiline(false)
    } else if (newText.includes("\n") || newText.length > 45) {
      setIsMultiline(true)
    } else {
      setIsMultiline(false)
    }
  }

  const handleSelectMention = (participant) => {
    if (!participant || mentionState.matchIndex < 0) return
    let displayName = "All"
    if (!participant.isAll) {
      const meta = parseMetadata(participant.metadata)
      displayName = participant.name || meta.nickname || meta.username || participant.identity || "Thành viên"
    }

    const el = editableRef.current
    if (!el) return

    const startChar = mentionState.matchIndex   // position of the '@' character
    const endChar = getCaretOffset()            // current caret (end of @query)

    // Build a Range covering exactly the "@query" text in the DOM
    const buildRange = (start, end) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      const r = document.createRange()
      let pos = 0
      let startSet = false
      let node = walker.nextNode()
      while (node) {
        const len = node.textContent.length
        if (!startSet && pos + len >= start) {
          r.setStart(node, start - pos)
          startSet = true
        }
        if (startSet && pos + len >= end) {
          r.setEnd(node, end - pos)
          break
        }
        pos += len
        node = walker.nextNode()
      }
      return r
    }

    // Delete the "@query" text
    const queryRange = buildRange(startChar, endChar)
    queryRange.deleteContents()

    // Create red mention span as atomic non-editable unit
    const span = document.createElement("span")
    span.textContent = `@${displayName}`
    span.contentEditable = "false"
    span.style.cssText = "color:#990011;font-weight:700;display:inline;margin-right:2px;"
    span.dataset.mention = displayName
    queryRange.insertNode(span)

    // Insert a trailing space after the span and move caret there
    const spaceNode = document.createTextNode(" ")
    span.after(spaceNode)
    const newRange = document.createRange()
    newRange.setStartAfter(spaceNode)
    newRange.collapse(true)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(newRange)

    const newText = getPlainText()
    setMessage(newText)
    const cleaned = newText.trim()
    if (!cleaned) {
      setIsMultiline(false)
    } else if (newText.includes("\n") || newText.length > 45) {
      setIsMultiline(true)
    } else {
      setIsMultiline(false)
    }
    setMentionState((prev) => ({ ...prev, isOpen: false }))
    el.focus()
  }

  const [isMemberPrivateAiAllowed, setIsMemberPrivateAiAllowed] = React.useState(() => {
    return getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI)
  })

  React.useEffect(() => {
    const handlePrivateAiChange = () => {
      const allowed = getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI)
      setIsMemberPrivateAiAllowed(allowed)
      if (!isHost && !allowed) {
        setIsPrivateAi(false)
      }
    }
    handlePrivateAiChange()
    window.addEventListener("catspeak_member_private_ai_allowed_changed", handlePrivateAiChange)
    return () => {
      window.removeEventListener("catspeak_member_private_ai_allowed_changed", handlePrivateAiChange)
    }
  }, [isHost, currentRoomId])

  const currentInputText = (message || editableRef.current?.innerText || "").replace(/\u00a0/g, " ").trim()
  const hasContent = currentInputText.length > 0

  const handleSend = useCallback(async () => {
    const text = (message || editableRef.current?.innerText || "").replace(/\u00a0/g, " ").trim()
    if (sendingRef.current || !text) return

    sendingRef.current = true

    if (isAiInput) {
      if (isAiBlocked) {
        sendingRef.current = false
        return
      }

      if (!isHost && isPrivateAi && !isMemberPrivateAiAllowed) {
        toast.error(
          t.rooms?.general?.privateAiDisabledByHost ||
            "Host đã tắt quyền sử dụng AI Chat riêng tư đối với thành viên."
        )
        sendingRef.current = false
        return
      }

      setMessage("")
      setIsMultiline(false)
      if (editableRef.current) editableRef.current.innerHTML = ""
      if (onCancelReply) onCancelReply()
      if (onAiMessageSent) onAiMessageSent()

      await sendAiMessage(text, { isPrivateAi, replyTarget })

      requestAnimationFrame(() => {
        sendingRef.current = false
      })
      return
    }

    // Normal chat message
    try {
      await onSendMessage(text)
    } catch (err) {
      console.error("Failed to send message:", err)
    }
    setMessage("")
    setIsMultiline(false)
    // Clear the contenteditable div
    if (editableRef.current) editableRef.current.innerHTML = ""

    requestAnimationFrame(() => {
      sendingRef.current = false
    })
  }, [
    message,
    onSendMessage,
    sendAiMessage,
    isAiBlocked,
    onAiMessageSent,
    onCancelReply,
    isAiInput,
    isPrivateAi,
    replyTarget,
    isHost,
    isMemberPrivateAiAllowed,
    t,
  ])

  const handleKeyDown = (e) => {
    if (e.nativeEvent?.isComposing || e.keyCode === 229) return

    if (mentionState.isOpen && filteredMentions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setMentionState((prev) => ({
          ...prev,
          selectedIndex: (prev.selectedIndex + 1) % filteredMentions.length,
        }))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setMentionState((prev) => ({
          ...prev,
          selectedIndex:
            (prev.selectedIndex - 1 + filteredMentions.length) %
            filteredMentions.length,
        }))
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        const selected = filteredMentions[mentionState.selectedIndex]
        if (selected) handleSelectMention(selected)
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setMentionState((prev) => ({ ...prev, isOpen: false }))
        return
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (hasContent && isConnected && (!isAiInput || !isAiBlocked)) {
        handleSend()
      }
    }
  }

  const placeholderText = !isConnected
    ? t.rooms?.chatBox?.connectingPlaceholder || "Connecting..."
    : isAiInput
      ? isAiBlocked
        ? t.rooms?.chatBox?.aiGeneratingPlaceholder || "AI is typing..."
        : replyTarget?.from?.isSystem
          ? "Reply to system..."
          : isPrivateAi
            ? t.rooms?.chatBox?.privateAiPlaceholder || "Ask AI (Private)"
            : t.rooms?.chatBox?.publicAiPlaceholder || "Ask AI (Public)"
      : t.rooms?.chatBox?.inputPlaceholder || "Type a message..."

  const isInputDisabled = !isConnected || (isAiInput && isAiBlocked)

  return (
    <div className="p-3 bg-white flex flex-col gap-2 relative shrink-0 border-t border-[#E5E5E5]">
      {/* Mention Autocomplete Popover */}
      {mentionState.isOpen && (
        <MentionPopover
          participants={filteredMentions}
          selectedIndex={mentionState.selectedIndex}
          onSelect={handleSelectMention}
        />
      )}

      {/* Replying banner */}
      {replyTarget && (
        <RepliedMessage
          senderName={replyTarget.from?.name || "Cat Speak"}
          content={replyTarget.message}
          onCancel={onCancelReply}
        />
      )}

      {/* Unified Input Box */}
      <div
        onClick={() => editableRef.current?.focus()}
        className={`w-full grid grid-cols-[auto_1fr_auto] border focus-within:border-cath-red-700 transition-all cursor-text rounded-[28px] ${
          isMultiline
            ? "pb-2 pt-3 min-h-[110px] gap-y-2 px-3"
            : "items-center h-14 pl-3 pr-1"
        } ${
          isAiInput
            ? "border-red-200 bg-gradient-to-r from-red-50/40 via-white to-red-50/20 shadow-sm"
            : "border-[#E5E5E5] bg-gray-50/60"
        }`}
      >
        {/* Left AI Switch Control */}
        {isAiInput && (
          <div
            className={`flex items-center gap-1.5 pr-1 shrink-0 ${
              isMultiline
                ? "col-start-1 row-start-2 self-center"
                : "col-start-1 row-start-1 h-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="origin-left flex items-center justify-center">
              <Switch
                checked={isPrivateAi}
                disabled={!isHost && !isMemberPrivateAiAllowed}
                onChange={(e) => {
                  if (!isHost && !isMemberPrivateAiAllowed && e.target.checked) {
                    toast.error(
                      t.rooms?.general?.privateAiDisabledByHost ||
                        "Host đã tắt quyền sử dụng AI Chat riêng tư đối với thành viên."
                    )
                    return
                  }
                  setIsPrivateAi(e.target.checked)
                }}
                colorClass="peer-checked:bg-red-700"
              />
            </div>
          </div>
        )}

        {/* Text Input Area – contenteditable for @mention inline color support */}
        <div
          className={`h-full px-1 min-w-0 relative ${
            isMultiline
              ? "col-span-3 col-start-1 row-start-1"
              : "col-start-2 row-start-1 flex items-center"
          }`}
        >
          <div
            ref={editableRef}
            contentEditable={!isInputDisabled}
            suppressContentEditableWarning
            onInput={handleContentInput}
            onKeyUp={handleContentInput}
            onCompositionEnd={handleContentInput}
            onKeyDown={handleKeyDown}
            onBlur={saveSelection}
            data-placeholder={placeholderText}
            className={`w-full text-base focus:outline-none bg-transparent leading-normal ${
              isInputDisabled ? "opacity-50 cursor-not-allowed" : ""
            } empty:before:content-[attr(data-placeholder)] empty:before:text-[#606060] empty:before:pointer-events-none`}
            style={{
              minHeight: isMultiline ? "2.5rem" : "1.25rem",
              maxHeight: isMultiline ? "120px" : "100%",
              overflowY: isMultiline ? "auto" : "hidden",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          />
        </div>

        {/* Right Actions: Character Counter + Emoji Picker + Send Button */}
        <div
          className={`flex items-center gap-0.5 shrink-0 ${
            isMultiline
              ? "col-start-3 row-start-2 justify-self-end self-center"
              : "col-start-3 row-start-1"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {isMultiline && (
            <span
              className={`text-[11px] font-mono select-none px-1 ${
                message.length >= 500
                  ? "text-red-500 font-bold"
                  : message.length >= 400
                  ? "text-amber-600 font-medium"
                  : "text-gray-400 opacity-75"
              }`}
              title={`${message.length} / 500 characters`}
            >
              {message.length}/500
            </span>
          )}

          {!isAiInput && (
            <Popover
              placement="top-right"
              className="shrink-0"
              triggerClassName="inline-flex items-center justify-center"
              trigger={
                <IconButton
                  variant="ghost"
                  aria-label="Emoji"
                  type="button"
                  disabled={isInputDisabled}
                  className="!w-10 !h-10"
                >
                  <Smile size={18} />
                </IconButton>
              }
              content={() => (
                <EmojiPickerWrapper
                  onSelect={(emoji) => {
                    addRecent(emoji)
                    const el = editableRef.current
                    if (!el) return
                    el.focus()
                    // Restore saved caret position (lost when emoji picker got focus)
                    restoreSelection()
                    document.execCommand("insertText", false, emoji)
                    const newTxt = el.innerText?.replace(/\n$/, "") || ""
                    setMessage(newTxt)
                    const cleaned = newTxt.trim()
                    if (!cleaned) {
                      setIsMultiline(false)
                    } else if (newTxt.includes("\n") || newTxt.length > 45) {
                      setIsMultiline(true)
                    } else {
                      setIsMultiline(false)
                    }
                    // Save the new position after insertion
                    saveSelection()
                  }}
                />
              )}
            />
          )}

          <IconButton
            onClick={handleSend}
            onTouchEnd={(e) => {
              if (!isInputDisabled && hasContent) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={isInputDisabled || !hasContent}
            variant={hasContent ? "primary" : "ghost"}
            aria-label="Send message"
            className="!w-10 !h-10"
          >
            <Send size={18} className="-translate-x-[1px] translate-y-[1px]" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
