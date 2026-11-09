import React from 'react'
import { CalendarDays, Clock, User } from 'lucide-react'
import { defaultCourseThumbnail } from '@/features/courses/utils/courseUtils'

const ClassInfoSection = ({ classData, t }) => {
  const tc = t.billing.checkoutClass
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-faq-card border border-border dark:border-[#3F3F3F] p-6">
      <h2 className="text-xl font-bold mb-4 text-[#111827] dark:text-white">{tc.classInfo}</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Placeholder for Class Image */}
        <div className="w-full md:w-48 h-48 bg-[#d9d9d9] dark:bg-[#272727] rounded-xl shrink-0">
          <img
            src={classData.thumbnailUrl || defaultCourseThumbnail}
            alt={classData.className}
            width={192}
            height={192}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-3">{classData.className}</h3>
            <p className="text-sm font-semibold text-black dark:text-neutral-200">
              {tc.slotsAvailable.replace('{{available}}', classData.availableSlots).replace('{{max}}', classData.maxSlots)}
            </p>
          </div>

          <div className="space-y-2 text-sm text-[#6B7280] dark:text-neutral-400">
            {/* <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#6B7280] dark:text-neutral-400" />
              <span>Lớp: {classData.classCode}</span>
            </div> */}

            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#6B7280] dark:text-neutral-400" />
              <span>{classData.schedule}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-[#6B7280] dark:text-neutral-400" />
              <span>{classData.dateRange} • {classData.totalSessions} {tc.sessions}</span>
            </div>

            <div className="flex items-center gap-2">
              <User size={16} className="text-[#6B7280] dark:text-neutral-400" />
              <span>{tc.instructor} {classData.teacher}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {classData.tags?.map(tag => (
              <span key={tag} className="px-3 py-1 bg-[#F3F4F6] dark:bg-[#272727] text-[#6B7280] dark:text-neutral-300 text-xs rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassInfoSection
