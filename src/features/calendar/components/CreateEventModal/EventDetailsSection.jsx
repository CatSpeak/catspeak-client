import { MapPin } from "lucide-react"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useLanguage } from "@/shared/context/LanguageContext"

const EventDetailsSection = ({
  title,
  onTitleChange,
  eventColor,
  eventLocation,
  onLocationChange,
  description,
  onDescriptionChange,
  maxParticipants,
  onMaxParticipantsChange,
  conditionsInput,
  onConditionsChange,
  errors = {},
}) => {
  const { t } = useLanguage()
  const cal = t.calendar

  const handleOpenMaps = () => {
    const loc = eventLocation.trim()
    if (!loc) return
    const isUrl =
      /^https?:\/\//i.test(loc) ||
      loc.includes("google.com/maps") ||
      loc.includes("maps.app.goo.gl")
    const url = isUrl
      ? loc.startsWith("http")
        ? loc
        : `https://${loc}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Title */}
      <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] font-bold text-base text-gray-900 shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
          {cal.eventName}
        </div>
        <div className="flex-1 flex flex-col w-full">
          <TextInput
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={cal.eventNamePlaceholder}
            variant="square"
            color={eventColor}
            containerClassName="w-full"
            error={errors.title}
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] font-bold text-base text-gray-900 shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
          {cal.location}
        </div>
        <div className="flex-1 flex flex-col w-full relative">
          <TextInput
            value={eventLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder={cal.locationPlaceholder}
            variant="square"
            color={eventColor}
            containerClassName="w-full"
            className="pr-10"
            error={errors.eventLocation}
          />
          <button
            type="button"
            onClick={handleOpenMaps}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-[#B91264] transition-colors"
            title={cal.openMaps}
          >
            <MapPin size={20} />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] font-bold text-base text-gray-900 shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
          {cal.description}
        </div>
        <div className="flex-1 flex flex-col w-full">
          <TextInput
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={cal.descriptionPlaceholder}
            variant="square"
            color={eventColor}
            containerClassName="w-full"
            error={errors.description}
          />
        </div>
      </div>

      {/* Max participants */}
      <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] font-bold text-base text-gray-900 shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
          {cal.maxParticipants}
        </div>
        <div className="flex items-start w-full">
          <div className="flex items-start flex-1">
            <TextInput
              type="number"
              value={maxParticipants}
              onChange={(e) => onMaxParticipantsChange(e.target.value)}
              variant="square"
              color={eventColor}
              className="text-center !px-2"
              containerClassName="w-32"
              error={errors.maxParticipants}
            />
            <span className="text-[#606060] ml-3 mt-[10px]">{cal.guest}</span>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="flex items-start max-[425px]:flex-col max-[425px]:gap-1">
        <div className="w-[150px] font-bold text-base text-gray-900 shrink-0 pt-[10px] max-[425px]:pt-0 max-[425px]:w-full">
          {cal.conditions}
        </div>
        <div className="flex-1 flex flex-col gap-1 w-full relative">
          <TextInput
            value={conditionsInput}
            onChange={(e) => onConditionsChange(e.target.value)}
            placeholder={cal.conditionsPlaceholder}
            variant="square"
            color={eventColor}
            containerClassName="w-full"
          />
          {conditionsInput.trim() && (
            <div className="flex flex-wrap gap-1 mt-1">
              {conditionsInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: eventColor }}
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket price (static / coming soon) */}
      <div className="flex items-center max-[425px]:flex-col max-[425px]:items-start max-[425px]:justify-between max-[425px]:gap-1">
        <div className="w-[150px] font-bold text-base text-gray-900 shrink-0 max-[425px]:w-full">
          {cal.ticketPrice}
        </div>
        <div className="flex-1 flex items-center justify-between w-full h-10 border border-transparent max-[425px]:p-0">
          <span className="text-[#606060] text-base">{cal.free}</span>
          <button
            type="button"
            disabled
            className="font-bold text-base transition-opacity duration-300 opacity-50 cursor-not-allowed"
            style={{ color: eventColor }}
          >
            {cal.edit}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventDetailsSection
