import { useState } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)
import {
  useCreateEventMutation,
  useUpdateEventMutation,
  useUpdateEventSeriesMutation,
  useUpdateEventOccurrenceMutation,
} from "@/store/api/eventsApi"
import { mapFormToPayload } from "../utils/mapFormToPayload"
import { useLanguage } from "@/shared/context/LanguageContext"
import { TIMEZONES } from "../components/ui/TimezoneDropdown"

const DEFAULT_TIMEZONE = {
  id: "Asia/Ho_Chi_Minh",
  label: "Hồ Chí Minh",
  offset: "GMT +07:00",
}

const WEEKDAY_CODES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

export const useEventForm = (onClose, editEvent, onSubmitInterceptor) => {
  const { t } = useLanguage()
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation()
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()
  const [updateEventSeries, { isLoading: isUpdatingSeries }] =
    useUpdateEventSeriesMutation()
  const [updateEventOccurrence, { isLoading: isUpdatingOccurrence }] =
    useUpdateEventOccurrenceMutation()
  const isLoading = isCreating || isUpdating || isUpdatingSeries || isUpdatingOccurrence

  // Evaluate initial values once
  const initialTitle = editEvent?.title || ""
  const initialDescription = editEvent?.description || ""
  const initialColor = editEvent?.color || "#B91264"
  const initialLocation = editEvent?.location || ""
  const initialCountryId = editEvent?.countryId || 0
  const initialCityId = editEvent?.cityId || 0
  const initialParticipants = editEvent?.maxParticipants || 20
  const initialVisibility = editEvent?.visibilityScope || "PUBLIC"
  const initialConditions =
    editEvent?.conditions?.map((c) => c.title).join(", ") || ""

  const initTzId =
    editEvent?.timezone ||
    editEvent?.recurrenceRule?.timeZone ||
    DEFAULT_TIMEZONE.id

  const initialStartTime = editEvent?.startTime
    ? dayjs(dayjs(editEvent.startTime).tz(initTzId).format("YYYY-MM-DDTHH:mm:ss"))
    : dayjs()
  const initialEndTime = editEvent?.endTime
    ? dayjs(dayjs(editEvent.endTime).tz(initTzId).format("YYYY-MM-DDTHH:mm:ss"))
    : dayjs().add(1, "hour")

  let initialTimezone = DEFAULT_TIMEZONE
  const foundTz = TIMEZONES.find((tz) => tz.id === initTzId)
  if (foundTz) {
    initialTimezone = foundTz
  } else if (initTzId) {
    initialTimezone = { id: initTzId, label: initTzId, offset: "" }
  }

  let initialRecurOption = "NONE"
  let initialRecurInterval = 1
  let initialSelectedDays = [1, 4] // default Tuesday, Friday
  let initialRecurEndDate = dayjs().add(1, "month").toDate()

  if (editEvent?.isRecurring && editEvent?.recurrenceRule) {
    const rr = editEvent.recurrenceRule
    initialRecurOption = rr.frequency || "CUSTOM"
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
      ? dayjs(dayjs(rr.recurrenceEndDate).tz(initTzId).format("YYYY-MM-DDTHH:mm:ss")).toDate()
      : dayjs().add(1, "month").toDate()
  }

  // Basic fields
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [eventColor, setEventColor] = useState(initialColor)
  const [eventLocation, setEventLocation] = useState(initialLocation)
  const [countryId, setCountryId] = useState(initialCountryId)
  const [cityId, setCityId] = useState(initialCityId)
  const [maxParticipants, setMaxParticipants] = useState(initialParticipants)
  const [visibility, setVisibility] = useState(initialVisibility)
  const [conditionsInput, setConditionsInput] = useState(initialConditions)

  // Date / time
  const [startTime, setStartTimeState] = useState(initialStartTime)
  const [endTime, setEndTime] = useState(initialEndTime)

  const setStartTime = (newStartTime) => {
    const startObj = dayjs(startTime)
    const endObj = dayjs(endTime)
    const recurEndObj = dayjs(recurrenceEndDate)
    const newStartObj = dayjs(newStartTime)

    // Calculate how much the start time moved (in milliseconds)
    const diffMs = newStartObj.diff(startObj)

    // Apply the exact same shift to the end time
    setStartTimeState(newStartTime)
    setEndTime(endObj.add(diffMs, "ms").toDate())
    setRecurrenceEndDate(recurEndObj.add(diffMs, "ms").toDate())
  }

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
    if (!countryId) newErrors.countryId = t.validation.calendar.countryRequired
    if (!cityId) newErrors.cityId = t.validation.calendar.cityRequired
    if (!eventLocation.trim())
      newErrors.eventLocation = t.validation.calendar.locationRequired
    if (!description.trim())
      newErrors.description = t.validation.calendar.descriptionRequired
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
      countryId,
      cityId,
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

    console.log(
      "=== CREATING/UPDATING EVENT PAYLOAD ===",
      JSON.stringify(payload, null, 2),
    )

    if (onSubmitInterceptor) {
      onSubmitInterceptor(payload, performSave)
      return
    }

    await performSave(payload, "series")
  }

  const performSave = async (payload, choice = "series") => {
    try {
      // Prioritize eventId because editEvent.id is often the occurrence ID
      const parentId = editEvent?.eventId || editEvent?.id

      if (parentId) {
        if (editEvent.isRecurring && editEvent.occurrenceId && choice === "occurrence") {
          await updateEventOccurrence({
            eventId: editEvent.eventId || parentId,
            occurrenceId: editEvent.occurrenceId,
            ...payload,
          }).unwrap()
        } else {
          await updateEvent({
            eventId: parentId,
            ...payload,
          }).unwrap()
        }
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
    countryId,
    setCountryId,
    cityId,
    setCityId,
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
