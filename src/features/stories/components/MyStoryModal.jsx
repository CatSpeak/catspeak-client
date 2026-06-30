import React, { useState } from "react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Modal from "@/shared/components/ui/Modal"
import { MessageSquare } from "lucide-react"

dayjs.extend(relativeTime)

const MyStoryModal = ({ open, story, onClose, onDelete }) => {
  const { t } = useLanguage()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleClose = () => {
    setConfirmDelete(false)
    onClose()
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(story?.storyId)
      handleClose()
    } else {
      setConfirmDelete(true)
    }
  }

  if (!story) return null

  // const createdAt = dayjs(story.createDate)
  // const expiresAt = dayjs(story.expiresAt)
  // const now = dayjs()
  // const timeRemaining = expiresAt.diff(now, "minute")
  // const hoursRemaining = Math.floor(timeRemaining / 60)
  // const minutesRemaining = timeRemaining % 60

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t.story?.myStory || "My Story"}
      bodyClassName="p-4 md:p-6 md:pt-0"
      className="md:max-w-[525px]"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-sm text-[#9e9e9e]">
          <span className="flex items-center gap-1">
            <MessageSquare size={13} className="shrink-0" />
            {story.commentCount || 0} {t.story?.replies}
          </span>
          <span>• {dayjs(story.createDate).fromNow()}</span>
        </div>

        <div className="min-h-[40px] w-full break-words text-base leading-relaxed whitespace-pre-wrap">
          {story.storyContent}
        </div>

        {/* <div className="space-y-4 text-sm">
          <div>
            <p className="text-[#7A7574]">{t.story?.created || "Created"}:</p>
            <p>{createdAt.format("MMM D, YYYY h:mm A")}</p>
          </div>

          <div>
            <p className="text-[#7A7574]">
              {t.story?.expiresIn || "Expires in"}:
            </p>

            <div className="flex items-center gap-2">
              <p>
                {hoursRemaining > 0 && `${hoursRemaining}h `}
                {minutesRemaining}m
              </p>
              <p>{expiresAt.format("MMM D, YYYY h:mm A")}</p>
            </div>
          </div>
        </div> */}

        <div className="flex justify-center gap-3 flex-1">
          <PillButton
            variant="secondary"
            onClick={handleClose}
            className="h-12 w-56 border border-primary text-primary"
          >
            {t.messages?.close || "Close"}
          </PillButton>
          <PillButton onClick={handleDelete} className="h-12 w-56">
            {confirmDelete
              ? t.story?.confirmDelete || "Confirm Delete"
              : t.story?.deleteStory || "Delete Story"}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default MyStoryModal
