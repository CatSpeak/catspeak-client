import React from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { UserPlus, UserCheck, Clock } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import PillButton from "./PillButton";
import {
  useGetConnectionStatusQuery,
  useSendFriendRequestMutation,
  useDeleteFriendshipMutation,
  useRespondFriendRequestMutation,
} from "@/store/api/social/friendshipApi";
import { selectCurrentUser } from "@/store/slices/authSlice";

const RequestButton = ({
  id,
  relationship,
  size = "md",
  t: propT,
  className = "",
  disabled = false,
  ...props
}) => {
  const { t: contextT } = useLanguage();
  const t = propT || contextT || {};
  const currentUser = useSelector(selectCurrentUser);

  const currentUserId =
    currentUser?.accountId ?? currentUser?.id ?? currentUser?.userId;
  const targetId = id != null ? Number(id) : null;
  const isOwnAccount =
    currentUserId != null &&
    targetId != null &&
    Number(currentUserId) === targetId;

  const shouldSkipQuery =
    !targetId ||
    isOwnAccount ||
    Boolean(
      relationship &&
      (relationship.isFriend !== undefined ||
        relationship.friendshipStatus !== undefined ||
        relationship.status !== undefined),
    );

  const { data: queriedStatusResponse, isLoading: isQueryLoading } =
    useGetConnectionStatusQuery(targetId, {
      skip: shouldSkipQuery,
      pollingInterval: 4000,
    });

  const [sendFriendRequest, { isLoading: isSending }] =
    useSendFriendRequestMutation();
  const [deleteFriendship, { isLoading: isDeleting }] =
    useDeleteFriendshipMutation();
  const [respondFriendRequest, { isLoading: isResponding }] =
    useRespondFriendRequestMutation();

  if (isOwnAccount || !targetId) {
    return null;
  }

  const rawStatus =
    queriedStatusResponse?.data !== undefined
      ? queriedStatusResponse.data
      : queriedStatusResponse || relationship || {};

  const isFriend = Boolean(
    rawStatus?.isFriend === true ||
    rawStatus?.friendshipStatus === 2 ||
    rawStatus?.friendshipStatus === "Accepted" ||
    rawStatus?.status === "Accepted",
  );

  const isPendingOutgoing = Boolean(
    !isFriend &&
    (rawStatus?.isPending === true ||
      rawStatus?.isRequested === true ||
      rawStatus?.isOutgoingRequest === true ||
      rawStatus?.isPendingRequest === true ||
      (rawStatus?.status === "Pending" &&
        (rawStatus?.isSender || !rawStatus?.isReceiver)) ||
      rawStatus?.friendshipStatus === 1 ||
      rawStatus?.friendshipStatus === "Pending"),
  );

  const isIncomingRequest = Boolean(
    !isFriend &&
    !isPendingOutgoing &&
    (rawStatus?.isIncomingRequest === true ||
      (rawStatus?.status === "Pending" && rawStatus?.isReceiver === true)),
  );

  const isActionLoading = isSending || isDeleting || isResponding;

  const friendshipId =
    rawStatus?.friendshipId ||
    rawStatus?.id ||
    relationship?.friendshipId ||
    relationship?.id ||
    targetId;

  const isSmall = size === "sm";
  const iconSize = isSmall ? 14 : 16;
  const buttonSizeClass = isSmall ? "!h-8 !px-3 !text-xs !gap-1.5" : "";

  const handleSendFriendRequest = async (e) => {
    e?.stopPropagation?.();
    if (isActionLoading || disabled) return;
    const toastId = "friend-request-action";

    try {
      await sendFriendRequest(targetId).unwrap();
      toast.success(
        t.profile?.social?.requestSent || "Đã gửi yêu cầu kết bạn",
        { id: toastId },
      );
    } catch (error) {
      toast.error(
        t.profile?.social?.requestError ||
        t.profile?.social?.errorOccurred ||
        "Không thể gửi yêu cầu kết bạn",
        { id: toastId },
      );
      console.error(error);
    }
  };

  const handleCancelFriendRequest = async (e) => {
    e?.stopPropagation?.();
    if (isActionLoading || disabled) return;
    const toastId = "friend-request-action";

    try {
      await deleteFriendship(friendshipId).unwrap();
      toast.success(
        t.profile?.social?.cancelRequestSuccess || "Đã hủy yêu cầu kết bạn",
        { id: toastId },
      );
    } catch (error) {
      toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
        id: toastId,
      });
      console.error(error);
    }
  };

  const handleAcceptFriendRequest = async (e) => {
    e?.stopPropagation?.();
    if (isActionLoading || disabled) return;
    const toastId = "friend-request-action";

    try {
      await respondFriendRequest({
        friendshipId,
        action: "accept",
      }).unwrap();
      toast.success(
        t.profile?.friends?.actions?.acceptSuccess || "Đã chấp nhận kết bạn!",
        { id: toastId },
      );
    } catch (error) {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra", {
        id: toastId,
      });
      console.error(error);
    }
  };

  const handleUnfriend = async (e) => {
    e?.stopPropagation?.();
    if (isActionLoading || disabled) return;
    const toastId = "friend-request-action";

    try {
      await deleteFriendship(friendshipId).unwrap();
      toast.success(t.profile?.social?.unfriendSuccess || "Đã hủy kết bạn", {
        id: toastId,
      });
    } catch (error) {
      toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
        id: toastId,
      });
      console.error(error);
    }
  };

  // State: Friend
  if (isFriend) {
    return (
      <PillButton
        variant="secondary"
        startIcon={<UserCheck size={iconSize} className="text-cath-red-700" />}
        onClick={handleUnfriend}
        loading={isActionLoading}
        disabled={disabled || isActionLoading}
        className={`${buttonSizeClass} ${className}`}
        {...props}
      >
        {t.profile?.social?.unfriend || t.profile?.tabs?.friends || "Bạn bè"}
      </PillButton>
    );
  }

  // State: Sent request (Pending outgoing)
  if (isPendingOutgoing) {
    return (
      <PillButton
        variant="secondary"
        startIcon={<Clock size={iconSize} />}
        onClick={handleCancelFriendRequest}
        loading={isActionLoading}
        disabled={disabled || isActionLoading}
        className={`${buttonSizeClass} ${className}`}
        {...props}
      >
        {t.profile?.social?.cancelRequest || "Hủy yêu cầu"}
      </PillButton>
    );
  }

  // State: Received request (Pending incoming)
  if (isIncomingRequest) {
    return (
      <PillButton
        variant="primary"
        startIcon={<UserCheck size={iconSize} />}
        onClick={handleAcceptFriendRequest}
        loading={isActionLoading}
        disabled={disabled || isActionLoading}
        className={`${buttonSizeClass} ${className}`}
        {...props}
      >
        {t.profile?.friends?.actions?.accept || "Chấp nhận"}
      </PillButton>
    );
  }

  // State: Not friends (Default)
  return (
    <PillButton
      variant="primary"
      startIcon={<UserPlus size={iconSize} />}
      onClick={handleSendFriendRequest}
      loading={isActionLoading || (isQueryLoading && !relationship)}
      disabled={disabled || isActionLoading}
      className={`${buttonSizeClass} ${className}`}
      {...props}
    >
      {t.profile?.social?.addFriend || "Kết bạn"}
    </PillButton>
  );
};

export default RequestButton;