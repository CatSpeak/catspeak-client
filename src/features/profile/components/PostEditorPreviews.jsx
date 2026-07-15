import React from "react"
import { X, FileText } from "lucide-react"
import LocalVideoPreview from "./LocalVideoPreview"

const PostEditorPreviews = ({
  files,
  existingMedias,
  removeFile,
  removeExistingMedia,
}) => {
  if (files.length === 0 && existingMedias.length === 0) return null

  return (
    <div className="flex flex-col gap-4 pr-1">
      {/* Render existing attachments */}
      {existingMedias.map((media) => {
        if (media.mediaType === "Image") {
          return (
            <div
              key={`existing-${media.postMediaId}`}
              className="relative w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[180px] shrink-0"
            >
              <img
                src={media.mediaUrl}
                alt="preview"
                className="w-full max-h-[300px] object-contain"
              />
              <button
                type="button"
                onClick={() => removeExistingMedia(media.postMediaId)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors z-10 border-none outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        } else if (media.mediaType === "Video") {
          return (
            <div
              key={`existing-${media.postMediaId}`}
              className="relative w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 min-h-[180px] shrink-0"
            >
              <LocalVideoPreview url={media.mediaUrl} />
              <button
                type="button"
                onClick={() => removeExistingMedia(media.postMediaId)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors z-10 border-none outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        } else {
          return (
            <div
              key={`existing-${media.postMediaId}`}
              className="relative w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[60px] shrink-0"
            >
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-white w-full">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <FileText className="w-6 h-6 text-blue-500 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-700 truncate">
                      {media.fileName || "Tài liệu"}
                    </span>
                    {media.fileSize && (
                      <span className="text-xs text-gray-400 mt-0.5">
                        {(media.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeExistingMedia(media.postMediaId)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors z-10 border-none outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        }
      })}

      {/* Render new attachments */}
      {files.map((item, index) => {
        const file = item.file
        const url = item.previewUrl
        const type = item.type

        if (type === "Image") {
          return (
            <div
              key={`new-${index}`}
              className="relative w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[180px] shrink-0"
            >
              <img
                src={url}
                alt="preview"
                className="w-full max-h-[300px] object-contain"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors z-10 border-none outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        } else if (type === "Video") {
          return (
            <div
              key={`new-${index}`}
              className="relative w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 min-h-[180px] shrink-0"
            >
              <LocalVideoPreview url={url} />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors z-10 border-none outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        } else {
          return (
            <div
              key={`new-${index}`}
              className="relative w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[60px] shrink-0"
            >
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-white w-full">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <FileText className="w-6 h-6 text-blue-500 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-700 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors z-10 border-none outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        }
      })}
    </div>
  )
}

export default PostEditorPreviews
