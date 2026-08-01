import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput } from "@/shared/components/ui/inputs"
import ToggleOption from "../ui/ToggleOption"
import { Link2, Eye } from "lucide-react"
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
      toast.error(dict.toastFieldsRequired)
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
      title={mode === "edit" ? dict.editTitle : dict.title}
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
          <PillButton type="submit" onClick={handleSubmit}>
            {mode === "edit" ? dict.save : dict.add}
          </PillButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Display Title Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.linkName} <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: false }))
            }}
            error={errors.title}
            placeholder={dict.linkPlaceholder}
            className={`rounded-xl !h-[50px] px-4 text-sm ${errors.title ? "border-red-500 ring-2 ring-red-200" : ""}`}
          />
        </div>

        {/* URL Link Input */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.url} <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            type="url"
            icon={Link2}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (errors.url) setErrors((prev) => ({ ...prev, url: false }))
            }}
            error={errors.url}
            placeholder={dict.urlPlaceholder}
            className={`rounded-xl !h-[50px] px-4 text-sm ${errors.url ? "border-red-500 ring-2 ring-red-200" : ""}`}
          />
        </div>

        {/* Visible to Students Card Box Toggle */}
        <div className="space-y-3 pt-2">
          <ToggleOption
            icon={<Eye size={20} className="text-[#F83B4F]" />}
            iconBg="bg-[#FFEAED]"
            title={t.courses.lectureHall.createPost.visibleToStudents}
            description={dict.visibleToStudentsDesc || ""}
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  )
}

export default AddLinkModal
