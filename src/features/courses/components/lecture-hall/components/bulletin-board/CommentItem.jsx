import React from "react"
import Avatar from "@/shared/components/ui/Avatar"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Hiển thị một bình luận đơn lẻ trong danh sách phản hồi.
 *
 * @param {object}   comment                - Dữ liệu bình luận
 * @param {string}   comment.id             - ID duy nhất
 * @param {string}   comment.authorName     - Tên tác giả
 * @param {string}   [comment.authorAvatar] - URL avatar
 * @param {boolean}  [comment.isTeacher]    - Là giáo viên hay không
 * @param {string}   comment.time           - Thời gian (chuỗi hiển thị)
 * @param {string}   [comment.image]        - URL ảnh đính kèm
 * @param {string}   comment.content        - Nội dung bình luận (text)
 * @param {string}   [comment.link]         - Link đính kèm
 * @param {number}   [comment.replyCount]   - Số lượng phản hồi con
 * @param {function} [onReply]              - Callback khi bấm "Phản hồi"
 * @param {function} [onViewReplies]        - Callback khi bấm "Xem XX phản hồi"
 */
const CommentItem = ({ comment = {}, }) => {
  const {
    authorName,
    authorAvatar,
    isTeacher,
    time,
    image,
    content,
    link,
    // replyCount = 0,
  } = comment

  const { t } = useLanguage()
  const dict = t.courses.lectureHall.postDetail

  return (
    <div className="flex gap-4">
      {/* Avatar */}
      <div className="shrink-0 pt-1">
        <Avatar src={authorAvatar} name={authorName} alt={authorName} size={40} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Author + time */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-[#191C1D]">{authorName}</span>
          {isTeacher && (
            <span className="bg-[#750000] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              {dict.teacher}
            </span>
          )}
          <span className="text-xs text-[#5B403C]"> {time}</span>
        </div>

        {/* Image attachment */}
        {image && (
          <div className="rounded-xl overflow-hidden mb-3 bg-[#E2E2E2]">
            <img
              src={image}
              alt={dict.commentAttachmentAlt}
              className="w-full object-cover max-h-60"
            />
          </div>
        )}

        {/* Text content */}
        {content && (
          <RenderHTML html={content} className="text-sm text-[#191C1D] leading-relaxed mb-2" />
        )}

        {/* Link attachment */}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#750000] hover:underline block mb-2"
          >
            {link}
          </a>
        )}
      </div>
    </div>
  )
}

export default CommentItem
