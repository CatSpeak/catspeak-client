import React, { useState, useEffect, useRef } from "react"
import { MoreVertical, EyeOff, ChevronUp, ChevronDown } from "lucide-react"
import LessonItemRow from "./LessonItemRow"
import { IconButton } from "@/shared/components/ui/buttons"
import SectionActionMenu from "./SectionActionMenu"
import { useLanguage } from "@/shared/context/LanguageContext"

const SectionCard = ({
  section = {},
  secIdx = 0,
  totalSections = 1,
  isEdit = true,
  isStudent = false,
  onOpenAddItem = () => { },
  onEditSection = () => { },
  onToggleSectionVisibility = () => { },
  onDeleteSection = () => { },
  onMoveSection = () => { },
  onEditItem = () => { },
  onToggleItemVisibility = () => { },
  onDeleteItem = () => { },
  className = "",
}) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.curriculum

  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false)
  const [openItemMenuId, setOpenItemMenuId] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)

  const sectionRef = useRef(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target)) {
        setIsSectionMenuOpen(false)
      }
      if (!e.target.closest(".lesson-dropdown-container")) {
        setOpenItemMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (isStudent && !section.isVisibleToStudents) return null

  return (
    <div
      className={`bg-[#F3F4F5] border border-[#E2E2E2] rounded-xl ${className}`}
    >
      {/* Section Header */}
      <div className={`flex items-center justify-between gap-4 px-6 py-4 bg-[#F3F4F5] w-full ${isExpanded ? "rounded-t-xl border-b border-[#E2E2E2]" : "rounded-xl"}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-lg font-bold text-[#191C1D]"
            >
              {section.name}
            </span>
            {section.isVisibleToStudents === false && (
              <span className="inline-flex items-center gap-1 bg-[#E1E3E4] text-[#5B403C] text-xs px-2 py-0.5 rounded-full font-medium">
                <EyeOff size={12} /> <span className="font-medium">{dict.hiddenStatus}</span>
              </span>
            )}
          </div>
          {section.description && (
            <p className="text-xs sm:text-sm text-[#5B403C] font-normal">
              {section.description}
            </p>
          )}
        </div>

        {/* Section controls buttons */}
        <div ref={sectionRef} className="flex items-center gap-1 shrink-0 relative">
          <IconButton
            variant="ghost"
            size="xs"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? dict.collapseSection : dict.expandSection}
            aria-label={isExpanded ? dict.collapseSection : dict.expandSection}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>

          {!isStudent && (
            <>
              <IconButton
                variant="ghost"
                size="xs"
                onClick={() => {
                  setIsSectionMenuOpen(!isSectionMenuOpen)
                }}
                title={dict.sectionOptionsTooltip}
                aria-label={dict.sectionOptionsTooltip}
              >
                <MoreVertical size={16} />
              </IconButton>

              {/* Section Action Menu */}
              <SectionActionMenu
                open={isSectionMenuOpen}
                onClose={() => setIsSectionMenuOpen(false)}
                section={section}
                secIdx={secIdx}
                totalSections={totalSections}
                onEdit={onEditSection}
                onToggleVisibility={onToggleSectionVisibility}
                onMove={onMoveSection}
                onDelete={onDeleteSection}
                onAddContent={(type) => onOpenAddItem(section.id, type)}
              />
            </>
          )}
        </div>

      </div>

      {/* List of Lessons inside Section */}
      {isExpanded && (
        <div className="space-y-4 bg-white w-full rounded-b-xl p-6">
          {section.items && section.items.length > 0 ? (
            section.items.map((item) => (
              <LessonItemRow
                key={item.id}
                item={item}
                isEdit={isEdit}
                isStudent={isStudent}
                isMenuOpen={openItemMenuId === item.id}
                onToggleMenu={() =>
                  setOpenItemMenuId(openItemMenuId === item.id ? null : item.id)
                }
                onEditItem={(it) => onEditItem(section.id, it)}
                onToggleItemVisibility={(itemId) => onToggleItemVisibility(section.id, itemId)}
                onDeleteItem={(itemId) => onDeleteItem(section.id, itemId)}
              />
            ))
          ) : (
            <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
              {dict.noLessons}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SectionCard
