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
import { useGetMyEventsQuery, useGetRegisteredEventsQuery, useGetStudentRegisteredEventsQuery } from '@/store/api/eventsApi'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@/shared/components/ui/indicators'
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import toast from 'react-hot-toast'

const MyCalendarPage = () => {
  const { t } = useLanguage()
  const { userTimeZone } = useTimezone()
  const { isTeacher } = useRoleOverride()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'calendar')
  const [prevLocationKey, setPrevLocationKey] = useState(location.key)
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(dayjs().date())
  const [viewType, setViewType] = useState('month')
  const [activeFilters, setActiveFilters] = useState([])

  // Adjust state during render to avoid cascading renders from useEffect
  if (location.key !== prevLocationKey) {
    setPrevLocationKey(location.key)
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }

  const fromDate = currentDate.startOf('month').format('YYYY-MM-DD')
  const toDate = currentDate.endOf('month').format('YYYY-MM-DD')

  // API Calls
  const { data: teacherScheduleSessions, isLoading: isLoadingTeacher } = useGetScheduleSessionsQuery(
    { from: fromDate, to: toDate },
    { skip: !isTeacher }
  );
  const { data: studentScheduleSessions, isLoading: isLoadingStudent } = useGetStudentScheduleSessionsQuery({ from: fromDate, to: toDate });
  const { data: myEvents, isLoading: isLoadingMyEvent } = useGetMyEventsQuery(
    { startDate: fromDate, endDate: toDate },
    { skip: !isTeacher }
  );
  const { data: registeredEvents, isLoading: isLoadingRegis } = useGetRegisteredEventsQuery({
    startDate: fromDate,
    endDate: toDate
  });
  const { data: studentRegisteredEvents, isLoading: isLoadingStuRegis } = useGetStudentRegisteredEventsQuery({
    startDate: fromDate,
    endDate: toDate
  });

  const isLoading = isLoadingTeacher || isLoadingStudent || isLoadingMyEvent || isLoadingRegis || isLoadingStuRegis

  const allEvents = useMemo(() => {
    const processEventsList = (events, list, eventType, seenIds) => {
      list.forEach(ev => {
        if (ev.isRecurringGroup && ev.subOccurrences && Array.isArray(ev.subOccurrences) && ev.subOccurrences.length > 0) {
          ev.subOccurrences.forEach(sub => {
            const newId = `${eventType}-${sub.id}`;
            if (!seenIds.has(newId)) {
              seenIds.add(newId);
              events.push({
                id: newId,
                eventId: ev.eventId || ev.id,
                occurrenceId: sub.id,
                title: sub.title || ev.title,
                subtitle: ev.description || "",
                startTime: sub.startTime,
                endTime: sub.endTime,
                location: sub.location || ev.location || (ev.isOnline ? (t.calendar?.online || 'Trực tuyến') : (t.calendar?.notAssigned || 'Chưa xác định')),
                thumbnailUrl: ev.thumbnailUrl || null,
                isOnline: ev.isOnline || false,
                ticketPrice: ev.ticketPrice || "",
                eventType: eventType,
              });
            }
          });
        } else {
          const newId = `${eventType}-${ev.occurrenceId || ev.id}`;
          if (!seenIds.has(newId)) {
            seenIds.add(newId);
            events.push({
              id: newId,
              eventId: ev.eventId || ev.id,
              occurrenceId: ev.occurrenceId || ev.id,
              title: ev.title,
              subtitle: ev.description || "",
              startTime: ev.startTime,
              endTime: ev.endTime,
              location: ev.location || (ev.isOnline ? (t.calendar?.online || 'Trực tuyến') : (t.calendar?.notAssigned || 'Chưa xác định')),
              thumbnailUrl: ev.thumbnailUrl || null,
              isOnline: ev.isOnline || false,
              ticketPrice: ev.ticketPrice || "",
              eventType: eventType,
            });
          }
        }
      });
    };

    const events = [];
    const seenIds = new Set();

    // 1. (Teacher Schedule)
    if (teacherScheduleSessions?.data && Array.isArray(teacherScheduleSessions.data)) {
      teacherScheduleSessions.data.forEach((session, index) => {
        const timePart = typeof session.startTime === "string" ? session.startTime.split("T")[1] || session.startTime : "00:00";
        const datePart = session.date || (typeof session.startTime === "string" && session.startTime.includes("T") ? session.startTime.split("T")[0] : null);
        const timeMatch = timePart.match(/(\d{1,2}:\d{2})/);
        const cleanTime = timeMatch ? timeMatch[1].padStart(5, "0") : "00:00";

        const timeEndPart = typeof session.endTime === "string" ? session.endTime.split("T")[1] || session.endTime : "00:00";
        const timeEndMatch = timeEndPart.match(/(\d{1,2}:\d{2})/);
        const cleanEndTime = timeEndMatch ? timeEndMatch[1].padStart(5, "0") : "00:00";

        const rawIsoStart = datePart && cleanTime
          ? `${datePart.trim()}T${cleanTime}:00Z`
          : session.rawStartTime || session.startTime;

        const rawIsoEnd = datePart && cleanEndTime
          ? `${datePart.trim()}T${cleanEndTime}:00Z`
          : session.rawEndTime || session.endTime;

        const startDateTime = rawIsoStart ? new Date(rawIsoStart).toISOString() : dayjs().toISOString();
        const endDateTime = rawIsoEnd ? new Date(rawIsoEnd).toISOString() : dayjs().toISOString();

        const newId = `teaching-${session.id || session.class?.id || `idx-${index}`}-${session.sessionNumber}`;
        if (!seenIds.has(newId)) {
          seenIds.add(newId);
          events.push({
            id: newId,
            classId: session.class?.id,
            title: session.class?.name || (t.calendar?.teachingSchedule || 'Lịch dạy'),
            subtitle: session.sessionNumber ? `${t.calendar?.session || 'Buổi'} ${session.sessionNumber}/${session.totalSessions || '?'}` : '',
            startTime: startDateTime,
            endTime: endDateTime,
            location: session.location || (t.calendar?.online || 'Trực tuyến'),
            thumbnailUrl: session.thumbnailUrl || null,
            isOnline: session.isOnline || false,
            status: session.class?.status,
            eventType: 'teaching-schedule',
          });
        }
      });
    }

    // 2. (Student Schedule)
    if (studentScheduleSessions?.data && Array.isArray(studentScheduleSessions.data)) {
      studentScheduleSessions.data.forEach((session, index) => {
        const timePart = typeof session.startTime === "string" ? session.startTime.split("T")[1] || session.startTime : "00:00";
        const datePart = session.date || (typeof session.startTime === "string" && session.startTime.includes("T") ? session.startTime.split("T")[0] : null);
        const timeMatch = timePart.match(/(\d{1,2}:\d{2})/);
        const cleanTime = timeMatch ? timeMatch[1].padStart(5, "0") : "00:00";

        const timeEndPart = typeof session.endTime === "string" ? session.endTime.split("T")[1] || session.endTime : "00:00";
        const timeEndMatch = timeEndPart.match(/(\d{1,2}:\d{2})/);
        const cleanEndTime = timeEndMatch ? timeEndMatch[1].padStart(5, "0") : "00:00";

        const rawIsoStart = datePart && cleanTime
          ? `${datePart.trim()}T${cleanTime}:00Z`
          : session.rawStartTime || session.startTime;

        const rawIsoEnd = datePart && cleanEndTime
          ? `${datePart.trim()}T${cleanEndTime}:00Z`
          : session.rawEndTime || session.endTime;

        const startDateTime = rawIsoStart ? new Date(rawIsoStart).toISOString() : dayjs().toISOString();
        const endDateTime = rawIsoEnd ? new Date(rawIsoEnd).toISOString() : dayjs().toISOString();

        const newId = `student-${session.id || session.class?.id || `idx-${index}`}-${session.sessionNumber}`;
        if (!seenIds.has(newId)) {
          seenIds.add(newId);
          events.push({
            id: newId,
            classId: session.class?.id,
            title: session.class?.name || (t.calendar?.studentSchedule || 'Lịch học'),
            subtitle: session.sessionNumber ? `${t.calendar?.session || 'Buổi'} ${session.sessionNumber}/${session.totalSessions || '?'}` : '',
            startTime: startDateTime,
            endTime: endDateTime,
            location: session.location || (t.calendar?.online || 'Trực tuyến'),
            thumbnailUrl: session.thumbnailUrl || null,
            isOnline: session.isOnline || false,
            status: session.class?.status,
            eventType: 'student-schedule',
          });
        }
      });
    }

    // 3. (My Events)
    const myEventsList = myEvents?.occurrences || myEvents?.events || (Array.isArray(myEvents) ? myEvents : []);
    processEventsList(events, myEventsList, 'my-event', seenIds);

    // 4. (Registered Events)
    const regEventsList = registeredEvents?.occurrences || registeredEvents?.events || (Array.isArray(registeredEvents) ? registeredEvents : []);
    processEventsList(events, regEventsList, 'registered-event', seenIds);

    // 5. (Student Registered Events)
    const studentRegEventsList = studentRegisteredEvents?.occurrences || studentRegisteredEvents?.events || (Array.isArray(studentRegisteredEvents) ? studentRegisteredEvents : []);
    processEventsList(events, studentRegEventsList, 'registered-event', seenIds);

    return events;
  }, [teacherScheduleSessions, myEvents, registeredEvents, studentScheduleSessions, studentRegisteredEvents, t, userTimeZone])

  const filteredEvents = useMemo(() => {
    if (activeFilters.length === 0) return allEvents
    return allEvents.filter(e => activeFilters.includes(e.eventType))
  }, [activeFilters, allEvents])

  // Filter events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    const targetDateStr = currentDate.date(selectedDate).format('YYYY-MM-DD')

    return filteredEvents.filter(ev => {
      if (!ev.startTime) return false
      const evStart = dayjs(ev.startTime).tz(userTimeZone)
      const evDateStr = evStart.format('YYYY-MM-DD')
      return evDateStr === targetDateStr
    })
  }, [selectedDate, currentDate, filteredEvents, userTimeZone])

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

      <div className='flex items-center justify-between'>
        <p className='text-[40px] font-semibold text-[#1A1A1A]'>{t.nav?.myCalendar || 'Lịch của tôi'}</p>
        {isTeacher && (
          <div className='flex gap-4'>
            <PillButton
              variant='primary'
              startIcon={<CalendarClock className='w-4 h-4' />}
              onClick={() => toast.success(t.comingSoon?.title || "Tính năng đang phát triển")}>
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
