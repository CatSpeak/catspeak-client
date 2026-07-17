import React, { useState, useRef } from "react"
import {
  useGetUserTimelinePostsQuery,
  useCreatePostMutation,
} from "../../../store/api/social/profilePostsApi"
import PostEditorModal from "./PostEditorModal"
import ProfilePostCard from "./ProfilePostCard"
import ProfileSidebar from "./ProfileSidebar"
import FluentCard from "@/shared/components/ui/FluentCard"
import { EmptyState } from "@/shared/components/ui/indicators"
import { Newspaper, Image, Video, FileText } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useGetUserProfileQuery } from "@/store/api/userApi"

const ProfileHomeTab = ({
  targetAccountId,
  isOwnProfile,
  onNavigateToFriends,
}) => {
  const { user } = useAuth()
  const { data: profileResponse } = useGetUserProfileQuery()
  const currentUser = profileResponse?.data || user

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [initialFiles, setInitialFiles] = useState([])

  const triggerImageRef = useRef(null)
  // const triggerVideoRef = useRef(null)
  // const triggerFileRef = useRef(null)

  const { data: postsData, isLoading: isLoadingPosts } =
    useGetUserTimelinePostsQuery(
      { accountId: targetAccountId },
      { skip: !targetAccountId },
    )

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation()

  const timelinePosts = postsData?.data || []

  const handleCreatePost = async (formData) => {
    try {
      await createPost(formData).unwrap()
      setIsEditorOpen(false)
    } catch (error) {
      console.error("Failed to create post:", error)
    }
  }

  const handleTriggerFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files)
      setInitialFiles(selected)
      setIsEditorOpen(true)
      // Reset input value so the same file can be selected again later
      e.target.value = ""
    }
  }

  const handleOpenEditorEmpty = () => {
    setInitialFiles([])
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setInitialFiles([])
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-3 pb-20">
      {/* Main Content - Timeline */}
      <div
        className={`space-y-3 ${isOwnProfile ? "lg:col-span-2" : "lg:col-span-3"}`}
      >
        {isOwnProfile && (
          <>
            <FluentCard padding="p-0" className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 p-4 sm:p-6">
                <Avatar
                  size={40}
                  src={currentUser?.avatarImageUrl}
                  name={currentUser?.nickname || currentUser?.username || "U"}
                />
                <button
                  onClick={handleOpenEditorEmpty}
                  className="flex-1 h-10 pl-5 text-left text-gray-500 bg-transparent border border-[#e5e5e5] hover:border-cath-red-700 rounded-full outline-none cursor-pointer text-sm transition-colors"
                >
                  Bạn đang nghĩ gì?
                </button>
              </div>

              <div className="h-px bg-[#e5e5e5]" />

              <div className="flex items-center gap-2 w-full">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={triggerImageRef}
                  onChange={handleTriggerFileChange}
                />
                <button
                  type="button"
                  onClick={() => triggerImageRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 h-12 px-4 text-sm text-[#16a34a] hover:bg-[#f3f3f3] active:bg-green-100 transition-colors duration-200 outline-none cursor-pointer"
                >
                  <Image size={20} className="text-[#16a34a]" />
                  <span>Ảnh</span>
                </button>

                {/* Temporarily hidden
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  className="hidden"
                  ref={triggerVideoRef}
                  onChange={handleTriggerFileChange}
                />
                <button
                  type="button"
                  onClick={() => triggerVideoRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 h-11 px-4 text-sm font-medium text-[#e11d48] hover:bg-rose-50 active:bg-rose-100 transition-colors duration-200 outline-none cursor-pointer"
                >
                  <Video size={20} className="text-[#e11d48]" />
                  <span>Video</span>
                </button>

                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.csv"
                  className="hidden"
                  ref={triggerFileRef}
                  onChange={handleTriggerFileChange}
                />
                <button
                  type="button"
                  onClick={() => triggerFileRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 h-11 px-4 text-sm font-medium text-[#2563eb] hover:bg-blue-50 active:bg-blue-100 transition-colors duration-200 outline-none cursor-pointer"
                >
                  <FileText size={20} className="text-[#2563eb]" />
                  <span>Tài liệu</span>
                </button>
                */}
              </div>
            </FluentCard>

            <PostEditorModal
              isOpen={isEditorOpen}
              onClose={handleCloseEditor}
              initialFiles={initialFiles}
              onSubmit={handleCreatePost}
              isSubmitting={isCreating}
            />
          </>
        )}

        {/* News Block */}
        <div className="space-y-3">
          {isLoadingPosts ? (
            <FluentCard>
              <div className="text-sm text-gray-500">Đang tải bài viết...</div>
            </FluentCard>
          ) : timelinePosts.length === 0 ? (
            <FluentCard>
              <EmptyState message="Chưa có bài viết nào." icon={Newspaper} />
            </FluentCard>
          ) : (
            timelinePosts.map((post) => (
              <ProfilePostCard
                key={post.postId}
                post={post}
                isOwnProfile={isOwnProfile}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <ProfileSidebar
        isOwnProfile={isOwnProfile}
        onNavigateToFriends={onNavigateToFriends}
      />
    </div>
  )
}

export default ProfileHomeTab
