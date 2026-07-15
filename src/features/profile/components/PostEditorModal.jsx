import React, { useState, useRef, useEffect } from "react"
import { Editor } from "@tinymce/tinymce-react"
import {
  Image,
  Video,
  Globe,
  Lock,
  Users,
  ChevronDown,
  FileText,
} from "lucide-react"

import Dropdown from "@/shared/components/ui/Dropdown"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Modal from "@/shared/components/ui/Modal"
import PostEditorPreviews from "./PostEditorPreviews"

const PRIVACY_OPTIONS = [
  { value: "Public", label: "Công khai", icon: <Globe className="w-4 h-4" /> },
  {
    value: "FriendsOnly",
    label: "Bạn bè",
    icon: <Users className="w-4 h-4" />,
  },
  {
    value: "Private",
    label: "Chỉ mình tôi",
    icon: <Lock className="w-4 h-4" />,
  },
]

const getFileType = (file) => {
  if (file && file.type) {
    if (file.type.startsWith("image/")) return "Image"
    if (file.type.startsWith("video/")) return "Video"
  }
  if (file && file.name) {
    const ext = file.name.split(".").pop().toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext))
      return "Image"
    if (
      ["mp4", "webm", "ogg", "mov", "avi", "mkv", "3gp", "flv", "wmv"].includes(
        ext,
      )
    )
      return "Video"
  }
  return "File"
}

