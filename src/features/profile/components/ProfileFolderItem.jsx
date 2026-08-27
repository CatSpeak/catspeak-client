import React from "react"
import { FcFolder } from "react-icons/fc"
import {
  Star,
  MoreVertical,
  Share2,
  Edit2,
  FolderInput,
  Trash2,
  Bookmark,
  FolderOpen,
  StarOff,
  Download,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Dropdown from "@/shared/components/ui/Dropdown"
import { IconButton } from "@/shared/components/ui/buttons"
import useLongPress from "../../materials/hooks/useLongPress"

const ProfileFolderItem = ({
  title,
  totalItems,
  updatedAt,
  isPublic,
  isOwnProfile,
  onClick,
  onShare,
  onRename,
  onMove,
  onDelete,
  onDownload,
  isSelected,
  isSelectionMode,
  onToggleSelect,
  onBookmark,
  allowDownload,
}) => {
  const { t } = useLanguage()
  const { handlers } = useLongPress({
    isSelectionMode,
    onToggleSelect,
    onClick,
  })

  const renderDropdown = () => (
    <Dropdown
      align="left"
      dropdownClassName="w-56"
      maxHeightClass="max-h-[360px]"
      onChange={(val) => {
        if (val === "download" && onDownload) onDownload()
        if (val === "share" && onShare) onShare()
        if (val === "rename" && onRename) onRename()
        if (val === "move" && onMove) onMove()
        if (val === "delete" && onDelete) onDelete()
        if (val === "bookmark" && onBookmark) onBookmark()
      }}
      options={
        isOwnProfile
          ? [
              {
                value: "download",
                label: t.materials.download,
                icon: <Download className="w-4 h-4" />,
              },
              {
                value: "share",
                label: t.materials.share,
                icon: <Share2 className="w-4 h-4" />,
              },
              {
                value: "rename",
                label: t.materials.rename,
                icon: <Edit2 className="w-4 h-4" />,
              },
              {
                value: "move",
                label: t.materials.move,
                icon: <FolderInput className="w-4 h-4" />,
              },
              {
                value: "delete",
                label: (
                  <span className="text-[#BA1A1A]">{t.materials.delete}</span>
                ),
                icon: <Trash2 className="w-4 h-4 text-[#BA1A1A]" />,
              },
            ]
          : [
              ...(allowDownload !== false
                ? [
                    {
                      value: "download",
                      label: t.materials.download,
                      icon: <Download className="w-4 h-4" />,
                    },
                  ]
                : []),
              {
                value: "share",
                label: t.materials.share,
                icon: <Share2 className="w-4 h-4" />,
              },
              ...(allowDownload !== false
                ? [
                    {
                      value: "bookmark",
                      label: t.materials.bookmark,
                      icon: <Bookmark className="w-4 h-4" />,
                    },
                  ]
                : []),
            ]
      }
      trigger={(isOpen, selectedOption, toggleDropdown) => (
        <IconButton
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            toggleDropdown()
          }}
        >
          <MoreVertical />
        </IconButton>
      )}
    />
  )
  return (
    <div
      {...handlers}
      className={`relative group border rounded-xl p-4 flex flex-col justify-between transition-all select-none ${
        isSelected
          ? "bg-[#FFF5F5] border-[#990011]"
          : "bg-white border-border hover:bg-primaryBg"
      } ${isOwnProfile || isSelectionMode ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <FcFolder className="text-2xl shrink-0" />
          <div>
            <h3 className="line-clamp-2">{title}</h3>

            <div className="flex items-center gap-2 text-sm text-secondary">
              <span>
                {t.materials.itemsCount?.replace(
                  "{{count}}",
                  totalItems || 0,
                ) || `${totalItems || 0} items`}
              </span>
              {updatedAt && (
                <>
                  <span
                    className="w-1 h-1 rounded-full bg-current shrink-0"
                    aria-hidden="true"
                  />
                  <span>{updatedAt}</span>
                </>
              )}
              {isOwnProfile && (
                <>
                  <span
                    className="w-1 h-1 rounded-full bg-current shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    {isPublic ? t.materials.public : t.materials.private}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div
          className="shrink-0 flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {renderDropdown()}
        </div>
      </div>
    </div>
  )
}

export default ProfileFolderItem
