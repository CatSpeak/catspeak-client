import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput, Switch } from "@/shared/components/ui/inputs"
import { Link2 } from "lucide-react"

const AddLinkModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
  sessionName = "Buổi 1: Introduction & Greetings",
}) => {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title,
      url,
      isVisible,
      sessionName,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm liên kết"
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
          <PillButton type="submit">
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

        {/* Display Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Tên hiển thị <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Video bài giảng, Tài liệu đọc thêm..."
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* URL Link Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Đường dẫn liên kết (URL) <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            type="url"
            icon={Link2}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Visible to Students Card Box Toggle */}
        <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[#111827]">
              Hiển thị với học viên
            </p>
            <p className="text-xs text-[#6B7280] font-normal">
              Học viên có thể nhìn thấy liên kết này ngay lập tức
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
