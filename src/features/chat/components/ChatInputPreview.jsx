import { X, FileIcon } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import ListItem from "@/shared/components/ui/ListItem"

/**
 * ChatInputPreview — renders thumbnail or document card for selected file attachments.
 */
const ChatInputPreview = ({ selectedFile, filePreviewUrl, onClear }) => {
  if (!selectedFile) return null

  if (filePreviewUrl) {
    return (
      <div className="relative inline-block w-fit group">
        <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden bg-black">
          {selectedFile.type.startsWith("video/") ? (
            <video
              src={filePreviewUrl}
              className="w-full h-full object-cover"
              preload="metadata"
              muted
              playsInline
            />
          ) : (
            <img
              src={filePreviewUrl}
              alt={selectedFile.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove attachment"
          className="absolute -top-5 -right-5 w-12 h-12 flex items-center justify-center focus:outline-none cursor-pointer"
        >
          <span className="w-7 h-7 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center hover:bg-[#f3f3f3]">
            <X size={14} />
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-[320px] w-full">
      <ListItem
        lines={2}
        className="bg-[#F3F3F3] rounded-xl border border-[#e5e5e5] overflow-hidden"
        leftContent={<FileIcon />}
        rightContent={
          <IconButton
            size="sm"
            variant="ghost"
            onClick={onClear}
            aria-label="Remove file attachment"
          >
            <X />
          </IconButton>
        }
      >
        <p className="font-semibold truncate m-0">{selectedFile.name}</p>
        <p className="text-sm text-[#606060] m-0">
          {(selectedFile.size / 1024).toFixed(1)} KB
        </p>
      </ListItem>
    </div>
  )
}

export default ChatInputPreview
