import React, { useState, useEffect } from "react"
import { Upload, Check } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetCurrentBackgroundQuery,
  useLazyGetCurrentBackgroundQuery,
  useGetSampleBackgroundsQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
} from "@/store/api/authApi"

const VirtualBackgroundPicker = ({ onApply }) => {
  const { t } = useLanguage()

  // Fetch sample backgrounds
  const { data: samplesResponse, isLoading: isSamplesLoading } =
    useGetSampleBackgroundsQuery()
  const samples = samplesResponse?.data || samplesResponse || []

  // Fetch current active background
  const { data: currentBackgroundResponse } = useGetCurrentBackgroundQuery()
  const activeUrl = currentBackgroundResponse?.data?.activeBackgroundUrl || null
  const customUploadedUrl =
    currentBackgroundResponse?.data?.customUploadedBackgroundUrl || null

  const [selectedUrl, setSelectedUrl] = useState(activeUrl)
  const [isUploading, setIsUploading] = useState(false)

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
    } catch (err) {
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

    // Max size 3MB
    if (file.size > 3 * 1024 * 1024) {
      toast.error(
        t?.rooms?.virtualBackground?.fileTooLarge ||
          "File is too large. Maximum size is 3MB.",
      )
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setIsUploading(true)
    try {
      await uploadCustom(formData).unwrap()

      const res = await getCurrent().unwrap()
      const uploadedUrl = res?.data?.customUploadedBackgroundUrl || null

      if (uploadedUrl) {
        // Ensure it's active
        if (res?.data?.activeBackgroundUrl !== uploadedUrl) {
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
    } catch (err) {
      toast.error(
        t?.rooms?.virtualBackground?.uploadFailed ||
          "Failed to upload background",
      )
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-sm font-medium text-gray-900 mb-3">
        {t?.rooms?.virtualBackground?.title || "Backgrounds"}
      </div>
      <div className="grid grid-cols-2 min-[426px]:grid-cols-3 md:grid-cols-2 gap-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 auto-rows-max content-start items-start flex-1 min-h-0 pb-2">
        {/* None Option */}
        <div
          onClick={() => handleSelect(null)}
          className={`relative w-full cursor-pointer rounded-lg border aspect-video overflow-hidden transition-all duration-200 block ${
            selectedUrl === null ? "border-[#990011]" : "border-[#e5e5e5]"
          } ${isSettingActive || isUploading ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 font-medium text-sm">
              {t?.rooms?.virtualBackground?.none || "None"}
            </span>
            {selectedUrl === null && (
              <div className="absolute top-1.5 right-1.5 bg-[#990011] text-white rounded-full p-0.5 shadow-sm">
                <Check size={12} />
              </div>
            )}
          </div>
        </div>

        {/* Upload Option */}
        <label
          className={`relative w-full cursor-pointer rounded-lg border border-dashed aspect-video overflow-hidden transition-all duration-200 block bg-gray-50 hover:bg-gray-100 ${
            isUploading ? "border-[#e5e5e5]" : "border-[#e5e5e5]"
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#990011] border-t-transparent mb-1"></div>
              </div>
            ) : (
              <>
                <Upload className="text-gray-400 mb-1" size={20} />
                <span className="text-[10px] text-gray-500">
                  {t?.rooms?.virtualBackground?.upload || "Upload"}
                </span>
              </>
            )}
          </div>
          <input
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
            className={`relative w-full cursor-pointer rounded-lg border aspect-video overflow-hidden transition-all duration-200 group block ${
              selectedUrl === customUploadedUrl
                ? "border-[#990011]"
                : "border-[#e5e5e5]"
            } ${isSettingActive || isUploading ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
          >
            <div className="absolute inset-0">
              <img
                src={customUploadedUrl}
                alt="Custom"
                className="w-full h-full object-cover transition-transform duration-300"
              />
              {selectedUrl === customUploadedUrl && (
                <div className="absolute top-1.5 right-1.5 bg-[#990011] text-white rounded-full p-0.5 shadow-sm">
                  <Check size={12} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sample Backgrounds */}
        {isSamplesLoading ? (
          <div className="col-span-full flex h-24 items-center justify-center text-gray-400 text-xs">
            {t?.rooms?.virtualBackground?.loading || "Loading..."}
          </div>
        ) : (
          Array.isArray(samples) &&
          samples.map((url, i) => (
            <div
              key={url || i}
              onClick={() => handleSelect(url)}
              className={`relative w-full cursor-pointer rounded-lg border aspect-video overflow-hidden transition-all duration-200 group block ${
                selectedUrl === url ? "border-[#990011]" : "border-[#e5e5e5]"
              } ${isSettingActive || isUploading ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
            >
              <div className="absolute inset-0">
                <img
                  src={url}
                  alt={`Background ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
                {selectedUrl === url && (
                  <div className="absolute top-1.5 right-1.5 bg-[#990011] text-white rounded-full p-0.5 shadow-sm">
                    <Check size={12} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default VirtualBackgroundPicker
