import React, { useRef } from "react"
import toast from "react-hot-toast"
import { MapPin, Edit2, BadgeCheck, UserPlus, Check, UserMinus, Camera } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useGetConnectionStatusQuery, useFollowUserMutation, useUnfollowUserMutation, useSendFriendRequestMutation, useDeleteFriendshipMutation } from "../api/friendshipApi"
import { useUpdateAvatarMutation } from "@/store/api/userApi"

const SocialProfileHeader = ({ user, formData, t, targetAccountId, isOwnProfile }) => {
  // Use avatarImageUrl as the primary avatar for the profile
  const displayAvatarUrl = formData?.avatarImageUrl || user?.avatarImageUrl
  const username = formData?.username || user?.username || "Lorem Ipsum"
  const bio = "Bio description" // Mocked for now
  const location = "Location" // Mocked for now

  // API Hooks
  const { data: statusResponse } = useGetConnectionStatusQuery(targetAccountId, { skip: isOwnProfile || !targetAccountId })
  const status = statusResponse?.data !== undefined ? statusResponse.data : statusResponse

  const [followUser] = useFollowUserMutation()
  const [unfollowUser] = useUnfollowUserMutation()
  const [sendFriendRequest] = useSendFriendRequestMutation()
  const [deleteFriendship] = useDeleteFriendshipMutation()
  const [updateAvatar, { isLoading: isUpdatingAvatar }] = useUpdateAvatarMutation()
  const fileInputRef = useRef(null)

  const handleFollowToggle = () => {
    if (status?.isFollowing) {
      unfollowUser(targetAccountId)
    } else {
      followUser(targetAccountId)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const avatarData = new FormData()
    avatarData.append("file", file)

    try {
      toast.loading("Đang cập nhật...", { id: "avatar-update" })
      await updateAvatar(avatarData).unwrap()
      toast.success("Cập nhật ảnh đại diện thành công", { id: "avatar-update" })
    } catch (error) {
      toast.error("Không thể cập nhật ảnh đại diện", { id: "avatar-update" })
      console.error(error)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6">
      {/* Cover Photo Area */}
      <div className="w-full h-48 md:h-[280px] bg-gray-200 relative group">
        {/* Placeholder for cover photo edit button */}
      </div>

      {/* Profile Info Area */}
      <div className="px-6 pb-6 pt-4 relative flex flex-col md:flex-row items-center md:items-end md:justify-between gap-4 border-b border-gray-100">
        {/* Left side: Avatar + Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 w-full">
          {/* Avatar floating above the bottom border of the cover photo */}
          <div className="-mt-24 md:-mt-28 relative z-10 p-1 bg-white rounded-full group">
            <div 
              className={`relative rounded-full overflow-hidden ${isOwnProfile ? "cursor-pointer" : ""}`}
              onClick={() => {
                if (isOwnProfile && fileInputRef.current && !isUpdatingAvatar) {
                  fileInputRef.current.click()
                }
              }}
            >
              <Avatar
                size={140}
                src={displayAvatarUrl}
                alt={username}
                name={username}
                className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-purple-100 text-purple-600 text-4xl"
              />
              {isOwnProfile && (
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUpdatingAvatar ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
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

          <div className="flex flex-col items-center md:items-start pt-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-none">
                {username}
              </h1>
              <BadgeCheck className="text-blue-500 w-6 h-6" />
            </div>
            <p className="text-[#7A7574] text-[15px] mt-2">{bio}</p>
            <div className="flex items-center gap-1.5 text-[#7A7574] text-[15px] mt-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="mt-4 md:mt-0 md:pb-6 shrink-0 flex items-center gap-2">
          {isOwnProfile ? (
            <button className="flex items-center gap-2 px-5 py-2 border border-[#990011] text-[#990011] rounded-full hover:bg-red-50 font-medium text-sm transition-colors">
              Chỉnh sửa
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              {/* Theo dõi Button */}
              <button 
                onClick={handleFollowToggle}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                  status?.isFollowing 
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                    : "bg-[#990011] text-white hover:bg-red-900"
                }`}
              >
                {status?.isFollowing ? (
                  <>Đang theo dõi <Check className="w-3.5 h-3.5" /></>
                ) : (
                  <>Theo dõi <UserPlus className="w-3.5 h-3.5" /></>
                )}
              </button>

              {/* Kết bạn Button */}
              <button 
                onClick={() => {
                  if (status?.isFriend || status?.friendshipStatus === 1 || status?.friendshipStatus === "Pending") {
                    if (status?.friendshipId) {
                      deleteFriendship(status.friendshipId)
                        .unwrap()
                        .then(() => toast.success(status?.isFriend ? "Đã hủy kết bạn" : "Đã hủy yêu cầu kết bạn"))
                        .catch(() => toast.error("Có lỗi xảy ra"))
                    }
                  } else if (!status?.isFriend && status?.friendshipStatus !== 1 && status?.friendshipStatus !== "Pending") {
                    sendFriendRequest(targetAccountId)
                      .unwrap()
                      .then(() => toast.success("Đã gửi yêu cầu kết bạn"))
                      .catch((err) => {
                        if (err?.status === 422) {
                          toast.error("Yêu cầu kết bạn đã tồn tại hoặc đang chờ xử lý")
                        } else {
                          toast.error("Không thể gửi yêu cầu kết bạn")
                        }
                      })
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                status?.isFriend 
                  ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
                  : (status?.friendshipStatus === 1 || status?.friendshipStatus === "Pending")
                  ? "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  : "border border-[#990011] text-[#990011] hover:bg-red-50"
              }`}>
                {status?.isFriend ? (
                  <>Hủy kết bạn <UserMinus className="w-3.5 h-3.5" /></>
                ) : (status?.friendshipStatus === 1 || status?.friendshipStatus === "Pending") ? (
                  <>Hủy yêu cầu <UserMinus className="w-3.5 h-3.5" /></>
                ) : (
                  <>Kết bạn <UserPlus className="w-3.5 h-3.5" /></>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SocialProfileHeader
