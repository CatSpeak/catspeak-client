import React, { useState, useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import Dropdown from "@/shared/components/ui/Dropdown"

const WorkspaceRoomSortModal = ({
  open,
  onClose,
  selectedSortField = "createdAt",
  selectedSortOrder = "desc",
  onApply,
}) => {
  const { t } = useLanguage()

  const [localField, setLocalField] = useState(selectedSortField)
  const [localOrder, setLocalOrder] = useState(selectedSortOrder)

  useEffect(() => {
    if (open) {
      setLocalField(selectedSortField || "createdAt")
      setLocalOrder(selectedSortOrder || "desc")
    }
  }, [open, selectedSortField, selectedSortOrder])

  const handleReset = () => {
    setLocalField("createdAt")
    setLocalOrder("desc")
  }

  const handleApply = () => {
    onApply?.(localField, localOrder)
    onClose()
  }

  const fieldOptions = [
    {
      value: "name",
      label: t.rooms?.sortOptions?.name || "Tên phòng",
    },
    {
      value: "createdAt",
      label: t.rooms?.sortOptions?.createdAt || "Ngày tạo",
    },
    {
      value: "currentParticipantCount",
      label: t.rooms?.sortOptions?.participants || "Số người tham gia",
    },
    {
      value: "duration",
      label: t.rooms?.sortOptions?.duration || "Thời lượng",
    },
  ]

  const sortButtonClass = (isSelected) =>
    `flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold border transition-all ${
      isSelected
        ? "border-cath-red-700 dark:border-red-500 bg-[#FFF0F2] dark:bg-red-950/30 text-cath-red-700 dark:text-red-400 ring-1 ring-cath-red-700 dark:ring-red-500"
        : "bg-white dark:bg-[#272727] border-border dark:border-[#3F3F3F] text-gray-600 dark:text-neutral-300 hover:border-cath-red-700 dark:hover:border-red-400 hover:text-cath-red-700 dark:hover:text-red-400"
    }`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.sortTitle || "Sắp xếp danh sách"}
      showCloseButton
      fullScreenOnMobile
      className="sm:!max-w-[480px] sm:!max-h-[85vh]"
      footer={
        <div className="flex gap-2">
          <PillButton
            type="button"
            onClick={handleReset}
            variant="secondary"
            className="flex-1"
          >
            {t.rooms?.sortReset || "Đặt lại"}
          </PillButton>

          <PillButton
            type="button"
            onClick={handleApply}
            variant="primary"
            className="flex-1"
          >
            {t.rooms?.filters?.apply || "Áp dụng"}
          </PillButton>
        </div>
      }
    >
      {/* Sort Field */}
      <div className="h-[56px] flex items-center justify-between gap-2">
        <p className="text-base">
          {t.rooms?.sortFieldLabel || "Thuộc tính sắp xếp"}
        </p>

        <Dropdown
          options={fieldOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          value={localField}
          onChange={setLocalField}
          placeholder="Select..."
          fitContent
        />
      </div>

      {/* Sort Order */}
      <div className="h-[56px] flex items-center justify-between gap-2">
        <p className="text-base">
          {t.rooms?.sortOrderLabel || "Thứ tự sắp xếp"}
        </p>

        <Dropdown
          options={[
            {
              value: "asc",
              label: t.rooms?.sortAsc || "Tăng dần",
            },
            {
              value: "desc",
              label: t.rooms?.sortDesc || "Giảm dần",
            },
          ]}
          value={localOrder}
          onChange={setLocalOrder}
          placeholder="Select..."
          fitContent
        />
      </div>
    </Modal>
  )
}

export default WorkspaceRoomSortModal
