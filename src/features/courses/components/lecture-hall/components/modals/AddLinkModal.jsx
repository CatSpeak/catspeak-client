import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { TextInput } from "@/shared/components/ui/inputs"
import ToggleOption from "../ui/ToggleOption"
import { Eye, X, Plus } from "lucide-react"
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
  const [errors, setErrors] = useState({})
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
      setErrors({})
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!title.trim()) newErrors.title = true
    if (!url.trim()) newErrors.url = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error(dict.toastFieldsRequired || "Vui lòng nhập đủ thông tin bắt buộc")
      return
    }

    setErrors({})

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
      title={
        <div className="w-full relative flex items-center justify-center">
          <h2 className="text-[22px] md:text-[28px] font-medium text-[#191C1D] dark:text-white">
            {mode === "edit" ? dict.editTitle : dict.title}
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            className="absolute right-0 -mr-2 p-2 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-full text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
      }
      showCloseButton={false}
      fullScreenOnMobile={false}
      className="md:max-w-2xl rounded-[24px] h-auto max-h-[95vh] md:max-h-[800px] bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F]"
      headerClassName="flex items-center justify-between px-6 md:px-10 py-6 md:py-8"
      bodyClassName="px-6 md:px-10 pb-6 flex-1 overflow-y-auto"
      footerClassName="p-0"
      footer={
        <div className="flex justify-between gap-4 px-6 md:px-10 pb-8 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[52px] rounded-full border border-[#990011] dark:border-[#FF6B6B] text-[#990011] dark:text-[#FF6B6B] font-medium text-base flex justify-center items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            {dict.cancel || "Hủy"} <X size={18} strokeWidth={2} />
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 h-[52px] rounded-full bg-[#990011] dark:bg-[#FF6B6B] text-white dark:text-gray-950 font-medium text-base flex justify-center items-center gap-2 hover:bg-[#80000e] dark:hover:bg-[#ff8080] transition-colors"
          >
            {mode === "edit" ? (dict.save || "Lưu") : (dict.add || "Thêm liên kết")} <Plus size={18} strokeWidth={2} />
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Display Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] dark:text-gray-300 mb-2">
            {dict.linkName || "Tên hiển thị"}
          </label>
          <TextInput
            required
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: false }))
            }}
            error={errors.title}
            placeholder={dict.linkPlaceholder || "VD: Bài giảng..."}
            className={`rounded-xl !h-[52px] px-4 text-sm bg-[#F3F4F5] dark:bg-[#222222] text-gray-900 dark:text-white border-0 dark:border dark:border-[#3F3F3F] focus:ring-1 focus:ring-gray-300 ${errors.title ? "ring-2 ring-red-400" : ""}`}
          />
        </div>

        {/* URL Link Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] dark:text-gray-300 mb-2">
            {dict.url || "Đường dẫn liên kết (URL)"}
          </label>
          <TextInput
            required
            type="url"
            value={url}
            onChange={async (e) => {
              const val = e.target.value
              setUrl(val)
              if (errors.url) setErrors((prev) => ({ ...prev, url: false }))
              
              if (!title.trim() && (val.includes("youtube.com") || val.includes("youtu.be"))) {
                try {
                  const res = await fetch(`https://noembed.com/embed?dataType=json&url=${val}`)
                  const data = await res.json()
                  if (data.title) {
                    setTitle(data.title)
                    if (errors.title) setErrors((prev) => ({ ...prev, title: false }))
                  }
                } catch (err) {
                  console.error("Failed to fetch youtube title", err)
                }
              }
            }}
            error={errors.url}
            placeholder={dict.urlPlaceholder || "Dán link video tại đây"}
            className={`rounded-xl !h-[52px] px-4 text-sm bg-[#F3F4F5] dark:bg-[#222222] text-gray-900 dark:text-white border-0 dark:border dark:border-[#3F3F3F] focus:ring-1 focus:ring-gray-300 ${errors.url ? "ring-2 ring-red-400" : ""}`}
          />
        </div>

        {/* Visible to Students Card Box Toggle */}
        <div className="pt-2">
          <ToggleOption
            icon={<Eye size={20} className="text-[#F83B4F]" />}
            iconBg="bg-[#FFEAED] dark:bg-red-950/40"
            title={t.courses.lectureHall.createPost.visibleToStudents}
            description={dict.visibleToStudentsDesc || "Tùy chỉnh độ hiển thị với học viên"}
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="border-none bg-[#F8F9FA] dark:bg-[#222222] rounded-[16px] p-4"
          />
        </div>
      </form>
    </Modal>
  )
}

export default AddLinkModal
