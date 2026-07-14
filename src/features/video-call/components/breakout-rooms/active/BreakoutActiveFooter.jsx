import React, { useState } from "react"
import { MessageSquare } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"

const BreakoutActiveFooter = ({
  broadcastMsg,
  setBroadcastMsg,
  handleBroadcastSubmit,
  isBroadcasting,
  handleStopBreakouts,
  isStopping,
}) => {
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!broadcastMsg.trim()) return
    await handleBroadcastSubmit(e)
    setIsModalOpen(false)
  }

  return (
    <div className="p-4 border-t border-[#e5e5e5] flex flex-col shrink-0">
      <PillButton
        onClick={() => setIsModalOpen(true)}
        variant="secondary"
        className="w-full"
        startIcon={<MessageSquare />}
      >
        {t.rooms.breakoutRooms.broadcastBtn}
      </PillButton>

      <PillButton
        onClick={handleStopBreakouts}
        disabled={isStopping}
        loading={isStopping}
        variant="primary"
        className="w-full"
      >
        {t.rooms.breakoutRooms.closeRoomsBtn}
      </PillButton>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t.rooms.breakoutRooms.broadcastTitle}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-3">
            <TextInput
              placeholder={t.rooms.breakoutRooms.broadcastPlaceholder}
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              autoFocus
            />
            <p className="text-sm text-[#606060]">
              {t.rooms.breakoutRooms.broadcastDesc}
            </p>
          </div>

          <div className="flex justify-end">
            <PillButton
              type="submit"
              disabled={isBroadcasting || !broadcastMsg.trim()}
              loading={isBroadcasting}
              variant="primary"
              className="w-full sm:w-auto"
            >
              {t.rooms.breakoutRooms.sendBtn}
            </PillButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default BreakoutActiveFooter
