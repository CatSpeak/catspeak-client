import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput } from "@/shared/components/ui/inputs"
import ToggleOption from "../ui/ToggleOption"
import { Eye, X, Plus } from "lucide-react"
import { useCreateCurriculumSectionMutation, useUpdateCurriculumSectionMutation } from "@/store/api/coursesApi"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

const SectionModal = ({ sectionModal, setSectionModal, onSaveSection, onSectionCreated, onSectionUpdated, classId }) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.modals.section || {}
  const isVisible = sectionModal.isVisibleToStudents ?? true
  const [errors, setErrors] = useState({})

  const [createSection, { isLoading: isCreating }] = useCreateCurriculumSectionMutation()
  const [updateSection, { isLoading: isUpdating }] = useUpdateCurriculumSectionMutation()
  const isSaving = isCreating || isUpdating

  const handleToggleVisible = (e) => {
    setSectionModal((prev) => ({
      ...prev,
      isVisibleToStudents: e.target.checked,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!sectionModal.name?.trim()) {
      setErrors({ name: true })
      toast.error(dict.toastNameRequired)
      return
    }
    setErrors({})

    // ── Create mode: call API ──
    if (sectionModal.mode === "create" && classId) {
      try {
        await createSection({
          classId,
          name: sectionModal.name.trim(),
          description: sectionModal.description?.trim() ?? "",
          isVisibleToStudents: sectionModal.isVisibleToStudents ?? true,
        }).unwrap()

        toast.success(dict.toastCreateSuccess)
        onSectionCreated?.()
        setSectionModal({
          open: false,
          mode: "create",
          sectionId: null,
          name: "",
          description: "",
          isVisibleToStudents: true,
        })
      } catch {
        toast.error(dict.toastCreateError)
      }
      return
    }

    // ── Edit mode: call API ──
    if (sectionModal.mode === "edit" && classId && sectionModal.sectionId) {
      try {
        await updateSection({
          classId,
          sectionId: sectionModal.sectionId,
          name: sectionModal.name.trim(),
          description: sectionModal.description?.trim() ?? "",
          isVisibleToStudents: sectionModal.isVisibleToStudents ?? true,
        }).unwrap()

        toast.success(dict.toastUpdateSuccess)
        onSectionUpdated?.()
        setSectionModal({
          open: false,
          mode: "create",
          sectionId: null,
          name: "",
          description: "",
          isVisibleToStudents: true,
        })
      } catch {
        toast.error(dict.toastUpdateError)
      }
      return
    }

    // ── Fallback when no classId ──
    onSaveSection && onSaveSection(e)
  }

  return (
    <Modal
      open={sectionModal.open}
      onClose={() => setSectionModal((prev) => ({ ...prev, open: false }))}
      title={
        <div className="w-full relative flex items-center justify-center">
          <h2 className="text-[22px] md:text-[28px] font-medium text-[#191C1D]">
            {sectionModal.mode === "create" ? dict.createTitle : dict.editTitle}
          </h2>
          <button 
            type="button" 
            onClick={() => setSectionModal((prev) => ({ ...prev, open: false }))}
            className="absolute right-0 -mr-2 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
      }
      showCloseButton={false}
      fullScreenOnMobile={false}
      className="md:max-w-2xl rounded-[24px]"
      headerClassName="flex items-center justify-between px-6 md:px-8 py-6 md:py-8"
      bodyClassName="px-6 md:px-10 pb-6 flex-1 overflow-y-auto"
      footerClassName="p-0"
      footer={
        <div className="flex justify-between gap-4 px-6 md:px-10 pb-8 pt-2">
          <button
            type="button"
            onClick={() => setSectionModal((prev) => ({ ...prev, open: false }))}
            disabled={isSaving}
            className="flex-1 h-[52px] rounded-full border border-[#990011] text-[#990011] font-medium text-base flex justify-center items-center gap-2 hover:bg-red-50 transition-colors"
          >
            {dict.cancel} <X size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 h-[52px] rounded-full bg-[#990011] text-white font-medium text-base flex justify-center items-center gap-2 hover:bg-[#80000e] transition-colors disabled:opacity-70"
          >
            {sectionModal.mode === "create" ? dict.save : dict.saveChanges || "Lưu"} <Plus size={18} strokeWidth={2} />
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section name */}
        <div>
          <label className="block text-[15px] font-medium text-[#374151] mb-2">
            {dict.sectionName}
          </label>
          <TextInput
            required
            value={sectionModal.name || ""}
            onChange={(e) => {
              setSectionModal((prev) => ({ ...prev, name: e.target.value }))
              if (errors.name) setErrors((prev) => ({ ...prev, name: false }))
            }}
            error={errors.name}
            placeholder={dict.namePlaceholder}
            className={`rounded-[16px] bg-gray-50/30 border-gray-200 !h-[54px] px-4 text-[15px] ${errors.name ? "border-red-500 ring-2 ring-red-200" : ""}`}
          />
        </div>

        {/* Section description */}
        <div>
          <label className="block text-[15px] font-medium text-[#374151] mb-2">
            {dict.sectionDesc}
          </label>
          <TextInput
            multiline
            rows={3}
            value={sectionModal.description || ""}
            onChange={(e) =>
              setSectionModal((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder={dict.descPlaceholder}
            className="rounded-[16px] bg-gray-50/30 border-gray-200 min-h-[86px] px-4 text-[15px] py-3 overflow-y-auto"
          />
        </div>

        {/* Toggle */}
        <div className="pt-2">
          <ToggleOption
            icon={<Eye size={20} className="text-[#F83B4F]" />}
            iconBg="bg-[#FFEAED]"
            title={dict.visibleToStudents}
            description={dict.visibleToStudentsDesc || ""}
            checked={isVisible}
            onChange={handleToggleVisible}
            className="border border-gray-200/60 rounded-[16px] p-4 bg-gray-50/30"
          />
        </div>
      </form>
    </Modal>
  )
}

export default SectionModal
