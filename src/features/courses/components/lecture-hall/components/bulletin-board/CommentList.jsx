import React from "react"
import { MessageSquareOff, MessageSquare } from "lucide-react"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import CommentItem from "./CommentItem"
import CommentInput from "./CommentInput"

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
  const totalCount = comments.length
  const visibleComments = showAll ? comments : comments.slice(0, previewCount)
  const hasMore = !showAll && totalCount > previewCount

  return (
    <div className="bg-[#F8F9FA] rounded-xl border border-[#E2E2E2] shadow-faq-card">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-8 py-5 border-b border-[#E2E2E2]">
        <span className="text-xl font-bold text-[#191C1D]">Phản hồi</span>
        {totalCount > 0 && (
          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#FEA53F] text-[#6C3E00] text-xs font-bold">
            {totalCount}
          </span>
        )}
      </div>

      <div className="px-8 py-6">
        {/* ── Locked state ── */}
        {locked ? (
          <EmptyState
            icon={MessageSquareOff}
            message="Đã khóa bình luận"
            variant="component"
          >
            <p className="text-xs text-[#5B403C] mt-1">Tính năng bình luận đã bị khóa</p>
          </EmptyState>
        ) : totalCount === 0 ? (
          /* ── No comments state ── */
          <EmptyState
            icon={MessageSquare}
            message="Không có bình luận"
            variant="component"
          >
            <p className="text-xs text-[#5B403C] mt-1">Không có bình luận mới ở đây</p>
          </EmptyState>
        ) : (
          /* ── Normal state: input + list ── */
          <>
            {/* Comment input */}
            <CommentInput
              currentUserAvatar={currentUserAvatar}
              currentUserName={currentUserName}
              onSubmit={onSubmit}
            />

            <div className="border-t border-[#E2E2E2] my-6" />

            {/* Comment list */}
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
                  Xem tất cả
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
