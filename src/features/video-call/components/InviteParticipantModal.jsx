import React, { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import Modal from "@/shared/components/ui/Modal";
import InvititeDropdown from "@/shared/components/ui/InvititeDropdown";
import Avatar from "@/shared/components/ui/Avatar";
import { useLanguage } from "@/shared/context/LanguageContext";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import toast from "react-hot-toast";
import { useInviteToRoomMutation } from "@/store/api/roomsApi";
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider";

const InviteParticipantModal = ({ open, onClose, roomId }) => {
  const { t } = useLanguage();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [inviteToRoom, { isLoading: isInviting }] = useInviteToRoomMutation();

  const { id: contextRoomId } = useGlobalVideoCall();
  const effectiveRoomId = roomId || contextRoomId;

  // Reset selected state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedEmails([]);
      setSelectedUsers({});
    }
  }, [open]);

  if (!open) return null;

  const handleSelectChange = (newValues, newOptions) => {
    setSelectedEmails(newValues);
    if (newOptions && Array.isArray(newOptions)) {
      const nextMap = { ...selectedUsers };
      newOptions.forEach((opt) => {
        if (opt?.value) {
          nextMap[opt.value] = opt.user || opt.friend || opt;
        }
      });
      setSelectedUsers(nextMap);
    }
  };

  const handleRemoveSelected = (val) => {
    setSelectedEmails((prev) => prev.filter((item) => item !== val));
  };

  const handleInvite = async () => {
    if (selectedEmails.length === 0) {
      toast.error(
        t.rooms?.videoCall?.selectAtLeastOne ||
          "Vui lòng chọn ít nhất một người bạn để mời"
      );
      return;
    }

    if (!effectiveRoomId) {
      toast.error(t.common?.errorOccurred || "Không tìm thấy thông tin phòng");
      return;
    }

    try {
      const invitePromises = selectedEmails.map((emailOrId) =>
        inviteToRoom({ roomId: effectiveRoomId, email: emailOrId }).unwrap()
      );
      const results = await Promise.allSettled(invitePromises);
      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const failedCount = results.filter((r) => r.status === "rejected").length;

      if (successCount > 0) {
        toast.success(
          failedCount === 0
            ? t.rooms?.notifications?.inviteSent || `Đã gửi lời mời thành công`
            : `Đã gửi lời mời cho ${successCount} người (${failedCount} thất bại)`
        );
        setSelectedEmails([]);
        setSelectedUsers({});
        onClose();
      } else {
        const firstError = results.find((r) => r.status === "rejected")?.reason;
        toast.error(
          firstError?.data?.message ||
            t.common?.errorOccurred ||
            "Gửi lời mời thất bại"
        );
      }
    } catch (err) {
      console.error("Failed to send invite:", err);
      toast.error(
        err?.data?.message || t.common?.errorOccurred || "Đã có lỗi xảy ra"
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.videoCall?.inviteParticipant || "Mời tham gia phòng"}
      size="sm"
      fullScreenOnMobile={false}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <PillButton onClick={onClose} variant="secondary">
            {t.cancel || "Hủy"}
          </PillButton>

          <PillButton
            onClick={handleInvite}
            disabled={isInviting || selectedEmails.length === 0}
            variant="primary"
            startIcon={<Send size={18} />}
            className="!border-transparent !text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInviting
              ? t.common?.sending || "Đang gửi..."
              : `${t.rooms?.videoCall?.sendInvite || "Gửi lời mời"}${
                  selectedEmails.length > 0 ? ` (${selectedEmails.length})` : ""
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
          <label className="text-xs font-medium text-gray-700">
            {t.rooms?.videoCall?.selectFriends || "Danh sách bạn bè"}
          </label>

          <InvititeDropdown
            mode="friends"
            value={selectedEmails}
            onChange={handleSelectChange}
            disabled={isInviting}
          />

          {/* Selected Friends Tags */}
          {selectedEmails.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-[100px] overflow-y-auto">
              {selectedEmails.map((val) => {
                const user = selectedUsers[val];
                const displayName = user?.username || user?.name || val;
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InviteParticipantModal;
