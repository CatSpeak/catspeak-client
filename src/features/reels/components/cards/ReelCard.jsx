import React, { useEffect, useState, useRef, useCallback } from "react"
import { Play, Heart, Eye, Volume2, VolumeX } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { formatCompactNumber, formatRelativeTime } from "../../utils/formatters"
import colors from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Single reel card in the Pinterest masonry grid - V2 Design
 * 
 * Behavior:
 * - Hover → video auto-plays (muted) over the thumbnail
 * - Leave → video stops, thumbnail returns
 */
const ReelCardV2 = React.memo(function ReelCardV2({ reel, onSelect }) {
  const { language } = useLanguage()
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

  const handlePlayPause = useCallback((e) => {
    e.stopPropagation()
    const el = videoRef.current
    if (!el) return

    if (el.paused) {
      el.play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {})
    } else {
      el.pause()
      setIsPlaying(false)
    }
  }, [])

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
      <div 
        className="relative w-full rounded-[24px] overflow-hidden bg-gray-100 shadow-sm transition-transform duration-300"
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)', transform: 'translateZ(0)' }}
      >
        {/* Thumbnail */}
        {reel.thumbnailUrl ? (
          <img
            src={reel.thumbnailUrl}
            alt={reel.title}
            className="w-full h-auto block object-cover rounded-[24px] transition-transform duration-500 md:group-hover:scale-[1.03]"
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
            className="absolute inset-0 w-full h-full object-cover rounded-[24px] z-10 pointer-events-none transition-opacity duration-300"
            style={{ opacity: showVideo ? 1 : 0 }}
          />
        )}

        {/* Top Right Play Icon */}
        {!isPlaying && (
          <button 
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/25 flex items-center justify-center backdrop-blur-sm cursor-pointer border-none transition-all hover:bg-black/40 hover:scale-110"
            onClick={handlePlayPause}
            aria-label="Play video"
          >
            <Play size={15} fill="white" color="white" className="ml-0.5" />
          </button>
        )}

        {/* Mute toggle — only while video is visible and playing */}
        {showVideo && isPlaying && (
          <button
            className="absolute top-3 left-3 z-40 w-8 h-8 rounded-full bg-black/40 border border-white/10 text-white flex items-center justify-center cursor-pointer backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:scale-[1.08] outline-none"
            onClick={handleToggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col px-1">
        {/* Title */}
        <h3 className="text-[13px] sm:text-[14.5px] font-medium text-gray-800 leading-snug mb-2 line-clamp-2">
          {reel.title}
        </h3>

        {/* Tags */}
        {reel.tags && reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {reel.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx} 
                className="px-1.5 md:px-2 py-0.5 bg-[#f59e0b] text-[#451a03] text-[9px] sm:text-[11px] font-semibold rounded"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* Footer (Author & Stats) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar
              size={32}
              src={reel.author.avatarUrl}
              name={reel.author.name}
              alt={reel.author.name}
            />
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-[13px] font-medium text-gray-500 leading-none mb-1 flex items-center gap-1">
                {reel.author.name}
                {reel.author.verified && (
                  <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </span>
              <span className="text-[9px] sm:text-[11px] text-gray-400 leading-none">
                {formatRelativeTime(reel.createdAt, language)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 sm:gap-3 text-gray-400 text-[11px] sm:text-[13px] font-medium">
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Eye className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" /> 
              {formatCompactNumber(reel.views, language)}
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Heart className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" /> 
              {formatCompactNumber(reel.likes, language)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ReelCardV2
