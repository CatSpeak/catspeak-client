import React, { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ClipboardList,
  Folder,
  Link2,
  Clock,
  FileText,
  EyeOff,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  VideoOff,
} from "lucide-react"
import LessonActionMenu from "./LessonActionMenu"
import { getDisplayData } from "../../utils/curriculumUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

// Helper function to resolve icon, background, and left accent border based on item type
const getItemConfig = (type) => {
  switch (type) {
    case "bulletinBoard":
      return {
        leftBorder: "",
        iconBg: "bg-[#FDE7E7] text-[#750000]",
        Icon: MessageSquare,
      }
    case "material":
      return {
        leftBorder: "",
        iconBg: "bg-[#FFE8D6] text-[#E85D04]",
        Icon: Folder,
      }
    case "link":
      return {
        leftBorder: "",
        iconBg: "bg-[#E0F2FE] text-[#0284C7]",
        Icon: Link2,
      }
    case "assignment":
      return {
        leftBorder: "",
        iconBg: "bg-[#D6E4FF] text-[#1E70F6]",
        Icon: ClipboardList,
      }
    case "quiz":
      return {
        leftBorder: "",
        iconBg: "bg-[#FCE7F3] text-[#EC4899]",
        Icon: FileText,
      }
    default:
      return {
        leftBorder: "",
        iconBg: "bg-[#FCE7F3] text-[#EC4899]",
        Icon: FileText,
      }
  }
}

const LessonItemRow = ({
  item = {},
  // isEdit = true,
  isStudent = false,
  onEditItem = () => { },
  onToggleItemVisibility = () => { },
  onDeleteItem = () => { },
  className = "",
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
  const [prevIsYoutubeLink, setPrevIsYoutubeLink] = useState(isYoutubeLink)

  // Reset isExpanded if the item is no longer a YouTube link
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

  if (isStudent && !item.isVisibleToStudents) return null

  const isHidden = item.isVisibleToStudents === false

  return (
    <div
      className={`rounded-xl md:rounded-2xl p-3 md:p-5 mb-3 md:mb-4 flex flex-col relative transition-all shadow-sm ${isHidden
        ? "bg-[#7B7979] border border-[#7B7979]"
        : "bg-white border border-[#E2E2E2] hover:border-gray-300"
        } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 md:gap-4 w-full">
        {/* Left section: Drag Handle + Type Icon + Title & Meta */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          {/* Type Icon Circle */}
          <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${config.iconBg}`}
          >
            <IconComponent size={20} />
          </div>

          {/* Title and Meta Information */}
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-[15px] font-semibold truncate max-w-full ${isHidden ? "text-white" : "text-[#191C1D]"} ${["bulletinBoard", "link", "assignment", "quiz", "material"].includes(displayData.type) ? "cursor-pointer hover:underline" : ""}`}
                onClick={() => {
                  const basePath = `/workspace/${isStudent ? 'learning' : 'courses'}/class/${classId}`;
                  if (displayData.type === "bulletinBoard") {
                    navigate(`${basePath}/bulletin-board/${displayData.itemId}`, { state: { displayData } })
                  } else if (isYoutubeLink) {
                    navigate(`${basePath}/links/${displayData.itemId}`)
                  } else if (displayData.type === "link") {
                    let urlToOpen = displayData.meta
                    if (urlToOpen && !/^https?:\/\//i.test(urlToOpen)) {
                      urlToOpen = 'https://' + urlToOpen
                    }
                    window.open(urlToOpen, "_blank")
                  } else if (displayData.type === "assignment") {
                    navigate(`${basePath}?tab=grading&assignmentId=${displayData.itemId}`)
                  } else if (displayData.type === "quiz") {
                    if (isStudent) {
                      navigate(`/workspace/courses/class/${classId}/quiz/${displayData.itemId}/take`)
                    } else {
                      navigate(`/workspace/courses/class/${classId}/quiz/${displayData.itemId}`)
                    }
                  } else if (displayData.type === "material") {
                    const fileUrl = item.material?.fileUrl || item.material?.url || item.material?.FileUrl || item.fileUrl;
                    if (fileUrl) {
                      window.open(fileUrl, "_blank")
                    }
                  }
                }}
              >
                {displayData.title}
              </h4>
            </div>

            {displayData.meta && (
              <div className={`flex items-center gap-1 text-[13px] font-normal ${isHidden ? "text-gray-200" : "text-[#7B7979]"}`}>
                {item.isVisibleToStudents === false && (
                  <span className="inline-flex items-center gap-1 bg-white text-[#7B7979] text-[10px] px-2.5 py-0.5 rounded-full font-bold mr-2">
                    <span className="font-bold">{dict.hiddenStatus || "Đang ẩn"}</span>
                    <EyeOff size={10} strokeWidth={3} />
                  </span>
                )}
                {displayData.metaType === "file" ? (
                  <FileText size={13} className="shrink-0" />
                ) : displayData.metaType === "none" ? null : (
                  <Clock size={13} className="shrink-0" />
                )}
                <div
                  className="line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: displayData.meta }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right section: Expand Button & 3-dots Menu Button */}
        <div className="shrink-0 flex items-center gap-1 text-gray-500">
          {isYoutubeLink && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded-full transition-colors ${isHidden ? "hover:bg-gray-600 text-white" : "hover:text-[#D94C38] hover:bg-gray-100"}`}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
          {isHidden && (
            <div className="mr-2 text-white opacity-80">
              <EyeOff size={20} />
            </div>
          )}
          {!isStudent && (
            <div className={isHidden ? "text-white" : ""}>
              <LessonActionMenu
                item={item}
                onEdit={onEditItem}
                onToggleItemVisibility={onToggleItemVisibility}
                onDeleteItem={onDeleteItem}
              />
            </div>
          )}
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
              <p className="mt-3 text-sm text-[#6B7280]">
                {t.courses.lectureHall.linkPage?.videoNotLoading || "Video không hiển thị?"}{" "}
                <a href={displayData.meta} target="_blank" rel="noopener noreferrer" className="text-[#D94C38] hover:underline font-medium">
                  {t.courses.lectureHall.linkPage?.openInNewTab || "Mở trong tab mới"}
                </a>
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-sm text-[#5B403C] w-full border border-dashed border-[#E2E2E2] rounded-xl bg-white">
              <VideoOff size={32} className="mb-3 text-[#9CA3AF] opacity-80" />
              <p>{t.courses.lectureHall.linkPage?.invalidYoutube || "Invalid YouTube URL"}</p>
              <a href={displayData.meta} target="_blank" rel="noopener noreferrer" className="text-[#D94C38] hover:underline mt-2 inline-block font-medium">
                {t.courses.lectureHall.linkPage?.openInNewTab || "Open in new tab"}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LessonItemRow
