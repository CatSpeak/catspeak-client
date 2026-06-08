import React, { useState } from "react"
import {
  formatTime,
  formatLocation,
  FREQUENCY_LABEL,
} from "../../utils/eventFormatters"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useCancelEventOccurrenceMutation } from "@/store/api/eventsApi"
import { Trash2, ChevronRight } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import Modal from "@/shared/components/ui/Modal"
import { TIMEZONES } from "../ui/TimezoneDropdown"

const EventDetailBody = ({
  ev,
  event,
  headerColor,
  isLoading,
  onSelectOccurrence,
}) => {
  const { t, language } = useLanguage()
  const { user, isAdmin } = useAuth()
  const localeStr = language === "vi" ? "vi-VN" : "en-US"
  const [cancelOccurrence, { isLoading: isCancelling }] =
    useCancelEventOccurrenceMutation()
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const isCreator = Boolean(
    user &&
    ev &&
    ((user.id != null && ev.creatorId != null && user.id === ev.creatorId) ||
      (user.username != null && ev.creatorName != null && user.username === ev.creatorName) ||
      (user.fullName != null && ev.creatorName != null && user.fullName === ev.creatorName)),
  )

  const handleDeleteOccurrence = async () => {
    if (!confirmDeleteId) return
    try {
      await cancelOccurrence({
        eventId: ev.recurringEventId ?? ev.id,
        occurrenceId: confirmDeleteId,
      }).unwrap()
      setConfirmDeleteId(null)
    } catch (error) {
      console.error("Failed to delete occurrence", error)
    }
  }

  const eventTzId = ev.timezone || "Asia/Ho_Chi_Minh"
  const eventTzObj = TIMEZONES.find((tz) => tz.id === eventTzId)
  const tzOffsetLabel = eventTzObj ? `(${eventTzObj.offset})` : `(${eventTzId})`

  return (
    <div className="relative bg-white text-base overflow-y-auto max-h-[60vh] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]">
      <div className="flex flex-col gap-3 p-6">
        {/* Time */}
        {!ev.isRecurringGroup && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.timeLabel || "Time"}:
            </span>
            <span className="text-[#60060]">
              {formatTime(ev.startTime, eventTzId)} –{" "}
              {formatTime(ev.endTime, eventTzId)} {tzOffsetLabel}
            </span>
          </div>
        )}

        {/* Location / City / Country */}
        {!ev.isRecurringGroup && (
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

              const queryParts = [locationStr, cityStr, countryStr].filter(
                Boolean,
              )
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
                    {locationStr && (
                      <span className="font-medium">{locationStr}</span>
                    )}
                    {(cityStr || countryStr) && (
                      <span
                        className={`text-sm opacity-80 ${locationStr ? "mt-0.5" : ""}`}
                      >
                        {[cityStr, countryStr].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </a>
                </div>
              )
            })()}
          </div>
        )}

        {/* Description */}
        {!ev.isRecurringGroup && ev.description && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.description || "Description"}:
            </span>
            <span className="text-[#60060]">{ev.description}</span>
          </div>
        )}

        {/* Participants */}
        {!ev.isRecurringGroup &&
          (ev.currentParticipants != null || ev.maxParticipants != null) && (
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
        {!ev.isRecurringGroup && ev.conditions && ev.conditions.length > 0 && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.conditions || "Conditions"}:
            </span>
            <div className="flex flex-wrap gap-2">
              {ev.conditions.map((c, index) => (
                <span
                  key={c.id || `cond-${index}`}
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
        {!ev.isRecurringGroup && ev.isRecurring && ev.recurrenceRule && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold min-w-max">
              {t.calendar?.repeatLabel || "Repeat"}:
            </span>
            <div className="text-[#60060] flex gap-1">
              <span>
                {ev.recurrenceRule.frequency &&
                t.calendar?.recurrence?.[
                  ev.recurrenceRule.frequency.toLowerCase()
                ]
                  ? t.calendar.recurrence[
                      ev.recurrenceRule.frequency.toLowerCase()
                    ]
                  : (FREQUENCY_LABEL[ev.recurrenceRule.frequency] ??
                    ev.recurrenceRule.frequency)}
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
                    ).toLocaleDateString(localeStr)}{" "}
                    –{" "}
                    {new Date(
                      ev.recurrenceRule.recurrenceEndDate,
                    ).toLocaleDateString(localeStr)}
                  </span>
                )}
            </div>
          </div>
        )}

        {/* Sub-occurrences */}
        {ev.isRecurringGroup &&
          ev.subOccurrences &&
          ev.subOccurrences.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="font-bold text-lg">
                {t.calendar?.occurrencesList || "Các buổi trong chuỗi"}:
              </span>

              <div className="flex flex-col gap-3">
                {ev.subOccurrences.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() =>
                      onSelectOccurrence && onSelectOccurrence(sub)
                    }
                    className="flex items-center justify-between p-4 rounded-2xl border border-[#F5F5F5] bg-[#F5F5F5] hover:border-[#990011] text-left"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {sub.title || ev.title}
                      </span>
                      <span className="text-[#606060]">
                        {formatTime(sub.startTime, eventTzId)} –{" "}
                        {formatTime(sub.endTime, eventTzId)}{" "}
                        {new Date(sub.startTime).toLocaleDateString(localeStr)}
                      </span>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>

      <Modal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title={t.calendar?.confirmDeleteTitle || "Xác nhận xóa"}
        className="max-w-sm"
      >
        <div className="py-2">
          <p className="text-black">
            {t.calendar?.confirmDeleteOccurrence ||
              "Bạn có chắc chắn muốn xóa buổi này?"}
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-6 mb-2">
          <button
            onClick={() => setConfirmDeleteId(null)}
            disabled={isCancelling}
            className="px-4 py-2 text-sm font-medium text-black bg-[#f2f2f2] rounded-lg hover:bg-[#d9d9d9] transition-colors"
          >
            {t.calendar?.cancel || "Hủy"}
          </button>
          <button
            onClick={handleDeleteOccurrence}
            disabled={isCancelling}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#B81919] rounded-lg hover:bg-red-800 transition-colors disabled:opacity-60 flex items-center min-w-[100px] justify-center"
          >
            {isCancelling
              ? t.calendar?.deleting || "Đang xóa..."
              : t.calendar?.confirm || "Xác nhận"}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default EventDetailBody