const PostEditorModal = ({
  isOpen,
  onClose,
  initialTitle = "",
  initialContent = "",
  initialPrivacy = "Public",
  initialLanguageCommunity = "All",
  initialMedias = [],
  initialFiles = [],
  onSubmit,
  isSubmitting = false,
  isEditMode = false,
}) => {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [privacy, setPrivacy] = useState(initialPrivacy)
  const [existingMedias, setExistingMedias] = useState(initialMedias)
  const [removedMediaIds, setRemovedMediaIds] = useState([])
  const [languageCommunity] = useState(() => {
    if (isEditMode) return initialLanguageCommunity
    const localLang = localStorage.getItem("communityLanguage")
    if (localLang === "zh") return "Chinese"
    if (localLang === "en") return "English"
    return "All"
  })
  const [files, setFiles] = useState([])
  const imageInputRef = useRef(null)
  // const videoInputRef = useRef(null)
  // const documentInputRef = useRef(null)

  // Track files in a ref to clean up object URLs on unmount
  const filesRef = useRef(files)
  useEffect(() => {
    filesRef.current = files
  }, [files])

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl)
        }
      })
    }
  }, [])

  // Sync state ONLY when the modal transitions to open to avoid flickering / constant recreation of object URLs
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setContent(initialContent)
      setPrivacy(initialPrivacy)
      setExistingMedias(initialMedias)
      setRemovedMediaIds([])

      if (initialFiles && initialFiles.length > 0) {
        const mapped = initialFiles.map((file) => {
          const type = getFileType(file)
          return {
            file,
            type,
            previewUrl:
              type === "Image" || type === "Video"
                ? URL.createObjectURL(file)
                : null,
          }
        })
        setFiles(mapped)
      } else {
        setFiles([])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleEditorChange = (newContent) => {
    setContent(newContent)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => {
        const type = getFileType(file)
        return {
          file,
          type,
          previewUrl:
            type === "Image" || type === "Video"
              ? URL.createObjectURL(file)
              : null,
        }
      })
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index) => {
    setFiles((prev) => {
      const item = prev[index]
      if (item && item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const removeExistingMedia = (mediaId) => {
    setExistingMedias((prev) => prev.filter((m) => m.postMediaId !== mediaId))
    setRemovedMediaIds((prev) => [...prev, mediaId])
  }

  const handleCancelClick = () => {
    // Clean up object URLs
    files.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl)
      }
    })
    setFiles([])
    onClose()
  }

  const handleSubmit = () => {
    if (
      !title.trim() &&
      !content.trim() &&
      files.length === 0 &&
      existingMedias.length === 0
    )
      return

    const formData = new FormData()
    formData.append("Title", title.trim() || "Untitled")
    formData.append("Slug", "post-" + Date.now())
    formData.append("Content", content)
    formData.append("Privacy", privacy)
    formData.append("LanguageCommunity", languageCommunity)

    files.forEach((item) => {
      formData.append("Files", item.file)
    })

    removedMediaIds.forEach((id) => {
      formData.append("DeletedMediaIds", id)
    })

    onSubmit(formData)
  }

  const renderFooter = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={imageInputRef}
          onChange={handleFileChange}
        />
        <PillButton
          onClick={() => imageInputRef.current?.click()}
          variant="secondary"
          textColor="#16a34a"
          startIcon={<Image className="w-5 h-5 text-[#16a34a]" />}
          disabled={isSubmitting}
        >
          Ảnh
        </PillButton>

        {/* Temporarily hidden
        <input
          type="file"
          multiple
          accept="video/*"
          className="hidden"
          ref={videoInputRef}
          onChange={handleFileChange}
        />
        <PillButton
          onClick={() => videoInputRef.current?.click()}
          variant="secondary"
          textColor="#e11d48"
          startIcon={<Video className="w-5 h-5 text-[#e11d48]" />}
          disabled={isSubmitting}
        >
          Video
        </PillButton>

        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.csv"
          className="hidden"
          ref={documentInputRef}
          onChange={handleFileChange}
        />
        <PillButton
          onClick={() => documentInputRef.current?.click()}
          variant="secondary"
          textColor="#2563eb"
          startIcon={<FileText className="w-5 h-5 text-[#2563eb]" />}
          disabled={isSubmitting}
        >
          Tài liệu
        </PillButton>
        */}
      </div>

      <div className="flex items-center gap-2">
        <PillButton
          onClick={handleCancelClick}
          variant="secondary"
          disabled={isSubmitting}
        >
          Hủy
        </PillButton>
        <PillButton
          onClick={handleSubmit}
          variant="primary"
          loading={isSubmitting}
          loadingText="Đang xử lý..."
          disabled={
            !title.trim() &&
            !content.trim() &&
            files.length === 0 &&
            existingMedias.length === 0
          }
        >
          {isEditMode ? "Lưu thay đổi" : "Đăng"}
        </PillButton>
      </div>
    </div>
  )

  return (
    <Modal
      open={isOpen}
      onClose={handleCancelClick}
      title={isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết"}
      className="md:max-w-2xl w-full bg-white"
      fullScreenOnMobile={true}
      footer={renderFooter()}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Dropdown
            options={PRIVACY_OPTIONS}
            value={privacy}
            onChange={(val) => setPrivacy(val)}
            dropdownClassName="min-w-[150px] max-w-[150px]"
            renderOption={(option, isSelected) => (
              <div
                className={`w-full h-9 px-3 text-xs rounded-lg flex items-center gap-2.5 transition-colors ${
                  isSelected
                    ? "bg-red-50 text-cath-red-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span
                  className={`shrink-0 ${isSelected ? "text-cath-red-700" : "text-gray-500"}`}
                >
                  {option.icon}
                </span>
                <span className="truncate text-left flex-1">
                  {option.label}
                </span>
              </div>
            )}
            trigger={(isOpen, selectedOption, toggleOpen) => (
              <PillButton
                type="button"
                onClick={toggleOpen}
                variant="outline"
                startIcon={
                  selectedOption ? <span>{selectedOption.icon}</span> : null
                }
                endIcon={
                  <ChevronDown
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                }
              >
                {selectedOption ? selectedOption.label : "Chọn quyền riêng tư"}
              </PillButton>
            )}
          />
        </div>

        <TextInput
          label="Tiêu đề bài viết"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="square"
          floatingLabel
        />

        <Editor
          tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
          value={content}
          onEditorChange={handleEditorChange}
          init={{
            height: 150,
            menubar: false,
            statusbar: false,
            plugins: ["autolink", "lists", "link", "charmap", "emoticons"],
            toolbar:
              "bold italic underline strikethrough | emoticons link | bullist numlist",
            placeholder: isEditMode
              ? "Chỉnh sửa bài viết..."
              : "Bạn đang nghĩ gì?",
            skin: "oxide",
            setup: (editor) => {
              editor.on("focus", () => {})
            },
          }}
        />

        <PostEditorPreviews
          files={files}
          existingMedias={existingMedias}
          removeFile={removeFile}
          removeExistingMedia={removeExistingMedia}
        />
      </div>
    </Modal>
  )
}

export default PostEditorModal
