import React, { useState } from 'react'
import Modal from '@/shared/components/ui/Modal'
import { PillButton } from '@/shared/components/ui/buttons'
import { Checkbox } from '@/shared/components/ui/inputs'

const FILTER_OPTIONS = [
  { key: 'teaching-schedule', label: 'Lịch dạy', color: '#34ce56' },
  { key: 'student-schedule', label: 'Lịch học', color: '#0e6eec' },
  { key: 'my-event', label: 'Sự kiện của tôi', color: '#f83b4f' },
  { key: 'registered-event', label: 'Đã đăng ký', color: '#e2b60a' },
  { key: 'other', label: 'Khác', color: '#7b7979' },
]

const EventFilter = ({ open, onClose, onApply, activeFilters = [] }) => {
  const [selected, setSelected] = useState(activeFilters)

  const toggleFilter = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleReset = () => {
    setSelected([])
  }

  const handleApply = () => {
    onApply(selected)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bộ lọc sự kiện"
      className="md:max-w-sm"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={
        <div className="flex items-center gap-2">
          <PillButton variant="secondary" onClick={handleReset} className="flex-1">
            Đặt lại
          </PillButton>
          <PillButton variant="primary" onClick={handleApply} className="flex-1">
            Áp dụng
          </PillButton>
        </div>
      }
    >
      <div className="space-y-2">
        <p className="text-sm text-[#7B7979]">
          Lọc theo loại sự kiện
        </p>
        {FILTER_OPTIONS.map((option) => {
          const isActive = selected.includes(option.key)
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => toggleFilter(option.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${isActive
                ? 'border-[#990011] bg-[#FFF5F5]'
                : 'border-[#E2E2E2] bg-white hover:bg-[#F9F9F9]'
                }`}
            >
              {/* Color dot */}
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: option.color }}
              />
              {/* Label */}
              <p className="flex-1 text-left text-sm font-medium text-[#1A1A1A]">
                {option.label}
              </p>
              {/* Checkbox */}
              <Checkbox checked={isActive} />
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

export default EventFilter