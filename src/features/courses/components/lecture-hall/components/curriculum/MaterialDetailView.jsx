import React, { useState } from 'react'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import { IconButton, PillButton } from '@/shared/components/ui/buttons'
import { useLanguage } from "@/shared/context/LanguageContext"
import { getDisplayData } from "../../utils/curriculumUtils"
import { useTimezone } from "@/shared/hooks/useTimezone"

const MaterialDetailView = ({ itemData, onBack }) => {
  const { t, language } = useLanguage()
  const [isDownloading, setIsDownloading] = useState(false)
  const { formatDateTime } = useTimezone()
  const dict = t.courses.lectureHall

  const locale = language === "vi" ? "vi-VN" : language === "zh" ? "zh-CN" : "en-US"
  const displayData = itemData ? getDisplayData(itemData, { ...dict.curriculum, noTitle: dict.postDetail.noTitle }, locale, formatDateTime) : null

  const materialData = itemData.material || itemData
  const fileUrl = materialData.fileUrl || materialData.url || materialData.FileUrl || itemData.fileUrl;

  const handleDownload = async () => {
    if (!fileUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const filename = fileUrl.split("/").pop().split("?")[0] || displayData?.title || "download";
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Lỗi khi tải file, chuyển sang mở tab mới:", error);
      // Fallback if fetch fails (e.g. CORS)
      window.open(fileUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }

  if (!itemData) {
    return (
      <div className="p-6 w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-[#5B403C] hover:text-[#D94C38] transition-colors mb-6 font-medium">
          <ArrowLeft size={16} />
          <span>{dict.postDetail.back || "Quay lại"}</span>
        </button>
        <div className="text-center py-12 text-sm text-[#EF4444] border border-dashed border-[#FCA5A5] rounded-xl bg-[#FEF2F2]">
          {dict.curriculum?.unnamedMaterial || "Tài liệu không tồn tại"}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full animate-fade-in space-y-6">
      <PillButton
        startIcon={<ArrowLeft size={16} />}
        onClick={onBack}
        className='w-fit'
        variant='secondary-no-outline'
      >
        {t.courses?.lectureHall?.title || "Giảng đường"}
      </PillButton>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E2E2E2] w-full">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <IconButton size="md" variant="secondary" >
              <FileText size={28} className="text-[#DC2626]" />
            </IconButton>
            <div className="flex flex-col space-y-1 flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A] truncate">
                {displayData?.title || itemData.title}
              </h2>
              <div className="text-base text-[#7B7979]">
                {displayData?.meta || ""}
              </div>
            </div>
          </div>

          {itemData.description && <div className="text-[#7B7979] text-base whitespace-pre-wrap">
            {itemData.description || ""}
          </div>}


          <PillButton
            onClick={handleDownload}
            loading={isDownloading}
            startIcon={<Download size={18} />}
            className="w-fit"
          >
            {dict.curriculum?.download || "Tải xuống"}
          </PillButton>
        </div>
      </div>
    </div>
  )
}

export default MaterialDetailView
