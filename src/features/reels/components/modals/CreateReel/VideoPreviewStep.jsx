import React from "react"
import { Video, Heart, MessageCircle, Share, Music } from "lucide-react"
import { useCreateReelContext, renderHighlightedDescription } from "../../../contexts/CreateReelContext"

export const VideoPreviewStep = () => {
  const {
    t,
    title,
    description,
    privacy,
    mobileTab,
    previewMode, setPreviewMode,
    videoPreviewUrl,
    coverPreviewUrl
  } = useCreateReelContext()

  return (
    <div className={`flex-col gap-4 text-left border-l-0 md:border-l border-gray-100 pl-0 md:pl-6 h-full ${mobileTab === "preview" ? "flex" : "hidden md:flex"}`}>
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          {t?.catSpeak?.reels?.createModal?.preview || "Preview"}
        </h3>

        {/* Live Feed Mode Tabs selector */}
        <div className="flex bg-gray-200/60 p-1 rounded-xl text-xs font-bold shadow-sm mt-1.5">
          <button
            type="button"
            onClick={() => setPreviewMode("video")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${previewMode === "video"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {t?.catSpeak?.reels?.createModal?.videoPlayback || "Video Playback"}
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode("cover")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${previewMode === "cover"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {t?.catSpeak?.reels?.createModal?.coverThumbnailTab || t?.catSpeak?.reels?.createModal?.coverThumbnail || "Cover Thumbnail"}
          </button>
        </div>
      </div>

      {/* Simulated Phone Mockup */}
      <div className="flex justify-center py-2 shrink-0 select-none scale-90 sm:scale-100 origin-center transition-transform duration-300">
        <div className="relative w-[210px] h-[410px] bg-black rounded-[32px] border-[6px] border-gray-800 shadow-xl overflow-hidden select-none transition-transform duration-300 hover:scale-[1.01]">
          {/* Notch bezel */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-gray-800 rounded-b-xl z-30 flex items-center justify-between px-4 text-[7px] text-white/95 font-semibold">
            <span className="font-mono">9:41</span>
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 bg-white/20 rounded-full flex items-center justify-center text-[5px]">⚡</span>
              <div className="w-2.5 h-1.2 border border-white/60 rounded-[2px] p-0.2 flex items-center">
                <div className="w-full h-full bg-white rounded-[0.5px]" />
              </div>
            </div>
          </div>

          {/* Feed backdrop preview (looping muted video or static cover) */}
          <div className="absolute inset-0 w-full h-full z-0 bg-gray-950">
            {previewMode === "video" ? (
              <video
                src={videoPreviewUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover brightness-[0.80] transition-all duration-300"
              />
            ) : coverPreviewUrl ? (
              <img
                src={coverPreviewUrl}
                alt="Live Mock Backdrop"
                className="w-full h-full object-cover brightness-[0.80] transition-all duration-300 animate-fadeIn"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-950 to-red-950 flex flex-col items-center justify-center p-3 text-center">
                <Video
                  className="text-gray-700 mb-1 animate-pulse"
                  size={24}
                />
                <span className="text-[9px] text-gray-500">
                  {t?.catSpeak?.reels?.createModal?.thumbnailPreviewing || "Thumbnail Previewing"}
                </span>
              </div>
            )}
          </div>

          {/* Feed Tabs overlay */}
          <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 text-[9px] font-bold text-white/60 z-10">
            <span className="cursor-pointer hover:text-white">Following</span>
            <span className="text-white relative flex flex-col items-center">
              For You
              <span className="absolute -bottom-0.5 w-1 h-1 bg-white rounded-full" />
            </span>
          </div>

          {/* Interaction Icons overlay */}
          <div className="absolute right-2 bottom-12 flex flex-col items-center gap-3 z-10">
            <div className="relative mb-1">
              <div className="w-7 h-7 rounded-full border border-white bg-cath-red-700 flex items-center justify-center font-bold text-[9px] text-white">
                C
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 border border-white text-white rounded-full w-3 h-3 flex items-center justify-center text-[7px] font-bold shadow-sm">
                +
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-7 h-7 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 shadow-sm cursor-pointer active:scale-95 transition-all">
                <Heart size={14} className="text-white fill-white/10" />
              </div>
              <span className="text-[8px] text-white/90 font-medium mt-0.5">1.2K</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-7 h-7 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 shadow-sm cursor-pointer active:scale-95 transition-all">
                <MessageCircle size={14} className="text-white fill-white/10" />
              </div>
              <span className="text-[8px] text-white/90 font-medium mt-0.5">0</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-7 h-7 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 shadow-sm cursor-pointer active:scale-95 transition-all">
                <Share size={12} className="text-white" />
              </div>
              <span className="text-[8px] text-white/90 font-medium mt-0.5">Share</span>
            </div>

            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/20 flex items-center justify-center animate-[spin_4s_linear_infinite] mt-1 shadow-md">
              <Music size={10} className="text-white/80" />
            </div>
          </div>

          {/* Metadata overlays */}
          <div className="absolute bottom-0 left-0 right-10 p-3 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 flex flex-col gap-1 text-left text-white/95">
            <span className="font-bold text-[9px] flex items-center gap-0.5">
              @you
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center text-[5px] text-white">✓</span>
            </span>

            <p className="text-[9px] leading-relaxed font-semibold line-clamp-1">
              <span className="text-cath-red-700 font-bold mr-1">
                #{privacy}
              </span>
              {title || t?.catSpeak?.reels?.createModal?.untitledReel || "Untitled Reel"}
            </p>

            {description && (
              <p className="text-[8px] text-white/80 line-clamp-2 leading-relaxed opacity-90 whitespace-pre-wrap break-words">
                {renderHighlightedDescription(description, "font-bold text-sky-200")}
              </p>
            )}

            <div className="flex items-center gap-1 text-[7px] text-white/60 mt-0.5 overflow-hidden w-full whitespace-nowrap">
              <Music size={8} className="shrink-0" />
              <div className="overflow-hidden w-full relative">
                <div
                  className="inline-block whitespace-nowrap pl-1 text-[7px] text-white/80 animate-marquee"
                  style={{
                    animation: 'mockMarquee 8s linear infinite',
                    display: 'inline-block'
                  }}
                >
                  Original Audio - you • Original Audio - you • Original Audio - you •&nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
