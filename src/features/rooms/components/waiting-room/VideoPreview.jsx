import React, { useEffect, useRef } from "react"
import { Mic, MicOff, Video, VideoOff, Image, Settings } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"

const VideoPreview = ({
  localStream,
  micOn,
  cameraOn,
  user,
  onToggleMic,
  onToggleCam,
  onOpenBgModal,
  onOpenSettings,
  lkVideoTrack,
}) => {
  const { t } = useLanguage()
  const videoRef = useRef(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (lkVideoTrack) {
      lkVideoTrack.attach(videoElement)
      return () => {
        lkVideoTrack.detach(videoElement)
      }
    } else if (localStream) {
      videoElement.srcObject = localStream
    } else {
      videoElement.srcObject = null
    }
  }, [lkVideoTrack, localStream])

  // Handle local preview muting
  useEffect(() => {
    if (videoRef.current && micOn) {
      videoRef.current.muted = true
    }
  }, [micOn])

  return (
    <div className="relative w-full max-w-3xl flex flex-col items-center">
      <div className="mb-3 relative w-full aspect-video overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white">
        {/* Video Preview */}
        {localStream && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Always mute local video preview purely for UI
            className={`h-full w-full object-cover -scale-x-100 ${!cameraOn ? "hidden" : ""}`}
          />
        )}

        {!cameraOn && (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            {user?.avatarImageUrl && (
              <>
                <div className="absolute inset-0 z-0 bg-neutral-900" />
                <img
                  src={user.avatarImageUrl}
                  alt=""
                  className="absolute inset-0 z-0 h-full w-full object-cover blur-[40px] scale-125 opacity-60"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.previousSibling.style.display = "none"
                  }}
                />
              </>
            )}
            <div className="relative z-10 flex items-center justify-center">
              <Avatar
                size={64}
                src={user?.avatarImageUrl}
                alt={user?.username || "User"}
                name={user?.fullName || user?.username || "User"}
                className={`md:!w-24 md:!h-24 ${user?.avatarImageUrl ? "shadow-xl" : ""}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="flex flex-row gap-3">
        <button
          onClick={onToggleMic}
          className={`border border-[#e5e5e5] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
            micOn
              ? "bg-cath-red-700 text-white hover:bg-[#7a000e]"
              : "bg-white hover:bg-[#E5E5E5]"
          }`}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>

        <button
          onClick={onToggleCam}
          className={`border border-[#e5e5e5] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
            cameraOn
              ? "bg-cath-red-700 text-white hover:bg-[#7a000e]"
              : "bg-white hover:bg-[#E5E5E5]"
          }`}
        >
          {cameraOn ? <Video /> : <VideoOff />}
        </button>

        <button
          onClick={onOpenBgModal}
          title={
            t?.rooms?.waitingScreen?.changeBackground || "Change Background"
          }
          className={`border border-[#e5e5e5] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 bg-white text-gray-700 hover:bg-[#E5E5E5]`}
        >
          <Image />
        </button>

        <button
          onClick={onOpenSettings}
          title={t?.rooms?.waitingScreen?.deviceSettings || "Device Settings"}
          className={`border border-[#e5e5e5] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 bg-white text-gray-700 hover:bg-[#E5E5E5]`}
        >
          <Settings />
        </button>
      </div>
    </div>
  )
}

export default VideoPreview
