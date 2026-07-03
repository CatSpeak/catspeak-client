import React from "react"
import { AlertTriangle } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const LeaveCallModal = ({ open, onClose, onConfirm, isHost, isBreakoutActive }) => {
  const { t } = useLanguage()

  if (!open) return null

  const isBlocked = isHost && isBreakoutActive

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.videoCall?.leaveCall || "Leave Call"}
      size="sm"
    >
      <div className="flex flex-col gap-6 pb-6">
        {isBlocked ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-800 flex items-start gap-2.5 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900">Không thể rời cuộc họp lúc này</p>
              <p className="text-amber-800 font-normal leading-relaxed">
                Đang có các phòng thảo luận nhóm hoạt động. Với tư cách là Host, bạn cần đóng tất cả phòng nhỏ (Stop Breakout) trước khi rời họp.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            {t.rooms?.videoCall?.leaveCallConfirmText ||
              "Are you sure you want to leave this call?"}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <PillButton onClick={onClose} variant="secondary">
            {t.cancel || "Cancel"}
          </PillButton>
          <PillButton
            onClick={onConfirm}
            disabled={isBlocked}
            variant="primary"
            className="!border-transparent !text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.rooms?.videoCall?.leaveCall || "Leave"}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default LeaveCallModal
