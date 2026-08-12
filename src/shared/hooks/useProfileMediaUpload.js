import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  useUpdateAvatarMutation,
  useLazyGetCurrentBackgroundQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
} from "@/store/api/userApi";

/**
 * Custom hook managing Avatar and Cover Photo upload flows.
 * Handles file validation, optimistic previews, API mutations, and toast notifications.
 *
 * @param {Object} [options]
 * @param {Object} [options.t] - Translation dictionary
 * @param {Function} [options.onAvatarSuccess] - Optional callback after successful avatar update
 * @param {Function} [options.onCoverSuccess] - Optional callback after successful cover update
 */
export const useProfileMediaUpload = ({ t = {}, onAvatarSuccess, onCoverSuccess } = {}) => {
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

  const handleAvatarChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // File validation: check image type
      if (!file.type.startsWith("image/")) {
        toast.error(
          t?.profile?.personalInfo?.invalidImageFormat ||
            "Vui lòng chọn tệp hình ảnh hợp lệ",
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const avatarData = new FormData();
      avatarData.append("file", file);

      try {
        toast.loading(
          t?.profile?.personalInfo?.updatingAvatar || "Đang cập nhật...",
          { id: "avatar-update" },
        );
        const result = await updateAvatar(avatarData).unwrap();
        toast.success(
          t?.profile?.personalInfo?.updateAvatarSuccess ||
            "Cập nhật ảnh đại diện thành công",
          { id: "avatar-update" },
        );
        if (onAvatarSuccess) {
          onAvatarSuccess(result);
        }
      } catch (error) {
        toast.error(
          t?.profile?.personalInfo?.updateAvatarError ||
            "Không thể cập nhật ảnh đại diện",
          { id: "avatar-update" },
        );
        console.error("Avatar update error:", error);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [updateAvatar, t, onAvatarSuccess],
  );

  const handleCoverChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // File validation: check image type
      if (!file.type.startsWith("image/")) {
        toast.error(
          t?.profile?.personalInfo?.invalidImageFormat ||
            "Vui lòng chọn tệp hình ảnh hợp lệ",
        );
        if (coverInputRef.current) coverInputRef.current.value = "";
        return;
      }

      // File validation: check file size (max 5MB)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error(
          t?.profile?.personalInfo?.coverSizeLimit ||
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
          t?.profile?.personalInfo?.updatingCover || "Đang cập nhật ảnh bìa...",
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
          t?.profile?.personalInfo?.updateCoverSuccess ||
            "Cập nhật ảnh bìa thành công",
          { id: "cover-update" },
        );
        if (onCoverSuccess) {
          onCoverSuccess(uploadedUrl);
        }
      } catch (error) {
        // Rollback preview on error
        setCoverImageUrl(null);
        URL.revokeObjectURL(objectUrl);
        toast.error(
          t?.profile?.personalInfo?.updateCoverError ||
            "Không thể cập nhật ảnh bìa",
          { id: "cover-update" },
        );
        console.error("Cover update error:", error);
      } finally {
        if (coverInputRef.current) coverInputRef.current.value = "";
      }
    },
    [
      coverImageUrl,
      uploadCustomBackground,
      getCurrentBackground,
      setActiveBackground,
      t,
      onCoverSuccess,
    ],
  );

  const triggerAvatarUpload = useCallback(() => {
    if (fileInputRef.current && !isUpdatingAvatar) {
      fileInputRef.current.click();
    }
  }, [isUpdatingAvatar]);

  const triggerCoverUpload = useCallback(() => {
    if (coverInputRef.current && !isCoverUpdating) {
      coverInputRef.current.click();
    }
  }, [isCoverUpdating]);

  return {
    coverImageUrl,
    fileInputRef,
    coverInputRef,
    isUpdatingAvatar,
    isCoverUpdating,
    handleAvatarChange,
    handleCoverChange,
    triggerAvatarUpload,
    triggerCoverUpload,
  };
};

export default useProfileMediaUpload;
