import React from "react"
import { Reply, MoreHorizontal, Trash2, Undo2, Copy } from "lucide-react"
import toast from "react-hot-toast"
import Popover from "@/shared/components/ui/Popover"
import { IconButton } from "@/shared/components/ui/buttons"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * ChatBubbleActions — action bar & popover menu for chat message bubbles.
 *
 * Provides quick actions:
 * - Reply (calls onReply)
 * - Copy (copies text or media link)
 * - Remove for me (calls onDeleteForMe)
 * - Remove for everyone (calls onRecall, restricted to message owner)
 *
 * @param {boolean}  isOwn - Whether bubble belongs to local user
 * @param {function} onReply - Reply handler
 * @param {function} onDeleteForMe - Soft delete handler
 * @param {function} onRecall - Message recall handler
 * @param {object}   message - Target message object
 */
const ChatBubbleActions = ({
  isOwn = false,
  onReply,
  onDeleteForMe,
  onRecall,
  message,
  onMenuOpenChange,
  isWidget = false,
}) => {
  const { t } = useLanguage()
  const contentToCopy =
    message?.content ||
    message?.messageContent ||
    message?.mediaUrl ||
    message?.fileUrl ||
    message?.attachmentUrl

  const handleCopy = () => {
    if (!contentToCopy) return
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(contentToCopy)
        .then(() => toast.success(t?.chat?.actions?.copied || "Copied to clipboard"))
        .catch(() => toast.error(t?.chat?.actions?.failedCopy || "Failed to copy"))
    }
  }

  if (!onReply && !onDeleteForMe && !onRecall && !contentToCopy) return null

  if (isWidget) {
    return (
      <div
        className={`absolute bottom-0 z-10 flex items-center transition-opacity opacity-0 group-hover:opacity-100 ${
          isOwn ? "right-full mr-2 flex-row-reverse" : "left-full ml-2 flex-row"
        }`}
      >
        <Popover
          placement="top-right"
          onOpenChange={onMenuOpenChange}
          trigger={
            <IconButton type="button" variant="ghost" title={t?.chat?.actions?.moreActions || "More actions"}>
              <MoreHorizontal />
            </IconButton>
          }
          content={(close) => (
            <MenuList className="min-w-[150px] z-50">
              {onReply && (
                <MenuItem
                  onClick={() => {
                    close()
                    onReply(message)
                  }}
                  icon={<Reply />}
                  label={t?.chat?.actions?.reply || "Reply"}
                />
              )}

              {contentToCopy && (
                <MenuItem
                  onClick={() => {
                    close()
                    handleCopy()
                  }}
                  icon={<Copy />}
                  label={t?.chat?.actions?.copy || "Copy"}
                />
              )}

              {onDeleteForMe && (
                <MenuItem
                  onClick={() => {
                    close()
                    onDeleteForMe(message)
                  }}
                  icon={<Trash2 />}
                  label={t?.chat?.actions?.removeForMe || "Remove for me"}
                />
              )}

              {isOwn && onRecall && (
                <MenuItem
                  onClick={() => {
                    close()
                    onRecall(message)
                  }}
                  className="text-red-600"
                  icon={<Undo2 />}
                  label={t?.chat?.actions?.removeForEveryone || "Remove for everyone"}
                />
              )}
            </MenuList>
          )}
        />
      </div>
    )
  }

  return (
    <div
      className={`absolute bottom-0 z-10 flex items-center transition-opacity opacity-0 group-hover:opacity-100 ${
        isOwn ? "right-full mr-2 flex-row-reverse" : "left-full ml-2 flex-row"
      }`}
    >
      {onReply && (
        <IconButton
          type="button"
          variant="ghost"
          onClick={() => onReply(message)}
          title={t?.chat?.actions?.reply || "Reply"}
        >
          <Reply />
        </IconButton>
      )}

      {contentToCopy && (
        <IconButton
          type="button"
          variant="ghost"
          onClick={handleCopy}
          title={t?.chat?.actions?.copy || "Copy"}
        >
          <Copy />
        </IconButton>
      )}

      {(onDeleteForMe || (isOwn && onRecall)) && (
        <Popover
          placement="top-right"
          onOpenChange={onMenuOpenChange}
          trigger={
            <IconButton type="button" variant="ghost" title={t?.chat?.actions?.moreActions || "More actions"}>
              <MoreHorizontal />
            </IconButton>
          }
          content={(close) => (
            <MenuList className="min-w-[150px] z-50">
              {onDeleteForMe && (
                <MenuItem
                  onClick={() => {
                    close()
                    onDeleteForMe(message)
                  }}
                  icon={<Trash2 />}
                  label={t?.chat?.actions?.removeForMe || "Remove for me"}
                />
              )}

              {isOwn && onRecall && (
                <MenuItem
                  onClick={() => {
                    close()
                    onRecall(message)
                  }}
                  className="text-red-600"
                  icon={<Undo2 />}
                  label={t?.chat?.actions?.removeForEveryone || "Remove for everyone"}
                />
              )}
            </MenuList>
          )}
        />
      )}
    </div>
  )
}

export default ChatBubbleActions
