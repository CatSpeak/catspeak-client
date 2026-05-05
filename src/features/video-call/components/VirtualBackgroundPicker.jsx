import React, { useState, useEffect } from "react"
import { Upload, Check } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetProfileQuery,
  useGetSampleBackgroundsQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
} from "@/store/api/authApi"

const VirtualBackgroundPicker = ({ onApply }) => {
  const { t } = useLanguage()

  // Fetch sample backgrounds
  const { data: samplesResponse, isLoading: isSamplesLoading } = useGetSampleBackgroundsQuery()
  const samples = samplesResponse?.data || samplesResponse || []

  // Fetch user profile to know current active background
  const { data: profileResponse } = useGetProfileQuery()
  const user = profileResponse?.data
  const activeUrl = user?.virtualBackgroundUrl || null

  const [selectedUrl, setSelectedUrl] = useState(activeUrl)
  const [isUploading, setIsUploading] = useState(false)

  const [uploadCustom] = useUploadCustomBackgroundMutation()
  const [setActive, { isLoading: isSettingActive }] = useSetActiveBackgroundMutation()

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
      toast.error(t?.rooms?.virtualBackground?.setFailed || "Failed to set virtual background")
      setSelectedUrl(activeUrl) // Revert on failure
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Max size 3MB
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t?.rooms?.virtualBackground?.fileTooLarge || "File is too large. Maximum size is 3MB.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setIsUploading(true)
    try {
      const res = await uploadCustom(formData).unwrap()
      const newUrl = res.url || res.data?.url || res.data

      await setActive({ backgroundUrl: newUrl }).unwrap()
      setSelectedUrl(newUrl)
      if (onApply) onApply(newUrl)
      toast.success(t?.rooms?.virtualBackground?.uploadSuccess || "Background uploaded and applied")
    } catch (err) {
      toast.error(t?.rooms?.virtualBackground?.uploadFailed || "Failed to upload background")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const isCustomSelected = selectedUrl && Array.isArray(samples) && !samples.includes(selectedUrl)

  return (
    <div className="flex flex-col h-full w-full p-3">
      <div className="text-sm font-medium text-gray-900 mb-3">{t?.rooms?.virtualBackground?.title || "Backgrounds"}</div>
      <div className="grid grid-cols-2 min-[426px]:grid-cols-3 md:grid-cols-2 gap-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 content-start flex-1 min-h-0 pb-2">
        
        {/* None Option */}
        <div
          onClick={() => handleSelect(null)}
          className={`relative flex items-center justify-center cursor-pointer rounded-xl border-2 aspect-video overflow-hidden transition-all duration-200 ${
            selectedUrl === null ? "border-[#990011]" : "border-gray-200 hover:border-gray-300"
          } ${(isSettingActive || isUploading) ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
        >
          <span className="text-gray-500 font-medium text-sm">{t?.rooms?.virtualBackground?.none || "None"}</span>
          {selectedUrl === null && (
            <div className="absolute top-1.5 right-1.5 bg-[#990011] text-white rounded-full p-0.5 shadow-sm">
              <Check size={12} />
            </div>
          )}
        </div>

        {/* Upload Option */}
        <label
          className={`relative flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed aspect-video overflow-hidden transition-all duration-200 ${
            isUploading ? "border-gray-300 bg-gray-50" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#990011] border-t-transparent mb-1"></div>
            </div>
          ) : (
            <>
              <Upload className="text-gray-400 mb-1" size={20} />
              <span className="text-[10px] text-gray-500">{t?.rooms?.virtualBackground?.upload || "Upload"}</span>
            </>
          )}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>

        {/* Custom Uploaded Background */}
        {isCustomSelected && (
          <div
            onClick={() => handleSelect(selectedUrl)}
            className={`relative cursor-pointer rounded-xl border-2 aspect-video overflow-hidden transition-all duration-200 border-[#990011] ${(isSettingActive || isUploading) ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
          >
            <img src={selectedUrl} alt="Custom" className="w-full h-full object-cover" />
            <div className="absolute top-1.5 right-1.5 bg-[#990011] text-white rounded-full p-0.5 shadow-sm">
              <Check size={12} />
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
              className={`relative cursor-pointer rounded-xl border-2 aspect-video overflow-hidden transition-all duration-200 group ${
                selectedUrl === url ? "border-[#990011]" : "border-transparent hover:border-gray-300"
              } ${(isSettingActive || isUploading) ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`}
            >
              <img
                src={url}
                alt={`Background ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {selectedUrl === url && (
                <div className="absolute top-1.5 right-1.5 bg-[#990011] text-white rounded-full p-0.5 shadow-sm">
                  <Check size={12} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default VirtualBackgroundPicker
