import React from "react"
import { Pencil, EyeOff, Trash, FilePlusCorner, Folder, BookOpen, Link2, Eye } from "lucide-react"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import { useLanguage } from "@/shared/context/LanguageContext"

const SectionActionMenu = ({
  open = false,
  onClose = () => { },
  section = {},
  onEdit = () => { },
  onToggleVisibility = () => { },
  onDelete = () => { },
  onAddContent = () => { },
}) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.curriculum

  if (!open) return null

  return (
    <div className="absolute right-1 top-10 z-30 animate-fadeIn">
      <MenuList className="w-[218px] rounded-xl shadow-faq-card text-sm text-[#1A1A1A]">
        <MenuItem
          icon={<FilePlusCorner size={14} className="text-[#1A1A1A]" />}
          label={dict.createBoard}
          onClick={() => {
            onAddContent("announcement")
            onClose()
          }}
        />
        <MenuItem
          icon={<Folder size={14} className="text-[#1A1A1A]" />}
          label={dict.addMaterial}
          onClick={() => {
            onAddContent("material")
            onClose()
          }}
        />
        <MenuItem
          icon={<BookOpen size={14} className="text-[#1A1A1A]" />}
          label={dict.addActivity}
          onClick={() => {
            onAddContent("assignment")
            onClose()
          }}
        />
        <MenuItem
          icon={<Link2 size={14} className="text-[#1A1A1A]" />}
          label={dict.addLink}
          onClick={() => {
            onAddContent("link")
            onClose()
          }}
        />
        <MenuItem
          icon={<Pencil size={14} className="text-[#1A1A1A]" />}
          label={dict.edit}
          onClick={() => {
            onEdit(section)
            onClose()
          }}
        />
        <MenuItem
          icon={section?.isVisibleToStudents === false ? <Eye size={15} className="text-[#1A1A1A]" /> : <EyeOff size={15} className="text-[#1A1A1A]" />}
          label={dict.toggleVisibility}
          onClick={() => {
            onToggleVisibility(section.id)
            onClose()
          }}
        />
        <MenuItem
          icon={<Trash size={15} className="text-[#1A1A1A]" />}
          label={dict.delete}
          onClick={() => {
            onDelete(section.id)
            onClose()
          }}
        />
      </MenuList>
    </div>
  )
}

export default SectionActionMenu
