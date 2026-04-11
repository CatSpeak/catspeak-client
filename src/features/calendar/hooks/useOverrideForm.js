import { useState } from "react"
import dayjs from "dayjs"
import { useUpdateEventOccurrenceMutation } from "@/store/api/eventsApi"

export const useOverrideForm = (eventId, occurrenceId, initialEvent, onClose) => {
  const [updateEventOccurrence, { isLoading }] = useUpdateEventOccurrenceMutation()

  const initialStartTime = initialEvent?.startTime
    ? dayjs(initialEvent.startTime)
    : dayjs()
  const initialEndTime = initialEvent?.endTime
    ? dayjs(initialEvent.endTime)
    : dayjs().add(1, "hour")
  
  const initialLocation = initialEvent?.location || ""
  const initialParticipants = initialEvent?.maxParticipants || 50
  
  // These aren't usually on the main event object natively if it's just the series template,
  // but if the user has already overridden this occurrence, they might be present.
  const initialIsCancelled = initialEvent?.isCancelled || false
  const initialOverrideReason = initialEvent?.overrideReason || ""

  const [startTime, setStartTime] = useState(initialStartTime)
  const [endTime, setEndTime] = useState(initialEndTime)
  const [location, setLocation] = useState(initialLocation)
  const [maxParticipants, setMaxParticipants] = useState(initialParticipants)
  const [isCancelled, setIsCancelled] = useState(initialIsCancelled)
  const [overrideReason, setOverrideReason] = useState(initialOverrideReason)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    
    // Convert states to payload
    const payload = {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location,
      maxParticipants: Number(maxParticipants),
      isCancelled,
      overrideReason: isCancelled ? overrideReason : undefined, // Optional logic, but let's pass it if provided
    }

    try {
      await updateEventOccurrence({
        eventId,
        occurrenceId,
        ...payload,
      }).unwrap()
      
      onClose()
    } catch (err) {
      console.error("Failed to update occurrence:", err)
    }
  }

  return {
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    location,
    setLocation,
    maxParticipants,
    setMaxParticipants,
    isCancelled,
    setIsCancelled,
    overrideReason,
    setOverrideReason,
    handleSubmit,
    isLoading
  }
}
