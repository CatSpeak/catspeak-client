import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import TeacherBadge from "@/shared/components/ui/TeacherBadge"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const isUserTeacher = (user) =>
  Boolean(user?.isTeacher ?? user?.authorIsTeacher)

const PostHeader = ({ post, isOwnProfile, onEdit, onDelete }) => {
  const { t } = useLanguage()
  const { formatTimeAgo } = useTimezone()
  const navigate = useNavigate()
  const location = useLocation()
  const authorAccountId = post.accountId || post.authorId || post.userId
  const isTeacher = isUserTeacher(post)

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

  const handleProfileClick = (e) => {
    if (authorAccountId) {
      e.preventDefault?.()
      e.stopPropagation()
      navigate(`/workspace/profile/${authorAccountId}`)
    }
  }

  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-4">
        <div
          onClick={handleProfileClick}
          className={`relative inline-flex items-center justify-center shrink-0 min-w-[48px] min-h-[48px] -m-1 p-1 rounded-full group ${
            authorAccountId ? "cursor-pointer touch-manipulation" : ""
          }`}
          role={authorAccountId ? "button" : undefined}
          tabIndex={authorAccountId ? 0 : undefined}
          onKeyDown={(e) => {
            if (authorAccountId && (e.key === "Enter" || e.key === " ")) {
              handleProfileClick(e)
            }
          }}
          aria-label={post.authorName || "User"}
        >
          <Avatar
            size={40}
            src={post.avatarUrl}
            name={post.authorName || "User"}
            accountId={authorAccountId}
            hoverScale={false}
            className="group-hover:opacity-85"
            onClick={handleProfileClick}
          />
        </div>
        <div>
          <div className="flex items-center gap-1 min-w-0">
            <h3
              onClick={handleProfileClick}
              className={`font-bold truncate inline-flex items-center min-h-[48px] -my-3 py-3 ${authorAccountId ? "cursor-pointer hover:text-cath-red-700 dark:hover:text-red-400 transition-colors touch-manipulation" : ""}`}
            >
              {post.authorName || "User"}
            </h3>
            {isTeacher && <TeacherBadge />}
          </div>

          <div className="text-sm text-secondary dark:text-[#AAAAAA] flex items-center flex-wrap gap-x-2">
            <span className="whitespace-nowrap">{formattedTime}</span>
            {privacyText && (
              <>
                <span className="w-1 h-1 rounded-full bg-secondary dark:bg-[#AAAAAA] shrink-0" />
                <span className="whitespace-nowrap">{privacyText}</span>
              </>
            )}
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
                icon={<Trash2 className="text-red-600 dark:text-red-400" />}
                label={
                  <span className="text-red-600 dark:text-red-400">
                    {t.profile?.post?.header?.delete || "Xóa bài viết"}
                  </span>
                }
                hoverBg="hover:bg-red-50 dark:hover:bg-red-950/30 group-hover:bg-red-50 dark:group-hover:bg-red-950/30"
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
