import React, { useState } from "react";
import { Send } from "lucide-react";
import Modal from "@/shared/components/ui/Modal";
import { useLanguage } from "@/shared/context/LanguageContext";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import toast from "react-hot-toast";
import { useInviteToRoomMutation } from "@/store/api/roomsApi";
import TextInput from "@/shared/components/ui/inputs/TextInput";

const InviteParticipantModal = ({ open, onClose, roomId }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [inviteToRoom, { isLoading }] = useInviteToRoomMutation();

  if (!open) return null;

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error(t.common?.emailRequired || "Vui lòng nhập email");
      return;
    }

    try {
      await inviteToRoom({ roomId, email: email.trim() }).unwrap();
      toast.success(t.rooms?.notifications?.inviteSent || "Đã gửi lời mời");
      setEmail("");
      onClose();
    } catch (err) {
      console.error("Failed to send invite:", err);
      toast.error(err?.data?.message || t.common?.errorOccurred || "Đã có lỗi xảy ra");
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
            disabled={isLoading || !email.trim()}
            variant="primary"
            startIcon={<Send size={18} />}
            className="!border-transparent !text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (t.common?.sending || "Đang gửi...") : (t.rooms?.videoCall?.sendInvite || "Gửi lời mời")}
          </PillButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <p className="text-sm text-gray-600">
          {t.rooms?.videoCall?.inviteDescription || "Nhập địa chỉ email của người bạn muốn mời vào phòng này. Họ sẽ nhận được thông báo kèm liên kết để tham gia."}
        </p>

        <TextInput
          label={t.common?.email || "Email"}
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && email.trim() && !isLoading) {
              handleInvite();
            }
          }}
          autoFocus
        />
      </div>
    </Modal>
  );
};

export default InviteParticipantModal;
