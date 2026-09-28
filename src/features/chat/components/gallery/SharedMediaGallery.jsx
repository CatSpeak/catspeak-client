import React, { useState, useMemo, useRef, useEffect } from "react"
import {
  Image,
  FileText,
  Mic,
  Link2,
  ExternalLink,
  Download,
  Play,
  Pause,
  Loader2,
} from "lucide-react"
import {
  useGetConversationMediaQuery,
  useLazyGetConversationMediaQuery,
} from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return ""
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(1)} KB`
}

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? "0" : ""}${s}`
}

/**
 * SharedMediaGallery — Tabbed gallery panel in ChatUserPanel showing
 * photos & videos, files, voice recordings, and links shared in conversation.
 */
const SharedMediaGallery = ({ conversationId, fullHeight = false }) => {
  const { t } = useLanguage()
  const { formatRelative } = useTimezone()
  const [activeTab, setActiveTab] = useState("images_videos")
  const [olderItems, setOlderItems] = useState([])
  const [hasMore, setHasMore] = useState(true)

  // Fetch initial page directly from RTK Query cache
  const {
    data: rawInitial = [],
    isLoading,
    isFetching,
  } = useGetConversationMediaQuery(
    conversationId
      ? {
          conversationId,
          type: activeTab,
          limit: 30,
        }
      : undefined,
    { skip: !conversationId },
  )

  const [triggerFetchOlder, { isFetching: isFetchingOlder }] =
    useLazyGetConversationMediaQuery()

  const initialItems = useMemo(() => {
    return Array.isArray(rawInitial)
      ? rawInitial
      : rawInitial?.data || rawInitial?.items || []
  }, [rawInitial])

  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    setOlderItems([])
    setHasMore(true)
  }

  // Combine initial items with manually loaded older items
  const allItems = useMemo(() => {
    const existingIds = new Set(initialItems.map((i) => i.messageId || i.id))
    const uniqueOlder = olderItems.filter(
      (i) => !existingIds.has(i.messageId || i.id),
    )
    return [...initialItems, ...uniqueOlder]
  }, [initialItems, olderItems])

  const handleLoadMore = async () => {
    if (allItems.length === 0 || isFetching || isFetchingOlder || !hasMore) return
    const lastItem = allItems[allItems.length - 1]
    const lastId = lastItem.messageId || lastItem.id
    if (!lastId) return

    try {
      const res = await triggerFetchOlder({
        conversationId,
        type: activeTab,
        beforeId: lastId,
        limit: 30,
      }).unwrap()

      const list = Array.isArray(res) ? res : res?.data || res?.items || []
      if (list.length < 30) {
        setHasMore(false)
      }
      setOlderItems((prev) => [...prev, ...list])
    } catch (err) {
      console.error("Failed to load older shared media:", err)
    }
  }

  // Mini Audio Player State for Audio tab
  const [playingAudioId, setPlayingAudioId] = useState(null)
  const audioInstanceRef = useRef(null)

  const handleTogglePlayAudio = (item) => {
    const itemId = item.messageId || item.id
    if (playingAudioId === itemId) {
      audioInstanceRef.current?.pause()
      setPlayingAudioId(null)
    } else {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause()
      }
      const audio = new Audio(item.mediaUrl)
      audioInstanceRef.current = audio
      audio.play().catch(() => setPlayingAudioId(null))
      audio.onended = () => setPlayingAudioId(null)
      setPlayingAudioId(itemId)
    }
  }

  useEffect(() => {
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause()
      }
    }
  }, [])

  const tabs = [
    { id: "images_videos", label: t?.chat?.gallery?.media || "Media", icon: Image },
    { id: "files", label: t?.chat?.gallery?.files || "Files", icon: FileText },
    { id: "audio", label: t?.chat?.gallery?.voice || "Voice", icon: Mic },
    { id: "links", label: t?.chat?.gallery?.links || "Links", icon: Link2 },
  ]

  return (
    <div
      className={`flex flex-col ${
        fullHeight ? "flex-1 overflow-hidden" : "border-t border-border mt-3 pt-3"
      }`}
    >
      {!fullHeight && (
        <div className="px-4 mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {t?.chat?.gallery?.sharedContent || "Shared Content"}
          </h4>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div
        className={`flex items-center gap-1 px-3 border-b border-border/70 pb-2 ${
          fullHeight ? "pt-2 shrink-0" : ""
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Content View ── */}
      <div
        className={`p-3 ${
          fullHeight
            ? "flex-1 overflow-y-auto"
            : "min-h-[160px] max-h-[380px] overflow-y-auto"
        }`}
      >
        {isLoading && allItems.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-neutral-400" size={24} />
          </div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 text-xs">
            {t?.chat?.gallery?.noItems || "No items in this category yet"}
          </div>
        ) : activeTab === "images_videos" ? (
          /* Photos & Videos 3-Column Grid */
          <div className="grid grid-cols-3 gap-2">
            {allItems.map((item, idx) => {
              const isVid =
                item.itemType === "video" ||
                item.mediaUrl?.match(/\.(mp4|webm|mov|mkv)/i)
              return (
                <a
                  key={item.messageId || idx}
                  href={item.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-zinc-800 border border-border/40 hover:opacity-95 transition-all"
                >
                  {isVid ? (
                    <video
                      src={item.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.fileName || "Shared photo"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {isVid && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play size={18} className="text-white fill-white" />
                    </div>
                  )}
                </a>
              )
            })}
          </div>
        ) : activeTab === "files" ? (
          /* Files List */
          <div className="flex flex-col gap-2">
            {allItems.map((item, idx) => (
              <a
                key={item.messageId || idx}
                href={item.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={item.fileName}
                className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-zinc-800/60 hover:bg-neutral-100 dark:hover:bg-zinc-800 border border-border/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 mr-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {item.fileName || "File"}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {formatFileSize(item.fileSize)} •{" "}
                      {formatRelative(item.createdAt)}
                    </p>
                  </div>
                </div>
                <Download size={14} className="text-neutral-400 shrink-0" />
              </a>
            ))}
          </div>
        ) : activeTab === "audio" ? (
          /* Audio / Voice Messages List */
          <div className="flex flex-col gap-2">
            {allItems.map((item, idx) => {
              const isPlaying =
                playingAudioId === (item.messageId || item.id)
              return (
                <div
                  key={item.messageId || idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-zinc-800/60 border border-border/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0 mr-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePlayAudio(item)}
                      className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-primary/90 transition-transform active:scale-95"
                    >
                      {isPlaying ? (
                        <Pause size={14} className="fill-current" />
                      ) : (
                        <Play size={14} className="fill-current translate-x-0.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {item.senderName || t?.chat?.voiceAudio || "Voice Message"}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {formatDuration(item.audioDuration)} •{" "}
                        {formatRelative(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Links List */
          <div className="flex flex-col gap-2">
            {allItems.map((item, idx) => {
              const link = item.linkUrl || item.messageContent
              return (
                <a
                  key={item.messageId || idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-zinc-800/60 hover:bg-neutral-100 dark:hover:bg-zinc-800 border border-border/40 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0 mr-2">
                    <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Link2 size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-primary font-medium truncate underline">
                        {link}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {formatRelative(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={13} className="text-neutral-400 shrink-0 mt-1" />
                </a>
              )
            })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && allItems.length >= 30 && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isFetching || isFetchingOlder}
              className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 cursor-pointer"
            >
              {isFetching || isFetchingOlder
                ? t?.chat?.loading || "Loading..."
                : t?.chat?.gallery?.loadMore || "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(SharedMediaGallery)
