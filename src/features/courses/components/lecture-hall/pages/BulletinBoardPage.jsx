import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import TablePagination from "@/features/courses/components/shared/TablePagination"
import CourseTablePageHeader from "@/features/courses/components/CourseTablePageHeader"
import { usePaginatedSearch } from "@/features/courses/hooks/usePaginatedSearch"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { 
  useDeletePostInBulletinBoardMutation, 
  useGetListPostsInBulletinBoardQuery, 
  useGetStudentClassDetailQuery, 
  useGetStudentListPostsInBulletinBoardQuery, 
  useUpdatePostInBulletinBoardMutation,
  useGetBulletinBoardDetailQuery
} from "@/store/api/coursesApi"
import BulletinBoardTable from "../components/ui/BulletinBoardTable"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { FileText } from "lucide-react"

export default function BulletinBoardPage() {
  const navigate = useNavigate()
  const { id: classId, boardId } = useParams()
  const { t, language } = useLanguage()
  const { formatDate } = useTimezone()
  const dict = t.courses.lectureHall

  const { data: boardDetailResponse } = useGetBulletinBoardDetailQuery(
    { classId, boardId },
    { skip: !classId || !boardId }
  )
  const boardDetail = boardDetailResponse?.data || boardDetailResponse || {}
  const title = boardDetail?.title || dict?.board || "Bảng tin"

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

  const {
    currentPage,
    debouncedSearchQuery,
    searchQuery,
    setCurrentPage,
    setSearchQuery,
  } = usePaginatedSearch(300)

  const [updatePost] = useUpdatePostInBulletinBoardMutation()
  const [deletePost] = useDeletePostInBulletinBoardMutation()
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, postId: null })

  const teacherQuery = useGetListPostsInBulletinBoardQuery(
    { classId, boardId, page: currentPage, pageSize: 10, search: debouncedSearchQuery },
    { skip: !classId || !boardId || isStudent }
  )
  const studentQuery = useGetStudentListPostsInBulletinBoardQuery(
    { classId, boardId, page: currentPage, pageSize: 10, search: debouncedSearchQuery },
    { skip: !classId || !boardId || !isStudent }
  )

  const { data: apiPosts, isLoading: isPostsLoading } = isStudent ? studentQuery : teacherQuery
  const isLoading = isPostsLoading

  const paginationRaw = apiPosts?.pagination || {}
  const pagination = {
    page: paginationRaw.page || 1,
    pageSize: paginationRaw.pageSize || 10,
    totalPages: paginationRaw.totalPages || Math.ceil((paginationRaw.totalItems || paginationRaw.total || 0) / (paginationRaw.pageSize || 10)) || 1,
    total: paginationRaw.totalItems || paginationRaw.total || 0
  }

  // Format data for DataTable
  const postsArray = Array.isArray(apiPosts?.data || apiPosts)
    ? (apiPosts?.data || apiPosts)
    : (apiPosts?.items || apiPosts?.posts || [])

  const posts = postsArray
    .filter((post) => post.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((post) => ({
      id: post.id,
      title: post.title,
      author: post.accountName,
      date: post.createdAt ? formatDate(post.createdAt) : "",
      replies: post.replyCount,
      isPinned: post.isPinned,
      isVisibleToStudents: post.isVisibleToStudents,
      allowReply: post.allowReply,
      status: post.isVisibleToStudents
        ? dict.bulletinBoard.visibility.visible
        : dict.bulletinBoard.visibility.hidden,
    }))

  const handleAction = async (action, rowId) => {
    if (action === "edit") {
      navigate(`${basePath}/class/${classId}/bulletin-board/${boardId}/edit-post/${rowId}`)
      return
    }

    if (action === "delete") {
      setDeleteConfirm({ open: true, postId: rowId })
      return
    }

    const originalPost = postsArray.find(p => p.id === rowId)
    if (!originalPost) return

    const formData = new FormData()
    formData.append("Title", originalPost.title || "")
    formData.append("Content", originalPost.content || "")

    let isPinned = originalPost.isPinned
    let isVisibleToStudents = originalPost.isVisibleToStudents
    let allowReply = originalPost.allowReply
    let isLocked = originalPost.isLocked !== undefined ? originalPost.isLocked : false

    if (action === "togglePin") isPinned = !isPinned
    if (action === "toggleVisibility") isVisibleToStudents = !isVisibleToStudents
    if (action === "toggleReply") allowReply = !allowReply

    formData.append("IsPinned", isPinned)
    formData.append("IsVisibleToStudents", isVisibleToStudents)
    formData.append("AllowReply", allowReply)
    formData.append("IsLocked", isLocked)

    try {
      await updatePost({
        classId,
        postId: rowId,
        formData
      }).unwrap()
      toast.success(dict.bulletinBoard.toastUpdateSuccess)
    } catch {
      toast.error(dict.bulletinBoard.toastUpdateFailed)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.postId) return
    try {
      await deletePost({ classId, postId: deleteConfirm.postId }).unwrap()
      toast.success(dict.bulletinBoard.toastDeleteSuccess)
    } catch {
      toast.error(dict.bulletinBoard.toastDeleteFailed)
    } finally {
      setDeleteConfirm({ open: false, postId: null })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner text={dict.loading} />
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      <Breadcrumb
        className="text-[#7B7979] text-xs sm:text-sm flex-wrap"
        items={[
          { label: dict.postDetail.breadcrumbs.home, onClick: () => navigate("/workspace") },
          { label: isStudent ? dict.postDetail.breadcrumbs.myLearning : dict.postDetail.breadcrumbs.myCourses, onClick: () => navigate(basePath) },
          { label: dict.postDetail.breadcrumbs.allCourses, onClick: () => navigate(basePath) },
          { label: dict.postDetail.breadcrumbs.courseDetail, onClick: () => navigate(`${basePath}/details/${classData?.courseId || ''}`) },
          { label: dict.postDetail.breadcrumbs.classDetail, onClick: () => navigate(`${basePath}/class/${classId}?tab=lecture-hall`) },
          { label: dict.postDetail.breadcrumbs.boardDetail, active: true },
        ]}
      />

      <CourseTablePageHeader
        title={title}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={dict.bulletinBoard.searchPlaceholder}
        createLabel={dict.bulletinBoard.addPost}
        onCreate={!isStudent ? () => navigate(`${basePath}/class/${classId}/bulletin-board/${boardId}/create-post`) : undefined}
      />

      {/* Table block */}
      {posts.length > 0 ? (
        <div className="flex flex-col gap-2">
          <BulletinBoardTable
            posts={posts}
            dict={dict}
            language={language}
            isStudent={isStudent}
            onRowClick={(row) => navigate(`${basePath}/class/${classId}/bulletin-board/posts/${row.id}`, { state: { boardId } })}
            onAction={(action, rowId) => handleAction(action, rowId)}
          />
          <TablePagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.total}
            limit={pagination.pageSize}
            onPageChange={setCurrentPage}
            t={t}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 flex-1 w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-800 font-medium mb-1">{dict.bulletinBoard.noPosts}</p>
          <p className="text-gray-400 text-sm">{dict.bulletinBoard.noPostsDescription}</p>
        </div>
      )}

      <ConfirmationModal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, postId: null })}
        onConfirm={handleConfirmDelete}
        title={dict.bulletinBoard.confirmDelete}
        message={dict.bulletinBoard.confirmDeleteMsg}
      />
    </div >
  )
}
