import React from "react"
import { MessageSquareOff, MessageSquare } from "lucide-react"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import CommentItem from "./CommentItem"
import CommentInput from "./CommentInput"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Section "Phản hồi" hoàn chỉnh: header, ô nhập, danh sách bình luận.
 * Hỗ trợ 3 trạng thái:
 *  - `locked`  : bình luận bị khóa → hiển thị thông báo "Đã khóa bình luận"
 *  - `empty`   : chưa có bình luận nào → hiển thị thông báo "Không có bình luận"
 *  - `normal`  : hiển thị ô nhập + danh sách bình luận
 *
 * @param {Array}    [comments=[]]          - Danh sách bình luận
 * @param {boolean}  [locked=false]         - Khóa bình luận hay không
 * @param {boolean}  [showAll=false]        - Đang xem-tất-cả hay chưa
 * @param {number}   [previewCount=3]       - Số bình luận hiển thị trước khi bấm "Xem tất cả"
 * @param {string}   [currentUserAvatar]    - Avatar người dùng hiện tại
 * @param {string}   [currentUserName]      - Tên người dùng hiện tại
 * @param {function} [onSubmit]             - Callback(text) khi gửi bình luận
 * @param {function} [onReply]              - Callback(comment) khi bấm Phản hồi
 * @param {function} [onViewReplies]        - Callback(comment) khi bấm Xem phản hồi
 * @param {function} [onShowAll]            - Callback khi bấm "Xem tất cả"
 */
const CommentList = ({
  comments = [],
  locked = false,
  showAll = false,
  previewCount = 3,
  currentUserAvatar,
  currentUserName,
  onSubmit,
  onReply,
  onViewReplies,
  onShowAll,
}) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.postDetail

  const totalCount = comments.length
  const visibleComments = showAll ? comments : comments.slice(0, previewCount)
  const hasMore = !showAll && totalCount > previewCount

  return (
    <div className="bg-[#F8F9FA] rounded-xl border border-[#E2E2E2] shadow-faq-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-5 border-b border-[#E2E2E2]">
        <span className="text-xl font-bold text-[#191C1D]">{dict.replies}</span>
        {totalCount > 0 && (
          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#FEA53F] text-[#6C3E00] text-xs font-bold">
            {totalCount}
          </span>
        )}
      </div>

      <div className="px-8 py-6">
        {/* Comment input */}
        {!locked && (
          <CommentInput
            currentUserAvatar={currentUserAvatar}
            currentUserName={currentUserName}
            onSubmit={onSubmit}
            placeholder={dict.inputPlaceholder}
          />)
        }

        {/* Locked state */}
        {locked ? (
          <EmptyState
            icon={MessageSquareOff}
            message={dict.lockedComments}
            variant="component"
          >
            <p className="text-base text-[#7B7979] mt-4">{dict.lockedCommentsDesc}</p>
          </EmptyState>
        ) : totalCount === 0 && (
          <EmptyState
            icon={MessageSquare}
            message={dict.noComments}
            variant="component"
          >
            <p className="text-base text-[#7B7979] mt-4">{dict.noCommentsDesc}</p>
          </EmptyState>
        )}

        {/* Comment List */}
        {totalCount > 0 && (
          <>
            <div className="border-t border-[#1A1A1A]/50 my-6" />
            <div className="space-y-6">
              {visibleComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={onReply}
                  onViewReplies={onViewReplies}
                />
              ))}
            </div>

            {/* View all button */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  className="text-sm font-semibold text-[#750000] hover:opacity-75 transition-opacity"
                  onClick={onShowAll}
                >
                  {dict.viewAll}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CommentList
