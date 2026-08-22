import React, { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Link2,
  FileText,
  FileEdit,
  FileQuestion,
  ExternalLink,
  Download,
  ChevronRight,
  MessageSquare,
  Clock,
  VideoOff,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { getDisplayData } from "../../utils/curriculumUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { PillButton } from "@/shared/components/ui/buttons"

// Helper function to resolve icon and background based on item type
const getItemConfig = (type) => {
  switch (type) {
    case "link":
      return {
        iconBg: "bg-[#D1F7E3] text-[#12B76A]",
        Icon: Link2,
      }
    case "material":
      return {
        iconBg: "bg-[#F3F4F6] text-[#DC2626]",
        Icon: FileText,
      }
    case "assignment":
      return {
        iconBg: "bg-[#FEF0C7] text-[#D97706]",
        Icon: FileEdit,
      }
    case "quiz":
      return {
        iconBg: "bg-[#EBE5FC] text-[#7C3AED]",
        Icon: FileQuestion,
      }
    case "bulletinBoard":
      return {
        iconBg: "bg-red-100/70 text-[#750000]",
        Icon: MessageSquare,
      }
    default:
      return {
        iconBg: "bg-gray-100 text-gray-500",
        Icon: FileText,
      }
  }
}

const StudentLessonRow = ({
  item = {},
  className = "",
  onSelectLesson = () => { },
}) => {
  const { t, language } = useLanguage()
  const { formatDateTime } = useTimezone()
  const dict = t.courses.lectureHall.curriculum

  const navigate = useNavigate()
  const { id: classId } = useParams()

  const locale = language === "vi" ? "vi-VN" : language === "zh" ? "zh-CN" : "en-US"
  const displayData = getDisplayData(
    item,
    {
      ...dict,
      noTitle: t.courses.lectureHall.postDetail.noTitle,
    },
    locale,
    formatDateTime,
  )
  const isYoutubeLink = displayData.type === "link" && displayData.meta && (displayData.meta.includes("youtube.com") || displayData.meta.includes("youtu.be"))
  const config = getItemConfig(displayData.type || "assignment")
  const IconComponent = config.Icon

  const [isExpanded, setIsExpanded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [prevIsYoutubeLink, setPrevIsYoutubeLink] = useState(isYoutubeLink)

  if (isYoutubeLink !== prevIsYoutubeLink) {
    setPrevIsYoutubeLink(isYoutubeLink)
    if (!isYoutubeLink) {
      setIsExpanded(false)
    }
  }

  const youtubeId = useMemo(() => {
    if (!isYoutubeLink || !displayData.meta) return null
    let result = null
    try {
      const url = new URL(displayData.meta.trim())
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
      const match = displayData.meta.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
      result = match ? match[1] : null
    }

    return result
  }, [isYoutubeLink, displayData.meta])

  // Hide if not visible to students
  if (item.isVisibleToStudents === false) return null

  const handleRowClick = () => {
    const basePath = `/workspace/learning/class/${classId}`;
    if (displayData.type === "bulletinBoard") {
      navigate(`${basePath}/bulletin-board/${displayData.itemId}`, { state: { displayData } })
    } else if (displayData.type === "link" || isYoutubeLink) {
      onSelectLesson(item, "link")
    } else if (displayData.type === "assignment") {
      onSelectLesson(item, "assignment")
    } else if (displayData.type === "quiz") {
      navigate(`/workspace/courses/class/${classId}/quiz/${displayData.itemId}/take`)
    } else if (displayData.type === "material") {
      onSelectLesson(item, "material")
    }
  }

  const handleDownload = async (e) => {
    e.stopPropagation();
    const materialData = item.material || item
    const fileUrl = materialData.fileUrl || materialData.url || materialData.FileUrl || item.fileUrl;
    
    if (!fileUrl) {
      handleRowClick();
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;

      const originalFilename = fileUrl.split("/").pop().split("?")[0] || "";
      const ext = originalFilename.includes(".") ? originalFilename.split(".").pop() : "";

      let cleanTitle = displayData.title || item.title || "download";

      if (ext && !cleanTitle.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
        cleanTitle = `${cleanTitle}.${ext}`;
      }

      link.download = cleanTitle;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
      window.open(fileUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }

  const renderRightAction = () => {
    if (displayData.type === "link") {
      return (
        <PillButton
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            if (isYoutubeLink) {
              setIsExpanded(!isExpanded);
            } else {
              handleRowClick();
            }
          }}
          startIcon={isYoutubeLink ? (isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />) : <ExternalLink size={16} />}
        >
          {isYoutubeLink ? (isExpanded ? "Đóng" : "Mở video") : "Mở liên kết"}
        </PillButton>
      )
    }

    if (displayData.type === "material") {
      return (
        <PillButton
          variant="outline"
          onClick={handleDownload}
          loading={isDownloading}
          startIcon={<Download size={16} />}
        >
          Tải xuống
        </PillButton>
      )
    }

    if (displayData.type === "assignment") {
      const status = item.status || item.studentStatus || "pending";
      const isDone = status === "completed" || status === "submitted" || status === "graded" || item.isCompleted;
      return (
        <div className="flex items-center gap-3">
          {isDone ? (
            <span className="bg-[#D1F7E3] text-[#039855] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              Đã nộp
            </span>
          ) : (
            <span className="bg-[#FEF0C7] text-[#B54708] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              Cần nộp
            </span>
          )}
          <ChevronRight size={18} className="text-[#191C1D] shrink-0" />
        </div>
      )
    }

    if (displayData.type === "quiz") {
      const status = item.status || item.studentStatus || "pending";
      const isDone = status === "completed" || status === "submitted" || status === "graded" || item.isCompleted;
      return (
        <div className="flex items-center gap-3">
          {isDone ? (
            <span className="bg-[#D1F7E3] text-[#039855] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              Đã làm
            </span>
          ) : (
            <span className="bg-[#FEF0C7] text-[#B54708] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              Chưa làm
            </span>
          )}
          <ChevronRight size={18} className="text-[#191C1D] shrink-0" />
        </div>
      )
    }

    return null;
  }

  return (
    <div
      onClick={() => {
        handleRowClick();
      }}
      className={`rounded-xl p-4 flex flex-col relative transition-all bg-white border border-[#E2E2E2] cursor-pointer hover:border-[#B52A2A] hover:shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left section: Type Icon + Title & Meta */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Type Icon Circle */}
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${config.iconBg}`}
          >
            <IconComponent size={20} />
          </div>

          {/* Title and Meta Information */}
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-[15px] font-medium text-[#191C1D] truncate max-w-full">
                {displayData.title}
              </h4>
            </div>

            {displayData.meta && (
              <div className="flex items-center gap-1.5 text-[13px] text-[#6B7280] font-normal">
                {displayData.type === "material" || displayData.type === "assignment" ? (
                  <Clock size={14} className="shrink-0" />
                ) : displayData.type === "link" && !isYoutubeLink ? (
                  <Clock size={14} className="shrink-0" />
                ) : null}
                <div
                  className="line-clamp-1 truncate"
                  dangerouslySetInnerHTML={{ __html: displayData.meta }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="shrink-0 flex items-center gap-2">
          {renderRightAction()}
        </div>
      </div>

      {/* Expanded Youtube Video */}
      {isExpanded && isYoutubeLink && (
        <div className="w-full mt-4 pt-4 border-t border-[#E2E2E2] flex justify-center items-center">
          {youtubeId ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-md">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                  title={displayData.title || t.courses.lectureHall.linkPage?.videoTitle || "Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-sm text-[#5B403C] w-full border border-dashed border-[#E2E2E2] rounded-xl bg-white">
              <VideoOff size={32} className="mb-3 text-[#9CA3AF] opacity-80" />
              <p>{t.courses.lectureHall.linkPage?.invalidYoutube || "Invalid YouTube URL"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StudentLessonRow