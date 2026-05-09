import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const RoomFullModal = ({ open, onClose }) => {
  const { t } = useLanguage()

  return (
    <Modal open={open} onClose={onClose} title={t.rooms.roomFullModal.title}>
      <div className="flex flex-col items-center gap-4 text-center pb-6">
        <div className="flex flex-col gap-2">
          <p className="m-0 text-base">{t.rooms.roomFullModal.message}</p>
          <p className="m-0 text-sm text-[#7A7574]">
            {t.rooms.roomFullModal.subMessage}
          </p>
        </div>
        <PillButton onClick={onClose} className="mt-2 min-w-[100px]">
          {t.rooms.roomFullModal.close}
        </PillButton>
      </div>
    </Modal>
  )
}

export default RoomFullModal
