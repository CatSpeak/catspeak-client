import React, { useState } from "react"
import { MessageSquare } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Modal from "@/shared/components/ui/Modal"

const BreakoutActiveFooter = ({
  broadcastMsg,
  setBroadcastMsg,
  handleBroadcastSubmit,
  isBroadcasting,
  handleStopBreakouts,
  isStopping,
}) => {
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
        Gửi thông báo chung
      </PillButton>

      <PillButton
        onClick={handleStopBreakouts}
        disabled={isStopping}
        loading={isStopping}
        variant="primary"
        className="w-full"
      >
        Đóng phòng
      </PillButton>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Gửi thông báo chung"
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-3">
            <TextInput
              placeholder="Ví dụ: Các em thảo luận trong 5 phút nữa nhé..."
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              autoFocus
            />
            <p className="text-sm text-[#606060]">
              Tin nhắn này sẽ được gửi đồng thời đến tất cả các phòng thảo luận
              nhỏ.
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
              Gửi
            </PillButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default BreakoutActiveFooter
