import React from "react"
import { Globe, Lock, RefreshCw, X, User } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const EventDetailHeader = ({ ev, headerColor, onClose }) => {
  const { t } = useLanguage()

  return (
    <div
      className="text-white p-5 rounded-none min-[426px]:rounded-t-xl z-10 relative overflow-hidden flex flex-col"
      style={{ backgroundColor: headerColor }}
    >
      {/* Mobile Close Button */}
      {onClose && (
        <div className="flex justify-end w-full mb-2 max-[425px]:flex hidden -mt-2 -mr-2">
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-white/20 transition-colors rounded-full flex items-center justify-center w-10 h-10"
          >
            <X size={24} />
          </button>
        </div>
      )}
    {/* Visibility & Recurring badges */}
    <div className="flex items-center gap-2 mb-2">
      {ev.visibilityScope === "PUBLIC" ? (
        <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
          <Globe size={12} /> {t.calendar?.public || "Công khai"}
        </span>
      ) : ev.visibilityScope ? (
        <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
          <Lock size={12} /> {t.calendar?.private || "Riêng tư"}
        </span>
      ) : null}

      {ev.isRecurring && (
        <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
          <RefreshCw size={12} /> {t.calendar?.recurring || "Lặp lại"}
        </span>
      )}
    </div>

    {/* Title */}
    <h2 className="text-3xl font-bold relative z-10">
      {ev.title || (
        <span className="opacity-60 italic text-xl">{t.calendar?.noTitle || "Không có tiêu đề"}</span>
      )}
    </h2>

    {/* Creator Name */}
    {ev.creatorName && (
      <div className="flex items-center gap-1.5 text-sm font-medium mt-2 text-white/90 relative z-10">
        <User size={15} />
        <span>{ev.creatorName}</span>
      </div>
    )}
  </div>
  )
}

export default EventDetailHeader
