import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Avatar from "@/shared/components/ui/Avatar"
import FluentCard from "@/shared/components/ui/FluentCard"
import ListItem from "@/shared/components/ui/ListItem"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { Skeleton, EmptyState } from "@/shared/components/ui/indicators"
import {
  useGetFriendRecommendationsQuery,
  useSendFriendRequestMutation,
} from "../../../store/api/social/friendshipApi"
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
  const [sentRequests, setSentRequests] = useState(new Set())
  const [loadingIds, setLoadingIds] = useState(new Set())

  const { data: recData, isLoading: isLoadingRecs } =
    useGetFriendRecommendationsQuery(
      { Page: 1, PageSize: 5 },
      { skip: !isOwnProfile },
    )

  const [sendFriendRequest] = useSendFriendRequestMutation()

  if (!isOwnProfile) return null

  const recommendations = Array.isArray(recData?.data)
    ? recData.data
    : Array.isArray(recData)
      ? recData
      : []

  const handleAddFriend = async (e, accountId) => {
    e.stopPropagation()
    setLoadingIds((prev) => new Set(prev).add(accountId))
    setSentRequests((prev) => new Set(prev).add(accountId))

    try {
      await sendFriendRequest(accountId).unwrap()
    } catch (err) {
      console.error("Failed to send friend request:", err)
      setSentRequests((prev) => {
        const next = new Set(prev)
        next.delete(accountId)
        return next
      })
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(accountId)
        return next
      })
    }
  }

  return (
    <div className="lg:col-span-1">
      {/* Suggested Friends Block */}
      <FluentCard padding="p-0" className="overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
          <h2 className="font-bold">
            {t.profile?.sidebar?.suggestedFriends || "Đề xuất bạn bè"}
          </h2>
        </div>

        {/* Body / ListItems */}
        <div className="flex flex-col gap-1 px-1">
          {isLoadingRecs ? (
            <div className="flex flex-col gap-1 px-1 py-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] px-4 flex items-center gap-4 rounded-xl"
                >
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="py-6 px-4">
              <EmptyState
                message={
                  t.profile?.sidebar?.noSuggestions || "Không có đề xuất nào."
                }
                variant="simple"
                className="p-0"
              />
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
                rightContent={
                  sentRequests.has(user.accountId) ? (
                    <PillButton variant="secondary" disabled>
                      {t.profile?.social?.requestSent || "Đã gửi"}
                    </PillButton>
                  ) : (
                    <PillButton
                      variant="primary"
                      onClick={(e) => handleAddFriend(e, user.accountId)}
                      loading={loadingIds.has(user.accountId)}
                    >
                      {t.profile?.social?.addFriend || "Kết bạn"}
                    </PillButton>
                  )
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
