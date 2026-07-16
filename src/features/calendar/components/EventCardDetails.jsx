import React, { useState } from "react";
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner";
import {
  useGetEventByIdQuery,
  useGetEventOccurrenceByIdQuery,
} from "@/store/api/eventsApi";
import EventDetailBody from "./EventDetailModal/EventDetailBody";
import EventDetailFooter from "./EventDetailModal/EventDetailFooter";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";

const EventCardDetails = ({ event, onClose, onActionComplete }) => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t } = useLanguage();
  const [overrideEvent, setOverrideEvent] = useState(null);

  // Component unmounts when selection changes, so no need for useEffect reset.

  const currentEvent = overrideEvent || event;

  const eventId = currentEvent?.eventId ?? currentEvent?.id;
  const occurrenceId = currentEvent?.occurrenceId;

  const {
    data: occurrenceDetail,
    isLoading: isLoadingOccurrence,
    isFetching: isFetchingOccurrence,
  } = useGetEventOccurrenceByIdQuery(occurrenceId, {
    skip: !occurrenceId,
  });

  // Prevent 404 GET errors if eventId is accidentally an occurrenceId 
  let actualEventId = eventId;
  if (occurrenceDetail?.eventId) {
    actualEventId = occurrenceDetail.eventId;
  } else if (occurrenceId && eventId === occurrenceId) {
    actualEventId = null;
  }

  const {
    data: detail,
    isLoading: isLoadingEvent,
    isFetching: isFetchingEvent,
  } = useGetEventByIdQuery(actualEventId, {
    skip: !actualEventId,
  });

  const isLoading =
    isLoadingEvent ||
    isLoadingOccurrence ||
    isFetchingEvent ||
    isFetchingOccurrence;

  if (!event) return null;

  let ev;
  if (occurrenceId) {
    ev = {
      ...currentEvent,
      ...detail,
      ...occurrenceDetail,
      // Retain the recurrence context from the parent so users know this is part of a series
      isRecurring:
        occurrenceDetail?.isRecurring ||
        detail?.isRecurring ||
        event?.isRecurring,
      recurrenceRule:
        occurrenceDetail?.recurrenceRule ||
        detail?.recurrenceRule ||
        event?.recurrenceRule,
      timezone:
        occurrenceDetail?.timezone || detail?.timezone || event?.timezone,
      isRecurringGroup: false,
      subOccurrences: undefined,
    };
  } else {
    ev = {
      ...currentEvent,
      ...detail,
    };
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner text={t.calendar?.loadingDetails || "Loading details..."} />
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-gray-200">
      <div className="max-h-[500px] overflow-y-auto">
        <EventDetailBody
          ev={ev}
          event={currentEvent}
          isLoading={isLoading}
          onSelectOccurrence={(sub) => {
            setOverrideEvent({
              eventId: actualEventId || eventId,
              occurrenceId: sub.id,
              ...sub,
            });
          }}
        />
      </div>

      {!(!occurrenceId && ev?.isRecurringGroup) && (
        <div className="shrink-0 bg-white rounded-b-2xl border-t border-gray-100">
          <EventDetailFooter
            eventId={actualEventId || eventId}
            event={ev}
            onClose={onClose}
            onActionComplete={onActionComplete}
            onEdit={() => {
              const basePath = lang ? `/${lang}/cat-speak/calendar` : "/cat-speak/calendar";
              navigate(`${basePath}/create`, {
                state: { editEvent: ev },
              });
              onClose();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventCardDetails;
