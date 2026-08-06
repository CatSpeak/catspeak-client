import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Search, Plus, MoreVertical, Pin } from "lucide-react"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import DataTable from "@/shared/components/ui/DataTable"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import { useGetListPostsInBulletinBoardQuery, useGetStudentListPostsInBulletinBoardQuery, useUpdatePostInBulletinBoardMutation, useDeletePostInBulletinBoardMutation, useGetStudentClassDetailQuery } from "@/store/api/coursesApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Dropdown from "@/shared/components/ui/Dropdown"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Pagination from "@/shared/components/ui/navigation/Pagination"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

export default function BulletinBoardPage() {
  const navigate = useNavigate()
  const { id: classId, boardId } = useParams()
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  const dict = t.courses.lectureHall

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

  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [updatePost] = useUpdatePostInBulletinBoardMutation()
  const [deletePost] = useDeletePostInBulletinBoardMutation()
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, postId: null })

  const teacherQuery = useGetListPostsInBulletinBoardQuery(
    { classId, boardId, page, pageSize },
    { skip: !classId || !boardId || isStudent }
  )
  const studentQuery = useGetStudentListPostsInBulletinBoardQuery(
    { classId, boardId, page, pageSize },
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
    .filter((post) => post.title?.toLowerCase().includes(searchTerm.toLowerCase()))
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
    <div className="min-h-screen">
      <Breadcrumb
        className="text-[#7B7979] text-sm"
        items={[
          { label: dict.postDetail.breadcrumbs.home, onClick: () => navigate("/workspace") },
          { label: isStudent ? dict.postDetail.breadcrumbs.myLearning : dict.postDetail.breadcrumbs.myCourses, onClick: () => navigate(basePath) },
          { label: dict.postDetail.breadcrumbs.allCourses, onClick: () => navigate(basePath) },
          { label: dict.postDetail.breadcrumbs.courseDetail, onClick: () => navigate(`${basePath}/details/${classData?.courseId || ''}`) },
          { label: dict.postDetail.breadcrumbs.classDetail, onClick: () => navigate(`${basePath}/class/${classId}?tab=lecture-hall`) },
          { label: dict.postDetail.breadcrumbs.boardDetail, active: true },
        ]}
      />

      <div className="min-w-6xl p-8 w-full">
        <button
          onClick={() => navigate(`${basePath}/class/${classId}?tab=lecture-hall`)}
          className="flex items-center gap-2 text-[#750000] font-normal mb-8 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={16} /> {dict.postDetail.back}
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-[#E2E2E2] shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-6 gap-4 border-b border-[#E2E2E2]">
            <TextInput
              icon={Search}
              placeholder={dict.bulletinBoard.searchPlaceholder}
              className="!h-10 bg-[#F3F4F5] !border-[#E2E2E2] "
              containerClassName="w-full max-w-[473px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {!isStudent && (
              <div className="flex items-center gap-4">
                <PillButton
                  variant={`secondary-no-outline`}
                  onClick={() => navigate(`${basePath}/class/${classId}/bulletin-board/${boardId}/create-post`)}
                  bgColor={"#FEA53F"}
                  textColor={"#6C3E00"}
                  className="!rounded-lg !h-10 font-semibold text-sm"
                  startIcon={<Plus size={8} color="#6C3E00" />}
                >
                  {dict.bulletinBoard.addPost}
                </PillButton>
              </div>
            )}
          </div>

          {/* Table */}
          <DataTable
            columns={[
              {
                key: "pin",
                label: "",
                render: (row) => row.isPinned
                  ? (
                    <Pin
                      size={16}
                      className="text-[#FEA53F] fill-[#FEA53F]"
                      aria-label={dict.bulletinBoard.pinnedPostTooltip}
                    />
                  )
                  : null
              },
              {
                key: "title",
                label: dict.bulletinBoard.topic,
                render: (row) => (
                  <div
                    className="flex items-center cursor-pointer hover:underline w-[352px]"
                    onClick={() => navigate(`${basePath}/class/${classId}/bulletin-board/posts/${row.id}`, { state: { boardId } })}
                  >
                    <span className={`font-semibold text-[#A00000]`}>
                      {row.title}
                    </span>
                  </div>
                )
              },
              {
                key: "author",
                label: dict.bulletinBoard.creator,
                className: "text-sm font-normal text-[#191C1D]",
              },
              {
                key: "date",
                label: dict.bulletinBoard.createdAt,
                className: "text-sm font-normal text-[#191C1D]",
              },
              {
                key: "replies",
                label: dict.bulletinBoard.replies,
                headerClassName: "text-center",
                className: "text-center",
                render: (row) => (
                  <span className="inline-flex items-center justify-center bg-[#E7E8E9] text-[#191C1D] font-semibold text-xs h-6 px-2 py-1 rounded">
                    {row.replies}
                  </span>
                )
              },
              // Teacher-only columns
              ...(!isStudent ? [
                {
                  key: "status",
                  label: dict.bulletinBoard.status,
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${row.status === dict.bulletinBoard.visibility.visible ? 'bg-[#750000]' : 'bg-[#E2E2E2]'}`} />
                      <span className={`font-medium ${row.status === dict.bulletinBoard.visibility.visible ? 'text-[#750000]' : 'text-[#5B403C]'}`}>{row.status}</span>
                    </div>
                  )
                },
                {
                  key: "action",
                  label: "",
                  headerClassName: "w-12",
                  className: "text-center",
                  render: (row) => (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        trigger={
                          <IconButton
                            variant="ghost"
                            title={dict.bulletinBoard.postActionsTooltip}
                            aria-label={dict.bulletinBoard.postActionsTooltip}
                          >
                            <MoreVertical size={18} color="#5B403C" />
                          </IconButton>
                        }
                        options={[
                          { value: 'toggleVisibility', label: row.isVisibleToStudents ? dict.bulletinBoard.visibility.hideItem : dict.bulletinBoard.visibility.showItem },
                          { value: 'togglePin', label: row.isPinned ? dict.bulletinBoard.visibility.unpin : dict.bulletinBoard.visibility.pin },
                          { value: 'toggleReply', label: row.allowReply ? dict.bulletinBoard.visibility.disableReply : dict.bulletinBoard.visibility.enableReply },
                          { value: 'edit', label: dict.bulletinBoard.edit },
                          { value: 'delete', label: dict.bulletinBoard.delete }
                        ]}
                        onChange={(val) => handleAction(val, row.id)}
                        align="right"
                        dropdownClassName="w-48"
                      />
                    </div>
                  )
                }
              ] : []),
            ]}
            data={posts}
            rowKey={(row) => row.id}
            emptyTitle={dict.bulletinBoard.noPosts}
            emptyDescription={dict.bulletinBoard.noPostsDescription}
            className="text-[#5B403C] text-sm font-semibold"
          />
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-[#E2E2E2] flex justify-end">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChangePage={setPage}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, postId: null })}
        onConfirm={handleConfirmDelete}
        title={dict.bulletinBoard.confirmDelete}
        message={dict.bulletinBoard.confirmDeleteMsg}
      />
    </div>
  )
}
