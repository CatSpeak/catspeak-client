import React from "react"
import { UploadCloud, AlertCircle } from "lucide-react"
import { useCreateReelContext } from "../../../contexts/CreateReelContext"

export const VideoUploadStep = () => {
  const {
    t,
    isVideoDragging,
    handleVideoDrag,
    handleVideoDrop,
    videoInputRef,
    handleVideoSelect,
    validationErrors,
  } = useCreateReelContext()

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragEnter={handleVideoDrag}
        onDragOver={handleVideoDrag}
        onDragLeave={handleVideoDrag}
        onDrop={handleVideoDrop}
        onClick={() => videoInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl h-[360px] cursor-pointer transition-all duration-300 ${
          isVideoDragging
            ? "border-cath-red-700 bg-red-50/30 scale-[0.99] shadow-inner"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          ref={videoInputRef}
          onChange={(e) => handleVideoSelect(e.target.files?.[0])}
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          className="hidden"
        />

        <div className="p-4 bg-white rounded-full shadow-md text-gray-400 mb-4 transition-transform hover:scale-105">
          <UploadCloud size={36} className="text-cath-red-700" />
        </div>

        <p className="font-bold text-sm text-gray-700 text-center px-4">
          {t.catSpeak?.reels?.dragDropVideo || "Drag and drop your video here to upload"}
        </p>
        <p className="text-xs text-gray-400 text-center mt-1 px-4">
          {t.catSpeak?.reels?.clickToBrowse || "or click to browse files"}
        </p>

        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 text-[10px] text-gray-400">
          <span>{t.catSpeak?.reels?.formatLimit || "MP4, WebM or MOV"}</span>
          <span>•</span>
          <span>{t.catSpeak?.reels?.sizeLimit || "Max 5 mins, 150MB"}</span>
        </div>
      </div>

      {validationErrors.video && (
        <span className="text-xs text-red-500 flex items-center gap-1 mt-1 font-semibold">
          <AlertCircle size={12} />
          {validationErrors.video}
        </span>
      )}
    </div>
  )
}
