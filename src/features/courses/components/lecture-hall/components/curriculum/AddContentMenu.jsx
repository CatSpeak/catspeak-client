import React from "react"
import { MessageSquareText, Folder, ClipboardList, Link2 } from "lucide-react"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import { useLanguage } from "@/shared/context/LanguageContext"

const AddContentMenu = ({ open = false, onClose = () => { }, onSelect = () => { } }) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.curriculum
  if (!open) return null

  const labelClassName = "text-sm font-semibold text-[#191C1D] dark:text-white"
  const iconBgClassName = "w-8 h-8 rounded-full flex items-center justify-center shrink-0"

  return (
    <div className="absolute right-14 top-14 z-30 animate-fadeIn">
      <MenuList className="w-full !py-2 rounded-xl shadow-faq-card border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] font-medium space-y-0.5">
        <MenuItem
          icon={
            <div className={`${iconBgClassName} bg-[#FFDAD4] dark:bg-red-950/40 text-primary dark:text-[#FF6B6B]`}>
              <MessageSquareText size={16} />
            </div>
          }
          label={<span className={labelClassName}>{dict.createBoard}</span>}
          onClick={() => {
            onSelect("announcement")
            onClose()
          }}
        />
        <MenuItem
          icon={
            <div className={`${iconBgClassName} bg-[#FFDCDB] dark:bg-amber-950/40 text-[#8A5100] dark:text-amber-400`}>
              <Folder size={16} />
            </div>
          }
          label={<span className={labelClassName}>{dict.addMaterial}</span>}
          onClick={() => {
            onSelect("material")
            onClose()
          }}
        />
        <MenuItem
          icon={
            <div className={`${iconBgClassName} bg-[#FFDBCF] dark:bg-orange-950/40 text-[#661E00] dark:text-orange-400`}>
              <ClipboardList size={16} />
            </div>
          }
          label={<span className={labelClassName}>{dict.addActivity}</span>}
          onClick={() => {
            onSelect("assignment")
            onClose()
          }}
        />
        <MenuItem
          icon={
            <div className={`${iconBgClassName} bg-[#EDEEEF] dark:bg-[#2A2A2A] text-[#5B403C] dark:text-gray-300`}>
              <Link2 size={16} />
            </div>
          }
          label={<span className={labelClassName}>{dict.addLink}</span>}
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
