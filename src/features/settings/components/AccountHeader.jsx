import React, { useState } from "react";
import toast from "react-hot-toast";
import { Camera, Users, Check } from "lucide-react";
import Avatar from "@/shared/components/ui/Avatar";
import Modal from "@/shared/components/ui/Modal";
import ImageCropModal from "@/shared/components/ui/ImageCropModal";
import TextInput from "@/shared/components/ui/inputs/TextInput";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import {
  useUpdateMeetingAvatarMutation,
  useGetCurrentBackgroundQuery,
} from "@/store/api/userApi";
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider";
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils";
import { useProfileMediaUpload } from "@/shared/hooks/useProfileMediaUpload";
import backgroundAccount from "@/shared/assets/backgrounds/background-account.png";

const AccountHeader = ({ user, formData, t }) => {
  const displayAvatarUrl = formData?.avatarImageUrl || user?.avatarImageUrl;
  const displayMeetingAvatarUrl =
    formData?.meetingAvatarUrl || user?.meetingAvatarUrl || displayAvatarUrl;
  const nickname = formData?.nickname || user?.nickname;
  const username = formData?.username || user?.username;
  const displayName = nickname || username || "User";

  const [isMeetingAvatarModalOpen, setIsMeetingAvatarModalOpen] =
    useState(false);
  const [meetingAvatarUrlInput, setMeetingAvatarUrlInput] = useState("");

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

  const [updateMeetingAvatar, { isLoading: isUpdatingMeetingAvatar }] =
    useUpdateMeetingAvatarMutation();

  const { data: currentBackgroundResponse, isLoading: isBackgroundLoading } =
    useGetCurrentBackgroundQuery();
  const fetchedCoverUrl =
    currentBackgroundResponse?.data?.activeBackgroundUrl ||
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
    user?.virtualBackgroundUrl ||
    formData?.activeBackgroundUrl ||
    user?.activeBackgroundUrl ||
    formData?.backgroundUrl ||
    user?.backgroundUrl ||
    null;

  // Optional: khi user đang trong call, đồng bộ avatar mới xuống LiveKit metadata ngay lập tức
  let localParticipant = null;
  try {
    const callCtx = useGlobalVideoCall();
    localParticipant = callCtx?.localParticipant ?? null;
  } catch {
    localParticipant = null;
  }


  const handleOpenMeetingAvatarModal = () => {
    setMeetingAvatarUrlInput(displayMeetingAvatarUrl || "");
    setIsMeetingAvatarModalOpen(true);
  };

  const handleSaveMeetingAvatarUrl = async () => {
    const trimmed = (meetingAvatarUrlInput || "").trim();

    if (trimmed.startsWith("data:")) {
      toast.error(
        "Vui lòng nhập đường dẫn URL (http/https), không sử dụng chuỗi base64.",
      );
      return;
    }

    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      toast.error("Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    try {
      toast.loading(
        t.profile?.personalInfo?.updatingMeetingAvatar ||
        "Đang cập nhật ảnh đại diện phòng họp...",
        { id: "meeting-avatar-update" },
      );

      await updateMeetingAvatar({ meetingAvatarUrl: trimmed }).unwrap();

      if (localParticipant) {
        await safeSetLiveKitMetadata(localParticipant, {
          avatarImageUrl: trimmed,
        });
      }

      toast.success(
        t.profile?.personalInfo?.updateMeetingAvatarSuccess ||
        "Cập nhật ảnh đại diện phòng họp thành công",
        { id: "meeting-avatar-update" },
      );
      setIsMeetingAvatarModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(
        t.profile?.personalInfo?.updateMeetingAvatarError ||
        "Không thể cập nhật ảnh đại diện phòng họp",
        { id: "meeting-avatar-update" },
      );
    }
  };

  return (
    <div className="w-full relative mb-16">
      {/* Cover Photo Outer Container */}
      <div className="w-full h-40 md:h-52 lg:h-64 rounded-[32px] overflow-hidden relative border border-border group/cover">
        {/* Cover Photo Image */}
        <div className="relative w-full h-full">
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

          {/* Hover Overlay */}
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
        </div>

        {/* Hidden File Input for Cover Upload */}
        <input
          type="file"
          ref={coverInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleCoverChange}
        />

        {/* Meeting Avatar Badge on Top-Right of Cover Photo (Outside group/cover click) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!isUpdatingMeetingAvatar) {
              handleOpenMeetingAvatarModal();
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
              style={{ border: "none" }}
            />
            <div
              className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isUpdatingMeetingAvatar
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
        </div>
      </div>

      {/* Main Profile Avatar floating over Cover (Original Bottom-Left Position) */}
      <div className="absolute -bottom-12 left-8 sm:left-12 z-20 group/avatar w-fit bg-white rounded-full p-1 shadow-sm">
        <div
          className="relative rounded-full overflow-hidden cursor-pointer"
          onClick={triggerAvatarUpload}
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
                : "opacity-0 group-hover/avatar:opacity-100"
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


      {/* Meeting Avatar URL Modal */}
      <Modal
        open={isMeetingAvatarModalOpen}
        onClose={() => setIsMeetingAvatarModalOpen(false)}
        title={t.profile?.personalInfo?.meetingAvatarLabel || "Ảnh phòng họp"}
        className="max-w-md w-full"
      >
        <div className="flex flex-col items-center gap-6 py-2">
          <Avatar
            size={100}
            src={meetingAvatarUrlInput || displayMeetingAvatarUrl}
            alt={displayName}
            name={displayName}
            className="shadow-md border-2 border-white"
          />

          <div className="w-full flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t?.rooms?.avatarPicker?.imageUrl || "Đường dẫn ảnh (URL)"}
            </label>
            <TextInput
              value={meetingAvatarUrlInput}
              onChange={(e) => setMeetingAvatarUrlInput(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="!h-11 !text-sm"
            />
            <p className="text-xs text-gray-500">
              {t?.rooms?.avatarPicker?.description ||
                "Dán đường dẫn ảnh hợp lệ (http:// hoặc https://). Nếu để trống, hệ thống sẽ mặc định dùng ảnh đại diện chính."}
            </p>
          </div>

          <div className="w-full flex items-center gap-3 pt-2">
            <PillButton
              variant="outline"
              onClick={() => setIsMeetingAvatarModalOpen(false)}
              className="flex-1"
            >
              Hủy
            </PillButton>
            <PillButton
              onClick={handleSaveMeetingAvatarUrl}
              loading={isUpdatingMeetingAvatar}
              startIcon={<Check size={16} />}
              className="flex-1"
            >
              Lưu ảnh
            </PillButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountHeader;
