import React, { memo } from "react";
import { Users } from "lucide-react";
import Modal from "@/shared/components/ui/Modal";
import { useGetOccurrenceRegistrationsQuery } from "@/store/api/eventsApi";

const RegistrationsModal = memo(function RegistrationsModal({
  occurrenceId,
  eventTitle,
  onClose,
  cal,
}) {
  const { data, isLoading } = useGetOccurrenceRegistrationsQuery(occurrenceId, {
    skip: !occurrenceId,
  });

  const registrants = data?.registers || [];

  return (
    <Modal
      open={!!occurrenceId}
      onClose={onClose}
      className="w-[90vw] sm:w-full max-w-md rounded-2xl bg-white shadow-xl min-[426px]:border min-[426px]:border-gray-100 flex flex-col overflow-hidden max-h-[70vh] sm:max-h-[80vh]"
      headerClassName="flex items-center justify-between px-5 py-4 border-b border-gray-100"
      bodyClassName="overflow-y-auto flex-1 p-5 min-h-[200px]"
      title={
        <div className="min-w-0">
          <span className="text-base font-bold text-gray-800 block">
            {cal?.workspaceRegistrationsModal || "Registrations for"}{" "}
            <span className="text-[#990011] truncate">{eventTitle}</span>
          </span>
          <span className="text-xs text-gray-400 mt-0.5 block font-normal">
            {registrants.length}{" "}
            {registrants.length !== 1
              ? (cal?.workspaceRegistrant || "Registrant") + "s"
              : cal?.workspaceRegistrant || "Registrant"}
          </span>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-32" />
                <div className="h-2.5 bg-gray-100 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : registrants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Users size={36} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">
            {cal?.workspaceNoRegistrations || "No registrations yet"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {registrants.map((r, idx) => (
            <div
              key={r.accountId || idx}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#990011]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {r.avatarUrl ? (
                  <img
                    src={r.avatarUrl}
                    alt={r.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-[#990011]">
                    {(r.username || r.fullName || "?")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {r.fullName || r.username || "Unknown"}
                </p>
                {r.username && r.fullName && (
                  <p className="text-xs text-gray-400 truncate">
                    @{r.username}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
});

export default RegistrationsModal;
