import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  Crop as CropIcon,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import useScrollLock from "@/shared/hooks/useScrollLock"

// eslint-disable-next-line react-refresh/only-export-components
export const CROP_PRESETS = {
  avatar: { key: "avatar", label: "Avatar (1:1)", aspect: 1 },
  square: { key: "square", label: "Square (1:1)", aspect: 1 },
  thumbnail: { key: "thumbnail", label: "Thumbnail (16:9)", aspect: 16 / 9 },
  banner: { key: "banner", label: "Banner (3.2:1)", aspect: 16 / 5 },
  story: { key: "story", label: "Story (9:16)", aspect: 9 / 16 },
  portrait: { key: "portrait", label: "Portrait (4:5)", aspect: 4 / 5 },
  classic: { key: "classic", label: "Classic (4:3)", aspect: 4 / 3 },
  free: { key: "free", label: "Free", aspect: null },
}

/**
 * Helper to normalize preset into aspect ratio value
 */
const resolveAspect = (preset, customAspect) => {
  if (typeof customAspect === "number" && !isNaN(customAspect) && customAspect > 0) {
    return customAspect
  }
  if (typeof preset === "number" && !isNaN(preset) && preset > 0) {
    return preset
  }
  if (typeof preset === "string" && CROP_PRESETS[preset.toLowerCase()]) {
    return CROP_PRESETS[preset.toLowerCase()].aspect
  }
  return 1 // Default 1:1 if not found
}

const fileObjectUrlRegistry = new Map()

const acquireFileObjectUrl = (file) => {
  if (!(file instanceof File || file instanceof Blob)) return null
  let entry = fileObjectUrlRegistry.get(file)
  if (!entry) {
    entry = { url: URL.createObjectURL(file), refCount: 0 }
    fileObjectUrlRegistry.set(file, entry)
  }
  entry.refCount += 1
  return entry.url
}

const releaseFileObjectUrl = (file) => {
  if (!(file instanceof File || file instanceof Blob)) return
  const entry = fileObjectUrlRegistry.get(file)
  if (!entry) return
  entry.refCount -= 1
  if (entry.refCount <= 0) {
    URL.revokeObjectURL(entry.url)
    fileObjectUrlRegistry.delete(file)
  }
}

