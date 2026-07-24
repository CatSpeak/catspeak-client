import React from "react"
import { Pencil, EyeOff, Eye, Trash } from "lucide-react"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"

const LessonActionMenu = ({
  open = false,
  onClose = () => { },
  item = {},
  onEdit = () => { },
  onToggleHide = () => { },
  onDelete = () => { },
}) => {
  if (!open) return null

  return (
    <div className="absolute right-0 top-8 z-30 animate-fadeIn">
      <MenuList className="w-44 rounded-xl shadow-faq-card text-sm text-[#1A1A1A]">
        <MenuItem
          icon={<Pencil size={15} className="text-[#1A1A1A]" />}
          label="Chỉnh sửa"
          onClick={() => {
            onEdit(item)
            onClose()
          }}
        />
        <MenuItem
          icon={item?.isHidden ? <Eye size={15} className="text-[#1A1A1A]" /> : <EyeOff size={15} className="text-[#1A1A1A]" />}
          label={"Tuỳ chỉnh ẩn/hiện"}
          onClick={() => {
            onToggleHide(item.id)
            onClose()
          }}
        />
        <MenuItem
          icon={<Trash size={15} className="text-[#1A1A1A]" />}
          label={"Xoá"}
          onClick={() => {
            onDelete(item.id)
            onClose()
          }}
        />
      </MenuList>
    </div>
  )
}

export default LessonActionMenu
