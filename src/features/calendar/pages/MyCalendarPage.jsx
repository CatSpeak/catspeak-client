import React, { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import DailyEventPanel from '../components/my-calendar/DailyEventPanel'
import CalendarTab from '../components/my-calendar/CalendarTab'
import EventTab from '../components/my-calendar/EventTab'
import TeachingScheduleTab from '../components/my-calendar/TeachingScheduleTab'
import { PillButton } from '@/shared/components/ui/buttons'
import { Breadcrumb, Tabs } from '@/shared/components/ui/navigation'
import { CalendarClock, Plus, Loader2, CalendarDays, Ticket, BookOpen } from 'lucide-react'
import { useGetScheduleSessionsQuery, useGetStudentScheduleSessionsQuery } from '@/store/api/coursesApi'
import { useGetMyEventsQuery, useGetRegisteredEventsQuery } from '@/store/api/eventsApi'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '@/shared/components/ui/indicators'
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"

const MyCalendarPage = () => {
  const { isTeacher } = useRoleOverride()
  const [activeTab, setActiveTab] = useState('calendar')
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(dayjs().date())
  const [viewType, setViewType] = useState('month')
  const [activeFilters, setActiveFilters] = useState([])
  const navigate = useNavigate()

  const fromDate = currentDate.startOf('month').format('YYYY-MM-DD')
  const toDate = currentDate.endOf('month').format('YYYY-MM-DD')

  // API Calls
  const { data: teacherScheduleSessions, isLoading: isLoadingTeacher } = useGetScheduleSessionsQuery({ from: fromDate, to: toDate });
  const { data: studentScheduleSessions, isLoading: isLoadingStudent } = useGetStudentScheduleSessionsQuery({ from: fromDate, to: toDate });
  const { data: myEvents, isLoading: isLoadingMyEvent } = useGetMyEventsQuery();
  const { data: registeredEvents, isLoading: isLoadingRegis } = useGetRegisteredEventsQuery();

  const isLoading = isLoadingTeacher || isLoadingStudent || isLoadingMyEvent || isLoadingRegis

  const allEvents = useMemo(() => {
    const events = [];

    // 1. (Teacher Schedule)
    if (teacherScheduleSessions?.data && Array.isArray(teacherScheduleSessions.data)) {
      teacherScheduleSessions.data.forEach((session, index) => {
        // Construct full startTime and endTime from date and time
        const startDateTime = session.date && session.startTime
          ? dayjs(`${session.date}T${session.startTime}`).toISOString()
          : dayjs().toISOString();
        const endDateTime = session.date && session.endTime
          ? dayjs(`${session.date}T${session.endTime}`).toISOString()
          : dayjs().toISOString();

        events.push({
          id: `teaching-${session.id || session.class?.id || `idx-${index}`}-${session.sessionNumber}`,
          classId: session.class?.id,
          title: session.class?.name || 'Lịch dạy',
          subtitle: session.sessionNumber ? `Buổi ${session.sessionNumber}/${session.totalSessions || '?'}` : '',
          startTime: startDateTime,
          endTime: endDateTime,
          location: session.location || 'Trực tuyến',
          thumbnailUrl: session.thumbnailUrl || null,
          isOnline: session.isOnline || false,
          eventType: 'teaching-schedule',
        });
      });
    }

    // 2. (Student Schedule)
    if (studentScheduleSessions?.data && Array.isArray(studentScheduleSessions.data)) {
      studentScheduleSessions.data.forEach((session, index) => {
        // Construct full startTime and endTime from date and time
        const startDateTime = session.date && session.startTime
          ? dayjs(`${session.date}T${session.startTime}`).toISOString()
          : dayjs().toISOString();
        const endDateTime = session.date && session.endTime
          ? dayjs(`${session.date}T${session.endTime}`).toISOString()
          : dayjs().toISOString();

        events.push({
          id: `student-${session.id || session.class?.id || `idx-${index}`}-${session.sessionNumber}`,
          classId: session.class?.id,
          title: session.class?.name || 'Lịch học',
          subtitle: session.sessionNumber ? `Buổi ${session.sessionNumber}/${session.totalSessions || '?'}` : '',
          startTime: startDateTime,
          endTime: endDateTime,
          location: session.location || 'Trực tuyến',
          thumbnailUrl: session.thumbnailUrl || null,
          isOnline: session.isOnline || false,
          eventType: 'student-schedule',
        });
      });
    }

    // 3. (My Events)
    if (myEvents?.occurrences && Array.isArray(myEvents.occurrences)) {
      myEvents.occurrences.forEach(ev => {
        events.push({
          id: `my-event-${ev.eventId}`,
          title: ev.title || 'Sự kiện của tôi',
          subtitle: '',
          startTime: ev.startTime,
          endTime: ev.endTime,
          location: ev.location || (ev.isOnline ? 'Trực tuyến' : 'Chưa xác định'),
          thumbnailUrl: ev.thumbnailUrl || null,
          isOnline: ev.isOnline || false,
          eventType: 'my-event',
        });
      });
    }

    // 4. (Registered Events)
    if (registeredEvents?.occurrences && Array.isArray(registeredEvents.occurrences)) {
      registeredEvents.occurrences.forEach(ev => {
        events.push({
          id: `registered-${ev.id}`,
          title: ev.title || 'Sự kiện đã đăng ký',
          subtitle: '',
          startTime: ev.startTime,
          endTime: ev.endTime,
          location: ev.location || (ev.isOnline ? 'Trực tuyến' : 'Chưa xác định'),
          thumbnailUrl: ev.thumbnailUrl || null,
          isOnline: ev.isOnline || false,
          eventType: 'registered-event',
        });
      });
    }

    return events;
  }, [teacherScheduleSessions, myEvents, registeredEvents, studentScheduleSessions])

  const filteredEvents = useMemo(() => {
    if (activeFilters.length === 0) return allEvents
    return allEvents.filter(e => activeFilters.includes(e.eventType))
  }, [activeFilters, allEvents])

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

  const tabOptions = [
    { id: 'calendar', label: 'Lịch cá nhân', icon: CalendarDays },
    ...(isTeacher ? [
      { id: 'event', label: 'Sự kiện', icon: Ticket },
      { id: 'teaching-schedule', label: 'Lịch giảng dạy', icon: BookOpen },
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
          { label: 'Trang chủ', onClick: () => navigate('/workspace') },
          { label: 'Lịch cá nhân' },
        ]}
      />

      <div className='flex items-center justify-between'>
        <p className='text-[40px] font-semibold text-[#1A1A1A]'>Lịch của tôi</p>
        <div className='flex gap-4'>
          <PillButton variant='primary' startIcon={<CalendarClock className='w-4 h-4' />}>Thay đổi lịch dạy</PillButton>
          <PillButton variant='outline' endIcon={<Plus className='w-4 h-4' />} onClick={() => navigate("/workspace/events/create")}>Tạo sự kiện</PillButton>
        </div>
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
