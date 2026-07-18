import React, { useEffect, memo } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/shared/components/ui/Modal";
import { useGetEventByIdQuery } from "@/store/api/eventsApi";

const EventFetcher = memo(function EventFetcher({ eventId, onReady, onError }) {
  const { data, isLoading, error } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });

  useEffect(() => {
    if (data) onReady(data);
  }, [data, onReady]);

  useEffect(() => {
    if (error) onError(error);
  }, [error, onError]);

  if (isLoading) {
    return (
      <Modal open={true} onClose={() => {}} showCloseButton={false} className="w-max rounded-2xl bg-white shadow-xl overflow-hidden p-0" title={null} headerClassName="hidden" bodyClassName="">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-xl">
          <Loader2 size={32} className="animate-spin text-[#990011]" />
          <p className="text-sm font-semibold text-gray-700">Loading event...</p>
        </div>
      </Modal>
    );
  }

  return null;
});

export default EventFetcher;
