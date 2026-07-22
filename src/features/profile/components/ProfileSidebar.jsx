import React from "react"
import { useNavigate } from "react-router-dom"
import Avatar from "@/shared/components/ui/Avatar"
import FluentCard from "@/shared/components/ui/FluentCard"
import HorizontalCard from "@/shared/components/ui/HorizontalCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useGetFriendRecommendationsQuery } from "../../../store/api/social/friendshipApi"

const ProfileSidebar = ({ isOwnProfile, onNavigateToFriends }) => {
  const navigate = useNavigate()
  const { data: recData, isLoading: isLoadingRecs } =
    useGetFriendRecommendationsQuery(undefined, { skip: !isOwnProfile })
  if (!isOwnProfile) return null

  const recommendations = Array.isArray(recData) ? recData : recData?.data || []

  return (
    <div className="lg:col-span-1">
      {/* Suggested Friends Block */}
      <FluentCard className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Đề xuất bạn bè</h2>
        </div>

        <div className="space-y-4">
          {isLoadingRecs ? (
            <div className="text-sm text-gray-500">Đang tải đề xuất...</div>
          ) : recommendations.length === 0 ? (
            <div className="text-sm text-gray-500">Không có đề xuất nào.</div>
          ) : (
            recommendations.map((user) => (
              <HorizontalCard
                key={user.accountId}
                onClick={() => navigate(`/profile/${user.accountId}`)}
                leftContent={
                  <Avatar
                    size={40}
                    src={user.avatarImageUrl}
                    name={user.nickname || user.username}
                  />
                }
              >
                <h3 className="font-semibold">
                  {user.nickname || user.username}
                </h3>

                <p className="text-sm text-[#606060]">
                  {user.level || "Member"}
                </p>
              </HorizontalCard>
            ))
          )}
          {recommendations.length > 0 && onNavigateToFriends && (
            <PillButton
              onClick={() => onNavigateToFriends("find")}
              variant="secondary"
              className="w-full h-10 text-sm mt-2"
            >
              Xem thêm
            </PillButton>
          )}
        </div>
      </FluentCard>
    </div>
  )
}

export default ProfileSidebar
