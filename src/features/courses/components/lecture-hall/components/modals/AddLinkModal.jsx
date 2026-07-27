import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput, Switch } from "@/shared/components/ui/inputs"
import { Link2 } from "lucide-react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

const AddLinkModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
  mode = "create",
  initialData = null,
}) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.modals.addLink || {}

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [isVisible, setIsVisible] = useState(true)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (mode === "edit" && initialData) {
        setTitle(initialData.title || "")
        setUrl(initialData.url || "")
        setIsVisible(initialData.isVisibleToStudents ?? true)
      } else {
        setTitle("")
        setUrl("")
        setIsVisible(true)
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title || !url) {
      toast.error("Vui lòng nhập tên hiển thị và đường dẫn liên kết")
      return
    }

    onSubmit({
      title,
      url,
      isVisible,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? (dict.editTitle || "Cập nhật liên kết") : (dict.title || "Thêm liên kết Youtube")}
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
            {dict.cancel || "Hủy"}
          </PillButton>
          <PillButton type="submit" onClick={handleSubmit}>
            {mode === "edit" ? (dict.save || "Lưu") : (dict.add || "Thêm")}
          </PillButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Display Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.linkName || "Tên liên kết"} <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.linkPlaceholder || "Ví dụ: Video bài giảng, Tài liệu đọc thêm..."}
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* URL Link Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.url || "URL"} <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            type="url"
            icon={Link2}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={dict.urlPlaceholder || "Dán link video tại đây"}
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Visible to Students Card Box Toggle */}
        <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[#111827]">
              {t.courses.lectureHall.createPost.visibleToStudents || "Hiển thị với học viên"}
            </p>
            <p className="text-xs text-[#6B7280] font-normal">
              {t.courses.lectureHall.createPost.visibleToStudents || "Hiển thị với học viên"}
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

export default AddLinkModal
