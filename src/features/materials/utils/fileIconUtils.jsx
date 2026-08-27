import React from "react"
import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  FileSpreadsheet,
} from "lucide-react"

/**
 * Returns a colorful icon component based on the file extension.
 *
 * @param {string} fileName - The file name or URL
 * @param {string} [url] - Optional file URL fallback
 * @param {string} [customClass] - Optional extra CSS classes
 * @returns {JSX.Element}
 */
export const getFileTypeIcon = (fileName = "", url = "", customClass = "") => {
  const name = fileName || url || ""
  const ext = name.includes(".")
    ? name.split(".").pop().toLowerCase().split("?")[0]
    : ""

  const baseClass = "shrink-0"
  const classes = customClass ? `${baseClass} ${customClass}` : baseClass

  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    return <ImageIcon className={`text-rose-500 ${classes}`} />
  }
  if (["mp4", "webm", "ogg", "mov", "mkv"].includes(ext)) {
    return <Film className={`text-purple-500 ${classes}`} />
  }
  if (["mp3", "wav", "m4a", "flac"].includes(ext)) {
    return <Music className={`text-amber-500 ${classes}`} />
  }
  if (ext === "pdf") {
    return <FileText className={`text-red-500 ${classes}`} />
  }
  if (["doc", "docx"].includes(ext)) {
    return <FileText className={`text-blue-600 ${classes}`} />
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className={`text-emerald-600 ${classes}`} />
  }
  if (["ppt", "pptx"].includes(ext)) {
    return <FileText className={`text-orange-500 ${classes}`} />
  }
  return <FileText className={`text-gray-500 ${classes}`} />
}
