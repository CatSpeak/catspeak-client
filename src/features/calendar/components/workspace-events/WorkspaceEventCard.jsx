import React, { memo, useCallback } from "react";
import { Clock, MapPin, Pencil, Trash2, Users, Calendar as CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { formatLocation } from "../../utils/eventFormatters";

const WorkspaceEventCard = memo(function WorkspaceEventCard({
  event,
  cal,
  onEditClick,
  onDeleteClick,
  onViewRegistrations,
}) {
  const isPast = event.startTime && dayjs(event.startTime).isBefore(dayjs());
  const isRecurring = event.isRecurringGroup === true;

  // Which occurrence ID to use for registrations modal
  const occIdForReg = isRecurring
    ? event.subOccurrences?.[0]?.id ?? null
    : event.id ?? null;

  const editEventId = event.eventId ?? event.recurringEventId ?? event.id;

  const location =
    (isRecurring
      ? event.subOccurrences?.[0]?.location
      : (event.isOnline ? "Online" : formatLocation(event.location, event.cityName, event.countryName) || event.location)) || null;

  // times
  const startDateStr = event.startTime
    ? dayjs(event.startTime).format("HH:mm (DD/MM/YYYY)")
    : null;
  const endDateStr = event.endTime
    ? dayjs(event.endTime).format("HH:mm (DD/MM/YYYY)")
    : null;

  const titleChar = (event.title || "E")[0].toUpperCase();

  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      onEditClick(editEventId, event.title);
    },
    [onEditClick, editEventId, event.title]
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDeleteClick(event);
    },
    [onDeleteClick, event]
  );

  const handleViewReg = useCallback(
    (e) => {
      e.stopPropagation();
      if (occIdForReg) onViewRegistrations(occIdForReg, event.title);
    },
    [onViewRegistrations, occIdForReg, event.title]
  );

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-[#E5E5E5] hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Card body — match CreateEventPage preview card layout */}
      <div className="flex items-start gap-3">
        {/* Circular thumbnail — matches preview card */}
        <div
          className="w-14 h-14 rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-gray-100"
          style={{ backgroundColor: event.thumbnailUrl ? "transparent" : (event.color || "#990011") }}
        >
          {event.thumbnailUrl ? (
            <img src={event.thumbnailUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xl font-bold">{titleChar}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-base font-semibold text-black truncate flex-1 min-w-[120px] max-w-full">
              {event.title || cal?.noTitle || "No title"}
            </span>
            {isPast && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 shrink-0">
                {cal?.workspacePast || "Past"}
              </span>
            )}
            {isRecurring && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 shrink-0">
                {cal?.recurring || "Recurring"}
              </span>
            )}
          </div>

          {/* Start → End time */}
          {(startDateStr || endDateStr) && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-1">
              <Clock size={13} className="shrink-0" />
              <span className="truncate max-w-[80vw]">
                {startDateStr || "--:--"}
                {endDateStr ? ` - ${endDateStr}` : ""}
              </span>
            </div>
          )}

          {/* Location */}
          {location ? (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-0.5">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate max-w-[80vw]">{location}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-0.5 italic">
              <MapPin size={13} />
              <span>{cal?.location || "Location"}</span>
            </div>
          )}

          {/* Occurrences count for recurring */}
          {isRecurring && (event.subOccurrences?.length ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <CalendarIcon size={11} />
              <span>
                {event.subOccurrences.length}{" "}
                {cal?.workspaceOccurrences || "occurrences"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        {/* View registrations */}
        {occIdForReg && (
          <button
            onClick={handleViewReg}
            className="flex flex-1 py-2 sm:py-2.5 px-4 items-center justify-center gap-1.5 rounded-xl bg-[#F2F2F2] hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors text-xs font-medium"
            title={cal?.workspaceViewRegistrations || "View registrations"}
          >
            <Users size={14} className="shrink-0" />
            <span className="truncate">{event.registeredCount || 0} {cal?.workspaceRegistrants || "Đã đăng ký"}</span>
          </button>
        )}

        {/* Edit */}
        <button
          onClick={handleEdit}
          disabled={isPast}
          className={`flex flex-1 py-2 sm:py-2.5 px-4 items-center justify-center gap-1.5 rounded-xl text-xs font-medium transition-colors ${
            isPast
              ? "bg-gray-50 text-gray-400 cursor-not-allowed"
              : "bg-[#F2F2F2] hover:bg-amber-50 hover:text-amber-600 text-gray-700"
          }`}
          title={isPast ? "Không thể chỉnh sửa sự kiện đã qua" : (cal?.workspaceEditEvent || "Edit event")}
        >
          <Pencil size={14} className="shrink-0" />
          <span className="truncate">{cal?.edit || "Edit"}</span>
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="flex flex-1 py-2 sm:py-2.5 px-4 items-center justify-center gap-1.5 rounded-xl bg-[#F2F2F2] hover:bg-red-50 hover:text-red-600 text-gray-700 transition-colors text-xs font-medium"
          title={cal?.workspaceDeleteEvent || "Delete event"}
        >
          <Trash2 size={14} className="shrink-0" />
          <span className="truncate">{cal?.workspaceDeleteEvent || "Delete"}</span>
        </button>
      </div>
    </div>
  );
});

export default WorkspaceEventCard;
