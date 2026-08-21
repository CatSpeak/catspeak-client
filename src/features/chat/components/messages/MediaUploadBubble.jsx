import React from "react"
import { X, RotateCw, Loader2 } from "lucide-react"
import { getFileIcon } from "@/features/courses/components/lecture-hall/utils/fileUtils"
import ListItem from "@/shared/components/ui/ListItem"
import { IconButton } from "@/shared/components/ui/buttons"

/**
 * MediaUploadBubble — renders a pending/uploading media card in the chat stream.
 * Displays "Đang gửi..." with a spinning loading indicator during upload.
 */
const MediaUploadBubble = ({ pendingUpload, onRetry, onCancel }) => {
  if (!pendingUpload) return null

  const {
    fileName = "Attachment",
    status = "uploading",
    errorMsg = null,
  } = pendingUpload

  const isUploading = status === "uploading"
  const isError = status === "error"

  return (
    <div className="mt-3 flex flex-col gap-1 items-end group relative w-full">
      <div className="flex flex-col w-full max-w-[360px]">
        <ListItem
          lines={2}
          className="bg-primaryBg rounded-2xl overflow-hidden text-left"
          leftContent={getFileIcon(fileName)}
          rightContent={
            <div className="flex items-center gap-1">
              {isUploading && (
                <div className="p-2 text-[#990011]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}

              {isError && onRetry && (
                <IconButton
                  type="button"
                  onClick={onRetry}
                  title="Retry upload"
                  variant="ghost"
                >
                  <RotateCw />
                </IconButton>
              )}

              {onCancel && (
                <IconButton
                  type="button"
                  onClick={onCancel}
                  title={isUploading ? "Cancel upload" : "Dismiss"}
                  variant="ghost"
                >
                  <X />
                </IconButton>
              )}
            </div>
          }
        >
          <p className="font-semibold truncate m-0">{fileName}</p>

          {isUploading ? (
            <p className="text-xs text-[#606060] m-0">Đang gửi...</p>
          ) : isError ? (
            <p className="text-sm text-red-500 font-semibold truncate m-0">
              {errorMsg || "Upload failed"}
            </p>
          ) : null}
        </ListItem>
      </div>
    </div>
  )
}

export default MediaUploadBubble
