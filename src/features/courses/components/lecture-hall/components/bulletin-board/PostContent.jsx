import React from "react"
import { Clock, MoreVertical } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { IconButton } from "@/shared/components/ui/buttons"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { getFileIcon } from "../../utils/fileUtils"

/**
 * Hiển thị nội dung chi tiết của một bài đăng bảng tin.
 *
 * @param {object}   post                   - Dữ liệu bài viết
 * @param {string}   post.tag               - Nhãn module/tag
 * @param {string}   post.title             - Tiêu đề bài viết
 * @param {string}   post.authorName        - Tên tác giả
 * @param {string}   [post.authorAvatar]    - URL avatar tác giả
 * @param {string}   post.date              - Ngày đăng (chuỗi hiển thị)
 * @param {string}   [post.bannerImage]     - URL ảnh banner (optional)
 * @param {string}   [post.content]         - Nội dung HTML bài viết
 * @param {Array}    [post.attachments]     - Danh sách file đính kèm [{name, size}]
 * @param {function} [onMenuClick]          - Callback khi nhấn nút "..."
 */
const PostContent = ({ post = {}, onMenuClick }) => {
  const {
    title,
    authorName,
    authorAvatar,
    date,
    thumbnailUrl,
    content,
    attachments = [],
  } = post

  return (
    <div className="bg-[#F8F9FA] rounded-xl p-6 border border-[#E2E2E2] shadow-faq-card space-y-6 mb-6">
      {/* Header: tag + menu */}
      <div className="flex items-center justify-between">
        {/* Author info */}
        <div className="flex items-center gap-3">
          <Avatar
            src={authorAvatar}
            name={authorName}
            alt={authorName}
            size={48}
          />
          <div className="space-y-1">
            <p className="font-semibold text-xl text-[#191C1D]">{authorName}</p>
            <p className="flex items-center gap-1 text-sm text-[#7B7979]">
              <Clock size={12} className="shrink-0" />
              {date}
            </p>
          </div>
        </div>

        <IconButton variant="ghost" onClick={onMenuClick} className="ml-auto">
          <MoreVertical size={16} />
        </IconButton>
      </div>

      {/* Title */}
      <h1 className="text-[28px] font-bold text-[#191C1D]">{title}</h1>

      {/* Banner image */}
      {thumbnailUrl && (
        <div className="rounded-xl overflow-hidden">
          <img
            src={thumbnailUrl}
            alt="banner"
            className="w-full object-cover "
          />
        </div>
      )}

      {/* Text content */}
      {content && (
        <RenderHTML html={content} className="text-[#1A1A1A] text-lg leading-relaxed" />
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-3 mt-4">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              onClick={() => file.url && window.open(file.url, '_blank')}
              className="flex items-center gap-4 bg-white border border-[#E2E2E2] rounded-xl px-4 py-3 cursor-pointer hover:bg-[#FFF5F4] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100/70 flex items-center justify-center shrink-0">
                {getFileIcon(file.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#191C1D]">{file.name}</p>
                <p className="text-xs text-[#5B403C]">{file.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PostContent
