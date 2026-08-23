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
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const PostDetailPage = () => {
  const navigate = useNavigate()
  const { id: classId, postId } = useParams()
  const location = useLocation()
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  const dict = t.courses.lectureHall.postDetail

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
    title: postDetail?.title || dict.noTitle,
    authorName: postDetail?.accountName || dict.teacher,
    authorAvatar: postDetail?.avatarImageUrl || "",
    date: postDetail?.createdAt ? formatDate(postDetail.createdAt) : "",
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
    authorName: comment.accountName || dict.anonymous,
    authorAvatar: comment.avatarImageUrl || "",
    isTeacher: comment.isTeacher || false,
    time: comment.createdAt ? formatDate(comment.createdAt) : "",
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
        toast.success(dict.toastReplySuccess)
        setReplyingTo(null)
      } else {
        await createComment({
          classId,
          postId,
          content: text,
        }).unwrap()
        toast.success(dict.toastCommentSuccess)
      }
    } catch {
      toast.error(dict.toastError)
    }
  }

  const boardId = location.state?.boardId || postDetail?.bulletinBoardId || postDetail?.boardId

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner text={t.courses.lectureHall.loading} />
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      <Breadcrumb
        className="text-[#7B7979] text-xs sm:text-sm flex-wrap"
        items={[
          { label: dict.breadcrumbs.home, onClick: () => navigate("/workspace") },
          { label: isStudent ? dict.breadcrumbs.myLearning : dict.breadcrumbs.myCourses, onClick: () => navigate(basePath) },
          { label: dict.breadcrumbs.allCourses, onClick: () => navigate(basePath) },
          { label: dict.breadcrumbs.courseDetail, onClick: () => navigate(`${basePath}/details/${classData?.courseId || ''}`) },
          { label: dict.breadcrumbs.classDetail, onClick: () => navigate(`${basePath}/class/${classId}?tab=lecture-hall`) },
          { label: "Chi tiết bảng tin", onClick: () => navigate(`${basePath}/class/${classId}/bulletin-board/${boardId}`) },
          { label: dict.breadcrumbs.postDetail, active: true },
        ]}
      />

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] md:text-[40px] font-semibold text-[#191C1D]">
          Chi tiết bài viết
        </h1>
        <div className="flex gap-2">
          {/* Header Action Buttons from image */}
          <button className="p-2 rounded-lg bg-white border border-[#E2E2E2] hover:bg-gray-50 transition-colors flex items-center justify-center h-10 w-10 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </button>
          <button className="p-2 rounded-lg bg-[#990011] text-white hover:bg-[#80000e] transition-colors flex items-center justify-center h-10 w-10 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 w-full overflow-hidden">
          {/* ── Nội dung bài đăng ── */}
          <PostContent post={formattedPost} />
        </div>

        <div className="lg:col-span-5 w-full overflow-hidden">
        <CommentList
          comments={comments}
          locked={!postDetail?.allowReply}
          showAll={showAll}
          previewCount={3}
          currentUserAvatar={user?.avatarImageUrl || ""}
          currentUserName={user?.fullName || dict.you}
          onSubmit={handleSubmit}
          onReply={(c) => setReplyingTo(c)}
          onViewReplies={(c) => console.log("view replies of", c)}
          onShowAll={() => setShowAll(true)}
        />
        </div>
      </div>
    </div>
  )
}

export default PostDetailPage
