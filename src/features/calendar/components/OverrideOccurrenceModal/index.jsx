import React from "react"
import { X, Calendar } from "lucide-react"
import dayjs from "dayjs"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import TimeDropdown from "../ui/TimeDropdown"
import { useOverrideForm } from "../../hooks/useOverrideForm"
import { formatTime } from "@/shared/utils/dateFormatter"
import { useLanguage } from "@/shared/context/LanguageContext"

const toDate = (value) =>
  value && typeof value.toDate === "function" ? value.toDate() : value

import Modal from "@/shared/components/ui/Modal"

const OverrideOccurrenceModal = ({ event, occurrenceId, onClose }) => {
  const { t } = useLanguage()
  const cal = t.calendar || {}
  const headerColor = event?.color || "#B91264"
  const eventId = event?.eventId ?? event?.id

  const {
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
    isLoading,
  } = useOverrideForm(eventId, occurrenceId, event, onClose)

  const isTimeInvalid = dayjs(toDate(endTime)).isBefore(dayjs(toDate(startTime))) || dayjs(toDate(endTime)).isSame(dayjs(toDate(startTime)))

  return (
    <Modal
      open
      onClose={onClose}
      showCloseButton={false}
      className="p-0 !max-w-[700px] w-full bg-[#F2F2F2] rounded-none min-[426px]:rounded-xl overflow-visible"
      bodyClassName="flex-1"
    >
      <div className="relative flex flex-col w-full bg-white rounded-none min-[426px]:rounded-xl min-[426px]:max-h-[90vh] h-full">
        {/* Floating close button */}
        <button
          onClick={onClose}
          type="button"
          className="hidden min-[426px]:block absolute -top-5 -right-5 bg-[#B81919] text-white p-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-50 hover:bg-red-800 transition-colors border-[4px] border-white"
        >
          <X size={26} strokeWidth={4} />
        </button>

        {/* Header */}
        <div
          className="w-full flex justify-between items-center px-4 py-3 shrink-0 rounded-t-none min-[426px]:rounded-t-xl"
          style={{ backgroundColor: headerColor, color: "white" }}
        >
          <div className="flex items-center gap-2">
            <Calendar size={24} />
            <h2 className="text-lg font-bold">
              {cal.editOccurrence}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="min-[426px]:hidden hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col gap-5">
          <p className="text-sm text-gray-500 mb-2">
            {cal.editOccurrenceWarning}
          </p>

          {/* Start / End time */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-gray-900 w-[120px]">
                {cal.startTime}
              </span>
              <div className="flex items-center gap-2">
                <DatePicker
                  value={toDate(startTime)}
                  disabled={true}
                  color={headerColor}
                />
                <TimeDropdown
                  value={formatTime(toDate(startTime))}
                  color={headerColor}
                  onChange={(hhmm) => {
                    const [h, m] = hhmm.split(":")
                    setStartTime(
                      dayjs(toDate(startTime))
                        .hour(Number(h))
                        .minute(Number(m))
                        .second(0)
                        .toDate(),
                    )
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-gray-900 w-[120px]">
                {cal.endTime}
              </span>
              <div className="flex items-center gap-2">
                <DatePicker
                  value={toDate(endTime)}
                  disabled={true}
                  color={headerColor}
                />
                <TimeDropdown
                  value={formatTime(toDate(endTime))}
                  color={headerColor}
                  onChange={(hhmm) => {
                    const [h, m] = hhmm.split(":")
                    setEndTime(
                      dayjs(toDate(endTime))
                        .hour(Number(h))
                        .minute(Number(m))
                        .second(0)
                        .toDate()
                    )
                  }}
                />
              </div>
            </div>
            {isTimeInvalid && (
              <p className="text-red-500 text-sm mt-1">
                {cal.endTimeBeforeStartTime}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-4 mt-2 max-[425px]:flex-col max-[425px]:items-start max-[425px]:gap-1">
            <span className="font-bold text-gray-900 w-[120px] max-[425px]:w-full">
              {cal.location}
            </span>
            <TextInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={cal.locationPlaceholder}
              variant="square"
              containerClassName="flex-1 max-[425px]:w-full"
            />
          </div>

          {/* Max Participants */}
          <div className="flex items-center gap-4 max-[425px]:flex-col max-[425px]:items-start max-[425px]:gap-1">
            <span className="font-bold text-gray-900 w-[120px] max-[425px]:w-full">
              {cal.maxParticipants}
            </span>
            <TextInput
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              variant="square"
              containerClassName="w-24 max-[425px]:w-full"
              className="text-center"
            />
          </div>

          {/* Cancel toggles & Reason */}
          <div className="flex flex-col gap-4 mt-4 border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer w-fit font-bold text-red-600">
              <input
                type="checkbox"
                checked={isCancelled}
                onChange={(e) => setIsCancelled(e.target.checked)}
                className="accent-red-600 w-4 h-4 cursor-pointer"
              />
              {cal.cancelOccurrenceToggle}
            </label>

            <div className="flex flex-col gap-1 w-full pl-6">
              <span className="text-sm font-semibold text-gray-800">
                {cal.reason}
              </span>
              <TextInput
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder={cal.reasonPlaceholder}
                variant="square"
                containerClassName="w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-none min-[426px]:rounded-b-xl border-t shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {cal.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || isTimeInvalid}
            className={`px-5 py-2 font-semibold text-white rounded-lg transition-colors flex items-center justify-center min-w-[120px] ${isTimeInvalid ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{
              backgroundColor: isLoading || isTimeInvalid ? "#9CA3AF" : headerColor,
            }}
          >
            {isLoading ? cal.processing : cal.save}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default OverrideOccurrenceModal
