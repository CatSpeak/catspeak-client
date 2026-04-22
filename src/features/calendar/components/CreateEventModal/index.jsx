import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useEventForm } from "../../hooks/useEventForm"
import { X } from "lucide-react"
import EventHeader from "./EventHeader"
import EventDateTimeSection from "./EventDateTimeSection"
import EventDetailsSection from "./EventDetailsSection"
import EventFooter from "./EventFooter"

const CreateEventModal = ({ onClose, editEvent }) => {
  const form = useEventForm(onClose, editEvent)
  const { t } = useLanguage()

  return (
    <Modal
      open
      onClose={onClose}
      showCloseButton={false}
      className="p-0 !max-w-[900px] w-full bg-[#F2F2F2] rounded-none min-[426px]:rounded-xl overflow-visible max-[425px]:h-full"
    >
      <form
        onSubmit={form.handleSubmit}
        className="relative flex flex-col w-full bg-white rounded-none min-[426px]:rounded-xl min-[426px]:max-h-[90vh] h-full"
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

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
          {/* Body */}
          <div className="px-5 sm:px-8 pt-8 pb-6 relative bg-white text-base">
            <div className="flex flex-col gap-5">
              <EventDateTimeSection
                eventColor={form.eventColor}
                startTime={form.startTime}
                onStartTimeChange={form.setStartTime}
                endTime={form.endTime}
                onEndTimeChange={form.setEndTime}
                selectedTimezone={form.selectedTimezone}
                onTimezoneChange={form.setSelectedTimezone}
                recurrenceOption={form.recurrenceOption}
                onRecurrenceChange={form.setRecurrenceOption}
                recurrenceInterval={form.recurrenceInterval}
                onRecurrenceIntervalChange={form.setRecurrenceInterval}
                selectedDays={form.selectedDays}
                onSelectedDaysChange={form.setSelectedDays}
                recurrenceEndDate={form.recurrenceEndDate}
                onRecurrenceEndDateChange={form.setRecurrenceEndDate}
              />

              <EventDetailsSection
                title={form.title}
                onTitleChange={(val) => {
                  form.setTitle(val)
                  if (form.errors?.title) form.setErrors(prev => ({ ...prev, title: undefined }))
                }}
                eventColor={form.eventColor}
                eventLocation={form.eventLocation}
                onLocationChange={(val) => {
                  form.setEventLocation(val)
                  if (form.errors?.eventLocation) form.setErrors(prev => ({ ...prev, eventLocation: undefined }))
                }}
                description={form.description}
                onDescriptionChange={form.setDescription}
                maxParticipants={form.maxParticipants}
                onMaxParticipantsChange={(val) => {
                  form.setMaxParticipants(val)
                  if (form.errors?.maxParticipants) form.setErrors(prev => ({ ...prev, maxParticipants: undefined }))
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
    </Modal>
  )
}

export default CreateEventModal
