import React, { useState, useEffect } from "react"
import { GripVertical, MoreVertical, Plus, EyeOff } from "lucide-react"
import LessonItemRow from "./LessonItemRow"
import { MOCK_CHAPTER } from "./mockData"
import { PillButton, IconButton } from "@/shared/components/ui/buttons"
import AddContentMenu from "./AddContentMenu"
import SectionActionMenu from "./SectionActionMenu"

const SectionCard = ({
  chapter = MOCK_CHAPTER,
  secIdx = 0,
  totalSections = 1,
  isEdit = true,
  isStudent = false,
  onOpenAddItem = () => { },
  onEditChapter = () => { },
  onToggleHideChapter = () => { },
  onDeleteChapter = () => { },
  onMoveChapter = () => { },
  onEditItem = () => { },
  onToggleHideItem = () => { },
  onDeleteItem = () => { },
  className = "",
}) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false)
  const [openItemMenuId, setOpenItemMenuId] = useState(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        setIsAddMenuOpen(false)
        setIsSectionMenuOpen(false)
        setOpenItemMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (isStudent && chapter.isHidden) return null

  return (
    <div
      className={`bg-[#F3F4F5] border border-[#E2E2E2] rounded-xl ${className}`}
    >
      {/* Section Header */}
      <div className="flex items-center rounded-t-xl justify-between gap-4 px-6 py-4 bg-[#F3F4F5] border-b border-[#E2E2E2] w-full">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              {isEdit && (
                <GripVertical
                  size={18}
                  className="text-[#5B403C] cursor-grab shrink-0 hover:text-gray-600 transition-colors"
                />
              )}
              <h3 className="text-lg font-bold text-[#191C1D]">
                {chapter.title}
              </h3>
              {chapter.isHidden && (
                <span className="inline-flex items-center gap-1 bg-[#E1E3E4] text-[#5B403C] text-xs px-2 py-0.5 rounded-full font-medium">
                  <EyeOff size={12} /> <span className="font-medium">Đang ẩn</span>
                </span>
              )}
            </div>
            {chapter.subtitle && (
              <p className="text-xs sm:text-sm text-[#5B403C] font-normal">
                {chapter.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls in edit mode */}
        {isEdit && (
          <div className="flex items-center gap-2 shrink-0 dropdown-container relative">
            {/* Add Content Button */}
            <PillButton
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddMenuOpen(!isAddMenuOpen)
                setIsSectionMenuOpen(false)
              }}
              startIcon={<Plus size={10} />}
              bgColor={"white"}
            >
              Thêm nội dung
            </PillButton>

            {/* Add Content Menu */}
            <AddContentMenu
              open={isAddMenuOpen}
              onClose={() => setIsAddMenuOpen(false)}
              onSelect={(type) => onOpenAddItem(chapter.id, type)}
            />

            {/* Section 3-dots Menu Button */}
            <IconButton
              variant="ghost"
              onClick={() => {
                setIsSectionMenuOpen(!isSectionMenuOpen)
                setIsAddMenuOpen(false)
              }}
              title="Tuỳ chọn section"
            >
              <MoreVertical size={16} />
            </IconButton>

            {/* Section Action Menu */}
            <SectionActionMenu
              open={isSectionMenuOpen}
              onClose={() => setIsSectionMenuOpen(false)}
              chapter={chapter}
              secIdx={secIdx}
              totalSections={totalSections}
              onEdit={onEditChapter}
              onToggleHide={onToggleHideChapter}
              onMove={onMoveChapter}
              onDelete={onDeleteChapter}
            />
          </div>
        )}
      </div>

      {/* List of Lessons inside Chapter */}
      <div className="space-y-4 bg-white w-full rounded-b-xl p-6">
        {chapter.items && chapter.items.length > 0 ? (
          chapter.items.map((item) => (
            <LessonItemRow
              key={item.id}
              item={item}
              isEdit={isEdit}
              isStudent={isStudent}
              isMenuOpen={openItemMenuId === item.id}
              onToggleMenu={() =>
                setOpenItemMenuId(openItemMenuId === item.id ? null : item.id)
              }
              onEditItem={(it) => onEditItem(chapter.id, it)}
              onToggleHideItem={(itemId) => onToggleHideItem(chapter.id, itemId)}
              onDeleteItem={(itemId) => onDeleteItem(chapter.id, itemId)}
            />
          ))
        ) : (
          <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
            Chưa có bài học nào trong section này
          </div>
        )}
      </div>
    </div>
  )
}

export default SectionCard