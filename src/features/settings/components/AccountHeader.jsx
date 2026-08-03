import React, { useRef } from "react";
import toast from "react-hot-toast";
import { Camera, Users } from "lucide-react";
import Avatar from "@/shared/components/ui/Avatar";
import {
  useUpdateAvatarMutation,
  useUpdateMeetingAvatarMutation,
  useGetCurrentBackgroundQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
} from "@/store/api/userApi";
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider";
import backgroundAccount from "@/shared/assets/backgrounds/background-account.png";

const AccountHeader = ({ user, formData, t }) => {
  const displayAvatarUrl = formData?.avatarImageUrl || user?.avatarImageUrl;
  const displayMeetingAvatarUrl =
    formData?.meetingAvatarUrl || user?.meetingAvatarUrl || displayAvatarUrl;
  const nickname = formData?.nickname || user?.nickname;
  const username = formData?.username || user?.username;
  const displayName = nickname || username || "User";

  // Use state to handle local preview of cover image
  const [coverImageUrl, setCoverImageUrl] = React.useState(null);

  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation();
  const [updateMeetingAvatar, { isLoading: isUpdatingMeetingAvatar }] =
    useUpdateMeetingAvatarMutation();
  const [uploadCustomBackground] = useUploadCustomBackgroundMutation();
  const [setActiveBackground] = useSetActiveBackgroundMutation();
  const { data: currentBackgroundResponse, isLoading: isBackgroundLoading } =
    useGetCurrentBackgroundQuery();

  // Optional: khi user đang trong call, đồng bộ avatar mới xuống LiveKit metadata ngay lập tức
  let localParticipant = null;
  try {
    const callCtx = useGlobalVideoCall();
    localParticipant = callCtx?.localParticipant ?? null;
  } catch {
    localParticipant = null;
  }

  const fetchedCoverUrl = currentBackgroundResponse?.data?.activeBackgroundUrl;

  const fileInputRef = useRef(null);
  const meetingAvatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

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

    const objectUrl = URL.createObjectURL(file);
    setCoverImageUrl(objectUrl);
    const bgFormData = new FormData();
    bgFormData.append("file", file);

    try {
      toast.loading("Đang cập nhật hình nền...", { id: "cover-update" });
      const res = await uploadCustomBackground(bgFormData).unwrap();
      const uploadedUrl = res?.data?.customUploadedBackgroundUrl || res?.data;
      if (uploadedUrl && typeof uploadedUrl === "string") {
        await setActiveBackground({ backgroundUrl: uploadedUrl }).unwrap();
      }
      toast.success("Cập nhật hình nền thành công", { id: "cover-update" });
    } catch (error) {
      toast.error("Không thể cập nhật hình nền", { id: "cover-update" });
    } finally {
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleMeetingAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Vui lòng chọn ảnh nhỏ hơn 3MB");
      return;
    }

    try {
      toast.loading(
        t.profile?.personalInfo?.updatingMeetingAvatar ||
          "Đang cập nhật ảnh đại diện phòng họp...",
        { id: "meeting-avatar-update" },
      );

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result;
        if (!dataUrl) {
          toast.error("Không thể đọc file ảnh", { id: "meeting-avatar-update" });
          return;
        }

        try {
          await updateMeetingAvatar({ meetingAvatarUrl: dataUrl }).unwrap();

          if (localParticipant?.setMetadata) {
            try {
              let currentMeta = {};
              try {
                currentMeta = localParticipant.metadata
                  ? JSON.parse(localParticipant.metadata)
                  : {};
              } catch {
                currentMeta = {};
              }
              await localParticipant.setMetadata(
                JSON.stringify({ ...currentMeta, avatarImageUrl: dataUrl }),
              );
            } catch (lkErr) {
              console.warn("Failed to sync meeting avatar to LiveKit", lkErr);
            }
          }

          toast.success(
            t.profile?.personalInfo?.updateMeetingAvatarSuccess ||
              "Cập nhật ảnh đại diện phòng họp thành công",
            { id: "meeting-avatar-update" },
          );
        } catch (err) {
          console.error(err);
          toast.error(
            t.profile?.personalInfo?.updateMeetingAvatarError ||
              "Không thể cập nhật ảnh đại diện phòng họp",
            { id: "meeting-avatar-update" },
          );
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error(
        t.profile?.personalInfo?.updateMeetingAvatarError ||
          "Không thể cập nhật ảnh đại diện phòng họp",
        { id: "meeting-avatar-update" },
      );
    } finally {
      if (meetingAvatarInputRef.current) meetingAvatarInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full relative mb-16">
      {/* Cover Photo Outer Container */}
      <div className="w-full h-40 md:h-52 lg:h-64 rounded-[32px] overflow-hidden relative border border-[#e5e5e5]">
        
        {/* Cover Photo Image & Hover Wrapper (Isolated group/cover) */}
        <div className="relative w-full h-full group/cover cursor-pointer">
          {isBackgroundLoading ? (
            <div className="w-full h-full bg-gray-300 animate-pulse" />
          ) : (
            <img
              src={coverImageUrl || fetchedCoverUrl || backgroundAccount}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = backgroundAccount;
              }}
            />
          )}

          {/* Cover Photo Upload Button (Center Overlay on Hover of Cover only) */}
          <div
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity z-10"
            onClick={() => {
              if (coverInputRef.current) {
                coverInputRef.current.click();
              }
            }}
          >
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>

        <input
          type="file"
          ref={coverInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleCoverChange}
        />

        {/* Meeting Avatar Badge on Top-Right of Cover Photo (Outside group/cover) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (meetingAvatarInputRef.current && !isUpdatingMeetingAvatar) {
              meetingAvatarInputRef.current.click();
            }
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 bg-black/65 backdrop-blur-md border border-white/30 rounded-2xl px-3 py-2 flex items-center gap-3 shadow-lg hover:bg-black/80 transition-all cursor-pointer group/meeting"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border-2 border-white/80 bg-cath-red-700 shadow-sm">
            <Avatar
              size={44}
              src={displayMeetingAvatarUrl}
              alt={displayName}
              name={displayName}
              className="w-full h-full text-white text-base"
              style={{ border: 'none' }}
            />
            <div
              className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                isUpdatingMeetingAvatar
                  ? "opacity-100"
                  : "opacity-0 group-hover/meeting:opacity-100"
              }`}
            >
              {isUpdatingMeetingAvatar ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </div>
          </div>

          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5 text-white font-bold text-xs whitespace-nowrap">
              <Users size={13} className="text-amber-400 shrink-0" />
              <span>
                {t.profile?.personalInfo?.meetingAvatarLabel || "Ảnh phòng họp"}
              </span>
            </div>
            <span className="text-[10px] text-gray-200 mt-0.5 group-hover/meeting:text-white transition-colors font-medium whitespace-nowrap">
              {isUpdatingMeetingAvatar
                ? t.profile?.personalInfo?.updatingAvatar || "Đang cập nhật..."
                : t.profile?.personalInfo?.clickToChangeMeetingAvatar ||
                  "Bấm để đổi ảnh phòng họp"}
            </span>
          </div>

          <input
            type="file"
            ref={meetingAvatarInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleMeetingAvatarChange}
          />
        </div>
      </div>

      {/* Main Profile Avatar floating over Cover (Original Bottom-Left Position) */}
      <div className="absolute -bottom-12 left-8 sm:left-12 z-20 group w-fit bg-white rounded-full p-1 shadow-sm">
        <div
          className="relative rounded-full overflow-hidden cursor-pointer"
          onClick={() => {
            if (fileInputRef.current && !isUpdatingAvatar) {
              fileInputRef.current.click();
            }
          }}
        >
          <Avatar
            size={120}
            src={displayAvatarUrl}
            alt={displayName}
            name={displayName}
            className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] bg-cath-red-700 text-white text-4xl"
          />
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isUpdatingAvatar
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isUpdatingAvatar ? (
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </div>
    </div>
  );
};

export default AccountHeader;
