import React, { useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput } from "@/shared/components/ui/inputs"
import ToggleOption from "../ui/ToggleOption"
import { MessageSquare, Eye, X, Plus } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

const CreateBulletinBoardModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
  initialData = null,
}) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.modals.createBoard || {}
  const createPostDict = t.courses.lectureHall.createPost || {}

  const [title, setTitle] = useState(initialData?.title || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [allowReply, setAllowReply] = useState(initialData?.allowReply ?? true)
  const [isVisible, setIsVisible] = useState(initialData?.isVisibleToStudents ?? true)
  const [errors, setErrors] = useState({})

  const [prevOpen, setPrevOpen] = useState(open)
  const [prevInitialData, setPrevInitialData] = useState(initialData)

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open)
    setPrevInitialData(initialData)
    if (open) {
      setTitle(initialData?.title || "")
      setContent(initialData?.content || "")
      setAllowReply(initialData?.allowReply ?? true)
      setIsVisible(initialData?.isVisibleToStudents ?? true)
      setErrors({})
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!title.trim()) newErrors.title = true
    const cleanContent = content.replace(/<[^>]*>?/gm, '').trim()
    if (!cleanContent) newErrors.content = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (newErrors.title) toast.error(dict.toastTitleRequired)
      else if (newErrors.content) toast.error(dict.toastContentRequired)
      return
    }

    setErrors({})

    onSubmit({
      title,
      content,
      allowReply,
      isVisible,
    })
    onClose()
  }

  const handleEditorChange = (newContent) => {
    setContent(newContent)
    if (errors.content) setErrors((prev) => ({ ...prev, content: false }))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? dict.editTitle : dict.title}
      className="md:max-w-2xl rounded-xl h-auto max-h-[95vh] md:max-h-[750px]"
      headerClassName="flex items-center justify-between px-6 py-4 border-b border-[#E2E2E2]"
      bodyClassName="p-6 flex-1 overflow-y-auto border-b border-[#E2E2E2]"
      footer={
        <div className="flex justify-between gap-4 px-1 pb-1 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[52px] rounded-full border border-[#990011] text-[#990011] font-medium text-base flex justify-center items-center gap-2 hover:bg-red-50 transition-colors"
          >
            {dict.cancel || "Hủy"} <X size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 h-[52px] rounded-full bg-[#990011] text-white font-medium text-base flex justify-center items-center gap-2 hover:bg-[#80000e] transition-colors disabled:opacity-70"
          >
            {initialData ? dict.save || "Lưu" : dict.create || "Tạo bảng tin"} <Plus size={18} strokeWidth={2} />
          </button>
        </div>
      }

    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.boardName} <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: false }))
            }}
            error={errors.title}
            placeholder={dict.boardPlaceholder}
            className={`rounded-xl !h-[50px] px-4 text-sm ${errors.title ? "border-red-500 ring-2 ring-red-200" : ""}`}
          />
        </div>

        {/* Content Input + TinyMCE Rich Text Editor */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            {dict.content}  <span className="text-[#EF4444]">*</span>
          </label>
          <div className={errors.content ? "border border-red-500 ring-2 ring-red-200 rounded-xl" : ""}>
            <Editor
              tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
              value={content}
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
        </div>


        {/* Toggles */}
        <div className="space-y-3 pt-2">
          {/* Visible to Students Toggle */}
          <ToggleOption
            icon={<Eye size={20} className="text-[#F83B4F]" />}
            iconBg="bg-[#FFEAED]"
            title={dict.visibleToStudents}
            description={createPostDict.visibleDesc || ""}
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
          />

          {/* Allow Reply Toggle */}
          <ToggleOption
            icon={<MessageSquare size={20} className="text-[#0E6EEC]" />}
            iconBg="bg-[#8ECAFF]"
            title={dict.allowReply}
            description={createPostDict.allowReplyDesc || ""}
            checked={allowReply}
            onChange={(e) => setAllowReply(e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  )
}

export default CreateBulletinBoardModal
