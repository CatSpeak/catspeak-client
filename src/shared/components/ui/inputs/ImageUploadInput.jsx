import React, { useState, useEffect, useRef } from "react"
import { Upload, Trash2, UploadCloud } from "lucide-react"
import { toast } from "react-hot-toast"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import MediaViewerModal from "@/shared/components/ui/MediaViewerModal"

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const ImageUploadInput = ({
  label,
  value,
  onChange,
  disabled = false,
  uploadText = "Upload Image",
  dragDropText = "Drag & drop thumbnail image here",
  hintText = "PNG, JPG, WEBP up to 5MB",
  changeText = "Change",
  removeText = "Remove",
  accept = "image/*",
  maxSizeMB = 5,
  fullAspect = false,
  className = "",
}) => {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fileInputRef = useRef(null)

  // Handle preview generation & cleanup
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null)
      setIsFullscreen(false)
      return
    }

    if (value instanceof File) {
      const url = URL.createObjectURL(value)
      setPreviewUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    } else if (typeof value === "string") {
      setPreviewUrl(value)
    }
  }, [value])

  const handleFileSelect = (file) => {
    if (!file) return

    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      toast.error(
        `File size (${fileSizeMB} MB) exceeds the ${maxSizeMB} MB limit.`,
      )
      return
    }

    onChange?.(file)
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = (e) => {
    e?.stopPropagation()
    onChange?.(null)
    setIsDragging(false)
    setIsFullscreen(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file)
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label>{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Hero / Full Aspect 16:9 Dropzone Mode */}
      {fullAspect ? (
        !previewUrl ? (
          <div
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center text-center p-6 rounded-xl border-2 border-dashed aspect-video w-full max-sm:aspect-auto max-sm:flex-1 min-h-[240px] sm:min-h-[280px] cursor-pointer ${
              isDragging
                ? "border-cath-red-700 bg-red-50/40 scale-[0.99]"
                : "border-[#e5e5e5] bg-gray-50/60 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <UploadCloud className="w-12 h-12 mb-4 text-gray-400" />

            <p className="text-lg font-semibold text-gray-800 mb-1">
              {dragDropText}
            </p>
            <p className="text-sm text-[#606060] max-w-[360px] mb-4">
              {hintText}
            </p>

            <PillButton
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              disabled={disabled}
              startIcon={<Upload size={16} />}
            >
              {uploadText}
            </PillButton>
          </div>
        ) : (
          <div
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-xl overflow-hidden border aspect-video w-full max-sm:aspect-auto max-sm:flex-1 min-h-[240px] sm:min-h-[280px] bg-gray-900 ${
              isDragging
                ? "border-cath-red-700 ring-2 ring-cath-red-700/20"
                : "border-[#e5e5e5]"
            }`}
          >
            {/* Blurred Backdrop Image */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center blur-2xl opacity-60 scale-110"
              style={{ backgroundImage: `url(${previewUrl})` }}
            />

            {/* Main Preview Image */}
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              onClick={() => setIsFullscreen(true)}
              className="relative z-10 w-full h-full object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
              title="Click to view full image"
            />

            {/* Bottom Actions Overlay */}
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
              <PillButton
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                startIcon={<Upload />}
              >
                {changeText}
              </PillButton>
              <PillButton
                type="button"
                variant="secondary"
                onClick={handleRemove}
                disabled={disabled}
                startIcon={<Trash2 />}
              >
                {removeText}
              </PillButton>
            </div>
          </div>
        )
      ) : /* Compact Mode */
      !previewUrl ? (
        <div
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border-2 border-dashed ${
            isDragging
              ? "border-cath-red-700 bg-red-50/40 scale-[0.99]"
              : "border-[#e5e5e5] bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-gray-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-gray-800">
                {dragDropText}
              </span>
              <span className="text-xs text-[#606060]">{hintText}</span>
            </div>
          </div>

          <PillButton
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            startIcon={<Upload size={16} />}
          >
            {uploadText}
          </PillButton>
        </div>
      ) : (
        <div
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-xl border ${
            isDragging
              ? "border-cath-red-700 bg-red-50/30 ring-2 ring-cath-red-700/20"
              : "border-[#e5e5e5] bg-gray-50"
          }`}
        >
          {/* Local Image Preview */}
          <div className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden border border-[#e5e5e5] bg-gray-900 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              onClick={() => setIsFullscreen(true)}
              className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
              title="Click to view full image"
            />
          </div>

          {/* File Info & Action Buttons */}
          <div className="flex flex-1 flex-col justify-between gap-2 overflow-hidden w-full">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {value instanceof File ? value.name : "Uploaded Image"}
              </span>
              {value instanceof File && (
                <span className="text-xs text-gray-500">
                  {formatFileSize(value.size)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <PillButton
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                startIcon={<Upload size={14} />}
              >
                {changeText}
              </PillButton>
              <PillButton
                type="button"
                variant="secondary"
                onClick={handleRemove}
                disabled={disabled}
                startIcon={<Trash2 size={14} />}
              >
                {removeText}
              </PillButton>
            </div>
          </div>
        </div>
      )}

      {/* Shared Reusable Fullscreen Media Viewer Modal */}
      {isFullscreen && (
        <MediaViewerModal
          media={previewUrl}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </div>
  )
}

export default ImageUploadInput
