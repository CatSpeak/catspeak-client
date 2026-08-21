import React, { useState } from 'react'
import dayjs from 'dayjs'
import DailyEventPanel from '../components/my-calendar/DailyEventPanel'
import CalendarTab from '../components/my-calendar/CalendarTab'
import EventTab from '../components/my-calendar/EventTab'
import TeachingScheduleTab from '../components/my-calendar/TeachingScheduleTab'
import { PillButton } from '@/shared/components/ui/buttons'
import { Breadcrumb, Tabs } from '@/shared/components/ui/navigation'
import { CalendarClock, Plus, CalendarDays, Ticket, BookOpen } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@/shared/components/ui/indicators'
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useLanguage } from "@/shared/context/LanguageContext"
import { DEFAULT_FILTERS } from '@/features/calendar/data/calendarConstants'
import useCalendarEvents from '@/features/calendar/hooks/useCalendarEvents'

const MyCalendarPage = () => {
  const { t } = useLanguage()
  const { isTeacher } = useRoleOverride()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'calendar')
  const [prevLocationKey, setPrevLocationKey] = useState(location.key)
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(dayjs().date())
  const [viewType, setViewType] = useState('week')
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS)

  // Adjust state during render to avoid cascading renders from useEffect
  if (location.key !== prevLocationKey) {
    setPrevLocationKey(location.key)
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }

  // Use custom hook for all event data management
  const { filteredEvents, eventsForSelectedDate, classesOptions, isLoading } = useCalendarEvents({
    currentDate,
    selectedDate,
    activeFilters,
  })

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

  const handleMonthChange = (newDate) => {
    const targetDate = dayjs(newDate)
    setCurrentDate(targetDate)
    setSelectedDate(targetDate.date())
  }

  const tabOptions = [
    { id: 'calendar', label: t.calendar?.generalCalendar || 'Lịch tổng hợp', icon: CalendarDays },
    ...(isTeacher ? [
      { id: 'event', label: t.nav?.events || 'Sự kiện', icon: Ticket },
      { id: 'teaching-schedule', label: t.nav?.schedule || 'Lịch giảng dạy', icon: BookOpen },
    ] : []),
  ]

  if (isLoading) {
    return (
      <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
    )
  }

  return (
    <div className='w-full space-y-6'>
      <Breadcrumb
        items={[
          { label: t.nav?.home || 'Trang chủ', onClick: () => navigate('/') },
          { label: t.nav?.myCalendar || 'Lịch của tôi' },
        ]}
      />

      <div className='flex items-center justify-between flex-col md:flex-row'>
        <p className='text-[40px] font-semibold text-[#1A1A1A]'>{t.nav?.myCalendar || 'Lịch của tôi'}</p>
        {isTeacher && (
          <div className='flex gap-4'>
            <PillButton
              variant='primary'
              startIcon={<CalendarClock className='w-4 h-4' />}
              onClick={() => navigate('/workspace/classes')}>
              {t.calendar?.changeTeachingSchedule || 'Thay đổi lịch dạy'}
            </PillButton>
            <PillButton
              variant='outline'
              endIcon={<Plus className='w-4 h-4' />}
              onClick={() => navigate("/workspace/events/create")}>
              {t.calendar?.createEvent || 'Tạo sự kiện'}
            </PillButton>
          </div>
        )}
      </div>

      <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} fullWidth={false} />

      {/* Content with 3 tab: Calendar, Event, Teaching Schedule */}
      {activeTab === 'calendar' && (
        <div className='flex flex-col lg:flex-row items-stretch gap-4 h-auto xl:h-[calc(100vh-200px)]'>
          <div className='flex-1 w-full min-h-0 flex flex-col'>
            <CalendarTab
              currentDate={currentDate}
              selectedDate={selectedDate}
              viewType={viewType}
              events={filteredEvents}
              onChangeView={setViewType}
              onPrev={handlePrev}
              onNext={handleNext}
              onChangeMonth={handleMonthChange}
              onSelectDate={setSelectedDate}
              activeFilters={activeFilters}
              onApplyFilter={setActiveFilters}
              classesOptions={classesOptions}
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
                  classesOptions={classesOptions}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {isTeacher && activeTab === 'event' && <EventTab />}

      {isTeacher && activeTab === 'teaching-schedule' && (
        <TeachingScheduleTab
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  )
}

export default MyCalendarPage
