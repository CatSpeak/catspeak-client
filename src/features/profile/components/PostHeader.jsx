import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const PostHeader = ({ post, isOwnProfile, onEdit, onDelete }) => {
  const { t } = useLanguage()
  const { formatTimeAgo } = useTimezone()
  const navigate = useNavigate()
  const location = useLocation()
  const authorAccountId = post.accountId || post.authorId || post.userId

  const formattedTime = post.createDate
    ? formatTimeAgo(post.createDate)
    : t.profile?.post?.header?.justNow || "Vừa xong"

  const privacyText =
    post.privacy === "Public"
      ? t.profile?.post?.header?.privacy?.public || "Công khai"
      : post.privacy === "FriendsOnly"
        ? t.profile?.post?.header?.privacy?.friendsOnly || "Bạn bè"
        : post.privacy === "Private"
          ? t.profile?.post?.header?.privacy?.private || "Chỉ mình tôi"
          : post.privacy

  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-4">
        <Avatar
          size={40}
          src={post.avatarUrl}
          name={post.authorName || "User"}
          accountId={authorAccountId}
        />
        <div>
          <h3
            onClick={(e) => {
              if (authorAccountId) {
                e.stopPropagation()
                const isWorkspace = location.pathname.startsWith("/workspace")
                navigate(
                  `${isWorkspace ? "/workspace" : ""}/profile/${authorAccountId}`,
                )
              }
            }}
            className={`font-semibold ${authorAccountId ? "cursor-pointer hover:underline hover:text-cath-red-700 transition-colors" : ""}`}
          >
            {post.authorName || "User"}
          </h3>
          <div className="text-sm text-secondary flex items-center flex-wrap gap-x-2">
            <span className="whitespace-nowrap">{formattedTime}</span>
            {privacyText && (
              <>
                <span className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                <span className="whitespace-nowrap">{privacyText}</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-[#606060] shrink-0" />
            <span className="whitespace-nowrap">
              {post.viewCount || 0}{" "}
              {t.profile?.post?.header?.views || "lượt xem"}
            </span>
          </div>
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
            <MenuList className="w-48">
              <MenuItem
                icon={<Edit />}
                label={t.profile?.post?.header?.edit || "Chỉnh sửa"}
                onClick={() => {
                  onEdit()
                  close()
                }}
              />
              <MenuItem
                icon={<Trash2 className="text-red-600" />}
                label={
                  <span className="text-red-600">
                    {t.profile?.post?.header?.delete || "Xóa bài viết"}
                  </span>
                }
                hoverBg="hover:bg-red-50 group-hover:bg-red-50"
                onClick={() => {
                  onDelete()
                  close()
                }}
              />
            </MenuList>
          )}
        />
      )}
    </div>
  )
}

export default PostHeader
