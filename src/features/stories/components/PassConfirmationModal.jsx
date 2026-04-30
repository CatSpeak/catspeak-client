import React, { useState } from "react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useLanguage } from "@/shared/context/LanguageContext"

import Avatar from "@/shared/components/ui/Avatar"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Modal from "@/shared/components/ui/Modal"

dayjs.extend(relativeTime)

const PassConfirmationModal = ({ open, story, onConnect, onPass, onClose }) => {
  const { t } = useLanguage()
  const [confirmPass, setConfirmPass] = useState(false)

  const handleClose = () => {
    setConfirmPass(false)
    onClose()
  }

  const handlePass = () => {
    if (confirmPass) {
      onPass(story)
      handleClose()
    } else {
      setConfirmPass(true)
    }
  }

  const handleConnect = () => {
    onConnect(story)
    handleClose()
  }

  if (!story) return null

  const createdAt = dayjs(story.createDate)
  const expiresAt = dayjs(story.expiresAt)
  const now = dayjs()
  const timeRemaining = expiresAt.diff(now, "minute")
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / 60))
  const minutesRemaining = Math.max(0, timeRemaining % 60)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t.catSpeak?.story || "Story"}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Avatar
            src={story.avatarImageUrl}
            name={story.username || t.catSpeak?.anonymous || "Anonymous"}
            size={40}
          />
          <div className="flex flex-col">
            <span className="font-semibold">
              {story.username || t.catSpeak?.anonymous || "Anonymous"}
            </span>
          </div>
        </div>

        <div className="min-h-[40px] w-full break-words rounded-lg bg-[#F2F2F2] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {story.storyContent}
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-[#7A7574]">
              {t.catSpeak?.created || "Created"}:
            </p>
            <p>{createdAt.format("MMM D, YYYY h:mm A")}</p>
          </div>

          <div>
            <p className="text-[#7A7574]">
              {t.catSpeak?.expiresIn || "Expires in"}:
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

        <div className="flex justify-end gap-3">
          <PillButton variant="secondary" onClick={handlePass} className="h-10">
            {confirmPass
              ? t.catSpeak?.confirm || "Confirm Pass"
              : t.catSpeak?.pass || "Pass"}
          </PillButton>
          <PillButton onClick={handleConnect} className="h-10">
            {t.catSpeak?.connect || "Connect"}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default PassConfirmationModal
