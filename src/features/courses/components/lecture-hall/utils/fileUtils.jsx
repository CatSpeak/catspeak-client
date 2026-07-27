import React from "react"
import { FileText, Image as ImageIcon, FileCode, File as FileIcon } from "lucide-react"

// Helper function to format file sizes cleanly
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Helper function to resolve dynamic file icon based on file extension
export const getFileIcon = (fileName) => {
  if (!fileName) return <FileText size={20} className="text-[#72000d]" />
  const ext = fileName.split(".").pop().toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
    return <ImageIcon size={20} className="text-amber-600" />
  }
  if (["pdf", "doc", "docx"].includes(ext)) {
    return <FileText size={20} className="text-[#72000d]" />
  }
  if (["pptx", "ppt", "xlsx", "xls"].includes(ext)) {
    return <FileCode size={20} className="text-blue-600" />
  }
  if (["js", "ts", "json", "html", "css"].includes(ext)) {
    return <FileCode size={20} className="text-blue-600" />
  }
  return <FileIcon size={20} className="text-gray-600" />
}
