import React from "react"
import {
  MoreVertical,
  Download,
  Share2,
  Edit2,
  FolderInput,
  Trash2,
  Bookmark,
  Star,
  StarOff,
  Settings,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  FileSpreadsheet,
} from "lucide-react"
import FilePreview from "@/shared/components/ui/FilePreview"
import Dropdown from "@/shared/components/ui/Dropdown"
import { IconButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"
import useLongPress from "../../materials/hooks/useLongPress"

const getFileTypeIcon = (fileName = "", url = "") => {
  const name = fileName || url || ""
  const ext = name.includes(".")
    ? name.split(".").pop().toLowerCase().split("?")[0]
    : ""

  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    return <ImageIcon className="text-rose-500 shrink-0" />
  }
  if (["mp4", "webm", "ogg", "mov", "mkv"].includes(ext)) {
    return <Film className="text-purple-500 shrink-0" />
  }
  if (["mp3", "wav", "m4a", "flac"].includes(ext)) {
    return <Music className="text-amber-500 shrink-0" />
  }
  if (ext === "pdf") {
    return <FileText className="text-red-500 shrink-0" />
  }
  if (["doc", "docx"].includes(ext)) {
    return <FileText className="text-blue-600 shrink-0" />
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className="text-emerald-600 shrink-0" />
  }
  if (["ppt", "pptx"].includes(ext)) {
    return <FileText className="text-orange-500 shrink-0" />
  }
  return <FileText className="text-gray-500 shrink-0" />
}

const ProfileFileItem = ({
  title,
  size,
  date,
  isPublic,
  fileUrl,
  isOwnProfile,
  isBookmarked,
  isList = false,
  onDownload,
  onShare,
  onRename,
  onMove,
  onDelete,
  onBookmark,
  onEdit,
  onClick,
  isSelected,
  isSelectionMode,
  onToggleSelect,
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
        if (val === "edit" && onEdit) onEdit()
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
                value: "edit",
                label: t.materials.edit,
                icon: <Settings className="w-4 h-4" />,
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
      className={`group relative border rounded-xl p-4 flex ${isList ? "flex-row items-center" : "flex-col"} w-full cursor-pointer transition-all select-none ${
        isSelected
          ? "bg-[#FFF5F5] border-[#990011]"
          : "bg-white border-border hover:bg-primaryBg"
      }`}
      {...handlers}
    >
      {isList ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {getFileTypeIcon(title, fileUrl)}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate" title={title}>
                  {title}
                </h3>
                {isOwnProfile && isBookmarked && (
                  <Star className="w-4 h-4 text-[#FF9C4F] fill-[#FF9C4F] shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-secondary">
                <span>{size}</span>
                {date && (
                  <>
                    <span
                      className="w-1 h-1 rounded-full bg-current shrink-0"
                      aria-hidden="true"
                    />
                    <span>{date}</span>
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
      ) : (
        <div className="flex flex-col justify-between h-full gap-4">
          {/* Top Header Row: File Type Icon + Title + Metadata on left, 3-Dot on right */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {getFileTypeIcon(title, fileUrl)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="truncate" title={title}>
                    {title}
                  </h3>
                  {isOwnProfile && isBookmarked && (
                    <Star className="w-4 h-4 text-[#FF9C4F] fill-[#FF9C4F] shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span>{size}</span>
                  {date && (
                    <>
                      <span
                        className="w-1 h-1 rounded-full bg-current shrink-0"
                        aria-hidden="true"
                      />
                      <span>{date}</span>
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

          {/* Large Preview Thumbnail */}
          <div className="relative w-full aspect-video rounded-xl border border-border flex items-center justify-center overflow-hidden bg-[#F3F3F3]">
            <FilePreview url={fileUrl} fileName={title} isThumbnail={true} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileFileItem
