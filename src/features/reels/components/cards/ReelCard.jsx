import React, { useEffect, useState, useRef, useCallback } from "react"
import { Heart, Eye, Volume2, VolumeX } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import Badge from "@/shared/components/ui/indicators/Badge"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import { formatCompactNumber } from "../../utils/formatters"
import colors from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

/**
 * Single reel card in the Pinterest masonry grid - V2 Design
 *
 * Behavior:
 * - Hover → video auto-plays (muted) over the thumbnail
 * - Leave → video stops, thumbnail returns
 */
const ReelCardV2 = React.memo(function ReelCardV2({ reel, onSelect }) {
  const { language } = useLanguage()
  const { formatTimeAgo } = useTimezone()
  const videoRef = useRef(null)
  const hoverIntentRef = useRef(null)

  const [showVideo, setShowVideo] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const hasVideo = Boolean(reel.videoUrl)

  const handleCardClick = useCallback(() => {
    onSelect(reel)
  }, [onSelect, reel])

  const stopPreview = useCallback((resetState = true) => {
    if (hoverIntentRef.current) {
      clearTimeout(hoverIntentRef.current)
      hoverIntentRef.current = null
    }

    const el = videoRef.current
    if (el) {
      el.pause()
      if (el.readyState > 0) {
        el.currentTime = 0
      }
    }
    if (resetState) {
      setShowVideo(false)
      setIsPlaying(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopPreview(false)
    }
  }, [stopPreview])

  const handleMouseEnter = useCallback(() => {
    if (!hasVideo) return

    hoverIntentRef.current = setTimeout(() => {
      const el = videoRef.current
      if (!el) return

      setShowVideo(true)
      if (el.readyState > 0) {
        el.currentTime = 0
      }
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }, 200)
  }, [hasVideo])

  const handleMouseLeave = useCallback(() => {
    stopPreview()
  }, [stopPreview])

  const handleToggleMute = useCallback((e) => {
    e.stopPropagation()
    const el = videoRef.current
    if (!el) return
    el.muted = !el.muted
    setIsMuted(el.muted)
  }, [])

  return (
    <div
      className="w-full flex flex-col gap-2 cursor-pointer group"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Container */}
      <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1A1A] shadow-sm transition-transform duration-300 isolate">
        {/* Thumbnail */}
        {reel.thumbnailUrl ? (
          <img
            src={reel.thumbnailUrl}
            alt={reel.title}
            className="w-full h-auto block object-cover rounded-xl transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full aspect-[3/4] flex items-center justify-center text-white text-3xl font-bold"
            style={{ background: colors.primaryRed }}
          >
            {reel.title.charAt(0)}
          </div>
        )}

        {/* Video overlay */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            muted={isMuted}
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover rounded-xl z-10 pointer-events-none transition-opacity duration-300"
            style={{ opacity: showVideo ? 1 : 0 }}
          />
        )}

        {/* Mute toggle — only while video is visible and playing */}
        {showVideo && isPlaying && (
          <IconButton
            variant="overlay"
            onClick={handleToggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
            className="absolute bottom-1 right-1 z-40"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </IconButton>
        )}

        {/* Stats Overlay (Stacked Bottom-Left) */}
        <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-2 text-white text-sm font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] pointer-events-none select-none">
          <span className="flex items-center gap-2">
            <Eye size={20} className="shrink-0" />
            <span>{formatCompactNumber(reel.views, language)}</span>
          </span>
          <span className="flex items-center gap-2">
            <Heart size={20} className="shrink-0" />
            <span>{formatCompactNumber(reel.likes, language)}</span>
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col">
        {/* Title */}
        <h3 className="text-base font-bold dark:text-white mb-2 line-clamp-2">
          {reel.title}
        </h3>

        {/* Tags */}
        {reel.tags && reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {reel.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} color="amber">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer (Author) */}
        <div className="flex items-center gap-4 min-w-0">
          <Avatar
            size={40}
            src={reel.author.avatarUrl}
            name={reel.author.name}
            alt={reel.author.name}
            accountId={reel.author.id || reel.author.accountId}
          />

          <div className="flex flex-col min-w-0">
            <span className="text-base dark:text-white truncate flex items-center gap-1">
              <span className="truncate">{reel.author.name}</span>
              {reel.author.verified && (
                <svg
                  className="w-3.5 h-3.5 text-blue-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </span>

            <span className="text-sm text-secondary dark:text-neutral-400 truncate">
              {reel.createdAt ? formatTimeAgo(reel.createdAt) : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ReelCardV2
