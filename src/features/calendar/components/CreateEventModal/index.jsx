import React, { useState, useRef } from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useEventForm } from "../../hooks/useEventForm"
import { X } from "lucide-react"
import EventHeader from "./EventHeader"
import EventDateTimeSection from "./EventDateTimeSection"
import EventRecurrenceSection from "./EventRecurrenceSection"
import EventDetailsSection from "./EventDetailsSection"
import EventFooter from "./EventFooter"
import EditChoiceModal from "../EventDetailModal/EditChoiceModal"

const CreateEventModal = ({ onClose, editEvent }) => {
  const [pendingPayload, setPendingPayload] = useState(null)
  const performSaveRef = useRef(null)

  const handleInterceptSubmit = (payload, performSave) => {
    if (editEvent?.isRecurring && editEvent?.occurrenceId) {
      setPendingPayload(payload)
      performSaveRef.current = performSave
    } else {
      performSave(payload, "series")
    }
  }

  const form = useEventForm(onClose, editEvent, handleInterceptSubmit)
  const { t } = useLanguage()

  return (
    <Modal
      open
      onClose={onClose}
      showCloseButton={false}
      className="flex flex-col p-0 !max-w-[900px] w-full bg-[#F2F2F2] rounded-none min-[426px]:rounded-xl overflow-visible max-[425px]:h-full"
      bodyClassName="flex-1 flex flex-col min-h-0"
    >
      <form
        onSubmit={form.handleSubmit}
        className="relative flex flex-col w-full bg-white rounded-none min-[426px]:rounded-xl min-[426px]:max-h-[90vh] flex-1 min-h-0"
      >
        {/* Floating close button */}
        <button
          onClick={onClose}
          type="button"
          className="hidden min-[426px]:block absolute -top-5 -right-5 bg-[#B81919] text-white p-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-50 hover:bg-red-800 transition-colors border-[4px] border-white"
        >
          <X size={26} strokeWidth={4} />
        </button>

        <div className="shrink-0">
          <EventHeader
            isEditing={!!editEvent}
            t={t}
            eventColor={form.eventColor}
            onColorChange={form.setEventColor}
            visibility={form.visibility}
            onVisibilityChange={form.setVisibility}
            onClose={onClose}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:m-4 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]">
          {/* Body */}
          <div className="p-6 relative bg-white text-base">
            <div className="flex flex-col gap-6">
              <EventDateTimeSection
                isEditing={!!editEvent}
                eventColor={form.eventColor}
                startTime={form.startTime}
                onStartTimeChange={form.setStartTime}
                endTime={form.endTime}
                onEndTimeChange={form.setEndTime}
                selectedTimezone={form.selectedTimezone}
                onTimezoneChange={form.setSelectedTimezone}
                errors={form.errors}
              />

              <EventRecurrenceSection
                isEditing={!!editEvent}
                eventColor={form.eventColor}
                startTime={form.startTime}
                recurrenceOption={form.recurrenceOption}
                onRecurrenceChange={form.setRecurrenceOption}
                recurrenceInterval={form.recurrenceInterval}
                onRecurrenceIntervalChange={form.setRecurrenceInterval}
                selectedDays={form.selectedDays}
                onSelectedDaysChange={form.setSelectedDays}
                recurrenceEndDate={form.recurrenceEndDate}
                onRecurrenceEndDateChange={form.setRecurrenceEndDate}
                recurrenceEndType={form.recurrenceEndType}
                onRecurrenceEndTypeChange={form.setRecurrenceEndType}
                occurrenceCount={form.occurrenceCount}
                onOccurrenceCountChange={form.setOccurrenceCount}
              />

              <EventDetailsSection
                title={form.title}
                onTitleChange={(val) => {
                  form.setTitle(val)
                  if (form.errors?.title)
                    form.setErrors((prev) => ({ ...prev, title: undefined }))
                }}
                eventColor={form.eventColor}
                countryId={form.countryId}
                onCountryIdChange={(val) => {
                  form.setCountryId(val)
                  form.setCityId(0) // reset city when country changes
                  if (form.errors?.countryId)
                    form.setErrors((prev) => ({
                      ...prev,
                      countryId: undefined,
                    }))
                }}
                cityId={form.cityId}
                onCityIdChange={(val) => {
                  form.setCityId(val)
                  if (form.errors?.cityId)
                    form.setErrors((prev) => ({ ...prev, cityId: undefined }))
                }}
                eventLocation={form.eventLocation}
                onLocationChange={(val) => {
                  form.setEventLocation(val)
                  if (form.errors?.eventLocation)
                    form.setErrors((prev) => ({
                      ...prev,
                      eventLocation: undefined,
                    }))
                }}
                description={form.description}
                onDescriptionChange={form.setDescription}
                maxParticipants={form.maxParticipants}
                onMaxParticipantsChange={(val) => {
                  form.setMaxParticipants(val)
                  if (form.errors?.maxParticipants)
                    form.setErrors((prev) => ({
                      ...prev,
                      maxParticipants: undefined,
                    }))
                }}
                conditionsInput={form.conditionsInput}
                onConditionsChange={form.setConditionsInput}
                errors={form.errors}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white min-[426px]:rounded-b-xl">
          <EventFooter
            eventColor={form.eventColor}
            isLoading={form.isLoading}
            isEditing={!!editEvent}
          />
        </div>
      </form>

      {pendingPayload && (
        <EditChoiceModal
          open={!!pendingPayload}
          onClose={() => setPendingPayload(null)}
          onSelect={(choice) => {
            if (performSaveRef.current) {
              performSaveRef.current(pendingPayload, choice)
            }
            setPendingPayload(null)
          }}
          headerColor={form.eventColor}
        />
      )}
    </Modal>
  )
}

export default CreateEventModal
