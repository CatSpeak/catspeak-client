import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput } from "@/shared/components/ui/inputs"
import ToggleOption from "../ui/ToggleOption"
import { Eye } from "lucide-react"
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
      title={sectionModal.mode === "create" ? dict.createTitle : dict.editTitle}
      className="md:max-w-md rounded-xl"
      headerClassName="flex items-center justify-between px-6 py-4 border-b border-[#E2E2E2]"
      bodyClassName="p-6 flex-1 overflow-y-auto border-b border-[#E2E2E2]"
      footer={
        <div className="flex justify-end gap-3 px-1">
          <PillButton
            type="button"
            variant="secondary-no-outline"
            onClick={() => setSectionModal((prev) => ({ ...prev, open: false }))}
            bgColor={"white"}
            textColor={"#72000d"}
            borderColor={"#E2E2E2"}
            disabled={isSaving}
          >
            {dict.cancel}
          </PillButton>
          <PillButton
            type="submit"
            disabled={isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? dict.saving : dict.save}
          </PillButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section name */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.sectionName} <span className="text-[#EF4444]">*</span>
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
            className={`rounded-xl !h-[50px] px-4 text-sm ${errors.name ? "border-red-500 ring-2 ring-red-200" : ""}`}
          />
        </div>

        {/* Section description */}
        <div>
          <TextInput
            multiline
            rows={3}
            label={dict.sectionDesc}
            labelClassName="text-sm font-semibold text-[#191C1D]"
            value={sectionModal.description || ""}
            onChange={(e) =>
              setSectionModal((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder={dict.descPlaceholder}
            className="rounded-xl max-h-[86px] px-4 text-sm py-3 overflow-y-auto"
          />
        </div>

        {/* Toggle */}
        <div className="space-y-3 pt-2">
          <ToggleOption
            icon={<Eye size={20} className="text-[#F83B4F]" />}
            iconBg="bg-[#FFEAED]"
            title={dict.visibleToStudents}
            description={dict.visibleToStudentsDesc || ""}
            checked={isVisible}
            onChange={handleToggleVisible}
          />
        </div>
      </form>
    </Modal>
  )
}

export default SectionModal
