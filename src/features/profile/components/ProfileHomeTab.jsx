import React from "react"
import { useGetUserTimelinePostsQuery } from "../../../store/api/social/profilePostsApi"
import CreatePostBox from "./CreatePostBox"
import PostFeedList from "./PostFeedList"
import ProfileSidebar from "./ProfileSidebar"
import { Newspaper } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ProfileHomeTab = ({
  targetAccountId,
  isOwnProfile,
  onNavigateToFriends,
}) => {
  const { t } = useLanguage()

  const { data: postsData, isLoading: isLoadingPosts } =
    useGetUserTimelinePostsQuery(
      { accountId: targetAccountId },
      { skip: !targetAccountId },
    )

  const timelinePosts = postsData?.data || []

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Content - Timeline */}
      <div
        className={`space-y-2 ${isOwnProfile ? "lg:col-span-2" : "lg:col-span-3"}`}
      >
        {isOwnProfile && <CreatePostBox />}

        {/* News Block */}
        <PostFeedList
          posts={timelinePosts}
          isLoading={isLoadingPosts}
          isOwnProfile={isOwnProfile}
          emptyMessage={t.profile?.home?.noPosts || "Chưa có bài viết nào."}
          emptyIcon={Newspaper}
          emptyVariant="card"
          className="flex flex-col gap-2"
        />
      </div>

      {/* Right Column - Sidebar */}
      <div className="hidden lg:block">
        <ProfileSidebar
          isOwnProfile={isOwnProfile}
          onNavigateToFriends={onNavigateToFriends}
        />
      </div>
    </div>
  )
}

export default ProfileHomeTab
