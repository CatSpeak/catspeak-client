import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Search, Plus, MoreVertical, Pin } from "lucide-react"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import DataTable from "@/shared/components/ui/DataTable"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import CreatePostModal from "../components/modals/CreatePostModal"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"

const MOCK_POSTS = [
  {
    id: 1,
    title: "Thông báo lịch học tuần này",
    author: "Dr. Sarah Jenkins",
    date: "20/07/2026",
    replies: 3,
    status: "Đang hiển thị",
    isPinned: true,
  },
  {
    id: 2,
    title: "Thông báo lịch thi Mid-term",
    author: "Dr. Sarah Jenkins",
    date: "25/07/2026",
    replies: 12,
    status: "Đang hiển thị",
    isPinned: false,
  },
  {
    id: 3,
    title: "Bài tập về nhà: Vocabulary Unit 2",
    author: "Dr. Sarah Jenkins",
    date: "26/07/2026",
    replies: 8,
    status: "Đang hiển thị",
    isPinned: false,
  },
  {
    id: 4,
    title: "Slide bài giảng Buổi 3 - Grammar deep dive",
    author: "Dr. Sarah Jenkins",
    date: "27/07/2026",
    replies: 0,
    status: "Đang ẩn",
    isPinned: false,
  },
  {
    id: 5,
    title: "Thảo luận: Phương pháp tự học Tiếng Anh",
    author: "Dr. Sarah Jenkins",
    date: "28/07/2026",
    replies: 45,
    status: "Đang hiển thị",
    isPinned: false,
  },
  {
    id: 6,
    title: "Tài liệu đọc thêm: Business Ethics",
    author: "Dr. Sarah Jenkins",
    date: "29/07/2026",
    replies: 5,
    status: "Đang hiển thị",
    isPinned: false,
  }
]

const BulletinBoardPage = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Breadcrumb
        className="text-[#7B7979] text-sm"
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Khóa học của tôi", href: "/workspace/courses" },
          { label: "Toàn bộ khóa học", href: "/workspace/courses" },
          { label: "Chi tiết khóa học", href: "#" },
          { label: "Chi tiết lớp học", href: "#" },
          { label: "Chi tiết bảng tin", active: true },
        ]}
      />

      <div className="min-w-6xl p-8 w-full">
        <button
          onClick={() => navigate(-1)}
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
            />

            <div className="flex items-center gap-4">
              <PillButton
                variant={`secondary-no-outline`}
                onClick={() => setActiveFilter("all")}
                className={`rounded-full text-sm font-semibold !h-10`}
                bgColor={`${activeFilter === "all" ? "#FFDAD4" : "white"}`}
                textColor={`${activeFilter === "all" ? "#750000" : "black"}`}
                borderColor={`${activeFilter === "all" ? "#750000" : "#E2E2E2"}`}
              >
                Tất cả
              </PillButton>
              <PillButton
                variant={`secondary-no-outline`}
                onClick={() => setActiveFilter("teacher")}
                className={`rounded-full text-sm font-semibold !h-10`}
                bgColor={`${activeFilter === "teacher" ? "#FFDAD4" : "white"}`}
                textColor={`${activeFilter === "teacher" ? "#750000" : "black"}`}
                borderColor={`${activeFilter === "teacher" ? "#750000" : "#E2E2E2"}`}
              >
                Bài của giảng viên
              </PillButton>
              <PillButton
                variant={`secondary-no-outline`}
                onClick={() => setActiveFilter("student")}
                className={`rounded-full text-sm font-semibold !h-10`}
                bgColor={`${activeFilter === "student" ? "#FFDAD4" : "white"}`}
                textColor={`${activeFilter === "student" ? "#750000" : "black"}`}
                borderColor={`${activeFilter === "student" ? "#750000" : "#E2E2E2"}`}
              >
                Bài của học viên
              </PillButton>

              <PillButton
                variant={`secondary-no-outline`}
                onClick={() => setIsCreateModalOpen(true)}
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
                label: "Tiêu đề bài viết",
                render: (row) => (
                  <span
                    className="w-[352px] text-[#750000] font-semibold cursor-pointer"
                    onClick={() => navigate(`posts/${row.id}`)}
                  >
                    {row.title}
                  </span>
                )
              },
              {
                key: "author",
                label: "Người tạo",
                className: "text-sm font-normal text-[#191C1D]"
              },
              {
                key: "date",
                label: "Thời gian tạo",
                className: "text-sm font-normal text-[#191C1D]"
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
                  <IconButton
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical size={18} color="#5B403C" />
                  </IconButton>
                )
              }
            ]}
            data={MOCK_POSTS}
            rowKey={(row) => row.id}
            className="text-[#5B403C] text-sm font-semibold"
          />

          {/* Footer */}
          <div className="bg-[#F3F4F5] border-[#E2E2E2] px-4 py-4">
            <span className="text-sm text-[#5B403C]">
              Hiển thị 1 - {MOCK_POSTS.length} của {MOCK_POSTS.length} bài viết
            </span>
          </div>
        </div>
      </div>

      <CreatePostModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div >
  )
}

export default BulletinBoardPage