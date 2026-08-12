import React, { useRef, useState, useEffect } from "react";
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
import PillButton from "@/shared/components/ui/buttons/PillButton";
import RequestButton from "@/shared/components/ui/buttons/RequestButton";
import {
  useGetConnectionStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../../../store/api/social/friendshipApi";
import {
  useUpdateAvatarMutation,
  useGetCurrentBackgroundQuery,
  useLazyGetCurrentBackgroundQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
} from "@/store/api/userApi";
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

  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation();
  const [getCurrentBackground] = useLazyGetCurrentBackgroundQuery();
  const [uploadCustomBackground, { isLoading: isUploadingCover }] =
    useUploadCustomBackgroundMutation();
  const [setActiveBackground, { isLoading: isSettingActiveBackground }] =
    useSetActiveBackgroundMutation();

  const isCoverUpdating = isUploadingCover || isSettingActiveBackground;

  // Clean up object URL when coverImageUrl changes or component unmounts
  useEffect(() => {
    return () => {
      if (coverImageUrl && coverImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverImageUrl);
      }
    };
  }, [coverImageUrl]);

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const avatarData = new FormData();
    avatarData.append("file", file);

    try {
      toast.loading(
        t.profile?.personalInfo?.updatingAvatar || "Đang cập nhật...",
        { id: "avatar-update" },
      );
      await updateAvatar(avatarData).unwrap();
      toast.success(
        t.profile?.personalInfo?.updateAvatarSuccess ||
          "Cập nhật ảnh đại diện thành công",
        { id: "avatar-update" },
      );
    } catch (error) {
      toast.error(
        t.profile?.personalInfo?.updateAvatarError ||
          "Không thể cập nhật ảnh đại diện",
        { id: "avatar-update" },
      );
      console.error(error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation: check image type
    if (!file.type.startsWith("image/")) {
      toast.error(
        t.profile?.personalInfo?.invalidImageFormat ||
          "Vui lòng chọn tệp hình ảnh hợp lệ",
      );
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    // File validation: check file size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(
        t.profile?.personalInfo?.coverSizeLimit ||
          "Kích thước ảnh bìa không được vượt quá 5MB",
      );
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    // Optimistic UI preview
    if (coverImageUrl && coverImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverImageUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setCoverImageUrl(objectUrl);

    const bgFormData = new FormData();
    bgFormData.append("file", file);

    try {
      toast.loading(
        t.profile?.personalInfo?.updatingCover || "Đang cập nhật ảnh bìa...",
        { id: "cover-update" },
      );

      const uploadRes = await uploadCustomBackground(bgFormData).unwrap();
      let uploadedUrl =
        uploadRes?.data?.customUploadedBackgroundUrl ||
        uploadRes?.data?.backgroundUrl ||
        (typeof uploadRes?.data === "string" ? uploadRes.data : null) ||
        uploadRes?.customUploadedBackgroundUrl ||
        (typeof uploadRes === "string" ? uploadRes : null);

      if (!uploadedUrl) {
        const currentRes = await getCurrentBackground().unwrap();
        uploadedUrl =
          currentRes?.data?.customUploadedBackgroundUrl ||
          currentRes?.customUploadedBackgroundUrl;
      }

      if (uploadedUrl && typeof uploadedUrl === "string") {
        await setActiveBackground({ backgroundUrl: uploadedUrl }).unwrap();
      }

      toast.success(
        t.profile?.personalInfo?.updateCoverSuccess ||
          "Cập nhật ảnh bìa thành công",
        { id: "cover-update" },
      );
    } catch {
      // Rollback preview on error
      setCoverImageUrl(null);
      URL.revokeObjectURL(objectUrl);
      toast.error(
        t.profile?.personalInfo?.updateCoverError ||
          "Không thể cập nhật ảnh bìa",
        { id: "cover-update" },
      );
    } finally {
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

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
    } catch (error) {
      toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
        id: toastId,
      });
      console.error(error);
    }
  };

  return (
    <div className="w-full bg-white border border-[#e5e5e5] rounded-xl overflow-hidden mb-6">
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
            onClick={() => {
              if (coverInputRef.current && !isCoverUpdating) {
                coverInputRef.current.click();
              }
            }}
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

      {/* Profile Info Area */}
      <div className="p-4 sm:p-6 relative border-b border-gray-100 flex flex-wrap sm:flex-nowrap items-start sm:items-end justify-between gap-4">
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
              onClick={() => {
                if (isOwnProfile && fileInputRef.current && !isUpdatingAvatar) {
                  fileInputRef.current.click();
                }
              }}
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
