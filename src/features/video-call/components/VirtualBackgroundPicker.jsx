import React, { useState, useEffect } from "react"
import { Upload, Ban } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import {
  useGetCurrentBackgroundQuery,
  useLazyGetCurrentBackgroundQuery,
  useGetSampleBackgroundsQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
} from "@/store/api/userApi"

const TILE_BASE =
  "relative w-full cursor-pointer rounded-xl border aspect-video overflow-hidden transition-colors duration-150 outline-none"

const TILE_DISABLED = "opacity-70 cursor-not-allowed pointer-events-none"

const TILE_SELECTED = "border-cath-red-700 dark:border-red-400 ring-2 ring-cath-red-700/50 dark:ring-red-400/50"

const TILE_UNSELECTED =
  "border-border dark:border-[#3F3F3F] hover:border-neutral-400 dark:hover:border-neutral-500"

const VirtualBackgroundPicker = ({ onApply, className = "" }) => {
  const { t } = useLanguage()

  // Fetch sample backgrounds
  const { data: samplesResponse, isLoading: isSamplesLoading } =
    useGetSampleBackgroundsQuery()
  const samples = Array.isArray(samplesResponse) ? samplesResponse : []

  // Fetch current active background — handle both single-level and
  // double-nested (data.data) shapes produced by baseApi normalization, and
  // force refetch on mount so re-entering waiting room always reflects server.
  const { data: currentBackgroundResponse } = useGetCurrentBackgroundQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  )
  const activeUrl =
    currentBackgroundResponse?.activeBackgroundUrl ??
    currentBackgroundResponse?.data?.activeBackgroundUrl ??
    null
  const customUploadedUrl =
    currentBackgroundResponse?.customUploadedBackgroundUrl ??
    currentBackgroundResponse?.data?.customUploadedBackgroundUrl ??
    null

  const [selectedUrl, setSelectedUrl] = useState(activeUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [brokenUrls, setBrokenUrls] = useState(() => new Set())
  const [uploadInputKey, setUploadInputKey] = useState(0)

  const markBroken = (url) =>
    setBrokenUrls((prev) => {
      if (!url || prev.has(url)) return prev
      const next = new Set(prev)
      next.add(url)
      return next
    })

  const [getCurrent] = useLazyGetCurrentBackgroundQuery()
  const [uploadCustom] = useUploadCustomBackgroundMutation()
  const [setActive, { isLoading: isSettingActive }] =
    useSetActiveBackgroundMutation()

  useEffect(() => {
    setSelectedUrl(activeUrl)
  }, [activeUrl])

  const handleSelect = async (url) => {
    if (isSettingActive || isUploading) return

    setSelectedUrl(url)
    try {
      await setActive({ backgroundUrl: url }).unwrap()
      if (onApply) onApply(url)
    } catch {
      toast.error(
        t?.rooms?.virtualBackground?.setFailed ||
          "Failed to set virtual background",
      )
      setSelectedUrl(activeUrl) // Revert on failure
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        t?.rooms?.virtualBackground?.fileTooLarge ||
          "File is too large. Maximum size is 5MB.",
      )
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setIsUploading(true)
    try {
      await uploadCustom(formData).unwrap()

      const res = await getCurrent().unwrap()
      const uploadedUrl =
        res?.customUploadedBackgroundUrl ??
        res?.data?.customUploadedBackgroundUrl ??
        null

      if (uploadedUrl) {
        // Ensure it's active
        const resActive =
          res?.activeBackgroundUrl ?? res?.data?.activeBackgroundUrl ?? null
        if (resActive !== uploadedUrl) {
          await setActive({ backgroundUrl: uploadedUrl }).unwrap()
        }
        setSelectedUrl(uploadedUrl)
        if (onApply) onApply(uploadedUrl)
        toast.success(
          t?.rooms?.virtualBackground?.uploadSuccess ||
            "Background uploaded and applied",
        )
      } else {
        toast.error(
          t?.rooms?.virtualBackground?.uploadFailed ||
            "Failed to upload background",
        )
      }
    } catch {
      toast.error(
        t?.rooms?.virtualBackground?.uploadFailed ||
          "Failed to upload background",
      )
    } finally {
      setIsUploading(false)
      setUploadInputKey((key) => key + 1)
    }
  }

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="grid grid-cols-2 gap-2 auto-rows-max content-start items-start">
        {/* None Option */}
        <div
          onClick={() => handleSelect(null)}
          className={`${TILE_BASE} group block bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 ${
            selectedUrl === null
              ? TILE_SELECTED
              : `border-dashed ${TILE_UNSELECTED} active:bg-neutral-200 dark:active:bg-neutral-700/80`
          } ${isSettingActive || isUploading ? TILE_DISABLED : ""}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Ban
              size={20}
              className="text-neutral-400 dark:text-neutral-400 mb-2 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors"
            />
            <span className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 font-medium transition-colors">
              {t?.rooms?.virtualBackground?.none || "None"}
            </span>
          </div>
        </div>

        {/* Upload Option */}
        <label
          className={`${TILE_BASE} border-dashed group block bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 ${TILE_UNSELECTED} active:bg-neutral-200 dark:active:bg-neutral-700/80 ${
            isUploading ? TILE_DISABLED : ""
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cath-red-700 border-t-transparent mb-1"></div>
              </div>
            ) : (
              <>
                <Upload
                  size={20}
                  className="text-neutral-400 dark:text-neutral-400 mb-2 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors"
                />
                <span className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 font-medium transition-colors">
                  {t?.rooms?.virtualBackground?.upload || "Upload"}
                </span>
              </>
            )}
          </div>
          <input
            key={uploadInputKey}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>

        {/* Custom Uploaded Background */}
        {customUploadedUrl && (
          <div
            onClick={() => handleSelect(customUploadedUrl)}
            className={`${TILE_BASE} group block bg-neutral-100 dark:bg-neutral-800 ${
              selectedUrl === customUploadedUrl
                ? TILE_SELECTED
                : TILE_UNSELECTED
            } ${isSettingActive || isUploading ? TILE_DISABLED : ""}`}
          >
            <div className="absolute inset-0">
              {brokenUrls.has(customUploadedUrl) ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400">
                  <Ban size={18} />
                  <span className="text-[11px] font-medium">
                    {t?.rooms?.virtualBackground?.imageUnavailable ||
                      "Image unavailable"}
                  </span>
                </div>
              ) : (
                <img
                  src={customUploadedUrl}
                  alt="Custom"
                  onError={() => markBroken(customUploadedUrl)}
                  className="w-full h-full object-cover transition-[filter] duration-100 ease-out group-hover:brightness-90 group-active:brightness-75"
                />
              )}
            </div>
          </div>
        )}

        {/* Sample Backgrounds */}
        {isSamplesLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full aspect-video rounded-xl border border-border dark:border-[#3F3F3F]"
            />
          ))
        ) : (
          Array.isArray(samples) &&
          samples
            .filter((url) => !brokenUrls.has(url))
            .map((url, i) => (
              <div
                key={url || i}
                onClick={() => handleSelect(url)}
                className={`${TILE_BASE} group block bg-neutral-100 dark:bg-neutral-800 ${
                  selectedUrl === url ? TILE_SELECTED : TILE_UNSELECTED
                } ${isSettingActive || isUploading ? TILE_DISABLED : ""}`}
              >
                <div className="absolute inset-0">
                  <img
                    src={url}
                    alt={`Background ${i + 1}`}
                    onError={() => markBroken(url)}
                    className="w-full h-full object-cover transition-[filter] duration-100 ease-out group-hover:brightness-90 group-active:brightness-75"
                  />
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

export default VirtualBackgroundPicker
