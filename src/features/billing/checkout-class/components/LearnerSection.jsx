import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { TextInput } from '@/shared/components/ui/inputs'
import { IconButton, PillButton } from '@/shared/components/ui/buttons'
import Avatar from '@/shared/components/ui/Avatar'

const LearnerSection = ({ learners, onAddLearner, onRemoveLearner }) => {
  const [emailInput, setEmailInput] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (emailInput.trim()) {
      onAddLearner(emailInput.trim())
      setEmailInput('')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-faq-card border border-border p-6 space-y-4">
      <h2 className="text-xl font-bold text-[#111827]">Thêm người học</h2>

      <div className='flex items-center w-full gap-3'>
        <TextInput
          icon={Search}
          containerClassName='flex-1'
          placeholder="Nhập email người học"
          value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
        <PillButton
          variant="outline"
          roundedClass='rounded-xl'
          className='!min-w-24'
          onClick={handleAdd}
          disabled={!emailInput.trim()}
        >
          Thêm
        </PillButton>
      </div>

      <div>
        {learners.map((learner) => (
          <div key={learner.id || learner.email} className="flex items-center justify-between border-b p-4 border-border last:border-0">
            {/* Infor student: avt, name, email */}
            <div className="flex items-center gap-3">
              <Avatar name={learner.name} size="md" />
              <div>
                <p className="text-base font-semibold text-[#111827]">
                  {learner.name} {learner.isPayer && <span className="font-normal text-[#6B7280]">(Người thanh toán)</span>}
                </p>
                <p className="text-sm text-[#6B7280]">{learner.email}</p>
              </div>
            </div>

            {/* Button action */}
            {!learner.isPayer && (
              <IconButton
                size="xs"
                variant="ghost"
                onClick={() => onRemoveLearner(learner.id)}
              >
                <X />
              </IconButton>
            )}
          </div>
        ))}
      </div>


      <p className="font-semibold text-[#111827]">Tổng số người học: {learners.length}</p>
    </div>
  )
}

export default LearnerSection
