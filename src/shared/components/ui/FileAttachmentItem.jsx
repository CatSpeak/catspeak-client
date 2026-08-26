import React from "react"
import { FileText } from "lucide-react"
import ListItem from "@/shared/components/ui/ListItem"

export const formatFileSize = (bytes) => {
  if (!bytes || typeof bytes !== "number") return null
  const mb = bytes / (1024 * 1024)
  if (mb < 0.1) {
    const kb = bytes / 1024
    return `${kb.toFixed(1)} KB`
  }
  return `${mb.toFixed(2)} MB`
}

const FileAttachmentItem = ({
  fileName = "Tài liệu",
  fileSize,
  rightAction,
  className = "",
  ...props
}) => {
  return (
    <ListItem
      lines={2}
      className={`rounded-xl border border-border bg-white ${className}`}
      leftContent={<FileText className="shrink-0" />}
      rightContent={rightAction}
      {...props}
    >
      <span className="text-black truncate">{fileName}</span>
      {fileSize ? (
        <span className="text-sm text-secondary">
          {formatFileSize(fileSize)}
        </span>
      ) : null}
    </ListItem>
  )
}

export default FileAttachmentItem
