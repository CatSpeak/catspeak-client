import React, { useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput, Switch } from "@/shared/components/ui/inputs"
import { toast } from "react-hot-toast"

const CreateBulletinBoardModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
  sessionName = "Buổi 1: Introduction & Greetings",
}) => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [allowReply, setAllowReply] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề!")
      return
    }

    // Check if content is empty or just <p><br></p>
    const cleanContent = content.replace(/<[^>]*>?/gm, '').trim()
    if (!cleanContent) {
      toast.error("Vui lòng nhập nội dung!")
      return
    }

    onSubmit({
      title,
      content,
      allowReply,
      isVisible,
      sessionName,
    })
    onClose()

    // Clear form
    setTitle("")
    setContent("")
    setAllowReply(true)
    setIsVisible(true)
  }

  const handleEditorChange = (newContent) => {
    setContent(newContent)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo bảng tin"
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
            Hủy
          </PillButton>
          <PillButton onClick={handleSubmit}>
            Lưu
          </PillButton>
        </div>
      }

    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner session info */}
        <div className="bg-[#F9FAFB] text-[#4B5563] text-sm p-3 rounded-xl font-medium">
          Đang thêm vào: <span className="font-semibold text-[#111827]">{sessionName}</span>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Tiêu đề <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề..."
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Content Input + TinyMCE Rich Text Editor */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Nội dung
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
              placeholder: "Viết nội dung ở đây...",
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
              Cho phép học viên phản hồi
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
              Hiển thị với học viên
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
