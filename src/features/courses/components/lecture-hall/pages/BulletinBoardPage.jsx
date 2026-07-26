import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Search, Plus, MoreVertical, Pin } from "lucide-react"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import DataTable from "@/shared/components/ui/DataTable"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import { useGetListPostsInBulletinBoardQuery, useUpdatePostInBulletinBoardMutation, useDeletePostInBulletinBoardMutation, useGetClassDetailQuery } from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Dropdown from "@/shared/components/ui/Dropdown"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"

const BulletinBoardPage = () => {
  const navigate = useNavigate()
  const { id: classId, boardId } = useParams()
  const { data: detailResponse } = useGetClassDetailQuery(classId, { skip: !classId })
  const classData = detailResponse?.data || detailResponse || {}

  const [searchTerm, setSearchTerm] = useState("")
  const [updatePost] = useUpdatePostInBulletinBoardMutation()
  const [deletePost] = useDeletePostInBulletinBoardMutation()
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, postId: null })

  const { data: apiPosts, isLoading: isPostsLoading } = useGetListPostsInBulletinBoardQuery(
    { classId, boardId },
    { skip: !classId || !boardId }
  )
  const isLoading = isPostsLoading

  // Format data for DataTable
  const postsArray = Array.isArray(apiPosts)
    ? apiPosts
    : (apiPosts?.items || apiPosts?.posts || apiPosts?.data || [])

  const posts = postsArray
    .filter((post) => post.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((post) => ({
      id: post.id,
      title: post.title,
      author: post.accountName,
      date: post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "",
      replies: post.replyCount,
      isPinned: post.isPinned,
      isVisibleToStudents: post.isVisibleToStudents,
      allowReply: post.allowReply,
      status: post.isVisibleToStudents ? "Đang hiển thị" : "Đang ẩn",
    }))

  const handleAction = async (action, rowId) => {
    if (action === "edit") {
      navigate(`/workspace/courses/class/${classId}/bulletin-board/${boardId}/edit-post/${rowId}`)
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
      toast.success("Cập nhật thành công")
    } catch {
      toast.error("Cập nhật thất bại")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.postId) return
    try {
      await deletePost({ classId, postId: deleteConfirm.postId }).unwrap()
      toast.success("Đã xóa bài viết")
    } catch {
      toast.error("Xóa bài viết thất bại")
    } finally {
      setDeleteConfirm({ open: false, postId: null })
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
          { label: "Khóa học của tôi", onClick: () => navigate("/workspace/courses") },
          { label: "Toàn bộ khóa học", onClick: () => navigate(`/workspace/courses/`) },
          { label: "Chi tiết khóa học", onClick: () => navigate(`/workspace/courses/details/${classData?.courseId || ''}`) },
          { label: "Chi tiết lớp học", onClick: () => navigate(`/workspace/courses/class/${classId}?tab=lecture-hall`) },
          { label: "Chi tiết bảng tin", active: true },
        ]}
      />

      <div className="min-w-6xl p-8 w-full">
        <button
          onClick={() => navigate(`/workspace/courses/class/${classId}?tab=lecture-hall`)}
          className="flex items-center gap-2 text-[#750000] font-normal mb-8 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-[#E2E2E2] shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-6 gap-4 border-b border-[#E2E2E2]">
            <TextInput
              icon={Search}
              placeholder="Tìm kiếm bài viết..."
              className="!h-10 bg-[#F3F4F5] !border-[#E2E2E2] "
              containerClassName="w-full max-w-[473px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex items-center gap-4">
              <PillButton
                variant={`secondary-no-outline`}
                onClick={() => navigate(`/workspace/courses/class/${classId}/bulletin-board/${boardId}/create-post`)}
                bgColor={"#FEA53F"}
                textColor={"#6C3E00"}
                className="!rounded-lg !h-10 font-semibold text-sm"
                startIcon={<Plus size={8} color="#6C3E00" />}
              >
                Thêm bài viết
              </PillButton>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={[
              {
                key: "pin",
                label: "",
                render: (row) => row.isPinned ? <Pin size={16} className="text-[#FEA53F] fill-[#FEA53F]" /> : null
              },
              {
                key: "title",
                label: "Chủ đề",
                render: (row) => (
                  <div
                    className="flex items-center cursor-pointer hover:underline w-[352px]"
                    onClick={() => navigate(`/workspace/courses/class/${classId}/bulletin-board/posts/${row.id}`)}
                  >
                    <span className={`font-semibold text-[#A00000]`}>
                      {row.title}
                    </span>
                  </div>
                )
              },
              {
                key: "author",
                label: "Người tạo",
                className: "text-sm font-normal text-[#191C1D]",
              },
              {
                key: "date",
                label: "Thời gian tạo",
                className: "text-sm font-normal text-[#191C1D]",
              },
              {
                key: "replies",
                label: "Phản hồi",
                headerClassName: "text-center",
                className: "text-center",
                render: (row) => (
                  <span className="inline-flex items-center justify-center bg-[#E7E8E9] text-[#191C1D] font-semibold text-xs h-6 px-2 py-1 rounded">
                    {row.replies}
                  </span>
                )
              },
              {
                key: "status",
                label: "Trạng thái",
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${row.status === 'Đang hiển thị' ? 'bg-[#750000]' : 'bg-[#E2E2E2]'}`} />
                    <span className={`font-medium ${row.status === 'Đang hiển thị' ? 'text-[#750000]' : 'text-[#5B403C]'}`}>{row.status}</span>
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
                        <IconButton variant="ghost">
                          <MoreVertical size={18} color="#5B403C" />
                        </IconButton>
                      }
                      options={[
                        { value: 'toggleVisibility', label: row.isVisibleToStudents ? 'Ẩn item' : 'Hiện item' },
                        { value: 'togglePin', label: row.isPinned ? 'Bỏ ghim' : 'Ghim' },
                        { value: 'toggleReply', label: row.allowReply ? 'Tắt bình luận' : 'Bật bình luận' },
                        { value: 'edit', label: 'Chỉnh sửa' },
                        { value: 'delete', label: 'Xoá' }
                      ]}
                      onChange={(val) => handleAction(val, row.id)}
                      align="right"
                      dropdownClassName="w-48"
                    />
                  </div>
                )
              }
            ]}
            data={posts}
            rowKey={(row) => row.id}
            className="text-[#5B403C] text-sm font-semibold"
          />
        </div>
      </div>

      <ConfirmationModal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, postId: null })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
      />
    </div>
  )
}

export default BulletinBoardPage