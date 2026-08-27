import dayjs from 'dayjs'

/**
 * Map teacher schedule sessions from API to normalized calendar events.
 */
export const mapTeacherSessions = (sessions, t, seenIds) => {
  const events = []
  if (!sessions?.data || !Array.isArray(sessions.data)) return events

  sessions.data.forEach((session, index) => {
    const startDateTime = session.rawStartTime || session.startTime || dayjs().toISOString()
    const endDateTime = session.rawEndTime || session.endTime || dayjs().toISOString()

    const newId = `teaching-${session.id || session.class?.id || `idx-${index}`}-${session.sessionNumber}`
    if (!seenIds.has(newId)) {
      seenIds.add(newId)
      events.push({
        id: newId,
        classId: session.class?.id,
        classLanguage: session.class?.language,
        title: session.class?.name || (t.calendar?.teachingSchedule || 'Lịch dạy'),
        subtitle: session.sessionNumber ? `${t.calendar?.session || 'Buổi'} ${session.sessionNumber}/${session.totalSessions || '?'}` : '',
        startTime: startDateTime,
        endTime: endDateTime,
        location: session.location || (t.calendar?.online || 'Trực tuyến'),
        thumbnailUrl: session.thumbnailUrl || null,
        isOnline: session.isOnline || false,
        status: session.class?.status,
        eventType: 'teaching-schedule',
      })
    }
  })

  return events
}

/**
 * Map student schedule sessions from API to normalized calendar events.
 */
export const mapStudentSessions = (sessions, t, seenIds) => {
  const events = []
  if (!sessions?.data || !Array.isArray(sessions.data)) return events

  sessions.data.forEach((session, index) => {
    const startDateTime = session.rawStartTime || session.startTime || dayjs().toISOString()
    const endDateTime = session.rawEndTime || session.endTime || dayjs().toISOString()

    const newId = `student-${session.id || session.class?.id || `idx-${index}`}-${session.sessionNumber}`
    if (!seenIds.has(newId)) {
      seenIds.add(newId)
      events.push({
        id: newId,
        classId: session.class?.id,
        classLanguage: session.class?.language,
        title: session.class?.name || (t.calendar?.studentSchedule || 'Lịch học'),
        subtitle: session.sessionNumber ? `${t.calendar?.session || 'Buổi'} ${session.sessionNumber}/${session.totalSessions || '?'}` : '',
        startTime: startDateTime,
        endTime: endDateTime,
        location: session.location || (t.calendar?.online || 'Trực tuyến'),
        thumbnailUrl: session.thumbnailUrl || null,
        isOnline: session.isOnline || false,
        status: session.class?.status,
        eventType: 'student-schedule',
      })
    }
  })

  return events
}

/**
 * Process a generic list of events/occurrences (my-events, registered-events, etc.)
 */
export const processEventsList = (list, eventType, seenIds, t) => {
  const events = []
  if (!list || !Array.isArray(list)) return events

  list.forEach(ev => {
    if (ev.isRecurringGroup && ev.subOccurrences && Array.isArray(ev.subOccurrences) && ev.subOccurrences.length > 0) {
      ev.subOccurrences.forEach(sub => {
        const newId = `${eventType}-${sub.id}`
        if (!seenIds.has(newId)) {
          seenIds.add(newId)
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
          })
        }
      })
    } else {
      const newId = `${eventType}-${ev.occurrenceId || ev.id}`
      if (!seenIds.has(newId)) {
        seenIds.add(newId)
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
        })
      }
    }
  })

  return events
}

/**
 * Build all normalized calendar events from multiple API sources.
 */
export const buildAllEvents = ({ teacherScheduleSessions, studentScheduleSessions, myEvents, registeredEvents, studentRegisteredEvents }, t) => {
  const seenIds = new Set()
  const events = []

  // 1. Teacher Schedule
  events.push(...mapTeacherSessions(teacherScheduleSessions, t, seenIds))

  // 2. Student Schedule
  events.push(...mapStudentSessions(studentScheduleSessions, t, seenIds))

  // 3. My Events
  const myEventsList = myEvents?.occurrences || myEvents?.events || (Array.isArray(myEvents) ? myEvents : [])
  events.push(...processEventsList(myEventsList, 'my-event', seenIds, t))

  // 4. Registered Events
  const regEventsList = registeredEvents?.occurrences || registeredEvents?.events || (Array.isArray(registeredEvents) ? registeredEvents : [])
  events.push(...processEventsList(regEventsList, 'registered-event', seenIds, t))

  // 5. Student Registered Events
  const studentRegEventsList = studentRegisteredEvents?.occurrences || studentRegisteredEvents?.events || (Array.isArray(studentRegisteredEvents) ? studentRegisteredEvents : [])
  events.push(...processEventsList(studentRegEventsList, 'registered-event', seenIds, t))

  return events
}
