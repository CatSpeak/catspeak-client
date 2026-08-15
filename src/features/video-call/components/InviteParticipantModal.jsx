import React, { useState } from "react"
import { Send, X } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import InvititeDropdown from "@/shared/components/ui/InvititeDropdown"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import toast from "react-hot-toast"
import { useInviteToRoomMutation } from "@/store/api/roomsApi"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

const InviteParticipantModal = ({ open, onClose, roomId }) => {
  const { t } = useLanguage()
  const [selectedAccountIds, setSelectedAccountIds] = useState([])
  const [selectedUsers, setSelectedUsers] = useState({})
  const [inviteToRoom, { isLoading: isInviting }] = useInviteToRoomMutation()

  const { id: contextRoomId } = useGlobalVideoCall()
  const effectiveRoomId = roomId || contextRoomId

  const handleModalClose = () => {
    setSelectedAccountIds([])
    setSelectedUsers({})
    onClose?.()
  }

  if (!open) return null

  const handleSelectChange = (newValues, newOptions) => {
    setSelectedAccountIds(newValues)
    if (newOptions && Array.isArray(newOptions)) {
      const nextMap = { ...selectedUsers }
      newOptions.forEach((opt) => {
        if (opt?.value != null) {
          nextMap[opt.value] = opt.user || opt.friend || opt
        }
      })
      setSelectedUsers(nextMap)
    }
  }

  const handleRemoveSelected = (val) => {
    setSelectedAccountIds((prev) => prev.filter((item) => item !== val))
  }

  const handleInvite = async () => {
    const idsToSend = (
      Array.isArray(selectedAccountIds)
        ? selectedAccountIds
        : [selectedAccountIds]
    )
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0)

    if (idsToSend.length === 0) {
      toast.error(
        t.rooms?.videoCall?.selectAtLeastOne ||
          "Vui lòng chọn ít nhất một người bạn để mời",
      )
      return
    }

    if (!effectiveRoomId) {
      toast.error(t.common?.errorOccurred || "Không tìm thấy thông tin phòng")
      return
    }

    try {
      const res = await inviteToRoom({
        roomId: effectiveRoomId,
        accountIds: idsToSend,
      }).unwrap()

      const results =
        res?.results || res?.data?.results || (Array.isArray(res) ? res : [])

      const invitedCount = results.filter((r) => r.status === "invited").length
      const alreadyInRoomCount = results.filter(
        (r) => r.status === "already_in_room",
      ).length
      const notFoundCount = results.filter(
        (r) => r.status === "not_found",
      ).length

      if (invitedCount > 0) {
        if (alreadyInRoomCount > 0 || notFoundCount > 0) {
          const details = []
          if (alreadyInRoomCount > 0)
            details.push(`${alreadyInRoomCount} đã ở trong phòng`)
          if (notFoundCount > 0) details.push(`${notFoundCount} không tìm thấy`)
          toast.success(
            `Đã gửi lời mời cho ${invitedCount} người (${details.join(", ")})`,
          )
        } else {
          toast.success(
            t.rooms?.notifications?.inviteSent || "Đã gửi lời mời thành công",
          )
        }
        handleModalClose()
      } else if (alreadyInRoomCount > 0) {
        toast.error("Người bạn chọn đã ở trong phòng họp.")
      } else {
        toast.error(
          res?.message || t.common?.errorOccurred || "Gửi lời mời thất bại",
        )
      }
    } catch (err) {
      console.error("Failed to send invite:", err)
      toast.error(
        err?.data?.message || t.common?.errorOccurred || "Đã có lỗi xảy ra",
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      title={t.rooms?.videoCall?.inviteParticipant || "Mời tham gia phòng"}
      size="sm"
      fullScreenOnMobile={false}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <PillButton onClick={handleModalClose} variant="secondary">
            {t.cancel || "Hủy"}
          </PillButton>

          <PillButton
            onClick={handleInvite}
            disabled={isInviting || selectedAccountIds.length === 0}
            variant="primary"
            startIcon={<Send size={18} />}
            className="!border-transparent !text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInviting
              ? t.common?.sending || "Đang gửi..."
              : `${t.rooms?.videoCall?.sendInvite || "Gửi lời mời"}${
                  selectedAccountIds.length > 0
                    ? ` (${selectedAccountIds.length})`
                    : ""
                }`}
          </PillButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <p className="text-sm text-gray-600">
          {t.rooms?.videoCall?.inviteDescription ||
            "Chọn bạn bè bạn muốn mời vào phòng này. Họ sẽ nhận được thông báo kèm liên kết để tham gia."}
        </p>

        <div className="flex flex-col gap-2">
          <InvititeDropdown
            mode="friends"
            value={selectedAccountIds}
            onChange={handleSelectChange}
            disabled={isInviting}
          />

          {/* Selected Friends Tags */}
          {selectedAccountIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-[100px] overflow-y-auto">
              {selectedAccountIds.map((val) => {
                const user = selectedUsers[val]
                const displayName =
                  user?.username || user?.name || `User #${val}`
                return (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-[#990011] border border-red-100"
                  >
                    <Avatar
                      src={
                        user?.avatarImageUrl ||
                        user?.avatarUrl ||
                        user?.meetingAvatarUrl
                      }
                      name={displayName}
                      size={16}
                      clickable={false}
                    />
                    <span className="max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelected(val)}
                      className="hover:text-red-900 transition-colors ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default InviteParticipantModal
