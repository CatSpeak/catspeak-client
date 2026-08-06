import React, { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import DailyEventPanel from '../components/my-calendar/DailyEventPanel'
import Calendar from '../components/my-calendar/Calendar'
import { PillButton } from '@/shared/components/ui/buttons'
import { Breadcrumb } from '@/shared/components/ui/navigation'
import { CalendarClock, Plus } from 'lucide-react'

const MOCK_EVENTS = [
  { id: '1', title: 'Lớp tiếng anh C1', subtitle: 'Lịch học', startTime: '2026-08-06T09:00:00+07:00', endTime: '2026-08-06T10:30:00+07:00', location: 'Trực tuyến', eventType: 'class-schedule' },
  { id: '2', title: 'Lớp phát âm', subtitle: 'Lịch dạy', startTime: '2026-08-06T14:00:00+07:00', endTime: '2026-08-06T15:30:00+07:00', location: 'Cơ sở 1', eventType: 'teaching-schedule' },
  { id: '3', title: 'Họp team', subtitle: '', startTime: '2026-08-06T15:00:00+07:00', endTime: '2026-08-06T17:00:00+07:00', location: 'Online', eventType: 'my-event' },
  { id: '4', title: 'Sự kiện ngoại khóa', subtitle: '', startTime: '2026-08-07T08:00:00+07:00', endTime: '2026-08-07T11:00:00+07:00', location: 'Sân vận động', eventType: 'registered-event' },
  { id: '5', title: 'Workshop kỹ năng', subtitle: '', startTime: '2026-08-08T14:00:00+07:00', endTime: '2026-08-08T16:00:00+07:00', location: 'Hội trường B', eventType: 'other' },
  { id: '6', title: 'Học nhóm', subtitle: '', startTime: '2026-08-05T19:00:00+07:00', endTime: '2026-08-05T21:00:00+07:00', location: 'Thư viện', eventType: 'class-schedule' },
  { id: '7', title: 'Dạy kèm', subtitle: '', startTime: '2026-08-04T17:30:00+07:00', endTime: '2026-08-04T19:00:00+07:00', location: 'Cơ sở 2 có rất nhiều cây xanh', eventType: 'teaching-schedule' },
  { id: '8', title: 'Họp CLB', subtitle: '', startTime: '2026-08-07T18:00:00+07:00', endTime: '2026-08-07T19:30:00+07:00', location: 'Phòng 204', eventType: 'my-event' },
  { id: '9', title: 'Tự học', subtitle: '', startTime: '2026-08-09T08:00:00+07:00', endTime: '2026-08-09T10:00:00+07:00', location: 'Ở nhà', eventType: 'other' },
  { id: '10', title: 'Tổng kết tuần', subtitle: '', startTime: '2026-08-09T20:00:00+07:00', endTime: '2026-08-09T21:00:00+07:00', location: 'Online', eventType: 'other' },
  { id: '11', title: 'Sự kiện 1', subtitle: '', startTime: '2026-08-10T08:00:00+07:00', endTime: '2026-08-10T19:45:00+07:00', location: 'Nơi A', eventType: 'class-schedule' },
  { id: '12', title: 'Sự kiện 2', subtitle: '', startTime: '2026-08-10T09:30:00+07:00', endTime: '2026-08-10T11:00:00+07:00', location: 'Nơi B', eventType: 'teaching-schedule' },
  { id: '13', title: 'Sự kiện 3', subtitle: '', startTime: '2026-08-10T11:30:00+07:00', endTime: '2026-08-10T12:30:00+07:00', location: 'Nơi C', eventType: 'my-event' },
  { id: '14', title: 'Sự kiện 4 (Trùng)', subtitle: '', startTime: '2026-08-10T13:00:00+07:00', endTime: '2026-08-10T14:30:00+07:00', location: 'Nơi D', eventType: 'registered-event' },
  { id: '15', title: 'Sự kiện 5 (Trùng)', subtitle: '', startTime: '2026-08-10T13:00:00+07:00', endTime: '2026-08-10T15:00:00+07:00', location: 'Nơi E', eventType: 'other' },
  { id: '16', title: 'Sự kiện 6', subtitle: '', startTime: '2026-08-10T15:30:00+07:00', endTime: '2026-08-10T17:00:00+07:00', location: 'Nơi F', eventType: 'class-schedule' },
  { id: '17', title: 'Sự kiện 7', subtitle: '', startTime: '2026-08-10T20:00:00+07:00', endTime: '2026-08-11T23:00:00+07:00', location: 'Nơi G', eventType: 'my-event' },
]

const MyCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(dayjs().date())
  const [viewType, setViewType] = useState('month')
  const [activeFilters, setActiveFilters] = useState([])

  const filteredEvents = useMemo(() => {
    if (activeFilters.length === 0) return MOCK_EVENTS
    return MOCK_EVENTS.filter(e => activeFilters.includes(e.eventType))
  }, [activeFilters])

  // Filter events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    const targetDateStr = currentDate.date(selectedDate).format('YYYY-MM-DD')
    const targetStart = dayjs(targetDateStr)
    const targetEnd = targetStart.add(1, 'day')

    return filteredEvents.filter(ev => {
      if (!ev.startTime) return false
      const evStart = dayjs(ev.startTime)
      const evEnd = ev.endTime ? dayjs(ev.endTime) : evStart.add(1, 'hour')
      // Check if event timeline overlaps with the target day
      return evStart.isBefore(targetEnd) && evEnd.isAfter(targetStart)
    })
  }, [selectedDate, currentDate, filteredEvents])

  const handleNext = () => {
    if (viewType === 'week') {
      const nextWeek = currentDate
        .date(Math.min(selectedDate, currentDate.daysInMonth()))
        .add(1, 'week')
      setCurrentDate(nextWeek)
      setSelectedDate(nextWeek.date())
    } else {
      setCurrentDate((d) => d.add(1, 'month'))
    }
  }

  const handlePrev = () => {
    if (viewType === 'week') {
      const prevWeek = currentDate
        .date(Math.min(selectedDate, currentDate.daysInMonth()))
        .subtract(1, 'week')
      setCurrentDate(prevWeek)
      setSelectedDate(prevWeek.date())
    } else {
      setCurrentDate((d) => d.subtract(1, 'month'))
    }
  }

  return (
    <div className='w-full space-y-6'>
      <Breadcrumb
        items={[
          { label: 'Lịch của tôi', to: '/calendar' },
          { label: 'Lịch cá nhân', to: '/calendar/my-calendar' },
        ]}
      />

      <div className='flex items-center justify-between'>
        <p className='text-[40px] font-semibold text-[#1A1A1A]'>Lịch của tôi</p>
        <div className='flex gap-4'>
          <PillButton variant='primary' startIcon={<CalendarClock className='w-4 h-4' />}>Thay đổi lịch dạy</PillButton>
          <PillButton variant='outline' endIcon={<Plus className='w-4 h-4' />}>Tạo sự kiện</PillButton>
        </div>
      </div>
      <div className='flex flex-col lg:flex-row items-stretch gap-4 h-auto xl:h-[calc(100vh-200px)]'>
        <div className='flex-1 w-full min-h-0 flex flex-col'>
          <Calendar
            currentDate={currentDate}
            selectedDate={selectedDate}
            viewType={viewType}
            events={filteredEvents}
            onChangeView={setViewType}
            onPrev={handlePrev}
            onNext={handleNext}
            onSelectDate={setSelectedDate}
            activeFilters={activeFilters}
            onApplyFilter={setActiveFilters}
          />
        </div>
        {viewType === 'month' && (
          <div className='w-full lg:w-[340px] flex flex-col relative shrink-0'>
            <div className='w-full h-[500px] lg:h-auto lg:absolute lg:inset-0'>
              <DailyEventPanel
                date={currentDate.date(selectedDate).format('DD/MM')}
                events={eventsForSelectedDate}
                activeFilters={activeFilters}
                onApplyFilter={setActiveFilters}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCalendarPage
