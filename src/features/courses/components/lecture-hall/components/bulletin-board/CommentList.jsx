import React from "react"
import { MessageSquareOff, MessageSquare } from "lucide-react"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import Avatar from "@/shared/components/ui/Avatar"
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
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Header */}
      <h3 className="text-[24px] font-medium text-[#191C1D] mb-6">
        {totalCount} {dict.replies || "Phản hồi"}
      </h3>

      <div className="space-y-8">
        {/* Comment input */}
        {!locked && (
          <div className="flex items-start gap-4">
            <Avatar
              src={currentUserAvatar}
              name={currentUserName}
              alt={currentUserName}
              size={40}
              className="w-10 h-10 mt-1"
            />
            <div className="flex-1">
              <CommentInput
                onSubmit={onSubmit}
              />
            </div>
          </div>
        )}

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
