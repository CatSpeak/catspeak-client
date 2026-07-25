import React, { useRef, useState } from "react"
import { CloudUpload, Link2, FileText, Image as ImageIcon, FileCode, File as FileIcon, X } from "lucide-react"
import { Editor } from "@tinymce/tinymce-react"
import Modal from "@/shared/components/ui/Modal"
import Switch from "@/shared/components/ui/inputs/Switch"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"

// Helper function to format file sizes cleanly
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Helper function to resolve dynamic file icon based on file extension
const getFileIcon = (fileName) => {
  if (!fileName) return <FileText size={20} className="text-[#72000d]" />
  const ext = fileName.split(".").pop().toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
    return <ImageIcon size={20} className="text-amber-600" />
  }
  if (["pdf", "doc", "docx"].includes(ext)) {
    return <FileText size={20} className="text-[#72000d]" />
  }
  if (["js", "ts", "json", "html", "css"].includes(ext)) {
    return <FileCode size={20} className="text-blue-600" />
  }
  return <FileIcon size={20} className="text-gray-600" />
}

const CreatePostModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPinned: false,
    allowReply: true,
    visibleToStudents: true,
  })

  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (file) => {
    setSelectedFile(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditorChange = (newContent) => {
    handleChange("content", newContent)
  }

  const handleCloseModal = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      title="Thêm bài viết"
      className="md:max-w-2xl rounded-xl"
      headerClassName="flex items-center justify-between px-6 py-4 border-b border-[#E2E2E2]"
      bodyClassName="p-6 flex-1 overflow-y-auto border-b border-[#E2E2E2]"
      footer={
        <div className="flex justify-end gap-3 px-1">
          <PillButton
            type="button"
            variant="outline"
            onClick={handleCloseModal}
            bgColor={"white"}
            textColor={"#72000d"}
            borderColor={"#E2E2E2"}
          >
            Hủy
          </PillButton>
          <PillButton
            onClick={() => {
              console.log("Save post", formData, selectedFile)
              handleCloseModal()
            }}
          >
            Lưu
          </PillButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Tiêu đề bài viết <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Nhập tiêu đề..."
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Nội dung */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Nội dung <span className="text-[#EF4444]">*</span>
          </label>
          <Editor
            tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
            value={formData.content}
            onEditorChange={handleEditorChange}
            init={{
              height: 180,
              menubar: false,
              statusbar: false,
              plugins: ["autolink", "lists", "link", "charmap", "emoticons"],
              toolbar:
                "bold italic underline strikethrough | emoticons link | bullist numlist",
              placeholder: "Viết nội dung ở đây...",
              skin: "oxide",
              setup: (editor) => {
                editor.on("focus", () => { })
              },
            }}
          />
        </div>

        {/* Tệp đính kèm */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Tệp tải lên ({selectedFile ? "1/1" : "0/1"})
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.pptx,.jpg,.png"
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all space-y-3 ${dragActive
                ? "border-[#72000d] bg-red-50/40"
                : "border-[#E2E2E2] hover:border-gray-400 bg-[#F9FAFB]"
                }`}
            >
              <div className="w-12 h-12 bg-white text-[#72000d] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CloudUpload size={24} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#72000d] font-bold mb-1">
                  Kéo thả tệp hoặc nhấp để tải lên
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Hỗ trợ PDF, DOCX, PPTX, JPG, PNG (Tối đa 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 bg-stone-50/60 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-red-100/70 text-[#72000d] rounded-xl flex items-center justify-center shrink-0">
                  {getFileIcon(selectedFile.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 hover:bg-gray-200/60 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                title="Gỡ tệp"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#191C1D] text-sm">Ghim bài viết</p>
              <p className="text-xs text-[#6B7280]">Giữ bài viết luôn ở đầu bảng tin</p>
            </div>
            <Switch
              checked={formData.isPinned}
              onChange={(e) => handleChange("isPinned", e.target.checked)}
              colorClass="peer-checked:bg-[#A00000]"
              className="!h-6"
            />
          </div>

          <div className="border-b border-[#E2E2E2]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#191C1D] text-sm">Cho phép phản hồi</p>
              <p className="text-sm text-[#6B7280]">Học viên có thể bình luận về bài viết</p>
            </div>
            <Switch
              checked={formData.allowReply}
              onChange={(e) => handleChange("allowReply", e.target.checked)}
              colorClass="peer-checked:bg-[#A00000]"
              className="!h-6"
            />
          </div>

          <div className="border-b border-[#E2E2E2]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#191C1D] text-sm">Hiển thị với học viên</p>
              <p className="text-sm text-[#6B7280]">Bài viết được công khai trên bảng tin lớp học</p>
            </div>
            <Switch
              checked={formData.visibleToStudents}
              onChange={(e) => handleChange("visibleToStudents", e.target.checked)}
              colorClass="peer-checked:bg-[#A00000]"
              className="!h-6"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CreatePostModal
