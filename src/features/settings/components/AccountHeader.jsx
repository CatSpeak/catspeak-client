import React, { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Camera, Users, Check } from "lucide-react";
import Avatar from "@/shared/components/ui/Avatar";
import Modal from "@/shared/components/ui/Modal";
import ImageCropModal from "@/shared/components/ui/ImageCropModal";
import TextInput from "@/shared/components/ui/inputs/TextInput";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import {
  useUpdateAvatarMutation,
  useUpdateMeetingAvatarMutation,
  useGetCurrentBackgroundQuery,
  useLazyGetCurrentBackgroundQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
} from "@/store/api/userApi";
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider";
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils";
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
  const [coverImageUrl, setCoverImageUrl] = useState(null);

  const [fileToCrop, setFileToCrop] = useState(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)

  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation();
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
      : null);

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

  // Optional: khi user đang trong call, đồng bộ avatar mới xuống LiveKit metadata ngay lập tức
  let localParticipant = null;
  try {
    const callCtx = useGlobalVideoCall();
    localParticipant = callCtx?.localParticipant ?? null;
  } catch {
    localParticipant = null;
  }

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

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
            onClick={() => {
              if (coverInputRef.current && !isCoverUpdating) {
                coverInputRef.current.click();
              }
            }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity cursor-pointer z-10"
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
          onChange={handleAvatarSelect}
        />
      </div>

      {/* Image Crop Modal for Profile Avatar */}
      {isCropModalOpen && fileToCrop && (
        <ImageCropModal
          image={fileToCrop}
          isOpen={isCropModalOpen}
          cropPreset="avatar"
          title={t.profile?.personalInfo?.cropAvatarTitle || "Cắt ảnh đại diện"}
          onClose={() => {
            setIsCropModalOpen(false)
            setFileToCrop(null)
          }}
          onCropComplete={(croppedFile) => {
            handleCropComplete(croppedFile)
            setIsCropModalOpen(false)
            setFileToCrop(null)
          }}
        />
      )}

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
