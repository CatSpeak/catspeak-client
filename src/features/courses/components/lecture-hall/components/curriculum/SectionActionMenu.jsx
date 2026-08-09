import React from "react"
import { Pencil, EyeOff, Trash, FilePlusCorner, Folder, BookOpen, Link2, Eye, MoreVertical } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"

const SectionActionMenu = ({
  section = {},
  onEdit = () => { },
  onToggleVisibility = () => { },
  onDelete = () => { },
  onAddContent = () => { },
}) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.curriculum

  const options = [
    {
      value: "addAnnouncement",
      label: dict.createBoard,
      icon: <FilePlusCorner size={14} className="text-[#1A1A1A]" />,
      action: () => onAddContent("announcement"),
    },
    {
      value: "addMaterial",
      label: dict.addMaterial,
      icon: <Folder size={14} className="text-[#1A1A1A]" />,
      action: () => onAddContent("material"),
    },
    {
      value: "addAssignment",
      label: dict.addActivity,
      icon: <BookOpen size={14} className="text-[#1A1A1A]" />,
      action: () => onAddContent("assignment"),
    },
    {
      value: "addLink",
      label: dict.addLink,
      icon: <Link2 size={14} className="text-[#1A1A1A]" />,
      action: () => onAddContent("link"),
    },
    {
      value: "edit",
      label: dict.edit,
      icon: <Pencil size={14} className="text-[#1A1A1A]" />,
      action: () => onEdit(section),
    },
    {
      value: "toggleVisibility",
      label: dict.toggleVisibility,
      icon: section?.isVisibleToStudents === false ? <Eye size={15} className="text-[#1A1A1A]" /> : <EyeOff size={15} className="text-[#1A1A1A]" />,
      action: () => onToggleVisibility(section.id),
    },
    {
      value: "delete",
      label: dict.delete,
      icon: <Trash size={15} className="text-[#1A1A1A]" />,
      action: () => onDelete(section.id),
    }
  ]

  const handleChange = (val, option) => {
    if (option && option.action) {
      option.action()
    }
  }

  return (
    <Dropdown
      options={options}
      onChange={handleChange}
      dropdownClassName="w-fit"
      maxHeightClass="max-h-[360px]"
      align="left"
      trigger={
        <IconButton
          variant="ghost"
          title={dict.sectionOptionsTooltip}
        >
          <MoreVertical size={16} />
        </IconButton>
      }
    />
  )
}

export default SectionActionMenu
