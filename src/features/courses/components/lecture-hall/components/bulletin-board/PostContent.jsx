import React from "react"
import { Clock } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { getFileIcon } from "../../utils/fileUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

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
 */
const PostContent = ({ post = {} }) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.postDetail
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
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Header: Author + 3 dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src={authorAvatar}
            name={authorName}
            alt={authorName}
            size={48}
            className="w-12 h-12"
          />
          <div className="space-y-0.5">
            <p className="font-semibold text-[17px] text-[#191C1D]">{authorName}</p>
            <p className="flex items-center gap-1 text-sm text-[#7B7979]">
              <Clock size={14} className="shrink-0" />
              {date}
            </p>
          </div>
        </div>

        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </button>
      </div>

      {/* Title */}
      <h2 className="text-[24px] font-medium text-[#191C1D]">
        {title}
      </h2>

      {/* Image / Thumbnail */}
      {thumbnailUrl ? (
        <div className="w-full rounded-2xl overflow-hidden bg-[#F8F9FA]">
          <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-auto object-cover max-h-[400px]" />
        </div>
      ) : (
        <div className="w-full h-[240px] md:h-[300px] bg-[#D9D9D9] rounded-2xl"></div>
      )}

      {/* Content */}
      {content && (
        <div className="text-[#333333] leading-relaxed">
          <RenderHTML html={content} className="text-[#1A1A1A] text-[15px] leading-relaxed" />
        </div>
      )}

      {/* Attachments */}
      {attachments?.length > 0 && (
        <div className="space-y-3 pt-4">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              onClick={() => file.url && window.open(file.url, "_blank")}
              onKeyDown={(event) => {
                if (file.url && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault()
                  window.open(file.url, "_blank")
                }
              }}
              role={file.url ? "button" : undefined}
              tabIndex={file.url ? 0 : undefined}
              title={dict.openAttachmentTooltip.replace("{{name}}", file.name)}
              className="flex items-center gap-4 bg-[#F8F9FA] rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E22E2E] flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-xs">
                PDF
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#191C1D] truncate">
                  {file.name}
                </p>
                <p className="text-[13px] text-[#7B7979] mt-0.5">{file.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PostContent
