import React, { useState, useRef } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput, Switch } from "@/shared/components/ui/inputs"
import { UploadCloud } from "lucide-react"
import FileAttachmentItem from "../ui/FileAttachmentItem"
import { useLanguage } from "@/shared/context/LanguageContext"

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
      title={dict.title}
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
            {dict.cancel}
          </PillButton>
          <PillButton type="submit" onClick={handleSubmit}>
            {dict.add}
          </PillButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.materialName}
          </label>
          <TextInput
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.materialPlaceholder}
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
        <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h5 className="text-sm font-semibold text-[#111827]">
              {t.courses.lectureHall.createPost.visibleToStudents}
            </h5>
            <p className="text-xs text-[#6B7280] font-normal">
              {dict.visibleToStudentsDesc}
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
