import React from "react"
import { Pencil, Eye, EyeOff, Trash, MoreVertical } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Dropdown from "@/shared/components/ui/Dropdown"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"

const LessonActionMenu = ({
  item,
  onEdit,
  onToggleItemVisibility,
  onDeleteItem,
}) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.curriculum

  const options = []

  if (item?.type === "bulletinBoard" || item?.type === "link") {
    options.push({
      value: "edit",
      label: dict.edit,
      icon: <Pencil size={15} className="text-[#1A1A1A]" />,
      action: () => onEdit(item),
    })
  }

  options.push({
    value: "toggleVisibility",
    label: dict.toggleVisibility,
    icon: item?.isVisibleToStudents === false ? <Eye size={15} className="text-[#1A1A1A]" /> : <EyeOff size={15} className="text-[#1A1A1A]" />,
    action: () => onToggleItemVisibility(item.id),
  })

  options.push({
    value: "delete",
    label: dict.delete,
    icon: <Trash size={15} className="text-[#1A1A1A]" />,
    action: () => onDeleteItem(item.id),
  })

  const handleChange = (val, option) => {
    if (option && option.action) {
      option.action()
    }
  }

  return (
    <Dropdown
      options={options}
      onChange={handleChange}
      dropdownClassName="w-44"
      align="right"
      trigger={
        <IconButton
          variant="ghost"
          title={dict.lessonOptionsTooltip}
        >
          <MoreVertical size={16} />
        </IconButton>
      }
    />
  )
}

export default LessonActionMenu
