import { X } from "lucide-react"
import { IconLogo } from "@/shared/assets/icons/logo"
import ColorDropdown from "../ui/ColorDropdown"
import VisibilityDropdown from "../ui/VisibilityDropdown"

const EventHeader = ({
  isEditing,
  t,
  eventColor,
  onColorChange,
  visibility,
  onVisibilityChange,
  onClose,
}) => (
  <div
    className="text-white pt-5 sm:pt-6 pb-5 px-5 sm:px-8 rounded-none min-[426px]:rounded-t-xl z-20 relative flex flex-col transition-colors duration-300"
    style={{ backgroundColor: eventColor }}
  >
    {/* Mobile Close Button */}
    <div className="flex justify-end w-full mb-2 max-[425px]:flex hidden -mt-2 -mr-2">
      <button
        type="button"
        onClick={onClose}
        className="text-white hover:bg-white/20 transition-colors rounded-full flex items-center justify-center w-10 h-10"
      >
        <X size={24} />
      </button>
    </div>

    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <h2 className="text-[22px] font-bold uppercase w-[220px]">
          {isEditing ? t.calendar?.editEvent : t.calendar?.createEvent}
        </h2>
        {/* <span className="text-[22px] font-light">|</span>
          <img
            src={IconLogo}
            alt="Location Logo"
            className="w-6 h-6 object-cover"
          />
          <span className="text-[17px] opacity-90 font-medium whitespace-nowrap">
            Đại học FPT
          </span> */}
      </div>

      <div className="flex items-center gap-3 pr-2">
        <ColorDropdown value={eventColor} onChange={onColorChange} />
        <VisibilityDropdown
          value={visibility}
          onChange={onVisibilityChange}
          color={eventColor}
        />
      </div>
    </div>
  </div>
)

export default EventHeader
