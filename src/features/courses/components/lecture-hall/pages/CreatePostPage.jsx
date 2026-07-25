import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
    Upload,
    CloudUpload,
    FileText,
    Image as ImageIcon,
    FileCode,
    File as FileIcon,
    X,
    Trash2,
    Send,
    Pin,
    MessageSquare,
    Eye,
} from "lucide-react"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Switch from "@/shared/components/ui/inputs/Switch"
import { PillButton } from "@/shared/components/ui/buttons"

// ─── Helpers (reused pattern from CreatePostModal / AddMaterialModal) ────────

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const getFileIcon = (fileName) => {
    if (!fileName) return <FileText size={20} className="text-[#72000d]" />
    const ext = fileName.split(".").pop().toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
        return <ImageIcon size={20} className="text-amber-600" />
    }
    if (["pdf", "doc", "docx"].includes(ext)) {
        return <FileText size={20} className="text-[#72000d]" />
    }
    if (["pptx", "ppt", "xlsx", "xls"].includes(ext)) {
        return <FileCode size={20} className="text-blue-600" />
    }
    return <FileIcon size={20} className="text-gray-600" />
}

const MAX_ATTACHMENTS = 5
const MAX_DESCRIPTION_WORDS = 250

// ─── Component ──────────────────────────────────────────────────────────────

const CreatePostPage = () => {
    const navigate = useNavigate()

    // Form state
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isPinned, setIsPinned] = useState(true)
    const [allowReply, setAllowReply] = useState(true)
    const [visibleToStudents, setVisibleToStudents] = useState(true)

    // Avatar / thumbnail image
    const [avatarPreview, setAvatarPreview] = useState("")
    const avatarInputRef = useRef(null)

    // Attachments (multiple files)
    const [attachments, setAttachments] = useState([])
    const [attachDragActive, setAttachDragActive] = useState(false)
    const attachInputRef = useRef(null)

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

    // ─── Description word count ───────────────────────────────────────────────

    const descriptionWordCount = description.trim()
        ? description.trim().split(/\s+/).length
        : 0

    // ─── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = () => {
        if (!title.trim()) {
            alert("Vui lòng nhập tiêu đề bài viết")
            return
        }
        console.log("Submit post", {
            title,
            description,
            avatarPreview,
            attachments,
            isPinned,
            allowReply,
            visibleToStudents,
        })
    }

    const handleDelete = () => {
        setTitle("")
        setDescription("")
        setAvatarPreview("")
        setAttachments([])
        setIsPinned(true)
        setAllowReply(true)
        setVisibleToStudents(true)
        if (avatarInputRef.current) avatarInputRef.current.value = ""
        if (attachInputRef.current) attachInputRef.current.value = ""
    }

    return (
        <div className="min-h-screen">
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
                    { label: "Thêm bài viết", active: true },
                ]}
            />

            <div className="max-w-4xl p-8">
                {/* ─── Page Title ─────────────────────────────────────────────── */}
                <h1 className="text-3xl font-bold text-[#191C1D] mb-8">
                    Thêm bài viết
                </h1>

                {/* ─── Form Card ──────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-[#E2E2E2] p-8 space-y-8">
                    <h2 className="text-xl font-bold text-[#191C1D]">
                        Thông tin bài viết
                    </h2>

                    {/* ── Avatar upload (pattern from CreateCoursePage) ── */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#191C1D]">
                            Ảnh đại diện
                        </label>
                        <div
                            onClick={handleAvatarClick}
                            className="group relative border border-[#E2E2E2] rounded-xl bg-[#F8F9FA] hover:bg-[#F2F2F2] flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[200px]"
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
                        <label className="block text-sm font-semibold text-[#191C1D]">
                            Tiêu đề
                        </label>
                        <TextInput
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề"
                            className="rounded-xl !h-[50px] px-4 text-sm"
                        />
                    </div>

                    {/* ── Description input ── */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#191C1D]">
                            Mô tả
                        </label>
                        <TextInput
                            multiline
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả"
                            className="rounded-xl px-4 text-sm !min-h-[80px]"
                        />
                        <p className="text-xs text-[#5B403C] text-right">
                            Tối đa {MAX_DESCRIPTION_WORDS} từ
                        </p>
                    </div>

                    {/* ── Attachments upload (pattern from CreatePostModal / AddMaterialModal) ── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-[#191C1D]">
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
                                    <div
                                        key={idx}
                                        className="border border-[#E2E2E2] bg-white rounded-xl px-4 py-3 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 bg-red-100/70 text-[#72000d] rounded-xl flex items-center justify-center shrink-0">
                                                {getFileIcon(file.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#191C1D] truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-[#5B403C]">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(idx)}
                                            className="p-1.5 hover:bg-gray-100 rounded-full text-[#5B403C] hover:text-[#191C1D] transition-colors"
                                            title="Xóa tệp"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Toggle options (pattern from CreatePostModal) ── */}
                    <div className="space-y-0">
                        {/* Pin */}
                        <ToggleOption
                            icon={<Pin size={20} className="text-[#FEA53F]" />}
                            iconBg="bg-[#FFF3E0]"
                            title="Ghim bài viết"
                            description="Giữ bài viết luôn ở đầu bảng tin"
                            checked={isPinned}
                            onChange={(e) => setIsPinned(e.target.checked)}
                        />

                        {/* Allow reply */}
                        <ToggleOption
                            icon={<MessageSquare size={20} className="text-[#750000]" />}
                            iconBg="bg-[#FFDAD4]"
                            title="Phản hồi công khai"
                            description="Cho phép học viên có thể bình luận về bài viết"
                            checked={allowReply}
                            onChange={(e) => setAllowReply(e.target.checked)}
                        />

                        {/* Visible */}
                        <ToggleOption
                            icon={<Eye size={20} className="text-[#750000]" />}
                            iconBg="bg-[#FFDAD4]"
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
                        variant="secondary-no-outline"
                        onClick={handleDelete}
                        bgColor="white"
                        textColor="#750000"
                        borderColor="#750000"
                        className="!rounded-xl !h-12 font-semibold text-sm w-full justify-center"
                    >
                        <Trash2 size={16} className="mr-2" /> Xóa
                    </PillButton>

                    <PillButton
                        onClick={handleSubmit}
                        bgColor="#750000"
                        textColor="white"
                        className="!rounded-xl !h-12 font-semibold text-sm w-full justify-center"
                    >
                        Đăng bảng tin <Send size={16} className="ml-2" />
                    </PillButton>
                </div>
            </div>
        </div>
    )
}

// ─── Reusable Toggle Row ──────────────────────────────────────────────────────

const ToggleOption = ({
    icon,
    iconBg = "bg-[#FFDAD4]",
    title,
    description,
    checked,
    onChange,
}) => (
    <div className="flex items-center justify-between py-4 border-b border-[#F3F4F5] last:border-b-0">
        <div className="flex items-center gap-4">
            <div
                className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
            >
                {icon}
            </div>
            <div>
                <p className="font-semibold text-sm text-[#191C1D]">{title}</p>
                <p className="text-xs text-[#5B403C]">{description}</p>
            </div>
        </div>
        <Switch
            checked={checked}
            onChange={onChange}
            colorClass="peer-checked:bg-[#A00000]"
            className="!h-6"
        />
    </div>
)

export default CreatePostPage