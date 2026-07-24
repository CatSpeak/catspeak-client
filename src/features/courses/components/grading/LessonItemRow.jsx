import React from "react"
import {
  GripVertical,
  MoreVertical,
  MessageSquareText,
  ClipboardList,
  Folder,
  Link2,
  Clock,
  FileText,
  EyeOff,
} from "lucide-react"
import { MOCK_LESSON_ITEM } from "./mockData"
import { IconButton } from "@/shared/components/ui/buttons"
import LessonActionMenu from "./LessonActionMenu"

// Helper function to resolve icon, background, and left accent border based on item type
const getItemConfig = (type) => {
  switch (type) {
    case "announcement":
      return {
        leftBorder: "border-l-4 border-[#72000d]",
        iconBg: "bg-red-100/70 text-[#72000d]",
        Icon: MessageSquareText,
      }
    case "material":
      return {
        leftBorder: "border-l-4 border-[#f08d1d]",
        iconBg: "bg-amber-100/70 text-[#f08d1d]",
        Icon: Folder,
      }
    case "link":
      return {
        leftBorder: "border-l-4 border-slate-300",
        iconBg: "bg-slate-100 text-slate-500",
        Icon: Link2,
      }
    case "assignment":
    default:
      return {
        leftBorder: "border-l-4 border-[#f08d1d]",
        iconBg: "bg-amber-100/70 text-[#f08d1d]",
        Icon: ClipboardList,
      }
  }
}

const LessonItemRow = ({
  item = MOCK_LESSON_ITEM,
  isEdit = true,
  isStudent = false,
  isMenuOpen = false,
  onToggleMenu = () => {},
  onEditItem = () => {},
  onToggleHideItem = () => {},
  onDeleteItem = () => {},
  className = "",
}) => {
  if (isStudent && item.isHidden) return null

  const config = getItemConfig(item.type || "assignment")
  const IconComponent = config.Icon

  return (
    <div
      className={`bg-[#F8F9FA] border border-[#E2E2E2] rounded-xl p-4 flex items-center justify-between gap-4 relative transition-all hover:border-gray-300 ${config.leftBorder} ${className}`}
    >
      {/* Left section: Drag Handle + Type Icon + Title & Meta */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Drag handle (visible in edit mode) */}
        {isEdit && (
          <GripVertical
            size={18}
            className="text-[#5B403C] cursor-grab shrink-0 hover:text-gray-600 transition-colors"
          />
        )}

        {/* Type Icon Circle */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.iconBg}`}
        >
          <IconComponent size={20} />
        </div>

        {/* Title and Meta Information */}
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[#191C1D] text-base font-semibold">
              {item.title}
            </h4>
            {item.isHidden && (
              <span className="inline-flex items-center gap-1 bg-[#E1E3E4] text-[#5B403C] text-xs px-2 py-0.5 rounded-full font-medium">
                <EyeOff size={12} /> <span className="font-medium">Đang ẩn</span>
              </span>
            )}
          </div>

          {item.meta && (
            <div className="flex items-center gap-1 text-xs text-[#5B403C] font-normal">
              {item.metaType === "file" ? (
                <FileText size={13} className="text-stone-500 shrink-0" />
              ) : item.metaType === "none" ? null : (
                <Clock size={13} className="text-stone-500 shrink-0" />
              )}
              <span>{item.meta}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right section: 3-dots Menu Button */}
      {isEdit && (
        <div className="dropdown-container relative shrink-0">
          <IconButton
            size="xs"
            variant="ghost"
            onClick={onToggleMenu}
            title="Tùy chọn bài học"
          >
            <MoreVertical size={16} />
          </IconButton>

          {/* Standalone Component: Lesson Action Menu */}
          <LessonActionMenu
            open={isMenuOpen}
            onClose={onToggleMenu}
            item={item}
            onEdit={onEditItem}
            onToggleHide={onToggleHideItem}
            onDelete={onDeleteItem}
          />
        </div>
      )}
    </div>
  )
}

export default LessonItemRow