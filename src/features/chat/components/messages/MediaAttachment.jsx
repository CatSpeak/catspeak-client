import React from "react"
import { FileIcon } from "lucide-react"
import ListItem from "@/shared/components/ui/ListItem"

/**
 * MediaAttachment — renders image previews, inline video players, or document file attachment cards.
 *
 * @param {string}  mediaUrl    - URL of media/file
 * @param {string}  messageType - Type of message ("Image", "Video", "File", etc.)
 * @param {string}  fileName    - Optional explicit filename
 * @param {number}  fileSize    - Optional explicit file size in bytes
 * @param {object}  message     - Raw message object (fallback for fileSize / size)
 * @param {boolean} isOwn       - Whether bubble belongs to local user
 */
const MediaAttachment = ({
  mediaUrl,
  messageType,
  fileName,
  fileSize,
  message,
  isOwn = false,
  hasCaption = false,
}) => {
  if (!mediaUrl) return null

  const msgTypeLower = String(messageType || "").toLowerCase()

  const isImage =
    Boolean(mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) ||
    ["image", "media", "picture", "photo", "1"].includes(msgTypeLower)

  const isVideo =
    !isImage &&
    (Boolean(mediaUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i)) ||
      ["video"].includes(msgTypeLower))

  const getDisplayName = () => {
    if (fileName) return fileName
    try {
      const urlPath = mediaUrl.split("?")[0]
      const name = urlPath.substring(urlPath.lastIndexOf("/") + 1)
      return decodeURIComponent(name) || "Attachment"
    } catch {
      return "Attachment"
    }
  }

  const displayName = getDisplayName()

  const rawSize = fileSize ?? message?.fileSize ?? message?.size
  const parsedSize =
    rawSize != null && !isNaN(Number(rawSize)) && Number(rawSize) > 0
      ? Number(rawSize)
      : null

  const handleDownload = async (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    try {
      const response = await fetch(mediaUrl)
      if (!response.ok) throw new Error("Fetch failed")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = displayName || "attachment"
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      window.open(mediaUrl, "_blank")
    }
  }

  const roundedClass = hasCaption
    ? "rounded-t-2xl rounded-b-none"
    : "rounded-2xl"

  return (
    <div className="w-full max-w-[360px]">
      {isImage ? (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={mediaUrl}
            alt={displayName}
            className={`${roundedClass} max-h-60 object-cover w-full cursor-pointer block`}
          />
        </a>
      ) : isVideo ? (
        /* Inline video player — natural aspect ratio, capped at max-h-60 */
        <video
          src={mediaUrl}
          controls
          playsInline
          className={`${roundedClass} max-h-60 w-full bg-black block`}
        />
      ) : (
        /* Document / file attachment card */
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={displayName}
          onClick={handleDownload}
          className="block no-underline w-full cursor-pointer"
        >
          <ListItem
            lines={2}
            className={`bg-[#F3F3F3] ${roundedClass} overflow-hidden text-left`}
            leftContent={<FileIcon />}
          >
            <p className="font-semibold truncate m-0">{displayName}</p>
            {parsedSize ? (
              <p className="text-sm text-[#606060] m-0">
                {parsedSize >= 1024 * 1024
                  ? `${(parsedSize / (1024 * 1024)).toFixed(1)} MB`
                  : `${(parsedSize / 1024).toFixed(1)} KB`}
              </p>
            ) : (
              displayName.includes(".") && (
                <p className="text-xs text-[#606060] m-0 uppercase">
                  {displayName.split(".").pop()} File
                </p>
              )
            )}
          </ListItem>
        </a>
      )}
    </div>
  )
}

export default MediaAttachment
