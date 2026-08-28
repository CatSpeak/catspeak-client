import React, { useState, useMemo } from "react"
import { Download, Play, Image as ImageIcon } from "lucide-react"
import MediaViewerModal from "@/shared/components/ui/MediaViewerModal"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import FileAttachmentItem from "@/shared/components/ui/FileAttachmentItem"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Unified tile component for both Images and Videos
 */
const VisualMediaItem = ({
  media,
  onClick,
  className = "",
  isSingle = false,
  isOverlay = false,
  overlayCount = 0,
}) => {
  const [hasError, setHasError] = useState(false)
  const isVideo = media.mediaType === "Video"

  // Single video player with inline controls
  if (isVideo && isSingle) {
    return (
      <div
        className={`relative w-full rounded-xl overflow-hidden bg-black border border-border flex items-center justify-center ${className}`}
      >
        <video
          src={media.mediaUrl}
          controls
          preload="metadata"
          className="w-full h-full object-contain bg-black"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 border border-border flex items-center justify-center ${className}`}
    >
      {isVideo ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            src={media.mediaUrl}
            preload="metadata"
            className="w-full h-full object-contain bg-black"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
          </div>
        </div>
      ) : hasError || !media.mediaUrl ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-2">
          <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
          <span className="text-[11px] text-gray-400 text-center truncate w-full px-1">
            Không thể tải hình ảnh
          </span>
        </div>
      ) : (
        <img
          src={media.mediaUrl}
          alt={media.fileName || "Post media"}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}

      {/* Dark hover tint */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

      {/* Overflow overlay badge (+N) */}
      {isOverlay && overlayCount > 0 && (
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-2xl sm:text-3xl z-10 transition-colors group-hover:bg-black/75">
          +{overlayCount}
        </div>
      )}
    </div>
  )
}

/**
 * Adaptive Gallery Layout for 1 to 5+ visual media items
 */
const VisualMediaGrid = ({ mediaList, onMediaClick }) => {
  const count = mediaList.length
  if (count === 0) return null

  // 1 Item: Full width with 16:9 aspect-video default
  if (count === 1) {
    return (
      <VisualMediaItem
        media={mediaList[0]}
        onClick={() => onMediaClick(0)}
        className="w-full aspect-video max-h-[500px]"
        isSingle
      />
    )
  }

  // 2 Items: 2 equal columns
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 w-full">
        {mediaList.map((m, index) => (
          <VisualMediaItem
            key={m.postMediaId}
            media={m}
            onClick={() => onMediaClick(index)}
            className="aspect-[4/3]"
          />
        ))}
      </div>
    )
  }

  // 3 Items: 1 dominant on left, 2 stacked on right
  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 w-full aspect-[4/3]">
        <VisualMediaItem
          media={mediaList[0]}
          onClick={() => onMediaClick(0)}
          className="h-full"
        />
        <div className="grid grid-rows-2 gap-1 h-full">
          <VisualMediaItem
            media={mediaList[1]}
            onClick={() => onMediaClick(1)}
            className="h-full"
          />
          <VisualMediaItem
            media={mediaList[2]}
            onClick={() => onMediaClick(2)}
            className="h-full"
          />
        </div>
      </div>
    )
  }

  // 4 Items: Balanced 2x2 grid
  if (count === 4) {
    return (
      <div className="grid grid-cols-2 gap-1 w-full">
        {mediaList.map((m, index) => (
          <VisualMediaItem
            key={m.postMediaId}
            media={m}
            onClick={() => onMediaClick(index)}
            className="aspect-square"
          />
        ))}
      </div>
    )
  }

  // 5+ Items: 2x2 grid showing first 3 items + overflow badge on 4th item
  const displayed = mediaList.slice(0, 4)
  const remainingCount = count - 3

  return (
    <div className="grid grid-cols-2 gap-1 w-full">
      {displayed.map((m, index) => {
        const isFourth = index === 3
        return (
          <VisualMediaItem
            key={m.postMediaId}
            media={m}
            onClick={() => onMediaClick(index)}
            className="aspect-square"
            isOverlay={isFourth}
            overlayCount={remainingCount}
          />
        )
      })}
    </div>
  )
}

/**
 * Main PostMediaGallery Component
 */
const PostMediaGallery = ({ media = [], initialDocsLimit = 2 }) => {
  const { t } = useLanguage()
  const [activeMediaIndex, setActiveMediaIndex] = useState(null)
  const [isDocsExpanded, setIsDocsExpanded] = useState(false)

  if (!media || media.length === 0) return null

  // Categorize media into visual (images/videos) and documents
  const visualMedia = useMemo(
    () =>
      (media || []).filter(
        (m) => m.mediaType === "Image" || m.mediaType === "Video",
      ),
    [media],
  )
  const documents = useMemo(
    () =>
      (media || []).filter(
        (m) => m.mediaType !== "Image" && m.mediaType !== "Video",
      ),
    [media],
  )

  const visibleDocuments = isDocsExpanded
    ? documents
    : documents.slice(0, initialDocsLimit)
  const hasMoreDocuments = documents.length > initialDocsLimit

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Visual media gallery */}
      {visualMedia.length > 0 && (
        <VisualMediaGrid
          mediaList={visualMedia}
          onMediaClick={(index) => setActiveMediaIndex(index)}
        />
      )}

      {/* Document attachment list */}
      {documents.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          {visibleDocuments.map((doc) => (
            <FileAttachmentItem
              key={doc.postMediaId}
              fileName={doc.fileName || t.profile?.post?.document || "Tài liệu"}
              fileSize={doc.fileSize}
              rightAction={
                <IconButton
                  as="a"
                  href={doc.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  title="Tải xuống"
                >
                  <Download size={20} />
                </IconButton>
              }
            />
          ))}

          {hasMoreDocuments && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsDocsExpanded((prev) => !prev)
              }}
              className="inline-flex items-center self-start text-sm font-semibold text-cath-red-700 hover:text-cath-red-800 hover:underline cursor-pointer pt-0.5"
            >
              {isDocsExpanded
                ? t.profile?.post?.showLess || "Thu gọn"
                : `${t.profile?.post?.seeMore || "Xem thêm"} (+${documents.length - initialDocsLimit})`}
            </button>
          )}
        </div>
      )}

      {/* Lightbox Modal with Full Playlist Navigation */}
      {activeMediaIndex !== null && (
        <MediaViewerModal
          mediaList={visualMedia}
          initialIndex={activeMediaIndex}
          onClose={() => setActiveMediaIndex(null)}
        />
      )}
    </div>
  )
}

export default PostMediaGallery
