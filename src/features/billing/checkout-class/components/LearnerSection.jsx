import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { TextInput } from '@/shared/components/ui/inputs'
import { toast } from 'react-hot-toast'
import { IconButton, PillButton } from '@/shared/components/ui/buttons'
import Avatar from '@/shared/components/ui/Avatar'

const LearnerSection = ({ learners, onAddLearner, onRemoveLearner, t }) => {
  const tc = t.billing.checkoutClass
  const [emailInput, setEmailInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (emailInput.trim()) {
      setIsLoading(true)
      const res = await onAddLearner(emailInput.trim())
      setIsLoading(false)
      if (res?.success) {
        setEmailInput('')
      } else {
        toast.error(res?.message || tc.addLearnerError)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-faq-card border border-border p-6 space-y-4">
      <h2 className="text-xl font-bold text-[#111827]">{tc.addLearner}</h2>

      <div className='flex items-start w-full gap-3'>
        <TextInput
          icon={Search}
          containerClassName='flex-1'
          placeholder={tc.emailPlaceholder}
          value={emailInput}
          onChange={(e) => {
            setEmailInput(e.target.value)
          }}
        />
        <PillButton
          variant="outline"
          roundedClass='rounded-xl'
          className='!min-w-24'
          onClick={handleAdd}
          loading={isLoading}
          loadingText={tc.adding}
          disabled={!emailInput.trim() || isLoading}
        >
          {tc.add}
        </PillButton>
      </div>

      <div>
        {learners.map((learner) => (
          <div key={learner.id || learner.email} className="flex items-center justify-between border-b p-4 border-border last:border-0">
            {/* Infor student: avt, name, email */}
            <div className="flex items-center gap-3">
              <Avatar name={learner.name} size="md" src={learner?.avatarImageUrl} />
              <div>
                <p className="text-base font-semibold text-[#111827]">
                  {learner.name} {learner.isPayer && <span className="font-normal text-[#6B7280]">{tc.payer}</span>}
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

      <p className="font-semibold text-[#111827]">{tc.totalLearners} {learners.length}</p>
    </div>
  )
}

export default LearnerSection
