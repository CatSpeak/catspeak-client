import React, { useState } from "react"
import { Play, ExternalLink, RotateCcw } from "lucide-react"

/**
 * YouTubeEmbed — Responsive YouTube video preview and inline player component.
 * Optimized for mobile touch devices and desktop web browsers.
 *
 * @param {string} videoId      - YouTube video ID
 * @param {string} originalUrl  - Original link URL
 * @param {string} timestamp    - Optional start timestamp
 * @param {boolean} isOwn       - Bubble owner flag
 */
const YouTubeEmbed = ({ videoId, originalUrl, timestamp = null, isOwn = false, hasCaption = false }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [imgSrc, setImgSrc] = useState(
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  )

  if (!videoId) return null

  const handleImageError = () => {
    if (imgSrc.includes("hqdefault")) {
      setImgSrc(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`)
    }
  }

  const handlePlayClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPlaying(true)
  }

  const handleStopClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPlaying(false)
  }

  const handleExternalClick = (e) => {
    e.stopPropagation()
  }

  const watchUrl =
    originalUrl || `https://www.youtube.com/watch?v=${videoId}`

  const roundedClass = hasCaption
    ? "rounded-t-2xl rounded-b-none"
    : "rounded-2xl"

  return (
    <div
      className={`w-full max-w-[360px] ${roundedClass} overflow-hidden shadow-xs bg-[#F3F3F3] text-gray-900`}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-1.5 font-semibold">
          <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span>YouTube</span>
        </div>

        <div className="flex items-center gap-2">
          {isPlaying && (
            <button
              type="button"
              onClick={handleStopClick}
              className="flex items-center gap-1 text-[11px] opacity-80 hover:opacity-100 transition-opacity"
              title="Close video player"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleExternalClick}
            className="flex items-center gap-1 text-[11px] opacity-80 hover:opacity-100 hover:underline transition-all"
            title="Open in YouTube"
          >
            <span>Watch</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Video Content Container */}
      <div className="relative aspect-video w-full bg-black overflow-hidden group">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1${
              timestamp ? `&start=${timestamp}` : ""
            }`}
            title="YouTube video player"
            className="w-full h-full border-0 block"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={handlePlayClick}
            className="w-full h-full relative block cursor-pointer group focus:outline-none"
            aria-label="Play YouTube video"
          >
            <img
              src={imgSrc}
              onError={handleImageError}
              alt="YouTube thumbnail"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                <Play size={22} className="fill-current translate-x-0.5" />
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

export default React.memo(YouTubeEmbed)
