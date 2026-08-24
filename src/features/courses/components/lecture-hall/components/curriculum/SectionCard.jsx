import React, { useState, useRef } from "react"
import { MoreVertical, EyeOff, ChevronUp, ChevronDown, Inbox } from "lucide-react"
import LessonItemRow from "./LessonItemRow"
import StudentLessonRow from "./StudentLessonRow"
import { IconButton } from "@/shared/components/ui/buttons"
import SectionActionMenu from "./SectionActionMenu"
import { useLanguage } from "@/shared/context/LanguageContext"

const SectionCard = ({
  section = {},
  isEdit = true,
  isStudent = false,
  onOpenAddItem = () => { },
  onEditSection = () => { },
  onToggleSectionVisibility = () => { },
  onDeleteSection = () => { },
  onEditItem = () => { },
  onToggleItemVisibility = () => { },
  onDeleteItem = () => { },
  onSelectLesson = () => { },
  className = "",
}) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.curriculum
  const [isExpanded, setIsExpanded] = useState(true)

  const sectionRef = useRef(null)

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
            <SectionActionMenu
              section={section}
              onEdit={onEditSection}
              onToggleVisibility={onToggleSectionVisibility}
              onDelete={onDeleteSection}
              onAddContent={(type) => onOpenAddItem(section.id, type)}
            />
          )}
        </div>

      </div>

      {/* List of Lessons inside Section */}
      {isExpanded && (
        <div className="space-y-4 bg-white w-full rounded-b-xl p-6">
          {section.items && section.items.length > 0 ? (
            section.items.map((item) => (
              isStudent ? (
                <StudentLessonRow
                  key={item.id}
                  item={item}
                  onSelectLesson={onSelectLesson}
                />
              ) : (
                <LessonItemRow
                  key={item.id}
                  item={item}
                  isEdit={isEdit}
                  isStudent={isStudent}
                  onEditItem={(it) => onEditItem(section.id, it)}
                  onToggleItemVisibility={(itemId) => onToggleItemVisibility(section.id, itemId)}
                  onDeleteItem={(itemId) => onDeleteItem(section.id, itemId)}
                  onSelectLesson={onSelectLesson}
                />
              )
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-sm text-[#5B403C] border border-dashed border-[#E2E2E2] rounded-xl">
              <Inbox size={24} className="mb-2 opacity-60" />
              <p>{dict.noLessons}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SectionCard
