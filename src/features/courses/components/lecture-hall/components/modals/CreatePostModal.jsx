import React, { useRef, useState } from "react"
import { CloudUpload } from "lucide-react"
import { Editor } from "@tinymce/tinymce-react"
import Switch from "@/shared/components/ui/inputs/Switch"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"
import { toast } from "react-hot-toast"
import Modal from "@/shared/components/ui/Modal"
import FileAttachmentItem from "../ui/FileAttachmentItem"
import { useLanguage } from "@/shared/context/LanguageContext"

const CreatePostModal = ({ open, onClose, onSubmit = () => { } }) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.createPost || {}
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
    setFormData({
      title: "",
      content: "",
      isPinned: false,
      allowReply: true,
      visibleToStudents: true,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error(dict.toastTitleRequired)
      return
    }

    const cleanContent = formData.content.replace(/<[^>]*>?/gm, '').trim()
    if (!cleanContent) {
      toast.error(dict.toastContentRequired)
      return
    }

    onSubmit({
      ...formData,
      file: selectedFile,
    })
    handleCloseModal()
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
          <PillButton onClick={handleSubmit}>
            {dict.save}
          </PillButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.postName} <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder={dict.postNamePlaceholder}
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Nội dung */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            {dict.content} <span className="text-[#EF4444]">*</span>
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
              placeholder: dict.contentPlaceholder,
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
            {dict.attachments} ({selectedFile ? "1/1" : "0/1"})
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
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={dict.attachmentsDesc}
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
                  {dict.attachmentsDesc}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {dict.supportedFiles}
                </p>
              </div>
            </div>
          ) : (
            <FileAttachmentItem
              file={selectedFile}
              onRemove={handleRemoveFile}
              variant="modal"
            />
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#191C1D] text-sm">{dict.pinTitle}</p>
              <p className="text-xs text-[#6B7280]">{dict.pinDesc}</p>
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
              <p className="font-semibold text-[#191C1D] text-sm">{dict.allowReplyTitle}</p>
              <p className="text-sm text-[#6B7280]">{dict.allowReplyDesc}</p>
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
              <p className="font-semibold text-[#191C1D] text-sm">{dict.visibleTitle}</p>
              <p className="text-sm text-[#6B7280]">{dict.visibleDesc}</p>
            </div>
            <Switch
              checked={formData.visibleToStudents}
              onChange={(e) => handleChange("visibleToStudents", e.target.checked)}
              colorClass="peer-checked:bg-[#A00000]"
              className="!h-6"
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default CreatePostModal
