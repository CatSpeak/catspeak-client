import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TextInput, Switch } from "@/shared/components/ui/inputs"

const SectionModal = ({ sectionModal, setSectionModal, onSaveSection }) => {
  const isVisible = !sectionModal.isHidden

  const handleToggleVisible = (e) => {
    setSectionModal((prev) => ({
      ...prev,
      isHidden: !e.target.checked,
    }))
  }

  return (
    <Modal
      open={sectionModal.open}
      onClose={() => setSectionModal((prev) => ({ ...prev, open: false }))}
      title={sectionModal.mode === "create" ? "Tạo section" : "Chỉnh sửa section"}
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
          >
            Hủy
          </PillButton>
          <PillButton
            type="submit"
          >
            Lưu
          </PillButton>
        </div>
      }
    >
      <form onSubmit={onSaveSection} className="space-y-4">
        {/* Section name */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Tên section <span className="text-[#EF4444]">*</span>
          </label>
          <TextInput
            required
            value={sectionModal.title}
            onChange={(e) =>
              setSectionModal((prev) => ({ ...prev, title: e.target.value }))
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
            label={"Mô tả section"}
            labelClassName="text-sm font-semibold text-[#191C1D]"
            value={sectionModal.subtitle}
            onChange={(e) =>
              setSectionModal((prev) => ({ ...prev, subtitle: e.target.value }))
            }
            placeholder="Nhập mô tả cho section này..."
            className="rounded-xl max-h-[86px] px-4 text-sm py-3 overflow-y-auto"
          />
        </div>

        {/* Toggle */}
        <div className="bg-[#EDEEEF] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h5 className="text-sm font-semibold text-[#111827]">
              Hiển thị với học viên
            </h5>
            <p className="text-xs text-[#6B7280] font-normal">
              Bật để học viên có thể nhìn thấy section này.
            </p>
          </div>
          <Switch
            checked={isVisible}
            onChange={handleToggleVisible}
            colorClass="peer-checked:bg-[#A00000]"
            className="min-h-6"
          />
        </div>

        {/* Modal Footer */}

      </form>
    </Modal>
  )
}

export default SectionModal
