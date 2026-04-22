import { useState } from "react"
import dayjs from "dayjs"
import {
  useCreateEventMutation,
  useUpdateEventMutation,
} from "@/store/api/eventsApi"
import { mapFormToPayload } from "../utils/mapFormToPayload"
import { useLanguage } from "@/shared/context/LanguageContext"

const DEFAULT_TIMEZONE = {
  id: "Asia/Bangkok",
  label: "Bangkok",
  offset: "GMT +07:00",
}

const WEEKDAY_CODES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
const INVERSE_VISIBILITY = {
  PUBLIC: "Công khai",
  SHARED_LINK_ONLY: "Chỉ những người có link",
  // COMMUNITY_ONLY: "Cộng đồng",  // not yet supported by backend
}
const INVERSE_RECURRENCE = {
  DAILY: "Hàng ngày",
  WEEKLY: "Hàng tuần",
  MONTHLY: "Hàng tháng",
  YEARLY: "Hàng năm",
}

export const useEventForm = (onClose, editEvent) => {
  const { t } = useLanguage()
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation()
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()
  const isLoading = isCreating || isUpdating

  // Evaluate initial values once
  const initialTitle = editEvent?.title || ""
  const initialDescription = editEvent?.description || ""
  const initialColor = editEvent?.color || "#B91264"
  const initialLocation = editEvent?.location || ""
  const initialParticipants = editEvent?.maxParticipants || 50
  const initialVisibility =
    INVERSE_VISIBILITY[editEvent?.visibilityScope] || "Công khai"
  const initialConditions =
    editEvent?.conditions?.map((c) => c.title).join(", ") || ""

  const initialStartTime = editEvent?.startTime
    ? dayjs(editEvent.startTime)
    : dayjs()
  const initialEndTime = editEvent?.endTime
    ? dayjs(editEvent.endTime)
    : dayjs().add(1, "hour")

  let initialRecurOption = "Không lặp lại"
  let initialRecurInterval = 1
  let initialSelectedDays = [1, 4] // default Tuesday, Friday
  let initialRecurEndDate = dayjs().add(1, "month").toDate()
  let initialTimezone = DEFAULT_TIMEZONE

  if (editEvent?.isRecurring && editEvent?.recurrenceRule) {
    const rr = editEvent.recurrenceRule
    initialRecurOption = INVERSE_RECURRENCE[rr.frequency] || "Tùy chỉnh..."
    initialRecurInterval = rr.interval || 1
    if (rr.byWeekDay && rr.byWeekDay.length > 0) {
      initialSelectedDays = rr.byWeekDay
        .map((d) => WEEKDAY_CODES.indexOf(d))
        .filter((idx) => idx !== -1)
      if (rr.frequency === "WEEKLY" && initialSelectedDays.length === 0) {
        initialSelectedDays = [1, 4]
      }
    }
    initialRecurEndDate = rr.recurrenceEndDate
      ? dayjs(rr.recurrenceEndDate).toDate()
      : dayjs().add(1, "month").toDate()
    if (rr.timeZone) {
      initialTimezone = {
        id: rr.timeZone,
        label: rr.timeZone,
        offset: "GMT +07:00",
      }
    }
  }

  // Basic fields
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [eventColor, setEventColor] = useState(initialColor)
  const [eventLocation, setEventLocation] = useState(initialLocation)
  const [maxParticipants, setMaxParticipants] = useState(initialParticipants)
  const [visibility, setVisibility] = useState(initialVisibility)
  const [conditionsInput, setConditionsInput] = useState(initialConditions)

  // Date / time
  const [startTime, setStartTime] = useState(initialStartTime)
  const [endTime, setEndTime] = useState(initialEndTime)

  // Recurrence
  const [recurrenceOption, setRecurrenceOption] = useState(initialRecurOption)
  const [recurrenceInterval, setRecurrenceInterval] =
    useState(initialRecurInterval)
  const [selectedDays, setSelectedDays] = useState(initialSelectedDays)
  const [recurrenceEndDate, setRecurrenceEndDate] =
    useState(initialRecurEndDate)
  const [selectedTimezone, setSelectedTimezone] = useState(initialTimezone)

  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e?.preventDefault()

    const newErrors = {}
    if (!title.trim()) newErrors.title = t.validation.calendar.titleRequired
    if (!eventLocation.trim()) newErrors.eventLocation = t.validation.calendar.locationRequired
    if (!description.trim()) newErrors.description = t.validation.calendar.descriptionRequired
    if (!maxParticipants || Number(maxParticipants) <= 0) {
      newErrors.maxParticipants = t.validation.calendar.maxParticipantsRequired
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    const payload = mapFormToPayload({
      title,
      description,
      eventLocation,
      eventColor,
      maxParticipants,
      visibility,
      startTime,
      endTime,
      recurrenceOption,
      recurrenceInterval,
      selectedDays,
      recurrenceEndDate,
      selectedTimezone,
      conditionsInput,
    })

    try {
      if (editEvent?.id || editEvent?.eventId) {
        await updateEvent({
          eventId: editEvent.id || editEvent.eventId,
          ...payload,
        }).unwrap()
      } else {
        await createEvent(payload).unwrap()
      }
      onClose()
    } catch (err) {
      console.error("Failed to save event:", err)
    }
  }

  return {
    // state
    title,
    setTitle,
    description,
    setDescription,
    eventColor,
    setEventColor,
    eventLocation,
    setEventLocation,
    maxParticipants,
    setMaxParticipants,
    visibility,
    setVisibility,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    recurrenceOption,
    setRecurrenceOption,
    recurrenceInterval,
    setRecurrenceInterval,
    selectedDays,
    setSelectedDays,
    recurrenceEndDate,
    setRecurrenceEndDate,
    selectedTimezone,
    setSelectedTimezone,
    conditionsInput,
    setConditionsInput,
    errors,
    setErrors,
    // submission
    handleSubmit,
    isLoading,
  }
}
