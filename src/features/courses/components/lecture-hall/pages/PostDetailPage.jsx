import React, { useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import PostContent from "../components/bulletin-board/PostContent"
import CommentList from "../components/bulletin-board/CommentList"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { toast } from "react-hot-toast"
import {
  useGetPostDetailQuery,
  useGetStudentPostDetailQuery,
  useCreateCommentInBulletinBoardMutation,
  useCreateStudentCommentInBulletinBoardMutation,
  useCreateReplyInCommentMutation,
  useGetStudentClassDetailQuery,
} from "@/store/api/coursesApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useSelector } from "react-redux"
import { formatFileSize } from "../utils/fileUtils"

const PostDetailPage = () => {
  const navigate = useNavigate()
  const { id: classId, postId } = useParams()
  const location = useLocation()

  // Robust role check
  const { data: profileResponse } = useGetUserProfileQuery()
  const profile = profileResponse?.data || profileResponse || {}
  const currentUserId = profile.accountId?.toString() || ""

  const { data: detailResponse } = useGetStudentClassDetailQuery(classId, { skip: !classId })
  const classData = detailResponse?.data || detailResponse || {}

  const isOwner = currentUserId && (
    classData.instructorId?.toString() === currentUserId ||
    classData.instructor?.id?.toString() === currentUserId ||
    classData.teacherId?.toString() === currentUserId
  )
  const isStudent = !isOwner
  const basePath = `/workspace/${isStudent ? 'learning' : 'courses'}`

  const [showAll, setShowAll] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)

  const { user } = useSelector((state) => state.auth)

  const teacherDetailQuery = useGetPostDetailQuery(
    { classId, postId },
    { skip: !classId || !postId || isStudent }
  )
  const studentDetailQuery = useGetStudentPostDetailQuery(
    { classId, postId },
    { skip: !classId || !postId || !isStudent }
  )

  const { data: postDetail, isLoading } = isStudent ? studentDetailQuery : teacherDetailQuery

  const [createTeacherComment] = useCreateCommentInBulletinBoardMutation()
  const [createStudentComment] = useCreateStudentCommentInBulletinBoardMutation()
  const createComment = isStudent ? createStudentComment : createTeacherComment

  const [createReply] = useCreateReplyInCommentMutation()

  const formattedPost = {
    tag: "",
    title: postDetail?.title || "Không có tiêu đề",
    authorName: postDetail?.accountName || "Giảng viên",
    authorAvatar: postDetail?.avatarImageUrl || "",
    date: postDetail?.createdAt ? new Date(postDetail.createdAt).toLocaleDateString("vi-VN") : "",
    thumbnailUrl: postDetail?.thumbnailUrl || "",
    content: postDetail?.content || "",
    attachments: postDetail?.attachmentsJson
      ? JSON.parse(postDetail.attachmentsJson).map(a => ({
        name: a.FileName,
        url: a.FileUrl,
        size: formatFileSize(a.FileSize)
      }))
      : [],
  }

  const comments = postDetail?.replies?.map((comment) => ({
    id: comment.id,
    authorName: comment.accountName || "Ẩn danh",
    authorAvatar: comment.avatarImageUrl || "",
    isTeacher: comment.isTeacher || false,
    time: comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("vi-VN") : "",
    content: comment.content,
    replyCount: comment.replyCount || 0,
  })) || []

  const handleSubmit = async (text) => {
    try {
      if (replyingTo) {
        await createReply({
          classId,
          commentId: replyingTo.id,
          content: text,
        }).unwrap()
        toast.success("Đã phản hồi bình luận")
        setReplyingTo(null)
      } else {
        await createComment({
          classId,
          postId,
          content: text,
        }).unwrap()
        toast.success("Đã gửi bình luận")
      }
    } catch (error) {
      toast.error(error?.data?.message || "Lỗi khi gửi bình luận")
    }
  }

  const boardId = location.state?.boardId || postDetail?.bulletinBoardId || postDetail?.boardId

  const handleBack = () => {
    if (boardId) {
      navigate(`${basePath}/class/${classId}/bulletin-board/${boardId}`)
    } else if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate(`${basePath}/class/${classId}?tab=lecture-hall`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Breadcrumb
        className="text-[#7B7979] text-sm"
        items={[
          { label: "Trang chủ", onClick: () => navigate("/workspace") },
          { label: "Khóa học của tôi", onClick: () => navigate(basePath) },
          { label: "Toàn bộ khóa học", onClick: () => navigate(basePath) },
          { label: "Chi tiết khóa học", onClick: () => navigate(`${basePath}/details/${classData?.courseId || ''}`) },
          { label: "Chi tiết lớp học", onClick: () => navigate(`${basePath}/class/${classId}?tab=lecture-hall`) },
          { label: "Chi tiết bài viết", active: true },
        ]}
      />

      <div className="min-w-6xl p-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#750000] font-normal mb-8 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* ── Nội dung bài đăng ── */}
        <PostContent
          post={formattedPost}
          onMenuClick={() => console.log("open post menu")}
        />

        {/* ── Phần phản hồi ── */}
        <CommentList
          comments={comments}
          locked={!postDetail?.allowReply}
          showAll={showAll}
          previewCount={3}
          currentUserAvatar={user?.avatarImageUrl || ""}
          currentUserName={user?.fullName || "Bạn"}
          onSubmit={handleSubmit}
          onReply={(c) => setReplyingTo(c)}
          onViewReplies={(c) => console.log("view replies of", c)}
          onShowAll={() => setShowAll(true)}
        />
      </div>
    </div>
  )
}

export default PostDetailPage
