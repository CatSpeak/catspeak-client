import React from "react"
import { MessageSquareText, Folder, ClipboardList, Link2 } from "lucide-react"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"

const AddContentMenu = ({ open = false, onClose = () => { }, onSelect = () => { } }) => {
  if (!open) return null

  const labelClassName = "text-sm font-semibold text-[#191C1D]"
  const iconBgClassName = "w-8 h-8 rounded-full flex items-center justify-center shrink-0"

  return (
    <div className="absolute right-14 top-14 z-30 animate-fadeIn">
      <MenuList className="w-full !py-2 rounded-xl shadow-faq-card border font-medium space-y-0.5">
        <MenuItem
          icon={
            <div className={`${iconBgClassName} bg-[#FFDAD4] text-primary`}>
              <MessageSquareText size={16} />
            </div>
          }
          label={<span className={labelClassName}>Tạo bảng tin</span>}
          onClick={() => {
            onSelect("announcement")
            onClose()
          }}
        />
        <MenuItem
          icon={
            <div className={`${iconBgClassName} bg-[#FFDCDB] text-[#8A5100]`}>
              <Folder size={16} />
            </div>
          }
          label={<span className={labelClassName}>Thêm học liệu</span>}
          onClick={() => {
            onSelect("material")
            onClose()
          }}
        />
        <MenuItem
          icon={
            <div className={`${iconBgClassName} bg-[#FFDBCF] text-[#661E00]`}>
              <ClipboardList size={16} />
            </div>
          }
          label={<span className={labelClassName}>Thêm hoạt động học tập</span>}
          onClick={() => {
            onSelect("assignment")
            onClose()
          }}
        />
        <MenuItem
          icon={
            <div className={`${iconBgClassName} bg-[#EDEEEF] text-[#5B403C]`}>
              <Link2 size={16} />
            </div>
          }
          label={<span className={labelClassName}>Thêm liên kết</span>}
          onClick={() => {
            onSelect("link")
            onClose()
          }}
        />
      </MenuList>
    </div>
  )
}

export default AddContentMenu
