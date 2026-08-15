import React, { useState, useEffect, useMemo } from "react";
import { Send, Check, X } from "lucide-react";
import Modal from "@/shared/components/ui/Modal";
import Dropdown from "@/shared/components/ui/Dropdown";
import Avatar from "@/shared/components/ui/Avatar";
import { useLanguage } from "@/shared/context/LanguageContext";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import toast from "react-hot-toast";
import { useInviteToRoomMutation } from "@/store/api/roomsApi";
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi";
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider";
import { parseMetadata } from "@/features/video-call/hooks/useParticipantList";

const InviteParticipantModal = ({ open, onClose, roomId }) => {
  const { t } = useLanguage();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [inviteToRoom, { isLoading: isInviting }] = useInviteToRoomMutation();

  // Get current user and active room participants from GlobalVideoCall context
  const { participants = [], user, id: contextRoomId } = useGlobalVideoCall();
  const effectiveRoomId = roomId || contextRoomId;
  const currentAccountId = user?.accountId;

  // Fetch friends list of the current user
  const { data: friendsResponse, isLoading: isFriendsLoading } =
    useGetFriendsQuery(currentAccountId, {
      skip: !currentAccountId || !open,
    });

  // Reset selected state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedEmails([]);
    }
  }, [open]);

  // Normalize friends response array
  const friendsList = useMemo(() => {
    if (!friendsResponse) return [];
    if (Array.isArray(friendsResponse)) return friendsResponse;
    if (Array.isArray(friendsResponse.data)) return friendsResponse.data;
    return [];
  }, [friendsResponse]);

  // Identify all active participants currently in the room (by accountId, email, username, identity)
  const currentRoomMembers = useMemo(() => {
    const accountIds = new Set();
    const emails = new Set();
    const usernames = new Set();

    // Include the current logged-in user
    if (user?.accountId) accountIds.add(String(user.accountId));
    if (user?.email) emails.add(user.email.toLowerCase().trim());
    if (user?.username) usernames.add(user.username.toLowerCase().trim());

    // Include all active LiveKit participants
    (participants || []).forEach((p) => {
      if (p?.identity) accountIds.add(String(p.identity));
      const meta = parseMetadata(p?.metadata);
      if (meta?.accountId) accountIds.add(String(meta.accountId));
      if (meta?.email) emails.add(String(meta.email).toLowerCase().trim());
      if (meta?.username) usernames.add(String(meta.username).toLowerCase().trim());
    });

    return { accountIds, emails, usernames };
  }, [participants, user]);

  // Filter out friends who are ALREADY in the room
  const availableFriends = useMemo(() => {
    return friendsList.filter((friend) => {
      if (!friend) return false;
      const isIdInRoom =
        friend.accountId !== undefined &&
        friend.accountId !== null &&
        currentRoomMembers.accountIds.has(String(friend.accountId));
      const isEmailInRoom =
        friend.email &&
        currentRoomMembers.emails.has(friend.email.toLowerCase().trim());
      const isUsernameInRoom =
        friend.username &&
        currentRoomMembers.usernames.has(friend.username.toLowerCase().trim());

      return !isIdInRoom && !isEmailInRoom && !isUsernameInRoom;
    });
  }, [friendsList, currentRoomMembers]);

  // Prepare Dropdown options with searchTerms, label, subtitle, and friend data
  const dropdownOptions = useMemo(() => {
    return availableFriends.map((friend) => ({
      value: friend.email || String(friend.accountId),
      label: friend.username || friend.email || "User",
      subtitle: friend.email || "",
      searchTerms: `${friend.username || ""} ${friend.email || ""}`,
      friend,
    }));
  }, [availableFriends]);

  if (!open) return null;

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

          <Dropdown
            mode="multiple"
            options={dropdownOptions}
            value={selectedEmails}
            onChange={(newValues) => setSelectedEmails(newValues)}
            enableSearch={true}
            loading={isFriendsLoading}
            placeholder={
              isFriendsLoading
                ? t.common?.loading || "Đang tải danh sách bạn bè..."
                : availableFriends.length === 0
                ? "Không có bạn bè nào sẵn sàng để mời"
                : "Chọn bạn bè..."
            }
            searchPlaceholder="Tìm kiếm theo tên hoặc email..."
            disabled={isFriendsLoading || availableFriends.length === 0 || isInviting}
            className="w-full"
            dropdownClassName="w-full min-w-full shadow-xl rounded-2xl"
            maxHeightClass="max-h-[280px]"
            renderOption={(option, isSelected) => {
              const friend = option.friend;
              return (
                <div
                  className={`w-full px-3 py-2 flex items-center justify-between transition-colors rounded-xl text-left text-sm hover:bg-neutral-100 ${
                    isSelected ? "bg-neutral-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
                    <Avatar
                      src={friend?.avatarImageUrl}
                      name={friend?.username}
                      size={32}
                      clickable={false}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {friend?.username}
                      </span>
                      {friend?.email && (
                        <span className="text-xs text-gray-500 truncate">
                          {friend.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center ml-2 shrink-0">
                    <div
                      className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                        isSelected
                          ? "bg-[#990011] border-[#990011] text-white"
                          : "border-gray-300 bg-white group-hover:border-gray-400"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            }}
          />

          {/* Selected Friends Tags */}
          {selectedEmails.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-[100px] overflow-y-auto">
              {selectedEmails.map((val) => {
                const opt = dropdownOptions.find((o) => o.value === val);
                const friend = opt?.friend;
                return (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-[#990011] border border-red-100"
                  >
                    <Avatar
                      src={friend?.avatarImageUrl}
                      name={friend?.username || val}
                      size={16}
                      clickable={false}
                    />
                    <span className="max-w-[120px] truncate">
                      {friend?.username || val}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedEmails((prev) =>
                          prev.filter((item) => item !== val)
                        )
                      }
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
