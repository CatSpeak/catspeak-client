import React from "react"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"

const VideoPreview = ({
  localStream,
  micOn,
  cameraOn,
  user,
  onToggleMic,
  onToggleCam,
}) => {
  const { t } = useLanguage()
  return (
    <div className="relative w-full max-w-3xl flex flex-col items-center">
      <div className="mb-3 relative w-full aspect-video overflow-hidden rounded-xl border border-[#e5e5e5] bg-white">
        {/* Video Preview */}
        {localStream && (
          <video
            ref={(video) => {
              if (video) {
                video.srcObject = localStream
                if (micOn) video.muted = true // Mute local preview to prevent echo
              }
            }}
            autoPlay
            playsInline
            muted // Always mute local video preview purely for UI
            className={`h-full w-full object-cover -scale-x-100 ${!cameraOn ? "hidden" : ""}`}
          />
        )}

        {!cameraOn && (
          <div className="flex h-full w-full items-center justify-center">
            <Avatar
              size={64}
              name={user?.username}
              className="md:!w-24 md:!h-24"
            />
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="flex flex-row gap-3 min-[426px]:absolute min-[426px]:bottom-6 min-[426px]:left-1/2 min-[426px]:z-10 min-[426px]:-translate-x-1/2 min-[426px]:mt-0">
        <button
          onClick={onToggleMic}
          className={`border border-[#C6C6C6] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
            micOn
              ? "bg-[#990011] text-white hover:bg-[#7a000e]"
              : "bg-white text-[#990011/80] hover:bg-[#E5E5E5]"
          }`}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>

        <button
          onClick={onToggleCam}
          className={`border border-[#C6C6C6] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
            cameraOn
              ? "bg-[#990011] text-white hover:bg-[#7a000e]"
              : "bg-white text-[#990011/80] hover:bg-[#E5E5E5]"
          }`}
        >
          {cameraOn ? <Video /> : <VideoOff />}
        </button>
      </div>
    </div>
  )
}

export default VideoPreview
