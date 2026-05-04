import React from "react"
import { X, User } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetOccurrenceRegistrationsQuery } from "@/store/api/eventsApi"

const ParticipantListModal = ({ open, onClose, occurrenceId }) => {
  const { t } = useLanguage()

  const { data, isLoading, isFetching } = useGetOccurrenceRegistrationsQuery(
    occurrenceId,
    {
      skip: !occurrenceId,
    },
  )

  const participants = data?.registers || []
  const totalCount = data?.totalCount ?? participants.length

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      className="!max-w-[500px] w-full p-0 bg-white rounded-none min-[426px]:rounded-xl shadow-xl overflow-visible"
      bodyClassName="flex-1"
    >
      <div className="relative flex flex-col w-full h-full bg-white rounded-none min-[426px]:rounded-xl max-h-[80vh]">
        {/* Floating close button */}
        <button
          onClick={onClose}
          className="hidden min-[426px]:block absolute -top-4 -right-4 bg-[#B81919] text-white p-1.5 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-50 hover:bg-red-800 transition-colors border-[3px] border-white"
        >
          <X size={18} strokeWidth={4} />
        </button>

        <div className="p-5 border-b border-gray-100 shrink-0 flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              {t.calendar?.participantList || "Danh sách người đăng ký"}
            </h3>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="max-[425px]:flex hidden -mt-1 -mr-2 bg-gray-100 text-gray-500 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {totalCount} {t.calendar?.people || "người"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading || isFetching ? (
            <LoadingSpinner
              className="flex flex-col items-center justify-center py-10"
              text={t.calendar?.loadingParticipants || "Đang tải..."}
            />
          ) : participants.length === 0 ? (
            <div className="text-center text-gray-500 py-10 italic">
              {t.calendar?.noParticipants || "Chưa có người đăng ký"}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {participants.map((p, idx) => (
                <li
                  key={p.accountId || idx}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 overflow-hidden">
                    {p.avatarImageUrl ? (
                      <img
                        src={p.avatarImageUrl}
                        alt={p.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate">
                      {p.username ||
                        t.calendar?.unknownUser ||
                        "Người dùng ẩn danh"}
                    </span>
                    {p.email && (
                      <span className="text-sm text-[#606060] truncate">
                        {p.email}
                      </span>
                    )}
                  </div>
                  {/* {p.roleName && (
                    <span className="text-sm text-[#606060] shrink-0">
                      {p.roleName}
                    </span>
                  )} */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ParticipantListModal
