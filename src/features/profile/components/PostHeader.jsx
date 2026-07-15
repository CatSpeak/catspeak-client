import React from "react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Globe, Users, Lock, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"

dayjs.extend(relativeTime)

const PostHeader = ({ post, isOwnProfile, onEdit, onDelete }) => {
  return (
    <div className="flex gap-4 justify-between">
      <div className="flex gap-4">
        <Avatar
          size={40}
          src={post.avatarUrl}
          name={post.authorName || "User"}
        />
        <div>
          <h3 className="font-semibold">{post.authorName || "User"}</h3>
          <p className="text-sm text-[#606060] flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Eye size={14} className="text-[#606060]" />
              <span>{post.viewCount || 0}</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-[#606060]"></span>
            <span>
              {post.createDate ? dayjs(post.createDate).fromNow() : "Vừa xong"}
            </span>
            {post.privacy && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#606060]"></span>
                <span
                  title={
                    post.privacy === "Public"
                      ? "Công khai"
                      : post.privacy === "FriendsOnly"
                        ? "Bạn bè"
                        : "Chỉ mình tôi"
                  }
                  className="inline-flex items-center"
                >
                  {post.privacy === "Public" && (
                    <Globe size={14} className="text-[#606060]" />
                  )}
                  {post.privacy === "FriendsOnly" && (
                    <Users size={14} className="text-[#606060]" />
                  )}
                  {post.privacy === "Private" && (
                    <Lock size={14} className="text-[#606060]" />
                  )}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {isOwnProfile && (
        <Popover
          placement="bottom-right"
          trigger={
            <IconButton variant="ghost">
              <MoreHorizontal />
            </IconButton>
          }
          content={(close) => (
            <div className="w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-1">
              <button
                onClick={() => {
                  onEdit()
                  close()
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" /> Chỉnh sửa
              </button>
              <button
                onClick={() => {
                  onDelete()
                  close()
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Xóa bài viết
              </button>
            </div>
          )}
        />
      )}
    </div>
  )
}

export default PostHeader
