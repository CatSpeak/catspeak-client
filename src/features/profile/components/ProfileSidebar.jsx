import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Avatar from "@/shared/components/ui/Avatar"
import FluentCard from "@/shared/components/ui/FluentCard"
import ListItem from "@/shared/components/ui/ListItem"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useGetFriendRecommendationsQuery } from "../../../store/api/social/friendshipApi"
import { useLanguage } from "@/shared/context/LanguageContext"

const getUserRoleLabel = (user, t) => {
  const isTeacher =
    user?.isTeacher === true ||
    user?.isTeacher === 1 ||
    user?.isTeacher === "true" ||
    (typeof user?.level === "string" &&
      user.level.trim().toLowerCase() === "expert")

  return isTeacher
    ? t.profile?.friends?.teacher || "Giảng viên"
    : t.profile?.friends?.member || "Thành viên"
}

const ProfileSidebar = ({ isOwnProfile, onNavigateToFriends }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const { data: recData, isLoading: isLoadingRecs } =
    useGetFriendRecommendationsQuery(
      { Page: 1, PageSize: 5 },
      { skip: !isOwnProfile },
    )
  if (!isOwnProfile) return null

  const recommendations = Array.isArray(recData?.data)
    ? recData.data
    : Array.isArray(recData)
      ? recData
      : []

  return (
    <div className="lg:col-span-1">
      {/* Suggested Friends Block */}
      <FluentCard padding="p-0" className="overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {t.profile?.sidebar?.suggestedFriends || "Đề xuất bạn bè"}
          </h2>
        </div>

        {/* Body / ListItems */}
        <div className="flex flex-col gap-1 px-1">
          {isLoadingRecs ? (
            <div className="p-4 sm:p-6 text-sm text-gray-500">
              {t.profile?.sidebar?.loading || "Đang tải đề xuất..."}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-4 sm:p-6 text-sm text-gray-500">
              {t.profile?.sidebar?.noSuggestions || "Không có đề xuất nào."}
            </div>
          ) : (
            recommendations.map((user) => (
              <ListItem
                key={user.accountId}
                hoverEffect={true}
                lines={2}
                className="rounded-xl overflow-hidden"
                onClick={() => {
                  const isWorkspace = location.pathname.startsWith("/workspace")
                  navigate(
                    `${isWorkspace ? "/workspace" : ""}/profile/${user.accountId}`,
                  )
                }}
                leftContent={
                  <Avatar
                    size={40}
                    src={user.avatarImageUrl}
                    name={user.nickname || user.username}
                    accountId={user.accountId}
                  />
                }
              >
                <span className="truncate">
                  {user.nickname || user.username}
                </span>

                <span className="text-sm text-[#606060] truncate">
                  {getUserRoleLabel(user, t)}
                </span>
              </ListItem>
            ))
          )}
        </div>

        {/* Footer */}
        {recommendations.length > 0 && onNavigateToFriends && (
          <div className="p-4 sm:p-6 pt-2">
            <PillButton
              onClick={() => onNavigateToFriends("find")}
              variant="secondary"
              className="w-full"
            >
              {t.profile?.sidebar?.seeMore || "Xem thêm"}
            </PillButton>
          </div>
        )}
      </FluentCard>
    </div>
  )
}

export default ProfileSidebar
