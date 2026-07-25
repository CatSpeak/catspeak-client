import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import PostContent from "../components/bulletin-board/PostContent"
import CommentList from "../components/bulletin-board/CommentList"

// ─── Mock post data ───────────────────────────────────────────────────────────
const MOCK_POST = {
  tag: "Module 1 - Introduction",
  title: "Thông báo lịch học tuần này",
  authorName: "Nguyễn Thị Anh Thy",
  authorAvatar: "https://i.pravatar.cc/150?img=5",
  date: "23/05/2026 · 13:45",
  content: `<p style="font-weight:600;margin-bottom:8px">Part 1: Essay</p>
<p style="margin-bottom:12px">The evolution of language is a fascinating subject that touches upon anthropology, sociology, and linguistics. Throughout history, the way humans communicate has been heavily influenced by technological advancements. For instance, the invention of the printing press standardized spelling and grammar, while the advent of the internet has introduced a plethora of new acronyms and relaxed structural rules.</p>
<p style="margin-bottom:12px">Furthermore, the globalization of commerce requires a lingua franca, which English has largely become. This widespread adoption, however, leads to regional variations, such as Spanglish or Chinglish, highlighting the dynamic nature of language adaptation.</p>
<p style="font-weight:600;margin-bottom:8px">Part 2: Essay</p>
<p style="margin-bottom:12px">The evolution of language is a fascinating subject that touches upon anthropology, sociology, and linguistics. Throughout history, the way humans communicate has been heavily influenced by technological advancements.</p>`,
  attachments: [
    { name: "[File's name].[format]", size: "2.5 MB" },
    { name: "[File's name].[format]", size: "2.5 MB" },
  ],
}

// ─── Mock comments ─────────────────────────────────────────────────────────
const MOCK_COMMENTS = [
  {
    id: 1,
    authorName: "Nguyễn Thị Anh Thy",
    authorAvatar: "https://i.pravatar.cc/150?img=5",
    isTeacher: false,
    time: "13:45",
    image: "https://picsum.photos/seed/comment1/600/200",
    content:
      "The evolution of language is a fascinating subject that touches upon anthropology, sociology, and linguistics. Throughout history, the way humans communicate has been heavily influenced by technological advancements.",
    link: "gooogleai.fetzzz",
    replyCount: 0,
  },
  {
    id: 2,
    authorName: "Nguyễn Thị Anh Thy",
    authorAvatar: "https://i.pravatar.cc/150?img=5",
    isTeacher: false,
    time: "13:45",
    content:
      "The evolution of language is a fascinating subject that touches upon anthropology, sociology, and linguistics. Throughout history, the way humans communicate has been heavily influenced by technological advancements.",
    replyCount: 5,
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────
const PostDetailPage = () => {
  const navigate = useNavigate()
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const [showAll, setShowAll] = useState(false)

  // false  → hiển thị bình thường
  // true   → khóa bình luận (demo)
  const [locked] = useState(false)

  const handleSubmit = (text) => {
    const newComment = {
      id: Date.now(),
      authorName: "Bạn",
      authorAvatar: "https://i.pravatar.cc/150?img=1",
      isTeacher: false,
      time: "Vừa xong",
      content: text,
      replyCount: 0,
    }
    setComments((prev) => [newComment, ...prev])
  }

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

      <div className="min-w-6xl p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#750000] font-normal mb-8 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* ── Nội dung bài đăng ── */}
        <PostContent
          post={MOCK_POST}
          onMenuClick={() => console.log("open post menu")}
        />

        {/* ── Phần phản hồi ── */}
        <CommentList
          comments={comments}
          locked={locked}
          showAll={showAll}
          previewCount={3}
          currentUserAvatar="https://i.pravatar.cc/150?img=1"
          currentUserName="Bạn"
          onSubmit={handleSubmit}
          onReply={(c) => console.log("reply to", c)}
          onViewReplies={(c) => console.log("view replies of", c)}
          onShowAll={() => setShowAll(true)}
        />
      </div>
    </div>
  )
}

export default PostDetailPage