const ImageCropModal = ({
  image,
  isOpen = true,
  onClose,
  onCropComplete,
  cropPreset = "avatar",
  aspect: aspectOverride,
  allowedAspects,
  title = "Crop Image",
  outputType = "image/jpeg",
  outputQuality = 0.92,
}) => {
  useScrollLock(isOpen && !!image)

  const originalFile =
    image instanceof File || image instanceof Blob ? image : null

  const [prevImage, setPrevImage] = useState(image)
  const [imageUrl, setImageUrl] = useState(() => {
    if (image instanceof File || image instanceof Blob) {
      return acquireFileObjectUrl(image)
    }
    return typeof image === "string" ? image : null
  })

  // Synchronize imageUrl state during render when image prop changes
  if (image !== prevImage) {
    if (prevImage instanceof File || prevImage instanceof Blob) {
      releaseFileObjectUrl(prevImage)
    }
    setPrevImage(image)
    if (image instanceof File || image instanceof Blob) {
      setImageUrl(acquireFileObjectUrl(image))
    } else if (typeof image === "string") {
      setImageUrl(image)
    } else {
      setImageUrl(null)
    }
  }

  // Release object URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (image instanceof File || image instanceof Blob) {
        releaseFileObjectUrl(image)
      }
    }
  }, [image])

  // Current active aspect ratio state
  const [prevCropPreset, setPrevCropPreset] = useState(cropPreset)
  const [prevAspectOverride, setPrevAspectOverride] = useState(aspectOverride)
  const [selectedPresetKey, setSelectedPresetKey] = useState(() => {
    if (typeof cropPreset === "string" && CROP_PRESETS[cropPreset]) {
      return cropPreset
    }
    return "custom"
  })

  const [activeAspect, setActiveAspect] = useState(() =>
    resolveAspect(cropPreset, aspectOverride),
  )

  // Synchronize aspect state during render when aspect props change
  if (cropPreset !== prevCropPreset || aspectOverride !== prevAspectOverride) {
    setPrevCropPreset(cropPreset)
    setPrevAspectOverride(aspectOverride)
    setActiveAspect(resolveAspect(cropPreset, aspectOverride))
    if (typeof cropPreset === "string" && CROP_PRESETS[cropPreset]) {
      setSelectedPresetKey(cropPreset)
    } else {
      setSelectedPresetKey("custom")
    }
  }

  // Image & Canvas state
  const [imageObj, setImageObj] = useState(null)
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [cropBoxScale, setCropBoxScale] = useState(1) // Scale factor for crop box relative to max image bounds (0.15 to 1.0)

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    startScale: 1,
    center: { x: 0, y: 0 },
  })

  const containerRef = useRef(null)
  const viewportRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 700, height: 480 })

  // Synchronize imageObj reset during render when imageUrl changes
  const [prevImageUrl, setPrevImageUrl] = useState(imageUrl)
  if (imageUrl !== prevImageUrl) {
    setPrevImageUrl(imageUrl)
    setImageObj(null)
  }

  useEffect(() => {
    if (!isOpen) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        setContainerSize({ width, height })
      }
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [isOpen])

  const [loadError, setLoadError] = useState(null)

  // Synchronize loadError reset during render when imageUrl changes
  const [prevLoadedUrl, setPrevLoadedUrl] = useState(imageUrl)
  if (imageUrl !== prevLoadedUrl) {
    setPrevLoadedUrl(imageUrl)
    setLoadError(null)
  }

  // Load Image Object for Canvas rendering
  useEffect(() => {
    if (!imageUrl) return

    let isMounted = true
    const img = new Image()

    if (typeof imageUrl === "string" && /^https?:\/\//i.test(imageUrl)) {
      img.crossOrigin = "anonymous"
    }

    img.onload = () => {
      if (!isMounted) return
      setImageObj(img)
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      // Reset transformations on new image
      setZoom(1)
      setRotation(0)
      setFlipH(false)
      setFlipV(false)
      setOffset({ x: 0, y: 0 })
      setCropBoxScale(1)
    }

    img.onerror = (err) => {
      if (!isMounted) return
      console.error("Failed to load image in ImageCropModal:", imageUrl, err)
      if (img.crossOrigin) {
        const retryImg = new Image()
        retryImg.onload = () => {
          if (!isMounted) return
          setImageObj(retryImg)
          setImgDimensions({
            width: retryImg.naturalWidth,
            height: retryImg.naturalHeight,
          })
        }
        retryImg.onerror = (retryErr) => {
          if (!isMounted) return
          console.error(
            "Retry without crossOrigin also failed in ImageCropModal:",
            imageUrl,
            retryErr,
          )
          setLoadError(
            "This image couldn't be loaded. It may be unavailable or blocked by the source server.",
          )
        }
        retryImg.src = imageUrl
      } else {
        setLoadError(
          "This image couldn't be loaded. It may be unavailable or in an unsupported format.",
        )
      }
    }

    img.src = imageUrl

    return () => {
      isMounted = false
    }
  }, [imageUrl])

  const viewMetrics = useMemo(() => {
    if (
      !imgDimensions.width ||
      !imgDimensions.height ||
      !containerSize.width ||
      !containerSize.height
    ) {
      return {
        dispW: 0,
        dispH: 0,
        dispEffectiveW: 0,
        dispEffectiveH: 0,
        maxCropW: 0,
        maxCropH: 0,
        cropW: 0,
        cropH: 0,
        maxOffsetX: 0,
        maxOffsetY: 0,
        minScale: 0.15,
      }
    }

    const isRotated90 = (rotation / 90) % 2 !== 0
    const effectiveW = isRotated90 ? imgDimensions.height : imgDimensions.width
    const effectiveH = isRotated90 ? imgDimensions.width : imgDimensions.height

    // Full edge-to-edge contain fitting within viewport container
    const maxAvailableW = containerSize.width
    const maxAvailableH = containerSize.height

    // Fit full image within container view at zoom = 1
    const scaleToFitContainer = Math.min(
      maxAvailableW / effectiveW,
      maxAvailableH / effectiveH,
    )

    const dispEffectiveW = effectiveW * scaleToFitContainer
    const dispEffectiveH = effectiveH * scaleToFitContainer

    const dispW = isRotated90 ? dispEffectiveH : dispEffectiveW
    const dispH = isRotated90 ? dispEffectiveW : dispEffectiveH

    const targetAspect = activeAspect || dispEffectiveW / dispEffectiveH
    const imageAspect = dispEffectiveW / dispEffectiveH

    let maxCropW, maxCropH
    if (imageAspect > targetAspect) {
      maxCropH = dispEffectiveH
      maxCropW = maxCropH * targetAspect
    } else {
      maxCropW = dispEffectiveW
      maxCropH = maxCropW / targetAspect
    }

    const minScale = Math.max(0.15, Math.min(50 / maxCropW, 50 / maxCropH))
    const effectiveCropScale = Math.min(1, Math.max(minScale, cropBoxScale))

    const cropW = maxCropW * effectiveCropScale
    const cropH = maxCropH * effectiveCropScale

    const scaledEffectiveW = dispEffectiveW * zoom
    const scaledEffectiveH = dispEffectiveH * zoom

    const maxOffsetX = Math.max(0, (scaledEffectiveW - cropW) / 2)
    const maxOffsetY = Math.max(0, (scaledEffectiveH - cropH) / 2)

    return {
      dispW,
      dispH,
      dispEffectiveW,
      dispEffectiveH,
      maxCropW,
      maxCropH,
      cropW,
      cropH,
      maxOffsetX,
      maxOffsetY,
      minScale,
      maxAvailableW,
      maxAvailableH,
    }
  }, [imgDimensions, containerSize, rotation, activeAspect, zoom, cropBoxScale])

  // Keep offset clamped strictly within image boundaries when view metrics change
  const clampedOffsetX = Math.max(
    -viewMetrics.maxOffsetX,
    Math.min(viewMetrics.maxOffsetX, offset.x),
  )
  const clampedOffsetY = Math.max(
    -viewMetrics.maxOffsetY,
    Math.min(viewMetrics.maxOffsetY, offset.y),
  )
  if (clampedOffsetX !== offset.x || clampedOffsetY !== offset.y) {
    setOffset({ x: clampedOffsetX, y: clampedOffsetY })
  }

  // Handle Image Dragging
  const handlePointerDown = (e) => {
    if (isResizing) return
    setIsDragging(true)
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y })
  }

  // Handle Resizing Crop Box via Corner Drag Handles
  const handleResizePointerDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0

    let centerX = 0
    let centerY = 0
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      centerX = rect.left + rect.width / 2
      centerY = rect.top + rect.height / 2
    }

    setResizeStart({
      x: clientX,
      y: clientY,
      startScale: cropBoxScale,
      center: { x: centerX, y: centerY },
    })
  }

  const handlePointerMove = useCallback(
    (e) => {
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0

      if (isResizing) {
        const startDist = Math.hypot(
          resizeStart.x - resizeStart.center.x,
          resizeStart.y - resizeStart.center.y,
        )
        const currentDist = Math.hypot(
          clientX - resizeStart.center.x,
          clientY - resizeStart.center.y,
        )

        if (startDist > 0) {
          const scaleFactor = currentDist / startDist
          const rawNewScale = resizeStart.startScale * scaleFactor
          const clampedNewScale = Math.min(
            1.0,
            Math.max(viewMetrics.minScale, rawNewScale),
          )
          setCropBoxScale(clampedNewScale)
        }
        return
      }

      if (isDragging) {
        const rawX = clientX - dragStart.x
        const rawY = clientY - dragStart.y

        setOffset({
          x: Math.max(
            -viewMetrics.maxOffsetX,
            Math.min(viewMetrics.maxOffsetX, rawX),
          ),
          y: Math.max(
            -viewMetrics.maxOffsetY,
            Math.min(viewMetrics.maxOffsetY, rawY),
          ),
        })
      }
    },
    [
      isResizing,
      resizeStart,
      isDragging,
      dragStart,
      viewMetrics.minScale,
      viewMetrics.maxOffsetX,
      viewMetrics.maxOffsetY,
    ],
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  const handleWheelZoom = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 4))
  }, [])

  useEffect(() => {
    const node = viewportRef.current
    if (!node || !isOpen) return

    node.addEventListener("wheel", handleWheelZoom, { passive: false })
    return () => node.removeEventListener("wheel", handleWheelZoom)
  }, [isOpen, handleWheelZoom, imageUrl])

  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setOffset({ x: 0, y: 0 })
    setCropBoxScale(1)
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleFlipH = () => setFlipH((prev) => !prev)
  const handleFlipV = () => setFlipV((prev) => !prev)

  // Canvas Crop & Export Logic
  const handleApplyCrop = () => {
    if (!imageObj || !imgDimensions.width || !viewMetrics.cropW) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const targetAspect =
      activeAspect || viewMetrics.dispEffectiveW / viewMetrics.dispEffectiveH
    const baseExportWidth = Math.min(Math.max(imgDimensions.width, 800), 2400)
    const baseExportHeight = baseExportWidth / targetAspect

    canvas.width = baseExportWidth
    canvas.height = baseExportHeight

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    if (outputType === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.save()

    const exportScaleRatio = baseExportWidth / viewMetrics.cropW

    ctx.translate(
      canvas.width / 2 + offset.x * exportScaleRatio,
      canvas.height / 2 + offset.y * exportScaleRatio,
    )

    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)

    const drawWidth = viewMetrics.dispW * zoom * exportScaleRatio
    const drawHeight = viewMetrics.dispH * zoom * exportScaleRatio

    ctx.drawImage(
      imageObj,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    )

    ctx.restore()

    canvas.toBlob(
      (blob) => {
        if (!blob) return

        const fileExt = outputType === "image/png" ? "png" : "jpg"
        const fileName = originalFile?.name
          ? `cropped_${originalFile.name.replace(/\.[^/.]+$/, "")}.${fileExt}`
          : `cropped_image_${Date.now()}.${fileExt}`

        const croppedFile = new File([blob], fileName, { type: outputType })
        const croppedDataUrl = URL.createObjectURL(blob)
        onCropComplete?.(croppedFile, croppedDataUrl)
        onClose?.()
      },
      outputType,
      outputQuality,
    )
  }

  // Available Presets List for Pill Selector
  const presetOptions = useMemo(() => {
    if (!allowedAspects || !Array.isArray(allowedAspects)) {
      return Object.values(CROP_PRESETS)
    }
    return allowedAspects.map((key) => {
      if (typeof key === "string" && CROP_PRESETS[key]) {
        return CROP_PRESETS[key]
      }
      if (typeof key === "object" && key.aspect) {
        return key
      }
      return CROP_PRESETS.avatar
    })
  }, [allowedAspects])

  if (!isOpen || !image) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-2xl sm:max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-border"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-50 text-cath-red-700">
                <CropIcon size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-gray-500">
                  Drag image to move, drag corners to resize crop area, or zoom.
                </p>
              </div>
            </div>
            <IconButton onClick={onClose} title="Close" variant="ghost">
              <X size={20} />
            </IconButton>
          </div>

          {/* Preset Selector Switcher Bar (If multiple presets enabled) */}
          {(allowedAspects || presetOptions.length > 1) && (
            <div className="px-6 py-2.5 border-b border-border bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {presetOptions.map((item) => {
                const isSelected =
                  selectedPresetKey === item.key ||
                  activeAspect === item.aspect
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSelectedPresetKey(item.key)
                      setActiveAspect(item.aspect)
                      setCropBoxScale(1)
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${isSelected
                      ? "bg-cath-red-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Interactive Crop Viewport Workspace */}
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative w-full h-[460px] sm:h-[480px] bg-gray-950 flex items-center justify-center overflow-hidden touch-none"
          >
            {/* FIX #6: explicit error state instead of a silent blank viewport */}
            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center px-8 z-10">
                <p className="text-sm text-gray-300 text-center max-w-sm">
                  {loadError}
                </p>
              </div>
            )}

            {/* Background Image Layer (Transformed) */}
            {imageUrl && !loadError && (
              <div
                ref={viewportRef}
                onPointerDown={handlePointerDown}
                className={`absolute inset-0 flex items-center justify-center ${isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
              >
                {viewMetrics.dispW > 0 && (
                  <img
                    src={imageUrl}
                    alt="Crop preview"
                    className="transition-transform duration-75 ease-out touch-none select-none"
                    style={{
                      width: `${viewMetrics.dispW}px`,
                      height: `${viewMetrics.dispH}px`,
                      objectFit: "contain",
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1
                        }) scaleY(${flipV ? -1 : 1})`,
                    }}
                    draggable={false}
                    crossOrigin={
                      typeof imageUrl === "string" && /^https?:\/\//i.test(imageUrl)
                        ? "anonymous"
                        : undefined
                    }
                  />
                )}
              </div>
            )}

            {/* Target Crop Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer Vignette Darkening */}
              <div
                className={`relative border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] rounded-lg flex items-center justify-center ${isResizing ? "" : "transition-[width,height] duration-150"
                  }`}
                style={{
                  width: `${viewMetrics.cropW}px`,
                  height: `${viewMetrics.cropH}px`,
                }}
              >
                {/* Rule of Thirds Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-b border-white/60" />
                  <div className="border-r border-white/60" />
                  <div className="border-r border-white/60" />
                  <div />
                </div>

                {/* Interactive Corner Drag Handles */}
                {/* Top-Left */}
                <div
                  onPointerDown={handleResizePointerDown}
                  className="absolute -top-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize group pointer-events-auto z-20"
                  title="Drag to resize crop area"
                >
                  <div className="w-3.5 h-3.5 border-2 border-white bg-cath-red-700 rounded-full shadow-md transition-transform group-hover:scale-125 group-active:scale-90" />
                </div>
                {/* Top-Right */}
                <div
                  onPointerDown={handleResizePointerDown}
                  className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize group pointer-events-auto z-20"
                  title="Drag to resize crop area"
                >
                  <div className="w-3.5 h-3.5 border-2 border-white bg-cath-red-700 rounded-full shadow-md transition-transform group-hover:scale-125 group-active:scale-90" />
                </div>
                {/* Bottom-Left */}
                <div
                  onPointerDown={handleResizePointerDown}
                  className="absolute -bottom-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize group pointer-events-auto z-20"
                  title="Drag to resize crop area"
                >
                  <div className="w-3.5 h-3.5 border-2 border-white bg-cath-red-700 rounded-full shadow-md transition-transform group-hover:scale-125 group-active:scale-90" />
                </div>
                {/* Bottom-Right */}
                <div
                  onPointerDown={handleResizePointerDown}
                  className="absolute -bottom-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize group pointer-events-auto z-20"
                  title="Drag to resize crop area"
                >
                  <div className="w-3.5 h-3.5 border-2 border-white bg-cath-red-700 rounded-full shadow-md transition-transform group-hover:scale-125 group-active:scale-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar Controls */}
          <div className="px-6 py-3 border-t border-border bg-gray-50/60 flex flex-wrap items-center justify-between gap-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <ZoomOut size={16} className="text-gray-500 shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cath-red-700"
              />
              <ZoomIn size={16} className="text-gray-500 shrink-0" />
              <span className="text-xs font-medium text-gray-600 w-8 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <IconButton
                onClick={handleRotate}
                title="Rotate 90°"
                variant="ghost"
                className="h-9 w-9 text-gray-700 hover:bg-gray-200"
              >
                <RotateCw size={17} />
              </IconButton>
              <IconButton
                onClick={handleFlipH}
                title="Flip Horizontal"
                variant="ghost"
                className={`h-9 w-9 ${flipH ? "text-cath-red-700 bg-red-50" : "text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <FlipHorizontal size={17} />
              </IconButton>
              {/* FIX #3: flipV state existed but had no control — added here,
                  mirroring the flipH button exactly. */}
              <IconButton
                onClick={handleFlipV}
                title="Flip Vertical"
                variant="ghost"
                className={`h-9 w-9 ${flipV ? "text-cath-red-700 bg-red-50" : "text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <FlipVertical size={17} />
              </IconButton>
              <IconButton
                onClick={handleReset}
                title="Reset Transformations & Crop Size"
                variant="ghost"
                className="h-9 w-9 text-gray-700 hover:bg-gray-200"
              >
                <RotateCcw size={17} />
              </IconButton>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-white">
            <PillButton
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-5"
            >
              Cancel
            </PillButton>
            <PillButton
              type="button"
              variant="primary"
              onClick={handleApplyCrop}
              startIcon={<Check size={16} />}
              className="px-6 bg-cath-red-700 hover:bg-cath-red-800 text-white"
              disabled={!imageObj || !!loadError}
            >
              Apply Crop
            </PillButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  )
}

export default ImageCropModal
