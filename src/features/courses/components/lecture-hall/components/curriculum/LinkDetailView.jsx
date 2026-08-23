import React, { useMemo } from 'react'
import { ArrowLeft, VideoOff, Link2, ExternalLink } from 'lucide-react'
import { IconButton, PillButton } from '@/shared/components/ui/buttons'
import { useLanguage } from "@/shared/context/LanguageContext"
import { getDisplayData } from "../../utils/curriculumUtils"
import { useTimezone } from "@/shared/hooks/useTimezone"

const LinkDetailView = ({ itemData, onBack }) => {
  const { t, language } = useLanguage()
  const { formatDateTime } = useTimezone()
  const dict = t.courses.lectureHall
  console.log(itemData);

  // const linkItem = itemData?.link || { url: itemData?.meta, title: itemData?.title, description: itemData?.content || itemData?.description }
  const linkItem = itemData?.meta

  const youtubeId = useMemo(() => {
    if (!linkItem) return null
    let result = null
    try {
      const url = new URL(linkItem.trim())
      if (url.hostname.includes("youtube.com")) {
        if (url.pathname.includes("/watch")) result = url.searchParams.get("v")
        else if (url.pathname.startsWith("/embed/")) result = url.pathname.split("/")[2]
        else if (url.pathname.startsWith("/v/")) result = url.pathname.split("/")[2]
      } else if (url.hostname.includes("youtu.be")) {
        result = url.pathname.slice(1)
      }
    } catch {
      result = null
    }

    if (!result) {
      const match = linkItem.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
      result = match ? match[1] : null
    }

    return result
  }, [linkItem])

  const locale = language === "vi" ? "vi-VN" : language === "zh" ? "zh-CN" : "en-US"
  const displayData = itemData ? getDisplayData(itemData, { ...dict.curriculum, noTitle: dict.postDetail.noTitle }, locale, formatDateTime) : null
  const isYoutubeLink = youtubeId !== null;

  if (!itemData) {
    return (
      <div className="p-6 w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-[#5B403C] hover:text-[#D94C38] transition-colors mb-6 font-medium">
          <ArrowLeft size={16} />
          <span>{dict.postDetail.back || "Quay lại"}</span>
        </button>
        <div className="text-center py-12 text-sm text-[#EF4444] border border-dashed border-[#FCA5A5] rounded-xl bg-[#FEF2F2]">
          {dict.linkPage?.notFound || "Liên kết không tồn tại"}
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

      <div className="bg-white rounded-xl p-4 sm:p-6 w-full">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <IconButton size="md" variant="secondary" >
              <Link2 className="text-[#12B76A]" />
            </IconButton>
            <div className="flex flex-col space-y-1 flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A] truncate">
                {displayData?.title || itemData.title}
              </h2>
              <a
                href={linkItem}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-[#0e6eec] hover:underline break-all"
              >
                {linkItem || displayData?.meta || ""}
              </a>
            </div>
          </div>

          {itemData.description && <div className="text-[#7B7979] text-lg whitespace-pre-wrap">
            {itemData.description}
          </div>}

          <PillButton
            onClick={() => {
              let urlToOpen = linkItem;
              if (urlToOpen && !/^https?:\/\//i.test(urlToOpen)) {
                urlToOpen = 'https://' + urlToOpen;
              }
              window.open(urlToOpen, "_blank");
            }}
            startIcon={<ExternalLink size={18} />}
            className="w-fit"
          >
            {dict.curriculum?.openLink || "Mở liên kết"}
          </PillButton>

          {isYoutubeLink && (
            <div className="flex justify-center items-center">
              <div className="flex flex-col items-center w-full">
                <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-md">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title={itemData.title || dict.linkPage?.videoTitle || "Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <p className="mt-3 text-sm text-[#6B7280]">
                  {dict.linkPage?.videoNotLoading || "Video không hiển thị?"}{" "}
                  <a href={linkItem} target="_blank" rel="noopener noreferrer" className="text-[#D94C38] hover:underline font-medium">
                    {dict.linkPage?.openInNewTab || "Mở trong tab mới"}
                  </a>
                </p>
              </div>
            </div>
          )
          }
        </div>
      </div>

    </div>
  )
}

export default LinkDetailView
