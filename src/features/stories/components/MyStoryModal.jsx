import React, { useState } from "react"
import dayjs from "dayjs"
import { useLanguage } from "@/shared/context/LanguageContext"

import PillButton from "@/shared/components/ui/buttons/PillButton"
import Modal from "@/shared/components/ui/Modal"

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

  const createdAt = dayjs(story.createDate)
  const expiresAt = dayjs(story.expiresAt)
  const now = dayjs()
  const timeRemaining = expiresAt.diff(now, "minute")
  const hoursRemaining = Math.floor(timeRemaining / 60)
  const minutesRemaining = timeRemaining % 60

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t.story?.myStory || "My Story"}
    >
      <div className="space-y-6">
        <div className="min-h-[40px] w-full break-words rounded-lg bg-[#F2F2F2] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {story.storyContent}
        </div>

        <div className="space-y-4 text-sm">
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
        </div>

        <div className="flex justify-end gap-3 pb-4 pt-2">
          <PillButton
            variant="secondary"
            onClick={handleClose}
            className="h-10"
          >
            {t.messages?.close || "Close"}
          </PillButton>
          <PillButton onClick={handleDelete} className="h-10">
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
