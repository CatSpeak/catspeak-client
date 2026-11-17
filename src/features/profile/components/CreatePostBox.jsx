import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Image, Video, FileText } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Avatar from "@/shared/components/ui/Avatar"
import PostEditorModal from "./PostEditorModal"
import { useCreatePostMutation } from "@/store/api/social/profilePostsApi"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import { getLocalizedCommunityName } from "@/features/news/utils/newsUtils"
import { validatePostFiles } from "@/features/profile/utils/postFileValidation"

const CreatePostBox = ({
  defaultCommunity = null,
  onPostCreated = null,
  className = "",
}) => {
  const { user, isAuthenticated } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const { data: profileResponse } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const currentUser = profileResponse?.data ?? profileResponse ?? user

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [initialFiles, setInitialFiles] = useState([])

  const triggerImageRef = useRef(null)
  const triggerVideoRef = useRef(null)
  const triggerFileRef = useRef(null)

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation()

  const handleOpenEditorEmpty = () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    setInitialFiles([])
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setInitialFiles([])
  }

  const handleTriggerFileChange = (e) => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files)
      e.target.value = ""
      const validation = validatePostFiles(selected, 0, t)
      if (!validation.isValid) {
        toast.error(validation.error)
        return
      }
      setInitialFiles(selected)
      setIsEditorOpen(true)
    }
  }

  const handleCreatePost = async (formData) => {
    try {
      const res = await createPost(formData).unwrap()
      setIsEditorOpen(false)
      const privacy = formData.get("Privacy")
      const targetCommunity = formData.get("LanguageCommunity")
      const communityLabel =
        privacy === "Public" && targetCommunity && targetCommunity !== "All"
          ? getLocalizedCommunityName(targetCommunity, t)
          : ""

      let successMsg =
        t.profile?.post?.editor?.createSuccess || "Đăng bài viết thành công!"
      if (communityLabel) {
        if (language === "en") {
          successMsg = `Post shared successfully to ${communityLabel} Community!`
        } else if (language === "ja") {
          successMsg = `${communityLabel}コミュニティに投稿しました！`
        } else if (language === "zh") {
          successMsg = `成功发布到${communityLabel}社区！`
        } else {
          successMsg = `Đăng bài thành công tới Cộng đồng ${communityLabel}!`
        }
      }

      toast.success(successMsg)
      if (onPostCreated) {
        onPostCreated(res)
      }
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Đã xảy ra lỗi khi gửi bài viết tới cộng đồng. Vui lòng thử lại sau."
      toast.error(errorMsg)
      throw err
    }
  }

  return (
    <>
      <FluentCard padding="p-0" className={`flex flex-col overflow-hidden ${className}`}>
        <div className="flex items-center gap-4 p-4">
          <Avatar
            size={40}
            src={currentUser?.avatarImageUrl || currentUser?.avatarUrl}
            name={currentUser?.nickname || currentUser?.username || "U"}
          />

          <button
            onClick={handleOpenEditorEmpty}
            className="flex-1 h-10 pl-5 text-left text-gray-500 dark:text-neutral-400 bg-transparent border border-border dark:border-[#3F3F3F] hover:border-cath-red-700 dark:hover:border-red-400 rounded-full outline-none cursor-pointer text-sm transition-colors"
          >
            {t.profile?.home?.whatOnYourMind || "Bạn đang nghĩ gì?"}
          </button>
        </div>

        <div className="h-px bg-[#e5e5e5] dark:bg-[#3F3F3F]" />

        <div className="flex items-center w-full">
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
            className="hidden"
            ref={triggerImageRef}
            onChange={handleTriggerFileChange}
          />
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) return navigate("/login")
              triggerImageRef.current?.click()
            }}
            className="flex-1 flex items-center justify-center gap-2 h-12 px-4 text-sm text-[#16a34a] hover:bg-primaryBg dark:hover:bg-[#272727] active:bg-green-100 dark:active:bg-[#333333] transition-colors duration-200 outline-none cursor-pointer"
          >
            <Image size={20} className="text-[#16a34a]" />
            <span>{t.profile?.home?.photo || "Ảnh"}</span>
          </button>

          <input
            type="file"
            multiple
            accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
            className="hidden"
            ref={triggerVideoRef}
            onChange={handleTriggerFileChange}
          />
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) return navigate("/login")
              triggerVideoRef.current?.click()
            }}
            className="flex-1 flex items-center justify-center gap-2 h-12 px-4 text-sm font-medium text-[#e11d48] hover:bg-primaryBg dark:hover:bg-[#272727] active:bg-rose-100 dark:active:bg-[#333333] transition-colors duration-200 outline-none cursor-pointer"
          >
            <Video size={20} className="text-[#e11d48]" />
            <span>
              {t.profile?.home?.video ||
                t.profile?.post?.editor?.video ||
                "Video"}
            </span>
          </button>

          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            className="hidden"
            ref={triggerFileRef}
            onChange={handleTriggerFileChange}
          />
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) return navigate("/login")
              triggerFileRef.current?.click()
            }}
            className="flex-1 flex items-center justify-center gap-2 h-12 px-4 text-sm font-medium text-[#2563eb] hover:bg-primaryBg dark:hover:bg-[#272727] active:bg-blue-100 dark:active:bg-[#333333] transition-colors duration-200 outline-none cursor-pointer"
          >
            <FileText size={20} className="text-[#2563eb]" />
            <span>
              {t.profile?.home?.document ||
                t.profile?.post?.editor?.document ||
                "Tài liệu"}
            </span>
          </button>
        </div>
      </FluentCard>

      <PostEditorModal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        initialFiles={initialFiles}
        initialLanguageCommunity={defaultCommunity || "All"}
        onSubmit={handleCreatePost}
        isSubmitting={isCreating}
      />
    </>
  )
}

export default CreatePostBox
