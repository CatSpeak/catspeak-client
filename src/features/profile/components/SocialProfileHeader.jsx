import React, { useRef } from "react";
import toast from "react-hot-toast";
import {
  MapPin,
  Edit2,
  BadgeCheck,
  UserPlus,
  Check,
  UserMinus,
  Camera,
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
} from "../api/friendshipApi";
import {
  useUpdateAvatarMutation,
  useGetCurrentBackgroundQuery,
} from "@/store/api/userApi";
import backgroundAccount from "@/shared/assets/backgrounds/background-account.png";

const SocialProfileHeader = ({
  user,
  formData,
  t,
  targetAccountId,
  isOwnProfile,
  onEditClick,
}) => {
  // Use avatarImageUrl as the primary avatar for the profile
  const displayAvatarUrl = formData?.avatarImageUrl || user?.avatarImageUrl;
  const nickname = formData?.nickname || user?.nickname;
  const username = formData?.username || user?.username;
  const displayName = nickname || username || "Lorem Ipsum";
  const handle = nickname ? username : null;
  const bio = "Bio description"; // Mocked for now
  const location = formData?.location || user?.location;

  // API Hooks
  const { data: statusResponse } = useGetConnectionStatusQuery(
    targetAccountId,
    { skip: isOwnProfile || !targetAccountId },
  );
  const status =
    statusResponse?.data !== undefined ? statusResponse.data : statusResponse;

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [sendFriendRequest] = useSendFriendRequestMutation();
  const [deleteFriendship] = useDeleteFriendshipMutation();
  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation();

  const { data: currentBackgroundResponse, isLoading: isBackgroundLoading } = useGetCurrentBackgroundQuery(
    undefined,
    {
      skip: !isOwnProfile,
    },
  );
  const fetchedCoverUrl = isOwnProfile
    ? currentBackgroundResponse?.data?.activeBackgroundUrl
    : null;

  const fileInputRef = useRef(null);

  const handleFollowToggle = () => {
    if (status?.isFollowing) {
      unfollowUser(targetAccountId);
    } else {
      followUser(targetAccountId);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const avatarData = new FormData();
    avatarData.append("file", file);

    try {
      toast.loading("Đang cập nhật...", { id: "avatar-update" });
      await updateAvatar(avatarData).unwrap();
      toast.success("Cập nhật ảnh đại diện thành công", {
        id: "avatar-update",
      });
    } catch (error) {
      toast.error("Không thể cập nhật ảnh đại diện", { id: "avatar-update" });
      console.error(error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isFriendOrPending =
    status?.isFriend ||
    status?.friendshipStatus === 1 ||
    status?.friendshipStatus === "Pending";

  const handleFriendshipToggle = () => {
    if (isFriendOrPending) {
      if (status?.friendshipId) {
        deleteFriendship(status.friendshipId)
          .unwrap()
          .then(() =>
            toast.success(
              status?.isFriend
                ? t.profile?.social?.unfriendSuccess || "Đã hủy kết bạn"
                : t.profile?.social?.cancelRequestSuccess ||
                    "Đã hủy yêu cầu kết bạn",
            ),
          )
          .catch(() =>
            toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra"),
          );
      }
    } else {
      sendFriendRequest(targetAccountId)
        .unwrap()
        .then(() =>
          toast.success(
            t.profile?.social?.requestSent || "Đã gửi yêu cầu kết bạn",
          ),
        )
        .catch((err) => {
          if (err?.status === 422) {
            toast.error(
              t.profile?.social?.requestPending ||
                "Yêu cầu kết bạn đã tồn tại hoặc đang chờ xử lý",
            );
          } else {
            toast.error(
              t.profile?.social?.requestError ||
                "Không thể gửi yêu cầu kết bạn",
            );
          }
        });
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
        },
        {
          key: "friendship",
          variant: friendshipVariant,
          startIcon: friendshipIcon,
          label: friendshipLabel,
          onClick: handleFriendshipToggle,
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
      <div className="p-4 sm:p-6 relative border-b border-gray-100 min-[426px]:grid min-[426px]:grid-cols-[auto_1fr] min-[426px]:gap-x-4">
        {/* Avatar floating above the bottom border of the cover photo */}
        <div className="-mt-24 md:-mt-28 relative z-10 p-1 bg-white rounded-full group min-[426px]:col-start-1 min-[426px]:row-start-1 w-fit">
          <div
            className={`relative rounded-full overflow-hidden ${isOwnProfile ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (isOwnProfile && fileInputRef.current && !isUpdatingAvatar) {
                fileInputRef.current.click();
              }
            }}
          >
            <Avatar
              size={140}
              src={displayAvatarUrl}
              alt={displayName}
              name={displayName}
              className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-purple-100 text-purple-600 text-4xl"
            />
            {isOwnProfile && (
              <div
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUpdatingAvatar ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                {isUpdatingAvatar ? (
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
            )}
          </div>
          {isOwnProfile && (
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          )}
        </div>

        {/* Text Info */}
        <div className="flex flex-col items-start gap-1 min-[426px]:col-start-1 min-[426px]:col-span-2 min-[426px]:row-start-2">
          <h1 className="text-2xl md:text-[28px] font-bold text-gray-900">
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
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="w-full min-[426px]:w-auto flex justify-end gap-2 min-[426px]:col-start-2 min-[426px]:row-start-1 min-[426px]:justify-self-end min-[426px]:self-end max-[425px]:mt-4">
          {actionButtons.map(({ key, variant, startIcon, label, onClick }) => (
            <PillButton
              key={key}
              variant={variant}
              onClick={onClick}
              startIcon={startIcon}
              className="max-[425px]:flex-1"
            >
              {label}
            </PillButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialProfileHeader;
