import React from 'react'
import { Calendar, CalendarDays, Clock, User, Users } from 'lucide-react'

const ClassInfoSection = ({ classData }) => {
  return (
    <div className="bg-white rounded-xl shadow-faq-card border border-border p-6">
      <h2 className="text-xl font-bold mb-4 text-[#111827]">Thông tin lớp học</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Placeholder for Class Image */}
        <div className="w-full md:w-48 h-48 bg-[#d9d9d9] rounded-xl shrink-0"></div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-[#111827] mb-3">{classData.className}</h3>
            <p className="text-sm font-semibold text-black">
              Còn trống {classData.availableSlots}/{classData.maxSlots}
            </p>
          </div>

          <div className="space-y-2 text-sm text-[#6B7280]">
            {/* <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#6B7280]" />
              <span>Lớp: {classData.classCode}</span>
            </div> */}

            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#6B7280]" />
              <span>{classData.schedule}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-[#6B7280]" />
              <span>{classData.dateRange} • {classData.totalSessions} buổi</span>
            </div>

            <div className="flex items-center gap-2">
              <User size={16} className="text-[#6B7280]" />
              <span>Giảng viên: {classData.teacher}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {classData.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-xs rounded-full font-medium">
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
