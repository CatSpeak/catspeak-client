import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  MapPin,
  Edit2,
  UserPlus,
  Check,
  AtSign,
  Camera,
} from "lucide-react";
import Avatar from "@/shared/components/ui/Avatar";
import ImageCropModal from "@/shared/components/ui/ImageCropModal";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import RequestButton from "@/shared/components/ui/buttons/RequestButton";
import {
  useGetConnectionStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../../../store/api/social/friendshipApi";
import { useGetCurrentBackgroundQuery } from "@/store/api/userApi";
import { useProfileMediaUpload } from "@/shared/hooks/useProfileMediaUpload";
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
  const displayName = nickname || username || "User";
  const handle = nickname ? username : null;
  const location =
    formData?.location || user?.location || formData?.address || user?.address;

  // Profile media upload hook (avatar & cover)
  const {
    coverImageUrl,
    fileInputRef,
    coverInputRef,
    isUpdatingAvatar,
    isCoverUpdating,
    handleAvatarChange,
    handleCoverChange,
    triggerAvatarUpload,
    triggerCoverUpload,
  } = useProfileMediaUpload({ t });

  // API Hooks for social status
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

  const isFollowLoading = isFollowingLoading || isUnfollowingLoading;

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

  const fileInputRef = useRef(null);

  const handleFollowToggle = async () => {
    if (isFollowLoading) return;
    const toastId = "follow-action";

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
    } catch (err) {
      toast.error(t.profile?.social?.actionFailed || "Thao tác thất bại", {
        id: toastId,
      });
      console.error(err);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileToCrop(file);
    setIsCropModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedFile) => {
    if (!croppedFile) return;

    const avatarData = new FormData();
    avatarData.append("file", croppedFile);

    try {
      toast.loading(t.profile?.avatar?.updating || "Đang cập nhật...", {
        id: "avatar-update",
      });
      await updateAvatar(avatarData).unwrap();
      toast.success(
        t.profile?.avatar?.updateSuccess || "Cập nhật ảnh đại diện thành công",
        {
          id: "avatar-update",
        },
      );
    } catch (error) {
      toast.error(
        t.profile?.avatar?.updateError || "Không thể cập nhật ảnh đại diện",
        { id: "avatar-update" },
      );
      console.error(error);
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
      const performSend = () => {
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
      };

      if (status?.friendshipId) {
        deleteFriendship(status.friendshipId)
          .unwrap()
          .then(() => {
            performSend();
          })
          .catch(() => {
            toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra");
          });
      } else {
        performSend();
      }
    }
  };

  return (
    <div className="w-full bg-white border border-border rounded-xl overflow-hidden mb-6">
      {/* Cover Photo Area */}
      <div
        className={`w-full h-48 md:h-[280px] bg-gray-200 relative overflow-hidden ${
          isOwnProfile ? "group/cover" : ""
        }`}
      >
        {isBackgroundLoading ? (
          <div className="w-full h-full bg-gray-300 animate-pulse"></div>
        ) : (
          <img
            src={coverImageUrl || fetchedCoverUrl || backgroundAccount}
            alt="Cover fallback"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null; // prevent infinite loop
              e.target.src = backgroundAccount;
            }}
          />
        )}

        {/* Hover Overlay for Cover */}
        {isOwnProfile && (
          <div
            onClick={triggerCoverUpload}
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer z-10 ${
              isCoverUpdating
                ? "opacity-100"
                : "opacity-0 group-hover/cover:opacity-100"
            }`}
          >
            {isCoverUpdating ? (
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </div>
        )}

        {/* Hidden File Input for Cover Upload */}
        {isOwnProfile && (
          <input
            type="file"
            ref={coverInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleCoverChange}
          />
        )}
      </div>

      <div className="p-4 sm:p-6 relative border-b border-border flex flex-wrap sm:flex-nowrap items-start sm:items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Avatar floating above the bottom border of the cover photo */}
          <div
            className={`-mt-24 md:-mt-28 mb-5 relative z-10 p-1 bg-white rounded-full w-fit ${
              isOwnProfile ? "group/avatar" : ""
            }`}
          >
            <div
              className={`relative rounded-full overflow-hidden ${
                isOwnProfile ? "cursor-pointer" : ""
              }`}
              onClick={isOwnProfile ? triggerAvatarUpload : undefined}
            >
              <Avatar
                size={133}
                src={displayAvatarUrl}
                alt={displayName}
                name={displayName}
                className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-purple-100 text-purple-600 text-4xl"
              />
              {isOwnProfile && (
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                    isUpdatingAvatar
                      ? "opacity-100"
                      : "opacity-0 group-hover/avatar:opacity-100"
                  }`}
                >
                  {isUpdatingAvatar ? (
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div className="ml-auto flex items-center justify-end gap-2 max-[425px]:w-full max-[425px]:justify-start shrink-0 flex-nowrap">
          {isOwnProfile ? (
            onEditClick && (
              <PillButton
                variant="outline"
                startIcon={<Edit2 />}
                onClick={onEditClick}
                className="max-[425px]:flex-1"
              >
                {t.profile?.personalInfo?.edit || "Chỉnh sửa"}
              </PillButton>
            )
          ) : (
            <>
              <PillButton
                variant={status?.isFollowing ? "secondary" : "primary"}
                startIcon={status?.isFollowing ? <Check /> : <UserPlus />}
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                loading={isFollowLoading}
                className={`max-[425px]:flex-1 ${isFollowLoading ? "cursor-not-allowed" : ""}`}
              >
                {status?.isFollowing
                  ? t.profile?.social?.following || "Đang theo dõi"
                  : t.profile?.social?.follow || "Theo dõi"}
              </PillButton>

              <RequestButton
                id={targetAccountId}
                relationship={status}
                t={t}
                className="max-[425px]:flex-1"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialProfileHeader;
