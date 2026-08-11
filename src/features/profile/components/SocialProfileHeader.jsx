import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  MapPin,
  Edit2,
  UserPlus,
  Check,
  UserMinus,
  AtSign,
} from "lucide-react";
import Avatar from "@/shared/components/ui/Avatar";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import {
  useGetConnectionStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useSendFriendRequestMutation,
  useDeleteFriendshipMutation,
} from "../../../store/api/social/friendshipApi";
import { useGetCurrentBackgroundQuery } from "@/store/api/userApi";
import backgroundAccount from "@/shared/assets/backgrounds/background-account.png";

const SocialProfileHeader = ({
  user,
  formData,
  t,
  targetAccountId,
  isOwnProfile,
  onEditClick,
  friendsCount = 0,
  followersCount = 0,
}) => {
  // Use avatarImageUrl as the primary avatar for the profile
  const displayAvatarUrl = formData?.avatarImageUrl || user?.avatarImageUrl;
  const username = formData?.username || user?.username;
  const nickname = formData?.nickname || user?.nickname;
  const displayName = username || nickname || "(?)";
  const handle =
    nickname && nickname !== displayName
      ? nickname.startsWith("@")
        ? nickname.slice(1)
        : nickname
      : null;
  const location =
    formData?.location || user?.location || formData?.address || user?.address;

  // API Hooks
  const { data: statusResponse } = useGetConnectionStatusQuery(
    targetAccountId,
    {
      skip: isOwnProfile || !targetAccountId,
      pollingInterval: 3000,
    },
  );
  const status =
    statusResponse?.data !== undefined ? statusResponse.data : statusResponse;

  const [followUser, { isLoading: isFollowingLoading }] =
    useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingLoading }] =
    useUnfollowUserMutation();
  const [sendFriendRequest, { isLoading: isSendingRequest }] =
    useSendFriendRequestMutation();
  const [deleteFriendship, { isLoading: isDeletingFriendship }] =
    useDeleteFriendshipMutation();

  const [isFriendCooldown, setIsFriendCooldown] = useState(false);
  const cooldownTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, []);

  const isFollowLoading = isFollowingLoading || isUnfollowingLoading;
  const isFriendshipLoading = isSendingRequest || isDeletingFriendship;
  const isFriendshipDisabled = isFriendshipLoading || isFriendCooldown;

  const { data: currentBackgroundResponse, isLoading: isBackgroundLoading } =
    useGetCurrentBackgroundQuery(undefined, {
      skip: !isOwnProfile,
    });
  const fetchedCoverUrl = isOwnProfile
    ? currentBackgroundResponse?.data?.activeBackgroundUrl ||
      currentBackgroundResponse?.activeBackgroundUrl ||
      currentBackgroundResponse?.data?.customUploadedBackgroundUrl ||
      currentBackgroundResponse?.customUploadedBackgroundUrl ||
      (typeof currentBackgroundResponse?.data === "string"
        ? currentBackgroundResponse.data
        : null) ||
      (typeof currentBackgroundResponse === "string"
        ? currentBackgroundResponse
        : null) ||
      formData?.virtualBackgroundUrl ||
      user?.virtualBackgroundUrl
    : formData?.virtualBackgroundUrl ||
      user?.virtualBackgroundUrl ||
      formData?.activeBackgroundUrl ||
      user?.activeBackgroundUrl ||
      formData?.backgroundUrl ||
      user?.backgroundUrl ||
      null;

  const handleFollowToggle = async () => {
    if (isFollowLoading) return;
    // const toastId = "follow-action";
    // toast.loading(t.profile?.social?.processing || "Đang xử lý...", {
    //   id: toastId,
    // });

    try {
      if (status?.isFollowing) {
        await unfollowUser(targetAccountId).unwrap();
        toast.success(t.profile?.social?.unfollowSuccess || "Đã hủy theo dõi", {
          id: toastId,
        });
      } else {
        await followUser(targetAccountId).unwrap();
        toast.success(t.profile?.social?.followSuccess || "Đã theo dõi", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
        id: toastId,
      });
      console.error(error);
    }
  };

  const isFriendOrPending =
    status?.isFriend ||
    status?.friendshipStatus === 1 ||
    status?.friendshipStatus === "Pending";

  const handleFriendshipToggle = async () => {
    if (isFriendshipDisabled) return;

    // Start 3-second cooldown immediately upon clicking
    setIsFriendCooldown(true);
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
    }
    cooldownTimeoutRef.current = setTimeout(() => {
      setIsFriendCooldown(false);
    }, 3000);

    try {
      if (isFriendOrPending) {
        if (status?.friendshipId) {
          await deleteFriendship(status.friendshipId).unwrap();
          toast.success(
            status?.isFriend
              ? t.profile?.social?.unfriendSuccess || "Đã hủy kết bạn"
              : t.profile?.social?.cancelRequestSuccess ||
                  "Đã hủy yêu cầu kết bạn",
            { id: "friendship-action" },
          );
        }
      } else {
        if (status?.friendshipId) {
          await deleteFriendship(status.friendshipId).unwrap();
        }
        await sendFriendRequest(targetAccountId).unwrap();
        toast.success(
          t.profile?.social?.requestSent || "Đã gửi yêu cầu kết bạn",
          { id: "friendship-action" },
        );
      }
    } catch (err) {
      if (err?.status === 422) {
        toast.error(
          t.profile?.social?.requestPending ||
            "Yêu cầu kết bạn đã tồn tại hoặc đang chờ xử lý",
          { id: "friendship-action" },
        );
      } else {
        toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
          id: "friendship-action",
        });
      }
      console.error(err);
    }
  };

  const friendshipVariant = status?.isFriend
    ? "outline"
    : isFriendOrPending
      ? "secondary"
      : "outline";

  const friendshipIcon = isFriendOrPending ? <UserMinus /> : <UserPlus />;

  const friendshipLabel = status?.isFriend
    ? t.profile?.social?.unfriend || "Hủy kết bạn"
    : isFriendOrPending
      ? t.profile?.social?.cancelRequest || "Hủy yêu cầu"
      : t.profile?.social?.addFriend || "Kết bạn";

  const actionButtons = isOwnProfile
    ? onEditClick
      ? [
          {
            key: "edit",
            variant: "outline",
            startIcon: <Edit2 />,
            label: t.profile?.personalInfo?.edit || "Chỉnh sửa",
            onClick: onEditClick,
          },
        ]
      : []
    : [
        {
          key: "follow",
          variant: status?.isFollowing ? "secondary" : "primary",
          startIcon: status?.isFollowing ? <Check /> : <UserPlus />,
          label: status?.isFollowing
            ? t.profile?.social?.following || "Đang theo dõi"
            : t.profile?.social?.follow || "Theo dõi",
          onClick: handleFollowToggle,
          disabled: isFollowLoading,
          loading: isFollowLoading,
          className: isFollowLoading ? "cursor-not-allowed" : "",
        },
        {
          key: "friendship",
          variant: friendshipVariant,
          startIcon: friendshipIcon,
          label: friendshipLabel,
          onClick: handleFriendshipToggle,
          disabled: isFriendshipDisabled,
          loading: isFriendshipLoading,
          className: isFriendshipDisabled ? "cursor-not-allowed" : "",
        },
      ];

  return (
    <div className="w-full bg-white border border-[#e5e5e5] rounded-xl overflow-hidden mb-6">
      {/* Cover Photo Area */}
      <div className="w-full h-48 md:h-[280px] bg-gray-200 relative group overflow-hidden">
        {isBackgroundLoading ? (
          <div className="w-full h-full bg-gray-300 animate-pulse"></div>
        ) : (
          <img
            src={fetchedCoverUrl || backgroundAccount}
            alt="Cover fallback"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null; // prevent infinite loop
              e.target.src = backgroundAccount;
            }}
          />
        )}
      </div>

      {/* Profile Info Area */}
      <div className="p-4 sm:p-6 relative border-b border-gray-100 flex flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          {/* Avatar floating above the bottom border of the cover photo */}
          <div className="-mt-24 md:-mt-28 mb-5 relative z-10 p-1 bg-white rounded-full w-fit">
            <div className="relative rounded-full overflow-hidden">
              <Avatar
                size={133}
                src={displayAvatarUrl}
                alt={displayName}
                name={displayName}
                className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-purple-100 text-purple-600 text-4xl"
              />
            </div>
          </div>
          {/* Text Info */}
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 truncate whitespace-nowrap overflow-hidden">
              {displayName}
            </h1>
            <div className="flex flex-col gap-1">
              {handle && (
                <div className="flex items-center gap-2 text-sm text-[#606060]">
                  <AtSign size={16} />
                  <span>{handle}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2 text-sm text-[#606060]">
                  <MapPin size={16} />
                  <span>{location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-[#606060] mt-0.5 font-medium">
                <span>
                  <strong className="text-gray-900">{friendsCount}</strong>{" "}
                  {t.profile?.tabs?.friends || "Bạn bè"}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-gray-900">{followersCount}</strong>{" "}
                  {t.profile?.friends?.subTabs?.followers || "Người theo dõi"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="ml-auto flex flex-wrap justify-end gap-2 max-[425px]:w-full max-[425px]:justify-start">
          {actionButtons.map(
            ({
              key,
              variant,
              startIcon,
              label,
              onClick,
              disabled,
              loading,
              className: btnClass,
            }) => (
              <PillButton
                key={key}
                variant={variant}
                onClick={onClick}
                startIcon={startIcon}
                disabled={disabled}
                loading={loading}
                className={`max-[425px]:flex-1 ${btnClass || ""}`}
              >
                {label}
              </PillButton>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialProfileHeader;
