import React from 'react'
import { Calendar, Clock, Users, Share2 } from 'lucide-react'
import PillButton from '@/shared/components/ui/buttons/PillButton'
import IconButton from '@/shared/components/ui/buttons/IconButton'
import Avatar from '@/shared/components/ui/Avatar'
import FluentCard from '@/shared/components/ui/FluentCard'
import ProgressBar from '@/shared/components/ui/ProgressBar'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useNavigate } from 'react-router-dom'

const ClassCard = ({
  coverImage,
  dateRange,
  title,
  subtitle,
  instructorName,
  instructorAvatar,
  scheduleDays,
  scheduleTime,
  progress,
  // onCancel,
  onEnter,
  onShare,
  instructorId
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const lo = t.courses?.student?.myLearningOverview || {}

  return (
    <FluentCard padding="p-0" className="overflow-hidden flex flex-col text-[#1A1A1A]">
      {/* Thumbnail */}
      <div className="relative h-56 bg-gray-200 w-full shrink-0">
        {coverImage && (
          <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        )}

        {/* Top right share button */}
        <IconButton variant="overlay"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShare?.(e);
          }}
          className='absolute top-2 right-2'>
          <Share2 size={16} />
        </IconButton>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-1 space-y-4">
        <div className="text-base font-medium text-[#7B7979]">{(lo.from || "Từ")} {dateRange}</div>

        <div className="flex flex-col gap-0.5">
          <h3 className="text-lg font-bold text-[#1A1A1A] line-clamp-1">{title}</h3>
          <p className="text-base text-[#7B7979] line-clamp-1">{subtitle}</p>
        </div>

        {/* Info List */}
        <div className="flex flex-col gap-2">
          <div
            className="flex items-center gap-2 text-sm text-[#7B7979] cursor-pointer"
            onClick={() => navigate(`/profile/${instructorId}`)}
          >
            <Avatar src={instructorAvatar} size={30} />
            <span>{(lo.instructorPrefix || "Giảng viên")} {instructorName}</span>
          </div>
          <div className="flex items-center gap-2 text-base text-[#1A1A1A]">
            <Calendar size={18} className="text-[#1A1A1A] shrink-0" />
            <span>{scheduleDays}</span>
          </div>
          <div className="flex items-center gap-2 text-base text-[#7B7979]">
            <Clock size={18} className="shrink-0 text-[#7B7979]" />
            <span>{scheduleTime}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base text-[#1A1A1A]">{lo.progressLabel || "Tiến độ"}</span>
            <span className="text-base font-semibold text-[#1A1A1A]">{progress}%</span>
          </div>
          <ProgressBar progress={progress} heightClass="h-2" colorClass="bg-[#990011]" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          {/* <PillButton
            variant="outline"
            onClick={onCancel}
            className="!h-10"
          >
            {lo.cancelEnrollment || "Hủy đăng ký"}
          </PillButton> */}
          <PillButton
            variant="primary"
            onClick={onEnter}
            className="!h-10"
          >
            {lo.enterClass || "Vào lớp"}
          </PillButton>
        </div>
      </div>
    </FluentCard>
  )
}

export default ClassCard