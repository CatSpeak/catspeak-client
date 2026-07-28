import React from "react"
import { X, RotateCw } from "lucide-react"
import { getFileIcon } from "@/features/courses/components/lecture-hall/utils/fileUtils"
import ListItem from "@/shared/components/ui/ListItem"
import ProgressBar from "@/shared/components/ui/ProgressBar"
import { IconButton } from "@/shared/components/ui/buttons"

/**
 * MediaUploadBubble — renders a pending/uploading media card in the chat stream.
 * Styled identically to MediaAttachment.jsx's attachment card with ProgressBar replacing file size.
 */
const MediaUploadBubble = ({ pendingUpload, onRetry, onCancel }) => {
  if (!pendingUpload) return null

  const {
    fileName = "Attachment",
    status = "uploading",
    progress = 100,
    errorMsg = null,
  } = pendingUpload

  const isUploading = status === "uploading"
  const isError = status === "error"

  return (
    <div className="mt-3 flex flex-col gap-1 items-end group relative w-full">
      <div className="flex flex-col w-full max-w-[360px]">
        <ListItem
          lines={2}
          className={`bg-[#F3F3F3] rounded-2xl overflow-hidden text-left`}
          leftContent={getFileIcon(fileName)}
          rightContent={
            <div className="flex items-center gap-1">
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
            <ProgressBar progress={progress} />
          ) : isError ? (
            <p className="text-sm text-red-500 font-semibold truncate">
              {errorMsg || "Upload failed"}
            </p>
          ) : null}
        </ListItem>
      </div>
    </div>
  )
}

export default MediaUploadBubble
