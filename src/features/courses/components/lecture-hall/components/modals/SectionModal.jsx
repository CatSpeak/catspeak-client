import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput, Switch } from "@/shared/components/ui/inputs"
import { useCreateCurriculumSectionMutation, useUpdateCurriculumSectionMutation } from "@/store/api/coursesApi"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

const SectionModal = ({ sectionModal, setSectionModal, onSaveSection, onSectionCreated, onSectionUpdated, classId }) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.modals.section || {}
  const isVisible = sectionModal.isVisibleToStudents ?? true

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
      toast.error("Vui lòng nhập tên section")
      return
    }

    // ── Create mode: call API ──
    if (sectionModal.mode === "create" && classId) {
      try {
        await createSection({
          classId,
          name: sectionModal.name.trim(),
          description: sectionModal.description?.trim() || null,
          isVisibleToStudents: sectionModal.isVisibleToStudents ?? true,
        }).unwrap()

        toast.success(dict.toastCreateSuccess || "Đã tạo section mới!")
        onSectionCreated?.()
        setSectionModal({
          open: false,
          mode: "create",
          sectionId: null,
          name: "",
          description: "",
          isVisibleToStudents: true,
        })
      } catch (err) {
        toast.error(err?.data?.message || err?.message || dict.toastCreateError || "Không thể tạo section. Vui lòng thử lại.")
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
          description: sectionModal.description?.trim() || null,
          isVisibleToStudents: sectionModal.isVisibleToStudents ?? true,
        }).unwrap()

        toast.success(dict.toastUpdateSuccess || "Đã cập nhật section!")
        onSectionUpdated?.()
        setSectionModal({
          open: false,
          mode: "create",
          sectionId: null,
          name: "",
          description: "",
          isVisibleToStudents: true,
        })
      } catch (err) {
        toast.error(err?.data?.message || err?.message || dict.toastUpdateError || "Không thể cập nhật section. Vui lòng thử lại.")
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
      title={sectionModal.mode === "create" ? (dict.createTitle || "Tạo section") : (dict.editTitle || "Chỉnh sửa section")}
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
            {dict.cancel || "Hủy"}
          </PillButton>
          <PillButton
            type="submit"
            disabled={isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? (dict.saving || "Đang lưu...") : (dict.save || "Lưu")}
          </PillButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section name */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            {dict.sectionName || "Tên section"} <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={sectionModal.name || ""}
            onChange={(e) =>
              setSectionModal((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Module 1 - Introduction"
            className="rounded-xl !h-[50px] px-4 text-sm"
          />
        </div>

        {/* Section description */}
        <div>
          <TextInput
            multiline
            rows={3}
            label={dict.sectionDesc || "Mô tả section"}
            labelClassName="text-sm font-semibold text-[#191C1D]"
            value={sectionModal.description || ""}
            onChange={(e) =>
              setSectionModal((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder={dict.descPlaceholder || "Nhập mô tả cho section này..."}
            className="rounded-xl max-h-[86px] px-4 text-sm py-3 overflow-y-auto"
          />
        </div>

        {/* Toggle */}
        <div className="bg-[#EDEEEF] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h5 className="text-sm font-semibold text-[#111827]">
              {t.courses.lectureHall.createPost.visibleToStudents || "Hiển thị với học viên"}
            </h5>
            <p className="text-xs text-[#6B7280] font-normal">
              {dict.visibleToStudentsDesc || "Bật để học viên có thể nhìn thấy section này."}
            </p>
          </div>
          <Switch
            checked={isVisible}
            onChange={handleToggleVisible}
            colorClass="peer-checked:bg-[#A00000]"
            className="min-h-6"
          />
        </div>
      </form>
    </Modal>
  )
}

export default SectionModal
