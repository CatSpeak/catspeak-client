import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ClipboardList,
  Folder,
  Link2,
  Clock,
  FileText,
  EyeOff,
  MessageSquare,
} from "lucide-react"
import LessonActionMenu from "./LessonActionMenu"
import { getDisplayData } from "../../utils/curriculumUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

// Helper function to resolve icon, background, and left accent border based on item type
const getItemConfig = (type) => {
  switch (type) {
    case "bulletinBoard":
      return {
        leftBorder: "border-l-4 border-l-[#750000]",
        iconBg: "bg-red-100/70 text-[#750000]",
        Icon: MessageSquare,
      }
    case "material":
      return {
        leftBorder: "border-l-4 border-l-[#fea53f]",
        iconBg: "bg-amber-100/70 text-[#fea53f]",
        Icon: Folder,
      }
    case "link":
      return {
        leftBorder: "border-l-4 border-l-[#750000]",
        iconBg: "bg-red-100/70 text-[#750000]",
        Icon: Link2,
      }
    case "assignment":
    default:
      return {
        leftBorder: "border-l-4 border-l-[#fea53f]",
        iconBg: "bg-amber-100/70 text-[#fea53f]",
        Icon: ClipboardList,
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
  const dict = t.courses.lectureHall.curriculum

  const navigate = useNavigate()
  const { id: classId } = useParams()

  if (isStudent && !item.isVisibleToStudents) return null

  const isHidden = item.isVisibleToStudents === false

  const locale = language === "vi" ? "vi-VN" : language === "zh" ? "zh-CN" : "en-US"
  const displayData = getDisplayData(
    item,
    {
      ...dict,
      noTitle: t.courses.lectureHall.postDetail.noTitle,
    },
    locale,
  )
  const isYoutubeLink = displayData.type === "link" && displayData.meta && (displayData.meta.includes("youtube.com") || displayData.meta.includes("youtu.be"))
  const config = getItemConfig(displayData.type || "assignment")
  const IconComponent = config.Icon

  return (
    <div
      className={`rounded-xl p-4 flex items-center justify-between gap-4 relative transition-all ${isHidden
        ? "bg-[#fbfbfc] border border-[#edeeef] border-l-4 border-l-[#d1d5db] opacity-75"
        : `bg-[#F8F9FA] border border-[#E2E2E2] hover:border-cath-red-700 ${config.leftBorder}`
        } ${className}`}
    >
      {/* Left section: Drag Handle + Type Icon + Title & Meta */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Type Icon Circle */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isHidden ? "bg-[#F3F4F5] text-[#9E9E9E]" : config.iconBg
            }`}
        >
          <IconComponent size={20} />
        </div>

        {/* Title and Meta Information */}
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-base font-semibold truncate max-w-full ${["bulletinBoard", "link", "assignment", "quiz", "material"].includes(displayData.type) ? "text-[#191C1D] cursor-pointer hover:underline" : "text-[#191C1D]"}`}
              onClick={() => {
                const basePath = `/workspace/${isStudent ? 'learning' : 'courses'}/class/${classId}`;
                if (displayData.type === "bulletinBoard") {
                  navigate(`${basePath}/bulletin-board/${displayData.realItemId}`)
                } else if (isYoutubeLink) {
                  navigate(`${basePath}/links/${displayData.realItemId}`)
                } else if (displayData.type === "link") {
                  let urlToOpen = displayData.meta
                  if (urlToOpen && !/^https?:\/\//i.test(urlToOpen)) {
                    urlToOpen = 'https://' + urlToOpen
                  }
                  window.open(urlToOpen, "_blank")
                } else if (displayData.type === "assignment") {
                  navigate(`${basePath}?tab=grading&assignmentId=${displayData.realItemId}`)
                } else if (displayData.type === "quiz") {
                  if (isStudent) {
                    navigate(`/workspace/courses/class/${classId}/quiz/${displayData.realItemId}/take`)
                  } else {
                    navigate(`/workspace/courses/class/${classId}/quiz/${displayData.realItemId}`)
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
            {item.isVisibleToStudents === false && (
              <span className="inline-flex items-center gap-1 bg-[#E1E3E4] text-[#5B403C] text-xs px-2 py-0.5 rounded-full font-medium">
                <EyeOff size={12} /> <span className="font-medium">{dict.hiddenStatus}</span>
              </span>
            )}
          </div>

          {displayData.meta && (
            <div className="flex items-center gap-1 text-xs text-[#5B403C] font-normal">
              {displayData.metaType === "file" ? (
                <FileText size={13} className="text-stone-500 shrink-0" />
              ) : displayData.metaType === "none" ? null : (
                <Clock size={13} className="text-stone-500 shrink-0" />
              )}
              <span className="truncate">{displayData.meta}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right section: 3-dots Menu Button */}
      {!isStudent && (
        <div className="shrink-0">
          {/* Standalone Component: Lesson Action Menu */}
          <LessonActionMenu
            item={item}
            onEdit={onEditItem}
            onToggleItemVisibility={onToggleItemVisibility}
            onDeleteItem={onDeleteItem}
          />
        </div>
      )}
    </div>
  )
}

export default LessonItemRow
