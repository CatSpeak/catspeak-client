import React from "react"
import { Pencil, Trash, MoreVertical } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Popover from "@/shared/components/ui/Popover"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"

const CommentMoreMenu = ({ onEdit, onDelete, className = "" }) => {
  const { t } = useLanguage()

  return (
    <Popover
      placement="bottom-left"
      className={`shrink-0 ${className}`}
      trigger={
        <IconButton
          variant="ghost"
          aria-label={t.news?.newsDetail?.moreOptions || "More options"}
          title={t.news?.newsDetail?.moreOptions || "More options"}
        >
          <MoreVertical size={18} />
        </IconButton>
      }
      content={(close) => (
        <MenuList>
          <MenuItem
            icon={<Pencil size={18} />}
            label={t.news?.newsDetail?.editComment || "Edit"}
            onClick={() => {
              close()
              onEdit()
            }}
          />
          <MenuItem
            icon={<Trash size={18} />}
            label={t.news?.newsDetail?.deleteComment || "Delete"}
            onClick={() => {
              close()
              onDelete()
            }}
          />
        </MenuList>
      )}
    />
  )
}

export default CommentMoreMenu
