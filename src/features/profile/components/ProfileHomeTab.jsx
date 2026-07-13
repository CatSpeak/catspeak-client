import React, { useState, useRef } from "react"
import { Heart, MessageCircle, Eye, MoreHorizontal, Edit, Trash2, ThumbsUp, Smile, Share } from "lucide-react"
import { 
  useGetUserTimelinePostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../api/profilePostsApi"
import {
  useReactToPostMutation,
  useSharePostMutation,
} from "@/store/api/postsApi"
import {
  useGetFriendRecommendationsQuery,
  useFollowUserMutation,
} from "../api/friendshipApi"
import Avatar from "@/shared/components/ui/Avatar"
import { useNavigate } from "react-router-dom"
import PostEditor from "./PostEditor"
import ShareModal from "@/features/news/components/ShareModal"
import CommentsSection from "@/features/news/components/CommentsSection"

const ProfileHomeTab = ({
  targetAccountId,
  isOwnProfile,
  onNavigateToFriends,
}) => {
  const navigate = useNavigate()
  const [editingPostId, setEditingPostId] = useState(null)
  const [activeMenuPostId, setActiveMenuPostId] = useState(null)
  
  // Interactions state
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [showReactionsPostId, setShowReactionsPostId] = useState(null)
  const holdTimer = useRef(null)

  const { data: postsData, isLoading: isLoadingPosts } =
    useGetUserTimelinePostsQuery(
      { accountId: targetAccountId },
      { skip: !targetAccountId },
    )
  const { data: recData, isLoading: isLoadingRecs } =
    useGetFriendRecommendationsQuery()
  const [followUser] = useFollowUserMutation()

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation()
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
  const [deletePost] = useDeletePostMutation()

  const [reactToPost] = useReactToPostMutation()
  const [sharePost] = useSharePostMutation()

  const timelinePosts = postsData?.data || []
  const recommendations = Array.isArray(recData) ? recData : recData?.data || []

  const handleFollow = (id) => {
    followUser(id)
  }

  const handleCreatePost = async (formData) => {
    try {
      await createPost(formData).unwrap()
    } catch (error) {
      console.error("Failed to create post:", error)
    }
  }

  const handleUpdatePost = async (postId, formData) => {
    try {
      await updatePost({ postId, formData }).unwrap()
      setEditingPostId(null)
    } catch (error) {
      console.error("Failed to update post:", error)
    }
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        await deletePost(postId).unwrap()
        setActiveMenuPostId(null)
      } catch (error) {
        console.error("Failed to delete post:", error)
      }
    }
  }

  const handleReact = (e, postId, type) => {
    e.stopPropagation()
    reactToPost({ postId, type })
    setShowReactionsPostId(null)
  }

  const handleShare = async (e, postId) => {
    e.stopPropagation()
    try {
      const result = await sharePost(postId).unwrap()
      let url =
        (typeof result === "string" ? result : result?.shareLink) ||
        window.location.href

      if (url && !url.startsWith("http")) {
        url = url.startsWith("/") ? url : `/${url}`
        url = `${window.location.origin}${url}`
      }

      if (url) {
        setShareUrl(url)
        setIsShareModalOpen(true)
      }
    } catch (err) {
      console.error("Share failed", err)
    }
  }

  const handleTouchStart = (postId) => {
    holdTimer.current = setTimeout(() => setShowReactionsPostId(postId), 400)
  }

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
      {/* Main Content */}
      <div
        className={`space-y-6 ${isOwnProfile ? "lg:col-span-2" : "lg:col-span-3"}`}
      >
        {isOwnProfile && (
          <PostEditor 
            onSubmit={handleCreatePost}
            isSubmitting={isCreating}
          />
        )}

        {/* News Block */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tin tức</h2>
          </div>

          <div className="space-y-6">
            {isLoadingPosts ? (
              <div className="text-sm text-gray-500">Đang tải bài viết...</div>
            ) : timelinePosts.length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có bài viết nào.</div>
            ) : (
              timelinePosts.map((post, idx) => {
                if (editingPostId === post.postId) {
                  return (
                    <div key={post.postId} className="border border-gray-200 rounded-xl p-4">
                      <PostEditor
                        initialTitle={post.title || ""}
                        initialContent={post.content || ""}
                        initialPrivacy={post.privacy || "Public"}
                        initialLanguageCommunity={post.languageCommunity || "All"}
                        initialMedias={post.media || []}
                        isEditMode={true}
                        isSubmitting={isUpdating}
                        onSubmit={(formData) => handleUpdatePost(post.postId, formData)}
                        onCancel={() => setEditingPostId(null)}
                      />
                    </div>
                  )
                }

                return (
                <div key={post.postId} className="space-y-4">
                  <div className="flex gap-3 justify-between">
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-1">
                        <Avatar
                          size={40}
                          src={post.avatarImageUrl}
                          name={post.username}
                          className="w-10 h-10 bg-purple-100 text-purple-600"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 leading-none">
                          {post.username}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span>{" "}
                          Cập nhật trạng thái
                        </p>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuPostId(activeMenuPostId === post.postId ? null : post.postId)}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {activeMenuPostId === post.postId && (
                          <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => {
                                setEditingPostId(post.postId)
                                setActiveMenuPostId(null)
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" /> Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.postId)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Xóa bài viết
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {post.title && post.title !== "Untitled" && (
                    <h4 className="text-lg font-bold text-gray-900 mt-2 px-1">
                      {post.title}
                    </h4>
                  )}

                  {post.content && (
                    <div 
                      className="text-[15px] text-gray-700 leading-relaxed prose prose-sm max-w-none px-1"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  )}

                  {post.media && post.media.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {post.media.slice(0, 2).map((m) => (
                        <div
                          key={m.postMediaId}
                          className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                        >
                          {m.mediaType === "Image" ? (
                            <img
                              src={m.mediaUrl}
                              alt="media"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              Video
                            </div>
                          )}
                        </div>
                      ))}
                      {post.media.length > 2 && (
                        <div className="aspect-square bg-[#333333] rounded-lg flex items-center justify-center text-white text-xl font-bold">
                          +{post.media.length - 2}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-end justify-between px-1 pb-2 pt-3 border-b border-gray-100 mt-2">
                    <div className="flex items-center gap-4">
                      {/* Like / Reactions */}
                      <div className="group/reactions relative flex items-center">
                        <button
                          onClick={(e) => {
                            const type = post.currentUserReaction || "Like"
                            handleReact(e, post.postId, type)
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-colors hover:bg-gray-100 ${
                            post.currentUserReaction === "Love"
                              ? "text-red-500"
                              : post.currentUserReaction === "Haha"
                                ? "text-yellow-500"
                                : post.currentUserReaction === "Like"
                                  ? "text-blue-600"
                                  : "text-gray-500"
                          }`}
                        >
                          {post.currentUserReaction === "Love" ? (
                            <Heart size={18} strokeWidth={1.5} className="text-red-600 fill-red-500" />
                          ) : post.currentUserReaction === "Haha" ? (
                            <Smile size={18} strokeWidth={1.5} className="text-yellow-600 fill-yellow-500" />
                          ) : (
                            <ThumbsUp
                              size={18}
                              strokeWidth={1.5}
                              className={
                                post.currentUserReaction === "Like"
                                  ? "text-blue-600 fill-blue-500"
                                  : "text-gray-400"
                              }
                            />
                          )}
                          <span className="font-semibold text-[13px]">
                            {post.totalReactions || 0}
                          </span>
                        </button>

                        {/* Reactions popover */}
                        <div
                          className={`absolute bottom-full left-0 mb-1 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 p-1 flex items-center gap-1 transition-all duration-200 z-20 origin-bottom-left
                          ${showReactionsPostId === post.postId ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible group-hover/reactions:opacity-100 group-hover/reactions:scale-100 group-hover/reactions:visible"}`}
                        >
                          <button
                            onClick={(e) => handleReact(e, post.postId, "Like")}
                            className="p-2 hover:-translate-y-1 transition-transform hover:bg-blue-50 rounded-full"
                          >
                            <ThumbsUp size={20} className="text-blue-600 fill-blue-500" />
                          </button>
                          <button
                            onClick={(e) => handleReact(e, post.postId, "Love")}
                            className="p-2 hover:-translate-y-1 transition-transform hover:bg-red-50 rounded-full"
                          >
                            <Heart size={20} className="text-red-600 fill-red-500" />
                          </button>
                          <button
                            onClick={(e) => handleReact(e, post.postId, "Haha")}
                            className="p-2 hover:-translate-y-1 transition-transform hover:bg-yellow-50 rounded-full"
                          >
                            <Smile size={20} className="text-yellow-600 fill-yellow-500" />
                          </button>
                        </div>
                        
                        {/* Touch handlers */}
                        <div
                          className="hidden"
                          onTouchStart={() => handleTouchStart(post.postId)}
                          onTouchEnd={handleTouchEnd}
                          onTouchMove={handleTouchEnd}
                          onMouseLeave={() => setShowReactionsPostId(null)}
                        />
                      </div>

                      {/* Comments */}
                      <button 
                        onClick={() => setOpenCommentsPostId(openCommentsPostId === post.postId ? null : post.postId)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-colors hover:bg-gray-100 font-semibold text-[13px] ${openCommentsPostId === post.postId ? "text-gray-900 bg-gray-50" : "text-gray-500"}`}
                      >
                        <MessageCircle size={18} strokeWidth={1.5} className={openCommentsPostId === post.postId ? "text-gray-700" : "text-gray-400"} />
                        <span>{post.totalComments || 0}</span>
                      </button>
                      
                      {/* Share */}
                      <button 
                        onClick={(e) => handleShare(e, post.postId)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-colors hover:bg-gray-100 text-gray-500 font-semibold text-[13px]"
                      >
                        <Share size={18} strokeWidth={1.5} className="text-gray-400" />
                        <span>Chia sẻ</span>
                      </button>
                    </div>

                    {/* Views */}
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                      <Eye size={16} strokeWidth={1.5} className="text-gray-400" />
                      <span className="font-semibold text-[12px] text-gray-400">
                        {post.viewCount || 0}
                      </span>
                    </div>
                  </div>
                  
                  {openCommentsPostId === post.postId && (
                    <div className="pt-2">
                      <CommentsSection
                        postId={post.postId}
                        totalComments={post.totalComments || 0}
                      />
                    </div>
                  )}

                  {idx < timelinePosts.length - 1 && (
                    <div className="h-4 bg-transparent my-1"></div>
                  )}
                </div>
              )})
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Sidebar (Hidden for other profiles) */}
      {isOwnProfile && (
        <div className="space-y-6 lg:col-span-1">
          {/* Suggested Friends Block */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Đề xuất bạn bè
              </h2>
              {onNavigateToFriends && (
                <button
                  onClick={() => onNavigateToFriends("find")}
                  className="text-sm font-medium text-[#990011] hover:underline"
                >
                  Xem thêm
                </button>
              )}
            </div>

            <div className="space-y-4">
              {isLoadingRecs ? (
                <div className="text-sm text-gray-500">Đang tải đề xuất...</div>
              ) : recommendations.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Không có đề xuất nào.
                </div>
              ) : (
                recommendations.map((user) => (
                  <div
                    key={user.accountId}
                    onClick={() => navigate(`/profile/${user.accountId}`)}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        size={48}
                        src={user.avatarImageUrl}
                        name={user.nickname || user.username}
                        className="w-12 h-12 bg-gray-200"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-gray-900 text-[15px] truncate max-w-[120px]">
                            {user.nickname || user.username}
                          </h3>
                          {user.level === "Teacher" && (
                            <div className="w-3.5 h-3.5 bg-blue-500 rounded-full text-white flex items-center justify-center text-[8px] font-bold">
                              ✓
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {user.level || "Member"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFollow(user.accountId)
                      }}
                      className="px-4 py-1.5 bg-[#990011] text-white text-sm font-medium rounded-full hover:bg-red-900"
                    >
                      Kết nối
                    </button>
                  </div>
                ))
              )}
              {recommendations.length > 0 && onNavigateToFriends && (
                <button
                  onClick={() => onNavigateToFriends("find")}
                  className="w-full mt-2 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Xem thêm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </div>
  )
}

export default ProfileHomeTab
