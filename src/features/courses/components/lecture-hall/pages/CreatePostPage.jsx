import React, { useState, useRef } from "react"
import {
  Upload,
  CloudUpload,
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
import { useCreatePostInBulletinBoardMutation, useUpdatePostInBulletinBoardMutation, useGetPostDetailQuery, useGetClassDetailQuery } from "@/store/api/coursesApi"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getMaterialValidationError, getFileFingerprint } from "../utils/fileUtils"

// ─── Helpers (reused pattern from CreatePostModal / AddMaterialModal) ────────

const MAX_ATTACHMENTS = 5

// ─── Component ──────────────────────────────────────────────────────────────

const CreatePostPage = () => {
  const { id: classId, boardId, postId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const dict = t.courses.lectureHall

  const isEditMode = !!postId
  const [createPost, { isLoading: isCreating }] = useCreatePostInBulletinBoardMutation()
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostInBulletinBoardMutation()
  const isLoading = isCreating || isUpdating

  const { data: postDetail } = useGetPostDetailQuery(
    { classId, postId },
    { skip: !isEditMode }
  )
  const { data: detailResponse } = useGetClassDetailQuery(classId, { skip: !classId })
  const classData = detailResponse?.data || detailResponse || {}

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPinned, setIsPinned] = useState(true)
  const [allowReply, setAllowReply] = useState(true)
  const [visibleToStudents, setVisibleToStudents] = useState(true)
  const [errors, setErrors] = useState({})

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
      toast.error(dict.createPost.fileTooLargeToast)
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)
    setAvatarFile(file)
  }

  const handleRemoveAvatar = (e) => {
    e.stopPropagation()
    setAvatarPreview("")
    setAvatarFile(null)
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ""
    }
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
    const validFiles = []
    const addMaterialDict = t.courses?.lectureHall?.modals?.addMaterial || {}
    const existingFingerprints = new Set(attachments.map(getFileFingerprint))
    let hasDuplicate = false

    for (const file of files) {
      const fingerprint = getFileFingerprint(file)
      const validationError = getMaterialValidationError(file)

      if (existingFingerprints.has(fingerprint)) {
        hasDuplicate = true
      } else if (validationError === "size") {
        toast.error(addMaterialDict.maxSize || "Dung lượng dưới 50MB")
      } else if (validationError === "type") {
        toast.error(addMaterialDict.toastInvalidFileType || "Định dạng không hợp lệ")
      } else if (validationError) {
        toast.error(addMaterialDict.toastInvalidFile || "Tệp không hợp lệ")
      } else {
        validFiles.push(file)
        existingFingerprints.add(fingerprint)
      }
    }

    if (hasDuplicate) {
      toast.error(addMaterialDict.toastDuplicateFile || "Một số tệp đã tồn tại và bị bỏ qua")
    }

    const remaining = MAX_ATTACHMENTS - attachments.length
    if (validFiles.length > remaining) {
      toast.error(dict.toastMaxFiles || `Chỉ được tải lên tối đa ${MAX_ATTACHMENTS} tệp`)
    }
    const toAdd = validFiles.slice(0, remaining)

    setAttachments((prev) => [...prev, ...toAdd])
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = true
    const cleanContent = content.replace(/<[^>]*>?/gm, '').trim()
    if (!cleanContent) newErrors.content = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (newErrors.title) toast.error(dict.createPost.toastTitleRequired)
      else if (newErrors.content) toast.error(dict.createPost.toastContentRequired)
      return
    }
    setErrors({})

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
        toast.success(dict.createPost.toastUpdateSuccess)
      } else {
        await createPost({ classId, boardId, formData }).unwrap()
        toast.success(dict.createPost.toastSuccess)
      }
      navigate(`/workspace/courses/class/${classId}/bulletin-board/${boardId}`)
    } catch (err) {
      console.error("Failed to save post", err)
      toast.error(isEditMode ? dict.createPost.toastUpdateError : dict.createPost.toastError)
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
    navigate(`/workspace/courses/class/${classId}/bulletin-board/${boardId}`)
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* ─── Breadcrumb ───────────────────────────────────────────────── */}
      <Breadcrumb
        className="text-[#7B7979] text-xs sm:text-sm flex-wrap"
        items={[
          { label: dict.postDetail.breadcrumbs.home, onClick: () => navigate("/workspace") },
          { label: dict.postDetail.breadcrumbs.myCourses, onClick: () => navigate("/workspace/courses") },
          { label: dict.postDetail.breadcrumbs.allCourses, onClick: () => navigate(`/workspace/courses/`) },
          { label: dict.postDetail.breadcrumbs.courseDetail, onClick: () => navigate(`/workspace/courses/details/${classData?.courseId || ''}`) },
          { label: dict.postDetail.breadcrumbs.classDetail, onClick: () => navigate(`/workspace/courses/class/${classId}?tab=lecture-hall`) },
          { label: dict.postDetail.breadcrumbs.boardDetail, onClick: () => navigate(`/workspace/courses/class/${classId}/bulletin-board/${boardId}`) },
          { label: isEditMode ? dict.createPost.editTitle : dict.createPost.title, active: true },
        ]}
      />

      <div className="w-full space-y-6">
        {/* ─── Page Title ─────────────────────────────────────────────── */}
        <h1 className="text-[28px] font-semibold text-[#191C1D]">
          {isEditMode ? "Sửa bài viết" : "Thêm bài viết"}
        </h1>

        {/* ─── Form Card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 space-y-8 shadow-sm">
          <h2 className="text-xl font-semibold text-[#191C1D]">
            {dict.createPost.postInfo}
          </h2>

          {/* ── Avatar upload (pattern from CreateCoursePage) ── */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#374151]">
              {dict.createPost.avatar}
            </label>
            <div
              onClick={handleAvatarClick}
              className="group relative rounded-xl bg-[#F3F4F5] flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[294px]"
            >
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatarPreview ? (
                <div className="relative w-full flex justify-center overflow-hidden rounded-xl p-4">
                  <img
                    src={avatarPreview}
                    alt={dict.createPost.previewAlt}
                    className="object-contain max-h-[240px] rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold text-sm transition-opacity rounded-xl pointer-events-none">
                    {dict.createPost.changeImage}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    title={dict.createPost.removeCoverTooltip}
                    aria-label={dict.createPost.removeCoverTooltip}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-10">
                  <div className="flex items-center justify-center text-[#9CA3AF]">
                    <Upload size={32} strokeWidth={2} />
                  </div>
                  <div className="text-center text-xs text-[#9CA3AF] space-y-1 font-medium">
                    <p>{dict.createPost.avatarDesc1 || "Hỗ trợ định dạng png, jpeg và svg."}</p>
                    <p>{dict.createPost.avatarDesc2 || "Kích cỡ dưới 50mb"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Title input ── */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">
              Tiêu đề
            </label>
            <TextInput
              value={title}
              required
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors((prev) => ({ ...prev, title: false }))
              }}
              error={errors.title}
              placeholder={"Nhập tiêu đề"}
              className={`rounded-xl !h-[50px] px-4 text-sm bg-[#F3F4F5] border-0 focus:ring-1 focus:ring-gray-300 ${errors.title ? "ring-2 ring-red-400" : ""}`}
            />
          </div>

          {/* ── Content input ── */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">
              Mô tả
            </label>
            <TextInput
              value={content}
              required
              onChange={(e) => {
                setContent(e.target.value)
                if (errors.content) setErrors((prev) => ({ ...prev, content: false }))
              }}
              error={errors.content}
              placeholder={"Nhập mô tả"}
              className={`rounded-xl !h-[50px] px-4 text-sm bg-[#F3F4F5] border-0 focus:ring-1 focus:ring-gray-300 ${errors.content ? "ring-2 ring-red-400" : ""}`}
            />
            <div className="flex justify-end pt-1">
              <span className="text-[11px] text-gray-400">Tối đa 250 từ</span>
            </div>
          </div>

          {/* ── Attachments upload (pattern from CreatePostModal / AddMaterialModal) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-[#374151]">
                {dict.createPost.attachments || "Tài liệu đính kèm"}
              </label>
              <span className="text-[11px] text-gray-400">
                {(dict.createPost.maxAttachments || "Tối đa {{count}} file").replace("{{count}}", String(MAX_ATTACHMENTS))}
              </span>
            </div>

            <input
              type="file"
              ref={attachInputRef}
              onChange={handleAttachChange}
              accept=".pdf,.docx,.jpg,.png"
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
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    attachInputRef.current?.click()
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={dict.createPost.attachmentsDesc}
                className={`border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 ${attachDragActive
                  ? "border-[#990011] bg-red-50/40"
                  : "border-[#990011]/60 hover:border-[#990011] bg-white"
                  }`}
              >
                <div className="w-12 h-12 text-[#990011] flex items-center justify-center mx-auto">
                  <CloudUpload size={28} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm text-[#990011] font-bold mb-1">
                    {dict.createPost.attachmentsDesc || "Nhấn để tải lên hoặc kéo thả file vào đây"}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {dict.createPost.supportedFiles || "Hỗ trợ PDF, DOCX, XLSX, PPTX, JPG, PNG (Max 50MB/file)"}
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
          <div className="space-y-4 pt-4">
            {/* Pin */}
            <ToggleOption
              icon={<Pin size={20} className="text-[#E2B60A]" />}
              iconBg="bg-[#FFF9CC]"
              title={dict.createPost.pinTitle}
              description={dict.createPost.pinDesc}
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="border-none bg-[#F8F9FA] rounded-[16px] p-4"
            />

            {/* Allow reply */}
            <ToggleOption
              icon={<MessageSquare size={20} className="text-[#0E6EEC]" />}
              iconBg="bg-[#8ECAFF]"
              title={dict.createPost.allowReplyTitle}
              description={dict.createPost.allowReplyDesc}
              checked={allowReply}
              onChange={(e) => setAllowReply(e.target.checked)}
              className="border-none bg-[#F8F9FA] rounded-[16px] p-4"
            />

            {/* Visible */}
            <ToggleOption
              icon={<Eye size={20} className="text-[#F83B4F]" />}
              iconBg="bg-[#FFEAED]"
              title={dict.createPost.visibleTitle}
              description={dict.createPost.visibleDesc}
              checked={visibleToStudents}
              onChange={(e) => setVisibleToStudents(e.target.checked)}
              className="border-none bg-[#F8F9FA] rounded-[16px] p-4"
            />
          </div>
        </div>

        {/* ─── Action Buttons ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mt-8 pb-10">
          <button
            type="button"
            onClick={cancelEdit}
            className="flex-1 h-[52px] rounded-full border border-[#990011] text-[#990011] font-medium text-base flex justify-center items-center gap-2 hover:bg-red-50 transition-colors"
          >
            {dict.createPost.delete || "Xóa"} <Trash2 size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 h-[52px] rounded-full bg-[#990011] text-white font-medium text-base flex justify-center items-center gap-2 hover:bg-[#80000e] transition-colors disabled:opacity-70"
          >
            {isLoading ? dict.createPost.saving : (
              <>{isEditMode ? dict.createPost.save : (dict.createPost.post || "Đăng bảng tin")} <Send size={18} strokeWidth={2} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}



export default CreatePostPage
