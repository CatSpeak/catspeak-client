import { useLanguage } from "@/shared/context/LanguageContext"

const EventFooter = ({ eventColor, isLoading, isEditing }) => {
  const { t } = useLanguage()
  const cal = t.calendar

  return (
    <div className="p-5 bg-white rounded-none min-[426px]:rounded-b-[20px]">
      <button
        type="submit"
        disabled={isLoading}
        className="w-full text-white font-bold text-base h-10 rounded-[6px] hover:opacity-90 transition-all duration-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: eventColor }}
      >
        {isEditing
          ? isLoading
            ? cal.updatingEvent
            : cal.updateEvent
          : isLoading
            ? cal.creatingEvent
            : cal.createEventBtn}
      </button>
    </div>
  )
}

export default EventFooter
