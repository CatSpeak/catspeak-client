import React, { useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput, Switch } from "@/shared/components/ui/inputs"
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

  const [title, setTitle] = useState(initialData?.title || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [allowReply, setAllowReply] = useState(initialData?.allowReply ?? true)
  const [isVisible, setIsVisible] = useState(initialData?.isVisibleToStudents ?? true)

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
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error(dict.toastTitleRequired)
      return
    }

    // Check if content is empty or just <p><br></p>
    const cleanContent = content.replace(/<[^>]*>?/gm, '').trim()
    if (!cleanContent) {
      toast.error(dict.toastContentRequired)
      return
    }

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
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? dict.editTitle : dict.title}
      className="md:max-w-2xl rounded-xl"
      headerClassName="flex items-center justify-between px-6 py-4 border-b border-[#E2E2E2]"
      bodyClassName="p-6 flex-1 overflow-y-auto border-b border-[#E2E2E2]"
      footer={
        <div className="flex justify-end gap-3 px-1">
          <PillButton
            type="button"
            variant="outline"
            onClick={onClose}
            bgColor={"white"}
            textColor={"#72000d"}
            borderColor={"#E2E2E2"}
          >
            {dict.cancel}
          </PillButton>
          <PillButton onClick={handleSubmit}>
            {initialData ? dict.save : dict.create}
          </PillButton>
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
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.boardPlaceholder}
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Content Input + TinyMCE Rich Text Editor */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            {dict.content}
          </label>
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


        {/* Toggles */}
        <div className="space-y-3 pt-2">
          {/* Allow Reply Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#191C1D]">
              {dict.allowReply}
            </span>
            <Switch
              checked={allowReply}
              onChange={(e) => setAllowReply(e.target.checked)}
              colorClass="peer-checked:bg-[#A00000]"
              className="min-h-6"
            />
          </div>

          {/* Visible to Students Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#191C1D]">
              {dict.visibleToStudents}
            </span>
            <Switch
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              colorClass="peer-checked:bg-[#A00000]"
              className="min-h-6"
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default CreateBulletinBoardModal
