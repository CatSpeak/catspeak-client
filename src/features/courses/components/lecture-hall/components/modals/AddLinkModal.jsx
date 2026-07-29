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
      toast.error(dict.toastFieldsRequired)
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
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.linkPlaceholder}
            className="rounded-xl !h-[50px] px-4 text-sm"
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
            onChange={(e) => setUrl(e.target.value)}
            placeholder={dict.urlPlaceholder}
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Visible to Students Card Box Toggle */}
        <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[#111827]">
              {t.courses.lectureHall.createPost.visibleToStudents}
            </p>
            <p className="text-xs text-[#6B7280] font-normal">
              {dict.visibleToStudentsDesc}
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
