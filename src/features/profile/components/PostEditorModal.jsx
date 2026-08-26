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
  AlertCircle,
} from "lucide-react"

import Dropdown from "@/shared/components/ui/Dropdown"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Modal from "@/shared/components/ui/Modal"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import PostEditorPreviews from "./PostEditorPreviews"
import { useLanguage } from "@/shared/context/LanguageContext"

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
  initialSlug = "",
  initialContent = "",
  initialPrivacy = "Public",
  initialLanguageCommunity = "All",
  initialMedias = [],
  initialFiles = [],
  onSubmit,
  isSubmitting = false,
  isEditMode = false,
}) => {
  const { t } = useLanguage()

  const PRIVACY_OPTIONS = [
    {
      value: "Public",
      label: t.profile?.post?.editor?.privacy?.public || "Công khai",
      icon: <Globe />,
    },
    {
      value: "FriendsOnly",
      label: t.profile?.post?.editor?.privacy?.friendsOnly || "Bạn bè",
      icon: <Users />,
    },
    {
      value: "Private",
      label: t.profile?.post?.editor?.privacy?.private || "Chỉ mình tôi",
      icon: <Lock />,
    },
  ]
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [privacy, setPrivacy] = useState(initialPrivacy)
  const [existingMedias, setExistingMedias] = useState(initialMedias)
  const [removedMediaIds, setRemovedMediaIds] = useState([])
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [languageCommunity] = useState(() => {
    if (isEditMode) return initialLanguageCommunity
    const localLang = localStorage.getItem("communityLanguage")
    if (localLang === "zh") return "Chinese"
    if (localLang === "en") return "English"
    return "All"
  })
  const [files, setFiles] = useState([])
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const documentInputRef = useRef(null)

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
      setErrors({})
      setSubmitError("")

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

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    if (errors.Title || errors.title) {
      setErrors((prev) => ({ ...prev, Title: null, title: null }))
    }
    if (submitError) setSubmitError("")
  }

  const handleEditorChange = (newContent) => {
    setContent(newContent)
    if (errors.Content || errors.content) {
      setErrors((prev) => ({ ...prev, Content: null, content: null }))
    }
    if (submitError) setSubmitError("")
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
      if (errors.Content || errors.content) {
        setErrors((prev) => ({ ...prev, Content: null, content: null }))
      }
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
    if (isSubmitting) return

    // Clean up object URLs
    files.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl)
      }
    })
    setFiles([])
    setErrors({})
    setSubmitError("")
    onClose()
  }

  const handleSubmit = async () => {
    setSubmitError("")
    const validationErrors = {}

    // Check if content is empty (stripping HTML tags and spaces)
    const strippedContent = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim()

    if (!strippedContent) {
      validationErrors.Content =
        t.profile?.post?.editor?.contentRequired ||
        "Nội dung bài viết không được để trống."
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})

    const formData = new FormData()
    formData.append("Title", title.trim() || "Untitled")
    formData.append(
      "Slug",
      isEditMode && initialSlug ? initialSlug : "post-" + Date.now(),
    )
    formData.append("Content", content)
    formData.append("Privacy", privacy)
    formData.append("LanguageCommunity", languageCommunity)

    const fileFieldName = isEditMode ? "NewFiles" : "Files"
    files.forEach((item) => {
      formData.append(fileFieldName, item.file)
    })

    if (isEditMode) {
      removedMediaIds.forEach((id) => {
        formData.append("RemovedMediaIds", id)
      })
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      console.error("Post submit error:", err)
      // Parse RFC 9110 / ASP.NET validation errors
      const apiErrors = err?.data?.errors || err?.errors
      let hasFieldErrors = false

      if (apiErrors && typeof apiErrors === "object") {
        const fieldErrors = {}
        for (const [key, msgs] of Object.entries(apiErrors)) {
          fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
          hasFieldErrors = true
        }
      }

      // Only display the top banner if there are no specific field-level validation errors
      if (!hasFieldErrors) {
        const msg =
          err?.data?.title ||
          err?.data?.message ||
          err?.message ||
          t.profile?.post?.editor?.submitError ||
          "Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin."
        setSubmitError(msg)
      }
    }
  }

  const renderFooter = () => (
    <div className="flex items-center justify-between w-full flex-wrap gap-2">
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
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
          variant="secondary-no-outline"
          textColor="#16a34a"
          startIcon={<Image className="w-5 h-5 text-[#16a34a]" />}
        >
          {t.profile?.post?.editor?.photo || "Ảnh"}
        </PillButton>

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
          variant="secondary-no-outline"
          textColor="#e11d48"
          startIcon={<Video className="w-5 h-5 text-[#e11d48]" />}
        >
          {t.profile?.post?.editor?.video || "Video"}
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
          variant="secondary-no-outline"
          textColor="#2563eb"
          startIcon={<FileText className="w-5 h-5 text-[#2563eb]" />}
        >
          {t.profile?.post?.editor?.document || "Tài liệu"}
        </PillButton>
      </div>

      <div className="flex items-center gap-2">
        <PillButton onClick={handleSubmit} variant="primary">
          {isEditMode
            ? t.profile?.post?.editor?.saveChanges || "Lưu thay đổi"
            : t.profile?.post?.editor?.post || "Đăng"}
        </PillButton>
      </div>
    </div>
  )

  return (
    <Modal
      open={isOpen}
      onClose={handleCancelClick}
      title={
        isEditMode
          ? t.profile?.post?.editor?.editTitle || "Chỉnh sửa bài viết"
          : t.profile?.post?.editor?.createTitle || "Tạo bài viết"
      }
      className="md:max-w-2xl w-full bg-white relative"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      fullScreenOnMobile={true}
      footer={renderFooter()}
    >
      {/* Full Modal Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
          <LoadingSpinner
            text={
              isEditMode
                ? t.profile?.post?.editor?.savingChanges || "Đang lưu thay đổi..."
                : t.profile?.post?.editor?.uploadingPost || "Đang đăng bài viết..."
            }
          />
        </div>
      )}

      <div className="flex flex-col gap-6">
        {submitError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{submitError}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Dropdown
            options={PRIVACY_OPTIONS}
            value={privacy}
            onChange={(val) => setPrivacy(val)}
            dropdownClassName="w-max max-w-[300px]"
            trigger={(isOpen, selectedOption, toggleOpen) => (
              <PillButton
                type="button"
                onClick={toggleOpen}
                variant="secondary"
                startIcon={selectedOption?.icon}
                endIcon={
                  <ChevronDown
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                }
              >
                {selectedOption
                  ? selectedOption.label
                  : t.profile?.post?.editor?.selectPrivacy ||
                    "Chọn quyền riêng tư"}
              </PillButton>
            )}
          />
        </div>

        <TextInput
          label={t.profile?.post?.editor?.titleLabel || "Tiêu đề bài viết"}
          placeholder={
            t.profile?.post?.editor?.titlePlaceholder ||
            "Nhập tiêu đề bài viết..."
          }
          value={title}
          onChange={handleTitleChange}
          error={errors.Title || errors.title}
          variant="square"
        />

        <div className="flex flex-col gap-1">
          <span className="text-xs">
            {t.profile?.post?.editor?.contentLabel || "Nội dung bài viết"}
            <span className="text-red-500 ml-0.5">*</span>
          </span>
          <div
            className={`transition-all duration-200 ${
              errors.Content || errors.content
                ? "[&_.tox-tinymce]:!border-red-500 [&_.tox-tinymce]:!ring-1 [&_.tox-tinymce]:!ring-red-500"
                : ""
            }`}
          >
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
                  ? t.profile?.post?.editor?.editPlaceholder ||
                    "Chỉnh sửa bài viết..."
                  : t.profile?.post?.editor?.placeholder || "Bạn đang nghĩ gì?",
                skin: "oxide",
                setup: (editor) => {
                  editor.on("focus", () => {})
                },
              }}
            />
          </div>
          {(errors.Content || errors.content) && (
            <span className="text-xs text-red-500 px-1 animate-shake">
              {errors.Content || errors.content}
            </span>
          )}
        </div>

        {(files.length > 0 || existingMedias.length > 0) && (
          <div className="flex flex-col gap-2">
            <span className="text-xs">
              {t.profile?.post?.editor?.attachmentsLabel || "Tệp đính kèm"}
            </span>
            <PostEditorPreviews
              files={files}
              existingMedias={existingMedias}
              removeFile={removeFile}
              removeExistingMedia={removeExistingMedia}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PostEditorModal
