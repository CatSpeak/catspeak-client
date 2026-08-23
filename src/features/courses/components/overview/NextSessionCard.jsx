import React from 'react'
import { Clock, Calendar, ArrowRight } from 'lucide-react'
import PillButton from '@/shared/components/ui/buttons/PillButton'
import Avatar from '@/shared/components/ui/Avatar'
import FluentCard from '@/shared/components/ui/FluentCard'

const NextSessionCard = ({
  title = "Khóa tiếng anh luyện nói",
  tags = ["China", "B2"],
  time = "11:45 AM",
  date = "Hôm nay, 15/07/2026",
  status = "Live",
  onAction,
}) => {
  return (
    <FluentCard className='space-y-3 text-[#1A1A1A]'>
      {/* Top section: Tags and Status */}
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-[#F4AB1B] text-[#1A1A1A] text-sm font-semibold rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
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
        {status === 'Live' ? (
          <PillButton
            variant="primary"
            endIcon={<ArrowRight size={18} />}
            onClick={onAction}
            className="!h-10"
          >
            Vào phòng
          </PillButton>
        ) : (
          <PillButton
            variant="outline"
            endIcon={<ArrowRight size={18} />}
            onClick={onAction}
            className="!h-10"
          >
            Xem lớp
          </PillButton>
        )}
      </div>
    </FluentCard>
  )
}

export default NextSessionCard