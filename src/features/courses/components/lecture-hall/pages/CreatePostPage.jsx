import React, { useState, useRef } from "react"
import {
  Upload,
  CloudUpload,
  Image as ImageIcon,
  File as FileIcon,
  Trash2,
  Send,
  Pin,
  MessageSquare,
  Eye,
  X,
} from "lucide-react"
import { Editor } from "@tinymce/tinymce-react"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"
import FileAttachmentItem from "../components/ui/FileAttachmentItem"
import ToggleOption from "../components/ui/ToggleOption"
import { useParams, useNavigate } from "react-router-dom"
import { useCreatePostInBulletinBoardMutation, useUpdatePostInBulletinBoardMutation, useGetPostDetailQuery } from "@/store/api/coursesApi"
import toast from "react-hot-toast"

// ─── Helpers (reused pattern from CreatePostModal / AddMaterialModal) ────────

const MAX_ATTACHMENTS = 5

// ─── Component ──────────────────────────────────────────────────────────────

const CreatePostPage = () => {
  const { id: classId, boardId, postId } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!postId
  const [createPost, { isLoading: isCreating }] = useCreatePostInBulletinBoardMutation()
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostInBulletinBoardMutation()
  const isLoading = isCreating || isUpdating

  const { data: postDetail } = useGetPostDetailQuery(
    { classId, postId },
    { skip: !isEditMode }
  )

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPinned, setIsPinned] = useState(true)
  const [allowReply, setAllowReply] = useState(true)
  const [visibleToStudents, setVisibleToStudents] = useState(true)

  // Avatar / thumbnail image
  const [avatarPreview, setAvatarPreview] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const avatarInputRef = useRef(null)

  // Attachments (multiple files)
  const [attachments, setAttachments] = useState([])
  const [attachDragActive, setAttachDragActive] = useState(false)
  const attachInputRef = useRef(null)

  const [prevPostId, setPrevPostId] = useState(null)

  if (isEditMode && postDetail && postId !== prevPostId) {
    setPrevPostId(postId)
    setTitle(postDetail.title || "")
    setContent(postDetail.content || "")
    setIsPinned(postDetail.isPinned ?? true)
    setAllowReply(postDetail.allowReply ?? true)
    setVisibleToStudents(postDetail.isVisibleToStudents ?? true)
    if (postDetail.thumbnailUrl) {
      setAvatarPreview(postDetail.thumbnailUrl)
    }
    // Note: Existing attachments would need custom handling for deletion/retention.
    // Assuming attachments are uploaded newly if changed, or backend handles it.
  }

  // ─── Avatar handlers (pattern from CreateCoursePage) ──────────────────────

  const handleAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      alert("Kích cỡ tệp phải dưới 50MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)
    setAvatarFile(file)
  }

  // ─── Attachment handlers (pattern from AddMaterialModal) ──────────────────

  const handleAttachDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setAttachDragActive(true)
    } else if (e.type === "dragleave") {
      setAttachDragActive(false)
    }
  }

  const handleAttachDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAttachDragActive(false)
    const files = Array.from(e.dataTransfer.files || [])
    addAttachments(files)
  }

  const handleAttachChange = (e) => {
    const files = Array.from(e.target.files || [])
    addAttachments(files)
    // Reset input value so the same file can be re-selected
    if (attachInputRef.current) attachInputRef.current.value = ""
  }

  const addAttachments = (files) => {
    setAttachments((prev) => {
      const remaining = MAX_ATTACHMENTS - prev.length
      const toAdd = files.slice(0, remaining)
      return [...prev, ...toAdd]
    })
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết")
      return
    }

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết")
      return
    }

    const formData = new FormData()
    formData.append("Title", title)
    formData.append("Content", content)
    formData.append("IsPinned", isPinned)
    formData.append("AllowReply", allowReply)
    formData.append("IsVisibleToStudents", visibleToStudents)

    if (avatarFile) {
      formData.append("Thumbnail", avatarFile)
    }

    attachments.forEach((file) => {
      formData.append("Attachments", file)
    })

    try {
      if (isEditMode) {
        await updatePost({ classId, postId, formData }).unwrap()
        toast.success("Cập nhật bài viết thành công")
      } else {
        await createPost({ classId, boardId, formData }).unwrap()
        toast.success("Tạo bài viết thành công")
      }
      navigate(-1)
    } catch (err) {
      console.error("Failed to save post", err)
      toast.error(isEditMode ? "Đã xảy ra lỗi khi cập nhật bài viết" : "Đã xảy ra lỗi khi tạo bài viết")
    }
  }

  // const handleDelete = () => {
  //   setTitle("")
  //   setContent("")
  //   setAvatarPreview("")
  //   setAvatarFile(null)
  //   setAttachments([])
  //   setIsPinned(true)
  //   setAllowReply(true)
  //   setVisibleToStudents(true)
  //   if (avatarInputRef.current) avatarInputRef.current.value = ""
  //   if (attachInputRef.current) attachInputRef.current.value = ""
  // }

  const cancelEdit = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* ─── Breadcrumb ───────────────────────────────────────────────── */}
      <Breadcrumb
        className="text-[#7B7979] text-sm"
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Khóa học của tôi", href: "/workspace/courses" },
          { label: "Toàn bộ khóa học", href: "/workspace/courses" },
          { label: "Chi tiết khóa học", href: "#" },
          { label: "Chi tiết lớp học", href: "#" },
          { label: "Chi tiết bảng tin", href: "#" },
          { label: isEditMode ? "Chỉnh sửa bài viết" : "Thêm bài viết", active: true },
        ]}
      />

      <div className="w-full space-y-6">
        {/* ─── Page Title ─────────────────────────────────────────────── */}
        <h1 className="text-[40px] font-semibold text-[#1A1A1A]">
          {isEditMode ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
        </h1>

        {/* ─── Form Card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 space-y-6 shadow-faq-card">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">
            Thông tin bài viết
          </h2>

          {/* ── Avatar upload (pattern from CreateCoursePage) ── */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-[#191C1D]">
              Ảnh đại diện
            </label>
            <div
              onClick={handleAvatarClick}
              className="group relative border border-[#E2E2E2] rounded-xl bg-[#F8F9FA] hover:bg-[#F2F2F2] flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[294px]"
            >
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatarPreview ? (
                <div className="relative w-full max-h-[260px] flex justify-center overflow-hidden rounded-xl p-4">
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="object-contain max-h-[240px] rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold text-sm transition-opacity rounded-xl">
                    Thay đổi hình ảnh
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-10">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#5B403C]">
                    <Upload size={24} />
                  </div>
                  <div className="text-center text-xs text-[#5B403C] space-y-1">
                    <p>Hỗ trợ định dạng png, jpeg và svg.</p>
                    <p>Kích cỡ dưới 50mb</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Title input ── */}
          <div className="space-y-2">
            <label className="block text-base font-medium text-[#191C1D]">
              Tiêu đề
            </label>
            <TextInput
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề"
              className="rounded-xl !h-[50px] px-4 text-sm"
            />
          </div>

          {/* ── Content input ── */}
          <div className="space-y-2">
            <label className="block text-base font-medium text-[#191C1D]">
              Nội dung
            </label>
            <Editor
              tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
              value={content}
              onEditorChange={(newContent) => setContent(newContent)}
              init={{
                height: 300,
                menubar: false,
                statusbar: false,
                plugins: ["autolink", "lists", "link", "charmap", "emoticons"],
                toolbar:
                  "bold italic underline strikethrough | emoticons link | bullist numlist",
                placeholder: "Viết nội dung ở đây...",
                skin: "oxide",
              }}
            />
          </div>

          {/* ── Attachments upload (pattern from CreatePostModal / AddMaterialModal) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-base font-medium text-[#191C1D]">
                Tài liệu đính kèm
              </label>
              <span className="text-xs text-[#5B403C]">
                Tối đa {MAX_ATTACHMENTS} file
              </span>
            </div>

            <input
              type="file"
              ref={attachInputRef}
              onChange={handleAttachChange}
              accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
              className="hidden"
              multiple
            />

            {/* Drop zone */}
            {attachments.length < MAX_ATTACHMENTS && (
              <div
                onDragEnter={handleAttachDrag}
                onDragLeave={handleAttachDrag}
                onDragOver={handleAttachDrag}
                onDrop={handleAttachDrop}
                onClick={() => attachInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 ${attachDragActive
                  ? "border-[#750000] bg-red-50/40"
                  : "border-[#E2E2E2] hover:border-[#C6C6C6] bg-[#F8F9FA]"
                  }`}
              >
                <div className="w-12 h-12 bg-white text-[#750000] rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CloudUpload size={24} />
                </div>
                <div>
                  <p className="text-sm text-[#750000] font-bold mb-1">
                    Nhấn để tải lên hoặc kéo thả file vào đây
                  </p>
                  <p className="text-[11px] text-[#5B403C]">
                    Hỗ trợ PDF, DOCX, XLSX, PPTX, JPG, PNG (Max 50MB/file)
                  </p>
                </div>
              </div>
            )}

            {/* Attached file list */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, idx) => (
                  <FileAttachmentItem
                    key={idx}
                    file={file}
                    onRemove={() => removeAttachment(idx)}
                    variant="default"
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Toggle options (pattern from CreatePostModal) ── */}
          <div className="space-y-0">
            {/* Pin */}
            <ToggleOption
              icon={<Pin size={20} className="text-[#E2B60A]" />}
              iconBg="bg-[#FFF9CC]"
              title="Ghim bài viết"
              description="Giữ bài viết luôn ở đầu bảng tin"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />

            {/* Allow reply */}
            <ToggleOption
              icon={<MessageSquare size={20} className="text-[#0E6EEC]" />}
              iconBg="bg-[#8ECAFF]"
              title="Phản hồi công khai"
              description="Cho phép học viên có thể bình luận về bài viết"
              checked={allowReply}
              onChange={(e) => setAllowReply(e.target.checked)}
            />

            {/* Visible */}
            <ToggleOption
              icon={<Eye size={20} className="text-[#F83B4F]" />}
              iconBg="bg-[#FFEAED]"
              title="Hiển thị với học viên"
              description="Tùy chỉnh độ hiển thị với học viên"
              checked={visibleToStudents}
              onChange={(e) => setVisibleToStudents(e.target.checked)}
            />
          </div>
        </div>

        {/* ─── Action Buttons ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <PillButton
            variant="outline"
            onClick={cancelEdit}
            bgColor="white"
            textColor="#750000"
            borderColor="#750000"
          >
            <X size={16} className="mr-2" /> Hủy
          </PillButton>

          <PillButton
            onClick={handleSubmit}
            disabled={isLoading}
            bgColor="#750000"
            textColor="white"
            className="!rounded-xl !h-12 font-semibold text-sm w-full justify-center disabled:opacity-50"
          >
            {isLoading ? "Đang lưu..." : (
              <>{isEditMode ? "Lưu thay đổi" : "Đăng bảng tin"} <Send size={16} className="ml-2" /></>
            )}
          </PillButton>
        </div>
      </div>
    </div>
  )
}



export default CreatePostPage