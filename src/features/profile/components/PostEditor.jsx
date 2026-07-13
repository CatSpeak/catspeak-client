import React, { useState, useRef } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { Image, Video, X, Globe, Lock, Users } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useAuth } from "@/features/auth/hooks/useAuth"

const PRIVACY_OPTIONS = [
  { value: "Public", label: "Công khai", icon: <Globe className="w-4 h-4" /> },
  { value: "FriendsOnly", label: "Bạn bè", icon: <Users className="w-4 h-4" /> },
  { value: "Private", label: "Chỉ mình tôi", icon: <Lock className="w-4 h-4" /> },
]

const PostEditor = ({
  initialTitle = "",
  initialContent = "",
  initialPrivacy = "Public",
  initialLanguageCommunity = "All",
  initialMedias = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditMode = false,
}) => {
  const { user } = useAuth()
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [privacy, setPrivacy] = useState(initialPrivacy)
  const [existingMedias, setExistingMedias] = useState(initialMedias)
  const [removedMediaIds, setRemovedMediaIds] = useState([])
  const [languageCommunity, setLanguageCommunity] = useState(() => {
    if (isEditMode) return initialLanguageCommunity
    const localLang = localStorage.getItem("communityLanguage")
    if (localLang === "zh") return "Chinese"
    if (localLang === "en") return "English"
    return "All"
  })
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleEditorChange = (newContent, editor) => {
    setContent(newContent)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingMedia = (mediaId) => {
    setExistingMedias((prev) => prev.filter((m) => m.postMediaId !== mediaId))
    setRemovedMediaIds((prev) => [...prev, mediaId])
  }

  const handleSubmit = () => {
    // Return early if there's no content and no files and no existing medias
    if (!title.trim() && !content.trim() && files.length === 0 && existingMedias.length === 0) return

    const formData = new FormData()
    formData.append("Title", title.trim() || "Untitled") 
    formData.append("Slug", "post-" + Date.now()) // Optional slug if required
    formData.append("Content", content)
    formData.append("Privacy", privacy)
    formData.append("LanguageCommunity", languageCommunity)
    
    files.forEach((file) => {
      formData.append("Files", file)
    })
    
    removedMediaIds.forEach((id) => {
      formData.append("DeletedMediaIds", id)
    })

    onSubmit(formData)
    
    // Reset if it's not edit mode (we keep state during submit, but clear it later if success handled externally)
    if (!isEditMode) {
      setTitle("")
      setContent("")
      setFiles([])
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 w-full">
      <div className="flex gap-3 mb-3">
        <Avatar
          size={40}
          src={user?.avatarImageUrl}
          name={user?.nickname || user?.username || "U"}
          className="w-10 h-10 bg-gray-200 shrink-0"
        />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-900 text-sm">
            {user?.nickname || user?.username}
          </span>
          <div className="flex items-center gap-2">
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="text-xs text-gray-600 bg-gray-100 rounded px-1.5 py-0.5 border-none outline-none cursor-pointer max-w-max"
            >
              {PRIVACY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Tiêu đề bài viết..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-base font-semibold text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-200 focus:border-gray-400 outline-none pb-2 mb-3"
        />
      </div>

      <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
        <Editor
          tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
          value={content}
          onEditorChange={handleEditorChange}
          init={{
            height: 150,
            menubar: false,
            statusbar: false,
            plugins: [
              "autolink", "lists", "link", "charmap", "emoticons"
            ],
            toolbar:
              "bold italic underline strikethrough | emoticons link | bullist numlist",
            placeholder: isEditMode ? "Chỉnh sửa bài viết..." : "Bạn đang nghĩ gì?",
            content_style:
              "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; border: none; }",
            skin: "oxide", // Optional: adapt to your theme
            setup: (editor) => {
              editor.on("focus", () => {
                // optional styling on focus
              })
            },
          }}
        />
      </div>

      {(files.length > 0 || existingMedias.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {existingMedias.map((media) => (
            <div key={`existing-${media.postMediaId}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {media.mediaType === "Image" ? (
                <img src={media.mediaUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-500">
                  <Video className="w-6 h-6 mb-1" />
                  Video
                </div>
              )}
              <button
                onClick={() => removeExistingMedia(media.postMediaId)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {files.map((file, index) => {
            const isImage = file.type.startsWith("image/")
            const url = URL.createObjectURL(file)
            return (
              <div key={`new-${index}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                {isImage ? (
                  <img src={url} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-500">
                    <Video className="w-6 h-6 mb-1" />
                    Video
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {!isEditMode && (
            <>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-green-600 font-medium text-sm transition-colors"
                disabled={isSubmitting}
              >
                <Image className="w-5 h-5" />
                Ảnh/Video
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              onClick={onCancel}
              className="px-4 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 font-medium text-sm transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={(!title.trim() && !content.trim() && files.length === 0) || isSubmitting}
            className="px-6 py-1.5 bg-[#990011] text-white rounded-lg font-medium text-sm hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang xử lý..." : isEditMode ? "Lưu thay đổi" : "Đăng"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostEditor
