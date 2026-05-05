import React from "react"
import { formatTime, formatLocation, FREQUENCY_LABEL } from "../../utils/eventFormatters"
import { useLanguage } from "@/shared/context/LanguageContext"

const EventDetailBody = ({ ev, event, headerColor, isLoading }) => {
  const { t } = useLanguage()

  return (
    <div className="p-5 relative bg-white text-base overflow-y-auto max-h-[60vh]">
      <div className="flex flex-col gap-3 text-black">
        {/* Time */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold min-w-max">
            {t.calendar?.timeLabel || "Time"}:
          </span>
          <span className="text-[#60060]">
            {formatTime(ev.startTime)} – {formatTime(ev.endTime)} (GMT +07:00)
          </span>
        </div>

        {/* Location / City / Country */}
        <div className="flex flex-col gap-3">
          {(() => {
            const locationStr = ev.location?.trim() || ""
            const cityStr = ev.cityName?.trim() || ""
            const countryStr = ev.countryName?.trim() || ""

            if (!locationStr && !cityStr && !countryStr) {
              return (
                <div className="flex items-baseline gap-2">
                  <span className="font-bold min-w-max">
                    {t.calendar?.location || "Location"}:
                  </span>
                  <span className="text-[#60060]">
                    {t.calendar?.notAssigned || "Not assigned"}
                  </span>
                </div>
              )
            }

            const queryParts = [locationStr, cityStr, countryStr].filter(Boolean)
            const queryStr = queryParts.join(", ")

            const isUrl =
              /^https?:\/\//i.test(locationStr) ||
              locationStr.includes("google.com/maps") ||
              locationStr.includes("maps.app.goo.gl")

            const mapUrl = isUrl
              ? locationStr.startsWith("http")
                ? locationStr
                : `https://${locationStr}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`

            return (
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-max">
                  {t.calendar?.location || "Location"}:
                </span>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col hover:opacity-80 transition-opacity"
                  style={{ color: headerColor }}
                >
                  {locationStr && <span className="font-medium">{locationStr}</span>}
                  {(cityStr || countryStr) && (
                    <span className={`text-sm opacity-80 ${locationStr ? "mt-0.5" : ""}`}>
                      {[cityStr, countryStr].filter(Boolean).join(", ")}
                    </span>
                  )}
                </a>
              </div>
            )
          })()}
        </div>

        {/* Description */}
        {ev.description && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.description || "Description"}:
            </span>
            <span className="text-[#60060]">{ev.description}</span>
          </div>
        )}

        {/* Participants */}
        {(ev.currentParticipants != null || ev.maxParticipants != null) && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.registeredCount || "Registered amount"}:
            </span>
            <span className="text-[#60060]">
              {ev.currentParticipants ?? 0}/{ev.maxParticipants ?? "∞"}
            </span>
          </div>
        )}

        {/* Conditions */}
        {ev.conditions && ev.conditions.length > 0 && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.conditions || "Conditions"}:
            </span>
            <div className="flex flex-wrap gap-2">
              {ev.conditions.map((c) => (
                <span
                  key={c.id}
                  title={c.description || undefined}
                  className="px-3 py-1 rounded-full text-white text-sm flex items-center justify-center"
                  style={{ backgroundColor: headerColor }}
                >
                  {c.title || c.conditionType || c.category || `#${c.id}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recurrence */}
        {ev.isRecurring && ev.recurrenceRule && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.repeatLabel || "Repeat"}:
            </span>
            <div className="text-[#60060] flex gap-1">
              <span>
                {FREQUENCY_LABEL[ev.recurrenceRule.frequency] ??
                  ev.recurrenceRule.frequency}
                {ev.recurrenceRule.interval > 1
                  ? ` (${t.calendar?.every || "every"} ${ev.recurrenceRule.interval} ${t.calendar?.intervalUnit?.default || "time"})`
                  : ""}
                {ev.recurrenceRule.recurrenceStartDate &&
                ev.recurrenceRule.recurrenceEndDate
                  ? ","
                  : ""}
              </span>
              {ev.recurrenceRule.recurrenceStartDate &&
                ev.recurrenceRule.recurrenceEndDate && (
                  <span className="text-[#60060]">
                    {new Date(
                      ev.recurrenceRule.recurrenceStartDate,
                    ).toLocaleDateString("vi-VN")}
                    {" – "}
                    {new Date(
                      ev.recurrenceRule.recurrenceEndDate,
                    ).toLocaleDateString("vi-VN")}
                  </span>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDetailBody
