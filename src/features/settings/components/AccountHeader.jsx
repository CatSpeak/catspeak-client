import React, { useRef } from "react";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import Avatar from "@/shared/components/ui/Avatar";
import {
  useUpdateAvatarMutation,
  useGetCurrentBackgroundQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
} from "@/store/api/userApi";
import backgroundAccount from "@/shared/assets/backgrounds/background-account.png";

const AccountHeader = ({ user, formData, t }) => {
  const displayAvatarUrl = formData?.avatarImageUrl || user?.avatarImageUrl;
  const nickname = formData?.nickname || user?.nickname;
  const username = formData?.username || user?.username;
  const displayName = nickname || username || "User";

  // Use state to handle local preview of cover image
  const [coverImageUrl, setCoverImageUrl] = React.useState(null);

  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation();
  const [uploadCustomBackground] = useUploadCustomBackgroundMutation();
  const [setActiveBackground] = useSetActiveBackgroundMutation();
  const { data: currentBackgroundResponse, isLoading: isBackgroundLoading } = useGetCurrentBackgroundQuery();

  const fetchedCoverUrl = currentBackgroundResponse?.data?.activeBackgroundUrl;

  const fileInputRef = useRef(null);
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

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setCoverImageUrl(objectUrl);
    const bgFormData = new FormData();
    bgFormData.append("file", file);

    try {
      toast.loading("Đang cập nhật hình nền...", { id: "cover-update" });
      const res = await uploadCustomBackground(bgFormData).unwrap();
      const uploadedUrl = res?.data?.customUploadedBackgroundUrl;
      if (uploadedUrl) {
        await setActiveBackground({ backgroundUrl: uploadedUrl }).unwrap();
      }
      toast.success("Cập nhật hình nền thành công", { id: "cover-update" });
    } catch (error) {
      toast.error("Không thể cập nhật hình nền", { id: "cover-update" });
    } finally {
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full relative mb-16">
      {/* Cover Photo Area */}
      <div className="w-full h-40 md:h-52 lg:h-64 rounded-[32px] overflow-hidden relative group border border-[#e5e5e5]">
        {isBackgroundLoading ? (
          <div className="w-full h-full bg-gray-300 animate-pulse"></div>
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
        <div
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => {
            if (coverInputRef.current) {
              coverInputRef.current.click();
            }
          }}
        >
          <Camera className="w-8 h-8 text-white" />
        </div>
        <input
          type="file"
          ref={coverInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleCoverChange}
        />
      </div>

      {/* Avatar floating over the cover */}
      <div className="absolute -bottom-12 left-8 sm:left-12 z-10 group w-fit bg-white rounded-full p-1 shadow-sm">
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
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUpdatingAvatar ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            {isUpdatingAvatar ? (
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
