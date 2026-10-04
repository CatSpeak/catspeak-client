import React, { useState, useMemo } from "react"
import { Download, Link2, Loader2, Pause, Play } from "lucide-react"
import {
  useGetConversationMediaQuery,
  useLazyGetConversationMediaQuery,
} from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import { useGalleryAudio } from "../../hooks/useGalleryAudio"
import {
  formatFileSize,
  formatDuration,
  getDomain,
} from "../../utils/galleryUtils"
import DockedAudioPlayer from "./DockedAudioPlayer"

/**
 * SharedMediaGallery — Tabbed gallery panel in ChatUserPanel showing
 * photos & videos, files, voice recordings, and links shared in conversation.
 */
const SharedMediaGallery = ({ conversationId, fullHeight = false }) => {
  const { t } = useLanguage()
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
    if (allItems.length === 0 || isFetching || isFetchingOlder || !hasMore)
      return
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

  // Audio playback lifecycle & docked player controls
  const {
    activeAudio,
    isPlayingAudio,
    audioCurrentTime,
    audioDuration,
    playbackSpeed,
    handleTogglePlayAudio,
    handleToggleDockedPlay,
    handleCycleSpeed,
    handleSeek,
    handleCloseAudio,
  } = useGalleryAudio()

  const tabs = useMemo(
    () => [
      { id: "images_videos", label: t?.chat?.gallery?.media || "Media" },
      { id: "files", label: t?.chat?.gallery?.files || "Files" },
      { id: "audio", label: t?.chat?.gallery?.voice || "Voice" },
      { id: "links", label: t?.chat?.gallery?.links || "Links" },
    ],
    [t],
  )

  return (
    <div
      className={`flex flex-col ${
        fullHeight
          ? "flex-1 overflow-hidden"
          : "border-t border-border mt-3 pt-3"
      }`}
    >
      {!fullHeight && (
        <div className="px-4 mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {t?.chat?.gallery?.sharedContent || "Shared Content"}
          </h4>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      {/* ── Content View ── */}
      <div
        className={`${
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
          <div className="p-4 grid grid-cols-3 gap-1">
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
                  className="group relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-border/40 hover:opacity-95 transition-all"
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
                      alt={item.fileName || t?.chat?.sharedPhoto || "Shared photo"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {isVid && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="text-white fill-white" />
                    </div>
                  )}
                </a>
              )
            })}
          </div>
        ) : activeTab === "files" ? (
          /* Files List */
          <div className="flex flex-col">
            {allItems.map((item, idx) => (
              <a
                key={item.messageId || idx}
                href={item.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={item.fileName}
                className="h-[72px] flex items-center gap-4 px-4 hover:bg-itemHover active:bg-itemActiveHover transition-colors"
              >
                <Download className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate">
                    {item.fileName || t?.chat?.defaultFile || "File"}
                  </p>
                  {item.fileSize ? (
                    <p className="text-sm text-secondary">
                      {formatFileSize(item.fileSize)}
                    </p>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        ) : activeTab === "audio" ? (
          /* Audio / Voice Messages List */
          <div className="flex flex-col">
            {allItems.map((item, idx) => {
              const itemId = item.messageId || item.id
              const isActiveThisItem =
                (activeAudio?.messageId || activeAudio?.id) === itemId
              const isPlayingThisItem = isActiveThisItem && isPlayingAudio
              const itemDur =
                isActiveThisItem &&
                Number.isFinite(audioDuration) &&
                audioDuration > 0
                  ? audioDuration
                  : Number.isFinite(item.audioDuration) &&
                      item.audioDuration > 0
                    ? item.audioDuration
                    : Number.isFinite(item.duration) && item.duration > 0
                      ? item.duration
                      : 0

              return (
                <div
                  key={itemId || idx}
                  onClick={() => handleTogglePlayAudio(item)}
                  className={`h-[72px] flex items-center gap-4 px-4 transition-colors cursor-pointer select-none ${
                    isActiveThisItem
                      ? "bg-itemHover hover:bg-itemActiveHover"
                      : "hover:bg-itemHover active:bg-itemActiveHover"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTogglePlayAudio(item)
                    }}
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    {isPlayingThisItem ? (
                      <Pause className="fill-current" />
                    ) : (
                      <Play className="fill-current" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className="truncate">
                      {item.senderName ||
                        t?.chat?.voiceAudio ||
                        "Voice Message"}
                    </p>
                    <p className="text-sm text-secondary">
                      {formatDuration(itemDur)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Links List */
          <div className="flex flex-col">
            {allItems.map((item, idx) => {
              const link = item.linkUrl || item.messageContent
              const domain = getDomain(link)
              return (
                <a
                  key={item.messageId || idx}
                  href={link?.startsWith("http") ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[72px] flex items-center gap-4 px-4 hover:bg-itemHover active:bg-itemActiveHover transition-colors"
                >
                  <Link2 className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate">{item.title || domain || link}</p>
                    <p className="text-sm text-secondary truncate">{link}</p>
                  </div>
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

      {/* ── Docked Audio Player Bar ── */}
      <DockedAudioPlayer
        activeAudio={activeAudio}
        isPlayingAudio={isPlayingAudio}
        audioCurrentTime={audioCurrentTime}
        audioDuration={audioDuration}
        playbackSpeed={playbackSpeed}
        onTogglePlay={handleToggleDockedPlay}
        onCycleSpeed={handleCycleSpeed}
        onSeek={handleSeek}
        onClose={handleCloseAudio}
        t={t}
      />
    </div>
  )
}

export default React.memo(SharedMediaGallery)
