import React from "react";
import { Mic, MicOff, Video, VideoOff, Image, Settings } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import Avatar from "@/shared/components/ui/Avatar";

const VideoPreview = ({
  localStream,
  micOn,
  cameraOn,
  user,
  onToggleMic,
  onToggleCam,
  onOpenBgModal,
  onOpenSettings,
}) => {
  const { t } = useLanguage();
  return (
    <div className="relative w-full max-w-3xl h-[269px] flex flex-col items-center rounded-2xl border border-[#F5F5F5] bg-[#FCFCFC]">
      <div className="py-2 relative w-full h-[190px] aspect-video overflow-hidden mt-4">
        {/* Video Preview */}
        {localStream && (
          <video
            ref={(video) => {
              if (video) {
                video.srcObject = localStream;
                if (micOn) video.muted = true; // Mute local preview to prevent echo
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
              name={user?.fullName || user?.username || "User"}
              className="md:!w-24 md:!h-24"
            />
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="flex flex-row gap-3 min-[426px]:absolute min-[426px]:bottom-4 min-[426px]:left-1/2 min-[426px]:z-10 min-[426px]:-translate-x-1/2 min-[426px]:mt-0">
        <button
          onClick={onToggleMic}
          className={`border border-[#e5e5e5] flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ${
            micOn
              ? "bg-cath-red-700 text-white hover:bg-[#7a000e]"
              : "bg-white hover:bg-[#E5E5E5]"
          }`}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>

        <button
          onClick={onToggleCam}
          className={`border border-[#e5e5e5] flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ${
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
          className={`border border-[#e5e5e5] flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 bg-white text-gray-700 hover:bg-[#E5E5E5]`}
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
  );
};

export default VideoPreview;
