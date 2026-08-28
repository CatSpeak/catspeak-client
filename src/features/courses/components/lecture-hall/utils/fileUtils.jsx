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
export const getFileStyle = (fileName) => {
  if (!fileName) {
    return { bg: "bg-gray-500", label: "FILE" }
  }
  const ext = fileName.split(".").pop().toLowerCase()
  const label = ext.substring(0, 4).toUpperCase()

  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
    return { bg: "bg-[#F59E0B]", label } // amber-500
  }
  if (["pdf"].includes(ext)) {
    return { bg: "bg-[#DC2626]", label } // red-600
  }
  if (["doc", "docx"].includes(ext)) {
    return { bg: "bg-[#2563EB]", label } // blue-600
  }
  if (["pptx", "ppt"].includes(ext)) {
    return { bg: "bg-[#F97316]", label } // orange-500
  }
  if (["xlsx", "xls", "csv"].includes(ext)) {
    return { bg: "bg-[#16A34A]", label } // green-600
  }
  return { bg: "bg-gray-500", label }
}

export const getFileIcon = (fileName) => {
  if (!fileName) return <FileText size={20} className="text-gray-500" />
  const ext = fileName.split(".").pop().toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
    return <ImageIcon size={20} className="text-[#F59E0B]" />
  }
  if (["pdf"].includes(ext)) {
    return <FileText size={20} className="text-[#DC2626]" />
  }
  if (["doc", "docx"].includes(ext)) {
    return <FileText size={20} className="text-[#2563EB]" />
  }
  if (["pptx", "ppt"].includes(ext)) {
    return <FileText size={20} className="text-[#F97316]" />
  }
  if (["xlsx", "xls", "csv"].includes(ext)) {
    return <FileText size={20} className="text-[#16A34A]" />
  }
  return <FileText size={20} className="text-gray-500" />
}

export const MAX_MATERIAL_SIZE = 50 * 1024 * 1024
export const MATERIAL_EXTENSIONS = new Set(["pdf", "docx", "jpg", "png"])

export const getMaterialExtension = (fileName) => {
  if (typeof fileName !== "string") return ""
  const dotIndex = fileName.lastIndexOf(".")
  return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : ""
}

export const getMaterialValidationError = (file) => {
  if (!file || typeof file.name !== "string") return "invalid"

  const size = Number(file.size)
  if (!Number.isFinite(size) || size <= 0) return "empty"
  if (size > MAX_MATERIAL_SIZE) return "size"
  if (!MATERIAL_EXTENSIONS.has(getMaterialExtension(file.name))) {
    return "type"
  }

  return null
}

export const getFileFingerprint = (file) => {
  return `${String(file?.name || "").toLowerCase()}-${Number(file?.size) || 0}-${Number(file?.lastModified) || 0}`
}
