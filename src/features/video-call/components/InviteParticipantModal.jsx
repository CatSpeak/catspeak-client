import React, { useState } from "react"
import { Check, Send, UserPlus, Users, X } from "lucide-react"
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

  const title = t.rooms?.videoCall?.inviteParticipant || "Mời tham gia phòng"
  const selectedCount = selectedAccountIds.length
  const hasSelection = selectedCount > 0

  const readyHint =
    t.rooms?.videoCall?.inviteReadyHint ||
    "Sẵn sàng gửi lời mời đến {{count}} người bạn."

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      ariaLabel={title}
      showCloseButton
      fullScreenOnMobile={false}
      className="md:max-w-lg rounded-3xl"
      headerClassName="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cath-red-700 to-cath-red-500 text-white shadow-sm ring-4 ring-red-50">
            <UserPlus size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 leading-tight">
              {title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {t.rooms?.videoCall?.inviteSubtitle ||
                "Gửi lời mời tham gia đến bạn bè của bạn"}
            </p>
          </div>
        </div>
      }
      bodyClassName="px-5 sm:px-6 py-5 flex flex-col gap-4 flex-1 overflow-y-auto"
      footerClassName="px-5 sm:px-6 py-4 bg-gray-50/70 border-t border-gray-100"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <div className="hidden sm:flex items-center gap-2 min-w-0 text-xs">
            {hasSelection ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
                  <Check size={11} strokeWidth={3} />
                </span>
                {readyHint.replace("{{count}}", String(selectedCount))}
              </span>
            ) : (
              <span className="text-gray-400 truncate">
                {t.rooms?.videoCall?.inviteEmptyHint ||
                  "Chọn ít nhất một người bạn để gửi lời mời."}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 shrink-0">
            <PillButton onClick={handleModalClose} variant="secondary">
              {t.cancel || "Hủy"}
            </PillButton>

            <PillButton
              onClick={handleInvite}
              disabled={isInviting || !hasSelection}
              loading={isInviting}
              loadingText={t.common?.sending || "Đang gửi..."}
              variant="primary"
              startIcon={<Send size={18} />}
              className="min-w-[132px]"
            >
              {`${t.rooms?.videoCall?.sendInvite || "Gửi lời mời"}${
                hasSelection ? ` (${selectedCount})` : ""
              }`}
            </PillButton>
          </div>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-gray-600">
        {t.rooms?.videoCall?.inviteDescription ||
          "Chọn bạn bè bạn muốn mời vào phòng này. Họ sẽ nhận được thông báo kèm liên kết để tham gia."}
      </p>

      <div className="flex flex-col gap-2.5">
        <InvititeDropdown
          mode="friends"
          value={selectedAccountIds}
          onChange={handleSelectChange}
          disabled={isInviting}
        />

        {hasSelection ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                {t.rooms?.videoCall?.inviteSelectedTitle || "Đã chọn"}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-cath-red-700 border border-red-100">
                {selectedCount}
              </span>
            </div>

            {/* Chip collection reflows with flex-wrap so labels are never clipped */}
            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {selectedAccountIds.map((val) => {
                const user = selectedUsers[val]
                const displayName =
                  user?.username || user?.name || `User #${val}`
                return (
                  <span
                    key={val}
                    className="group inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full text-xs font-medium bg-white text-gray-800 border border-gray-200 shadow-xs transition-colors hover:border-cath-red-200 hover:bg-red-50/60"
                  >
                    <Avatar
                      src={
                        user?.avatarImageUrl ||
                        user?.avatarUrl ||
                        user?.meetingAvatarUrl
                      }
                      name={displayName}
                      size={20}
                      clickable={false}
                    />
                    <span className="max-w-[120px] truncate font-semibold">
                      {displayName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelected(val)}
                      aria-label={(t.rooms?.videoCall?.inviteRemove ||
                        "Bỏ chọn {{name}}").replace("{{name}}", displayName)}
                      className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-100 hover:text-cath-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-3.5 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400">
              <Users size={16} />
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              {t.rooms?.videoCall?.inviteEmptyHint ||
                "Chọn ít nhất một người bạn để gửi lời mời."}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default InviteParticipantModal
