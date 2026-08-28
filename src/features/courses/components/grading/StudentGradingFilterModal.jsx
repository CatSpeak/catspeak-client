import React, { useState, useEffect } from "react"
import Modal from "@/shared/components/ui/Modal"
import Dropdown from "@/shared/components/ui/Dropdown"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"

const StudentGradingFilterModal = ({
  open,
  onClose,
  activeStatus,
  onStatusChange,
  activeType,
  onTypeChange,
}) => {
  const { t } = useLanguage()
  const filterT = t.courses.grading.filterModal

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
    { value: "all", label: filterT.statusAll },
    { value: "pending", label: filterT.statusPending },
    { value: "submitted", label: filterT.statusSubmitted },
    { value: "graded", label: filterT.statusGraded },
    { value: "overdue", label: filterT.statusOverdue },
  ]

  const typeOptions = [
    { value: "all", label: filterT.typeAll },
    { value: "assignment", label: filterT.typeAssignment },
    { value: "quiz", label: filterT.typeQuiz },
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
      title={filterT.title}
      footer={
        <div className="flex items-center gap-3 w-full">
          <PillButton variant="secondary" onClick={handleReset} className="flex-1">
            {filterT.resetBtn}
          </PillButton>
          <PillButton variant="primary" onClick={handleApply} className="flex-1">
            {filterT.applyBtn}
          </PillButton>
        </div>
      }
    >
      <div className="flex flex-col gap-2 mb-4">
        <label className="font-bold text-gray-900 text-sm">{filterT.status}</label>
        <Dropdown
          options={statusOptions}
          value={localStatus}
          onChange={(val) => setLocalStatus(val)}
          className="w-full"
          dropdownClassName="w-full max-w-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-900 text-sm">{filterT.type}</label>
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
