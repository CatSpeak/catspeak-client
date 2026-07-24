import React, { useState, useRef } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput, Switch } from "@/shared/components/ui/inputs"
import { UploadCloud, FileText, Image as ImageIcon, FileCode, File, X } from "lucide-react"

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
  return <File size={20} className="text-gray-600" />
}

const AddMaterialModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
  sessionName = "Buổi 1: Introduction & Greetings",
}) => {
  const [title, setTitle] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const fileInputRef = useRef(null)

  // Standardized Drag Event Handlers
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

  // Update file & auto fill display title with new file name
  const handleFileSelection = (file) => {
    setSelectedFile(file)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
    setTitle(nameWithoutExt)
  }

  // Reset file & clear display title back to empty
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setTitle("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title,
      file: selectedFile,
      isVisible,
      sessionName,
    })
    handleCloseModal()
  }

  const handleCloseModal = () => {
    setSelectedFile(null)
    setTitle("")
    setIsVisible(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      title="Thêm học liệu"
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
          <PillButton type="submit">
            Lưu
          </PillButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner session info */}
        <div className="bg-[#F9FAFB] text-[#4B5563] text-sm p-3 rounded-xl font-medium">
          Đang thêm vào: <span className="font-semibold text-[#111827]">{sessionName}</span>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Tên hiển thị <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tên học liệu..."
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Upload File Zone */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Tệp tải lên ({selectedFile ? "1/1" : "0/1"}) <span className="text-red-500">*</span>
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
                : "border-gray-300 hover:border-gray-400 bg-white"
                }`}
            >
              <div className="w-12 h-12 bg-red-100/70 text-[#72000d] rounded-full flex items-center justify-center mx-auto">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-800 font-medium">
                  Kéo thả tệp vào đây hoặc{" "}
                  <span className="text-[#72000d] font-bold hover:underline">
                    chọn tệp
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Hỗ trợ PDF, DOCX, PPTX, JPG, PNG (Tối đa 50MB)
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

        {/* Visible to Students Card Box Toggle */}
        <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h5 className="text-sm font-semibold text-[#111827]">
              Hiển thị với học viên
            </h5>
            <p className="text-xs text-[#6B7280] font-normal">
              Học viên có thể nhìn thấy liên kết này ngay lập tức
            </p>
          </div>
          <Switch
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            colorClass="peer-checked:bg-[#A00000]"
            className="min-h-6"
          />
        </div>
      </form>
    </Modal>
  )
}

export default AddMaterialModal
