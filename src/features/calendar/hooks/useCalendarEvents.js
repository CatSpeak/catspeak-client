import { useMemo } from 'react'
import { useGetScheduleSessionsQuery, useGetStudentScheduleSessionsQuery } from '@/store/api/coursesApi'
import { useGetMyEventsQuery, useGetRegisteredEventsQuery, useGetStudentRegisteredEventsQuery } from '@/store/api/eventsApi'
import { useRoleOverride } from '@/features/courses/components/RoleSwitcher'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useTimezone } from '@/shared/hooks/useTimezone'
import { buildAllEvents } from '../utils/eventMappers'

/**
 * Custom hook that fetches, normalizes, filters, and derives calendar event data.
 *
 * @param {object} params
 * @param {import('dayjs').Dayjs} params.currentDate - Current calendar date
 * @param {number} params.selectedDate - Selected day of month (1-31)
 * @param {object} params.activeFilters - Active filter state { eventTypes: [], classIds: [] }
 * @returns {{ allEvents, filteredEvents, eventsForSelectedDate, classesOptions, isLoading }}
 */
const useCalendarEvents = ({ currentDate, selectedDate, activeFilters }) => {
  const { t } = useLanguage()
  const { getZoneDateStr } = useTimezone()
  const { isTeacher } = useRoleOverride()

  const fromDate = currentDate.startOf('month').format('YYYY-MM-DD')
  const toDate = currentDate.endOf('month').format('YYYY-MM-DD')

  // API Calls
  const { data: teacherScheduleSessions, isLoading: isLoadingTeacher } = useGetScheduleSessionsQuery(
    { from: fromDate, to: toDate },
    { skip: !isTeacher }
  )
  const { data: studentScheduleSessions, isLoading: isLoadingStudent } = useGetStudentScheduleSessionsQuery({ from: fromDate, to: toDate })
  const { data: myEvents, isLoading: isLoadingMyEvent } = useGetMyEventsQuery(
    { startDate: fromDate, endDate: toDate },
    { skip: !isTeacher }
  )
  const { data: registeredEvents, isLoading: isLoadingRegis } = useGetRegisteredEventsQuery({
    startDate: fromDate,
    endDate: toDate
  })
  const { data: studentRegisteredEvents, isLoading: isLoadingStuRegis } = useGetStudentRegisteredEventsQuery({
    startDate: fromDate,
    endDate: toDate
  })

  const isLoading = isLoadingTeacher || isLoadingStudent || isLoadingMyEvent || isLoadingRegis || isLoadingStuRegis

  // Normalize all API data into a flat event array
  const allEvents = useMemo(() => {
    return buildAllEvents(
      { teacherScheduleSessions, studentScheduleSessions, myEvents, registeredEvents, studentRegisteredEvents },
      t
    )
  }, [teacherScheduleSessions, myEvents, registeredEvents, studentScheduleSessions, studentRegisteredEvents, t])

  // Derive unique class options from events
  const classesOptions = useMemo(() => {
    const map = new Map()
    allEvents.forEach(ev => {
      if (ev.classId && ev.title && (ev.eventType === 'teaching-schedule' || ev.eventType === 'student-schedule')) {
        map.set(ev.classId.toString(), ev.title)
      }
    })
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }))
  }, [allEvents])

  // Apply filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      // 1. Event type filter
      if (!activeFilters.eventTypes.includes(ev.eventType)) {
        return false
      }
      // 2. Class filter
      if (activeFilters.classIds.length > 0) {
        if (ev.classId && !activeFilters.classIds.includes(ev.classId.toString())) {
          return false
        }
      }
      return true
    })
  }, [activeFilters, allEvents])

  // Events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    const targetDateStr = currentDate.date(selectedDate).format('YYYY-MM-DD')
    return filteredEvents.filter(ev => {
      if (!ev.startTime) return false
      const evDateStr = getZoneDateStr(ev.startTime)
      return evDateStr === targetDateStr
    })
  }, [selectedDate, currentDate, filteredEvents, getZoneDateStr])

  return { allEvents, filteredEvents, eventsForSelectedDate, classesOptions, isLoading }
}

export default useCalendarEvents
