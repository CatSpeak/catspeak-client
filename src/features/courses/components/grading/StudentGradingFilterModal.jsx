import React, { useState, useEffect } from "react"
import Modal from "@/shared/components/ui/Modal"
import Dropdown from "@/shared/components/ui/Dropdown"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const StudentGradingFilterModal = ({
  open,
  onClose,
  activeStatus,
  onStatusChange,
  activeType,
  onTypeChange,
}) => {
  const [localStatus, setLocalStatus] = useState(activeStatus)
  const [localType, setLocalType] = useState(activeType)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalStatus(activeStatus)
      setLocalType(activeType)
    }
  }, [open, activeStatus, activeType])

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Chưa làm" },
    { value: "submitted", label: "Đã nộp" },
    { value: "graded", label: "Đã chấm" },
    { value: "overdue", label: "Quá hạn" },
  ]

  const typeOptions = [
    { value: "all", label: "Tất cả" },
    { value: "assignment", label: "Bài nộp" },
    { value: "quiz", label: "Bài kiểm tra" },
  ]

  const handleReset = () => {
    setLocalStatus("all")
    setLocalType("all")
  }

  const handleApply = () => {
    onStatusChange(localStatus)
    onTypeChange(localType)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bộ lọc"
      footer={
        <div className="flex items-center gap-3 w-full">
          <PillButton variant="secondary" onClick={handleReset} className="flex-1">
            Đặt lại
          </PillButton>
          <PillButton variant="primary" onClick={handleApply} className="flex-1">
            Áp dụng
          </PillButton>
        </div>
      }
    >
      <div className="flex flex-col gap-2 mb-4">
        <label className="font-bold text-gray-900 text-sm">Trạng thái</label>
        <Dropdown
          options={statusOptions}
          value={localStatus}
          onChange={(val) => setLocalStatus(val)}
          className="w-full"
          dropdownClassName="w-full max-w-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-900 text-sm">Loại bài</label>
        <Dropdown
          options={typeOptions}
          value={localType}
          onChange={(val) => setLocalType(val)}
          className="w-full"
          dropdownClassName="w-full max-w-none"
        />
      </div>
    </Modal>
  )
}

export default StudentGradingFilterModal
