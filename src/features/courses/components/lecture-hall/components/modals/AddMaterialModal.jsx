import React, { useState, useRef } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput, Switch } from "@/shared/components/ui/inputs"
import { UploadCloud, X } from "lucide-react"
import FileAttachmentItem from "../ui/FileAttachmentItem"

const AddMaterialModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
}) => {
  const [title, setTitle] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelection(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelection(Array.from(e.target.files))
    }
  }

  // Append new files to the list
  const handleFilesSelection = (files) => {
    setSelectedFiles(prev => [...prev, ...files])
    if (!title && files.length > 0) {
      const nameWithoutExt = files[0].name.replace(/\.[^/.]+$/, "")
      setTitle(nameWithoutExt)
    }
  }

  // Remove a specific file from the list
  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title,
      files: selectedFiles,
      isVisible,
    })
    handleCloseModal()
  }

  const handleCloseModal = () => {
    setTitle("")
    setSelectedFiles([])
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
          <PillButton type="submit" onClick={handleSubmit}>
            Lưu
          </PillButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Tiêu đề
          </label>
          <TextInput
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề..."
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Upload File Zone */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Tệp tải lên ({selectedFiles.length}/5)
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.pptx,.jpg,.png"
            multiple
            className="hidden"
          />

          <div className="space-y-3">
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
                    chọn thêm tệp
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Hỗ trợ PDF, DOCX, PPTX, JPG, PNG (Tối đa 50MB/file)
                </p>
              </div>
            </div>
            {selectedFiles.map((file, idx) => (
              <FileAttachmentItem
                key={`${file.name}-${idx}`}
                file={file}
                onRemove={() => handleRemoveFile(idx)}
              />
            ))}
          </div>
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
