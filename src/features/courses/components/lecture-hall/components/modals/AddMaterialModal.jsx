import React, { useState, useRef } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput } from "@/shared/components/ui/inputs"
import ToggleOption from "../ui/ToggleOption"
import { UploadCloud, Eye, X, Plus } from "lucide-react"
import FileAttachmentItem from "../ui/FileAttachmentItem"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"
import { getMaterialValidationError, getFileFingerprint } from "../../utils/fileUtils"

const AddMaterialModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
}) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.modals.addMaterial || {}

  const [title, setTitle] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [errors, setErrors] = useState({})
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
    const validFiles = []
    const existingFingerprints = new Set(selectedFiles.map(getFileFingerprint))
    let hasDuplicate = false

    for (const file of files) {
      const fingerprint = getFileFingerprint(file)
      const validationError = getMaterialValidationError(file)

      if (existingFingerprints.has(fingerprint)) {
        hasDuplicate = true
      } else if (validationError === "size") {
        toast.error(dict.maxSize || "Dung lượng dưới 50MB")
      } else if (validationError === "type") {
        toast.error(dict.toastInvalidFileType || "Định dạng không hợp lệ")
      } else if (validationError) {
        toast.error(dict.toastInvalidFile || "Tệp không hợp lệ")
      } else {
        validFiles.push(file)
        existingFingerprints.add(fingerprint)
      }
    }

    if (hasDuplicate) {
      toast.error(dict.toastDuplicateFile || "Một số tệp đã tồn tại và bị bỏ qua")
    }

    if (validFiles.length > 0) {
      const remaining = 5 - selectedFiles.length
      if (validFiles.length > remaining) {
        toast.error(dict.toastMaxFiles || "Chỉ được chọn tối đa 5 tệp")
      }
      const toAdd = validFiles.slice(0, remaining)

      if (!title && toAdd.length > 0) {
        const nameWithoutExt = toAdd[0].name.replace(/\.[^/.]+$/, "")
        setTitle(nameWithoutExt)
      }

      setSelectedFiles(prev => [...prev, ...toAdd])
      if (errors.files) setErrors((prev) => ({ ...prev, files: false }))
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

    if (selectedFiles.length === 0) {
      setErrors({ files: true })
      toast.error(dict.toastFilesRequired || "Vui lòng chọn ít nhất 1 tệp!")
      return
    }

    setErrors({})

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
    setErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      title={
        <div className="w-full relative flex items-center justify-center">
          <h2 className="text-[22px] md:text-[28px] font-medium text-[#191C1D]">
            {dict.title || "Thêm tài liệu"}
          </h2>
          <button 
            type="button" 
            onClick={handleCloseModal}
            className="absolute right-0 -mr-2 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
      }
      showCloseButton={false}
      className="md:max-w-2xl rounded-[24px] h-auto max-h-[95vh] md:max-h-[800px]"
      headerClassName="flex items-center justify-between px-6 md:px-10 py-6 md:py-8"
      bodyClassName="px-6 md:px-10 pb-10 flex-1 overflow-y-auto"
      footer={
        <div className="flex justify-between gap-4 px-1 pb-1 pt-1">
          <button
            type="button"
            onClick={handleCloseModal}
            className="flex-1 h-[52px] rounded-full border border-[#990011] text-[#990011] font-medium text-base flex justify-center items-center gap-2 hover:bg-red-50 transition-colors"
          >
            {dict.cancel || "Hủy"} <X size={18} strokeWidth={2} />
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 h-[52px] rounded-full bg-[#990011] text-white font-medium text-base flex justify-center items-center gap-2 hover:bg-[#80000e] transition-colors disabled:opacity-70"
          >
            {dict.add || "Thêm tài liệu"} <Plus size={18} strokeWidth={2} />
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.materialName || "Tiêu đề"}
          </label>
          <TextInput
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.materialPlaceholder || "Nhập tiêu đề"}
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Upload File Zone */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            {dict.uploadFile} ({selectedFiles.length}/5)
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.jpg,.png"
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
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={dict.uploadDesc}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all space-y-3 ${dragActive
                ? "border-[#72000d] bg-red-50/40"
                : errors.files
                  ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                  : "border-gray-300 hover:border-gray-400 bg-white"
                }`}
            >
              <div className="w-12 h-12 bg-red-100/70 text-[#72000d] rounded-full flex items-center justify-center mx-auto">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-800 font-medium">
                  {dict.dragDropPrefix}{" "}
                  <span className="text-[#72000d] font-bold hover:underline">
                    {dict.selectFile}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {dict.supportedFiles}
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
        <div className="space-y-3 pt-2">
          <ToggleOption
            icon={<Eye size={20} className="text-[#F83B4F]" />}
            iconBg="bg-[#FFEAED]"
            title={t.courses.lectureHall.createPost.visibleToStudents}
            description={dict.visibleToStudentsDesc || ""}
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  )
}

export default AddMaterialModal
