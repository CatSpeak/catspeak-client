import React from 'react'
import { Clock, Calendar, ArrowRight } from 'lucide-react'
import PillButton from '@/shared/components/ui/buttons/PillButton'
import FluentCard from '@/shared/components/ui/FluentCard'
import { useLanguage } from '@/shared/context/LanguageContext'
import CourseStatusPill from '../CourseStatusPill'
import CourseLanguagePill from '../CourseLanguagePill'

const NextSessionCard = ({
  title,
  time,
  date,
  status,
  classStatus,
  language,
  onAction,
}) => {
  const { t } = useLanguage()
  const lo = t.courses?.student?.myLearningOverview || {}

  return (
    <FluentCard className='space-y-3 text-[#1A1A1A]'>
      {/* Top section: Tags and Status */}
      <div className="flex justify-between items-start w-full">
        {language && (
          <CourseLanguagePill
            language={language}
          />
        )}
        {classStatus && (
          <CourseStatusPill status={classStatus} />
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[#1A1A1A] line-clamp-1">
        {title}
      </h3>

      {/* Date & Time info */}
      <div className="flex flex-col gap-2 text-base">
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={18} />
          <span>{date}</span>
        </div>
      </div>

      {/* Footer: Avatars and Button */}
      <div className="flex items-center justify-end">
        {status ? (
          <PillButton
            variant="primary"
            endIcon={<ArrowRight size={18} />}
            onClick={onAction}
            className="!h-10"
          >
            {lo.enterRoom || "Vào phòng"}
          </PillButton>
        ) : (
          <PillButton
            variant="outline"
            endIcon={<ArrowRight size={18} />}
            onClick={onAction}
            className="!h-10"
          >
            {lo.viewClass || "Xem lớp"}
          </PillButton>
        )}
      </div>
    </FluentCard>
  )
}

export default NextSessionCard