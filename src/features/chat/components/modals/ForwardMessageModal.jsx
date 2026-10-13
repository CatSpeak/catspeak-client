import React, { useState, useMemo } from "react"
import { Search, Send, Check, MessageSquareShare } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import {
  useGetConversationsQuery,
  useForwardMessagesMutation,
} from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * ForwardMessageModal — Allows user to forward a message (text, media, audio, file)
 * to multiple conversations simultaneously with an optional comment,
 * matching POST /api/conversations/messages/forward.
 */
const ForwardMessageModal = ({ open, onClose, message }) => {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: rawConversations = [], isLoading } = useGetConversationsQuery(undefined, {
    skip: !open,
  })

  const [forwardMessagesMutation] = useForwardMessagesMutation()

  const conversations = useMemo(() => {
    return Array.isArray(rawConversations)
      ? rawConversations
      : rawConversations?.data || rawConversations?.items || []
  }, [rawConversations])

  const sourceMessageId = Number(message?.id || message?.messageId)

  const messageText =
    message?.content ||
    message?.messageContent ||
    (message?.messageType === "Audio"
      ? `[${t?.chat?.voiceAudio || "Voice Message"}]`
      : message?.mediaUrl
        ? `[${t?.chat?.media || "Media"}]`
        : "")

  const senderName =
    message?.sender?.username ||
    message?.sender?.name ||
    t?.chat?.someone ||
    "Someone"

  const filteredConversations = useMemo(() => {
    if (!Array.isArray(conversations)) return []
    const q = searchQuery.toLowerCase().trim()
    if (!q) return conversations

    return conversations.filter((c) => {
      const name = c.isGroup
        ? c.groupName || c.name || ""
        : c.friend?.username || c.friend?.name || c.name || ""
      return name.toLowerCase().includes(q)
    })
  }, [conversations, searchQuery])

  const toggleSelectConversation = (convId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(convId)) {
        next.delete(convId)
      } else {
        next.add(convId)
      }
      return next
    })
  }

  const handleForwardBatch = async () => {
    if (selectedIds.size === 0 || !sourceMessageId) return

    setIsSubmitting(true)
    const targetConversationIds = Array.from(selectedIds).map(Number)

    try {
      const result = await forwardMessagesMutation({
        sourceMessageId,
        targetConversationIds,
        comment: comment.trim() || undefined,
      }).unwrap()

      const successCount = result?.successCount ?? targetConversationIds.length
      toast.success(
        t?.chat?.forwardedSuccessBatch
          ? t.chat.forwardedSuccessBatch.replace("{{count}}", successCount)
          : `Message forwarded to ${successCount} conversations`,
      )
      setSelectedIds(new Set())
      setComment("")
      onClose()
    } catch (err) {
      console.error("Failed to forward messages:", err)
      toast.error(t?.chat?.forwardFailed || "Failed to forward message")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="md:max-w-md w-full"
      showCloseButton={true}
      title={
        <div className="flex items-center gap-2">
          <MessageSquareShare size={19} className="text-primary" />
          <span>{t?.chat?.forwardMessageTitle || "Forward Message"}</span>
        </div>
      }
      bodyClassName="p-0 flex-1 overflow-hidden flex flex-col"
    >
      {/* ── Message Quote Preview ──────────────────────────── */}
      <div className="p-3 bg-neutral-50 dark:bg-zinc-800/60 border-b border-border text-xs">
        <p className="font-semibold text-neutral-500 mb-0.5">
          {t?.chat?.forwardingPrompt || "Forwarding message from"}{" "}
          <span className="text-neutral-800 dark:text-neutral-200 font-bold">
            {senderName}
          </span>
          :
        </p>
        <p className="italic text-neutral-700 dark:text-neutral-300 line-clamp-2">
          "{messageText}"
        </p>
      </div>

      {/* ── Search Input ───────────────────────────────────── */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              t?.chat?.sidebar?.searchPlaceholder || "Search conversations..."
            }
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-neutral-100 dark:bg-zinc-800 rounded-lg border-0 focus:ring-2 focus:ring-primary outline-hidden"
          />
        </div>
      </div>

      {/* ── Conversation Multi-Select List ──────────────────── */}
      <div className="flex-1 overflow-y-auto max-h-[280px] p-2 divide-y divide-border/20">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            {t?.chat?.loadingConversations || "Loading..."}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            {t?.chat?.sidebar?.noConversations || "No conversations found"}
          </div>
        ) : (
          filteredConversations.map((c) => {
            const convId = Number(c.conversationId || c.id)
            const name = c.isGroup
              ? c.groupName || c.name || "Group"
              : c.friend?.username || c.friend?.name || c.name || "Chat"
            const avatar = c.isGroup ? c.groupAvatar : c.friend?.avatarImageUrl
            const isSelected = selectedIds.has(convId)

            return (
              <div
                key={convId}
                onClick={() => toggleSelectConversation(convId)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary/10 dark:bg-primary/20"
                    : "hover:bg-neutral-50 dark:hover:bg-zinc-800/40"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <Avatar size={36} name={name} src={avatar} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{name}</p>
                    {c.isGroup && (
                      <p className="text-[11px] text-neutral-400">
                        {c.participants?.length || 0} members
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkbox indicator */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-primary border-primary text-white"
                      : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-zinc-800"
                  }`}
                >
                  {isSelected && <Check size={14} className="stroke-[3]" />}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Footer Comment & Action Bar ─────────────────────── */}
      <div className="p-3 border-t border-border bg-neutral-50/50 dark:bg-zinc-900/50 flex flex-col gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            t?.chat?.forwardCommentPlaceholder ||
            "Add an optional comment or note..."
          }
          className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 rounded-lg border border-border focus:ring-2 focus:ring-primary outline-hidden"
        />

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-neutral-500 font-medium">
            {selectedIds.size > 0
              ? `${selectedIds.size} ${t?.chat?.conversationsSelected || "selected"}`
              : t?.chat?.selectToForward || "Select conversations to forward"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 cursor-pointer"
            >
              {t?.chat?.cancel || "Cancel"}
            </button>

            <button
              type="button"
              onClick={handleForwardBatch}
              disabled={selectedIds.size === 0 || isSubmitting}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Send size={13} />
              <span>
                {isSubmitting
                  ? t?.chat?.sending || "Sending..."
                  : `${t?.chat?.forwardAction || "Forward"} (${selectedIds.size})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default React.memo(ForwardMessageModal)
