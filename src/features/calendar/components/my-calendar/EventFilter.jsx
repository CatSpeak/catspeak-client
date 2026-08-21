import React, { useState, useEffect } from 'react'
import Modal from '@/shared/components/ui/Modal'
import { PillButton } from '@/shared/components/ui/buttons'
import { Checkbox } from '@/shared/components/ui/inputs'
import Dropdown from '@/shared/components/ui/Dropdown'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useRoleOverride } from '@/features/courses/components/RoleSwitcher'

const defaultFilters = {
  eventTypes: ['teaching-schedule', 'student-schedule', 'my-event', 'registered-event', 'other'],
  classIds: [],
}

const EventFilter = ({ open, onClose, onApply, activeFilters, classesOptions = [] }) => {
  const { t } = useLanguage()
  const { isTeacher } = useRoleOverride()

  // Initialize state with props or fallback to default
  const [selected, setSelected] = useState(activeFilters || defaultFilters)

  useEffect(() => {
    if (open && activeFilters) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(activeFilters)
    }
  }, [open, activeFilters])

  const handleReset = () => {
    setSelected(defaultFilters)
    onApply(defaultFilters)
  }

  const handleApply = () => {
    onApply(selected)
  }

  const EVENT_TYPE_OPTIONS = [
    ...(isTeacher ? [{ key: 'teaching-schedule', label: t.calendar?.teachingSchedule || 'Lịch dạy', color: '#34ce56' }] : []),
    { key: 'student-schedule', label: t.calendar?.studentSchedule || 'Lịch học', color: '#0e6eec' },
    ...(isTeacher ? [{ key: 'my-event', label: t.calendar?.myEvents || 'Sự kiện của tôi', color: '#f83b4f' }] : []),
    { key: 'registered-event', label: t.calendar?.registered || 'Đã đăng ký', color: '#e2b60a' },
    { key: 'other', label: t.calendar?.other || 'Khác', color: '#888888' },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.calendar?.eventFilter || "Bộ lọc sự kiện"}
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={
        <div className="flex items-center gap-3 pt-2">
          <PillButton variant="secondary" onClick={handleReset} className="flex-1 min-h-[48px]">
            {t.calendar?.filterReset || "Xóa lọc"}
          </PillButton>
          <PillButton variant="primary" onClick={handleApply} className="flex-1 min-h-[48px]">
            {t.calendar?.filterApply || "Áp dụng"}
          </PillButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#1A1A1A]">{t.calendar?.eventType || "Loại lịch"}</p>
          <div className="grid grid-cols-2 gap-3">
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2.5 text-sm text-[#4E4E4E] cursor-pointer"
              >
                <Checkbox
                  checked={selected.eventTypes.includes(opt.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected({ ...selected, eventTypes: [...selected.eventTypes, opt.key] })
                    } else {
                      setSelected({ ...selected, eventTypes: selected.eventTypes.filter(k => k !== opt.key) })
                    }
                  }}
                />
                {opt.color && (
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                )}
                <span className="truncate">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {isTeacher && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#1A1A1A]">{t.calendar?.classOrCourse || "Lớp học"}</h4>
            <Dropdown
              options={classesOptions.map(opt => ({ label: opt.title, value: opt.id }))}
              value={selected.classIds}
              onChange={(val) => setSelected({ ...selected, classIds: val })}
              mode="multiple"
              enableSearch={true}
              closeOnSelect={false}
              placeholder={t.calendar?.selectClass || "Chọn lớp học"}
              dropdownClassName="w-full"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}

export default EventFilter