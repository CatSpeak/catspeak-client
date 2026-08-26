import React from "react"
import { X } from "lucide-react"
import LocalVideoPreview from "./LocalVideoPreview"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import FileAttachmentItem from "@/shared/components/ui/FileAttachmentItem"

const PreviewItem = ({ item, onRemove }) => {
  const { type, url, fileName, fileSize } = item

  if (type === "Image") {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-gray-50 flex items-center justify-center min-h-[180px] shrink-0">
        <img
          src={url}
          alt={fileName || "preview"}
          className="w-full max-h-[300px] object-contain"
        />
        <IconButton
          onClick={onRemove}
          variant="overlay"
          size="sm"
          className="absolute top-3 right-3 z-10"
        >
          <X />
        </IconButton>
      </div>
    )
  }

  if (type === "Video") {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-gray-50 min-h-[180px] shrink-0">
        <LocalVideoPreview url={url} />
        <IconButton
          onClick={onRemove}
          variant="overlay"
          size="sm"
          className="absolute top-3 right-3 z-10"
        >
          <X />
        </IconButton>
      </div>
    )
  }

  // Document / generic file attachment
  return (
    <FileAttachmentItem
      fileName={fileName}
      fileSize={fileSize}
      rightAction={
        <IconButton
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="shrink-0"
        >
          <X />
        </IconButton>
      }
    />
  )
}

const PostEditorPreviews = ({
  files = [],
  existingMedias = [],
  removeFile,
  removeExistingMedia,
}) => {
  if (files.length === 0 && existingMedias.length === 0) return null

  // Normalize server-saved media and local newly uploaded files into a unified structure
  const normalizedItems = [
    ...existingMedias.map((media) => ({
      id: `existing-${media.postMediaId}`,
      type: media.mediaType,
      url: media.mediaUrl,
      fileName: media.fileName || "Tài liệu",
      fileSize: media.fileSize,
      onRemove: () => removeExistingMedia(media.postMediaId),
    })),
    ...files.map((item, index) => ({
      id: `new-${index}`,
      type: item.type,
      url: item.previewUrl,
      fileName: item.file?.name || "Tài liệu",
      fileSize: item.file?.size,
      onRemove: () => removeFile(index),
    })),
  ]

  return (
    <div className="flex flex-col gap-4">
      {normalizedItems.map((item) => (
        <PreviewItem key={item.id} item={item} onRemove={item.onRemove} />
      ))}
    </div>
  )
}

export default PostEditorPreviews
