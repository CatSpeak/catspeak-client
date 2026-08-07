import React, { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Calendar, Plus } from "lucide-react"

import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import Modal from "@/shared/components/ui/Modal"

import {
  useGetMyEventsQuery,
  useDeleteEventMutation,
} from "@/store/api/eventsApi"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import Pagination from '@/shared/components/ui/navigation/Pagination'

import RegistrationsModal from "../workspace-events/RegistrationsModal"
import EventFetcher from "../workspace-events/EventFetcher"
import WorkspaceEventCard from "../workspace-events/WorkspaceEventCard"

const EventTab = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const cal = useMemo(() => t.calendar || {}, [t])

  const { user } = useAuth()
  const userId = user?.accountId

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [registrationsTarget, setRegistrationsTarget] = useState(null) // { occurrenceId, title }
  const [editFetch, setEditFetch] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error } = useGetMyEventsQuery(undefined, {
    skip: !userId,
  })
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation()

  const events = useMemo(() => data?.occurrences || [], [data])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(events.length / pageSize))
  const paginatedEvents = useMemo(() => {
    return events.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [events, currentPage, pageSize])

  // Handlers
  const handleEditClick = useCallback((eventId, title) => {
    setEditFetch({ eventId, title })
  }, [])

  const handleFetchReady = useCallback(
    (fullEvent) => {
      setEditFetch(null)
      navigate(`/workspace/events/create`, {
        state: { editEvent: fullEvent, from: window.location.pathname },
      })
    },
    [navigate]
  )

  const handleFetchError = useCallback(
    (err) => {
      setEditFetch(null)
      toast.error(
        err?.data?.message || cal.deleteError || "Failed to load event."
      )
    },
    [cal]
  )

  const handleDeleteClick = useCallback((event) => {
    setDeleteTarget(event)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    const toastId = toast.loading(cal.workspaceDeleting || "Deleting...")
    try {
      const idToDelete = deleteTarget.eventId ?? deleteTarget.recurringEventId ?? deleteTarget.id
      await deleteEvent(idToDelete).unwrap()
      toast.success(cal.deleteSuccess || "Event deleted!", { id: toastId })
      setDeleteTarget(null)
    } catch (err) {
      console.error("[WorkspaceEvents] Delete error:", err)
      toast.error(
        err?.data?.message || cal.deleteError || "Failed to delete.",
        { id: toastId }
      )
    }
  }, [deleteEvent, deleteTarget, cal])

  const handleViewRegistrations = useCallback((occurrenceId, title) => {
    setRegistrationsTarget({ occurrenceId, title })
  }, [])

  const handleCreateEvent = useCallback(() => {
    navigate(`/workspace/events/create`, {
      state: { from: window.location.pathname }
    })
  }, [navigate])

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 text-gray-800">
      {/* Content */}
      <div>
        {isLoading ? (
          /* Loading skeletons */
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl p-4 border border-[#e5e5e5] shadow-sm animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorMessage
            message={
              error?.data?.message || "Failed to load events. Please try again."
            }
          />
        ) : events.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center p-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Calendar size={48} className="text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-700 mb-1">
              {cal.workspaceNoEvents || "Chưa có sự kiện nào"}
            </h3>
            <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">
              {cal.workspaceNoEventsDesc || "Tạo sự kiện đầu tiên của bạn để quản lý tại đây."}
            </p>
            <button
              onClick={handleCreateEvent}
              className="bg-[#990011] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#80000e] transition-colors flex items-center gap-1.5 text-sm shadow"
            >
              <Plus size={16} />
              <span>{cal.workspaceCreateFirst || "Tạo sự kiện đầu tiên"}</span>
            </button>
          </div>
        ) : (
          /* Event grid */
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#606060]">
              {events.length === 1
                ? `1 ${cal.event || "sự kiện"}`
                : `${events.length} ${cal.event || "sự kiện"}`}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paginatedEvents.map((event, idx) => (
                <WorkspaceEventCard
                  key={event.recurringEventId ?? event.id ?? idx}
                  event={event}
                  cal={cal}
                  onEditClick={handleEditClick}
                  onDeleteClick={handleDeleteClick}
                  onViewRegistrations={handleViewRegistrations}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChangePage={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit fetch overlay */}
      {editFetch && (
        <EventFetcher
          eventId={editFetch.eventId}
          onReady={handleFetchReady}
          onError={handleFetchError}
        />
      )}

      {/* Delete confirm dialog */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={cal.workspaceDeleteConfirmTitle || "Delete this event?"}
        className="w-[90vw] max-w-sm"
        bodyClassName="px-6 py-2 text-sm text-gray-500"
        footer={
          <div className="flex gap-3 justify-end pt-4 pb-2">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              {cal.workspaceDeleteCancel || "Cancel"}
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1.5"
            >
              {isDeleting && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {isDeleting
                  ? cal.workspaceDeleting || "Deleting..."
                  : cal.workspaceDeleteConfirm || "Delete"}
              </span>
            </button>
          </div>
        }
      >
        {cal.workspaceDeleteConfirmMsg ||
          "This event and all its occurrences will be permanently deleted and cannot be undone."}{" "}
        <strong className="text-gray-700">
          &ldquo;{deleteTarget?.title}&rdquo;
        </strong>
      </Modal>

      {/* Registrations modal */}
      {registrationsTarget && (
        <RegistrationsModal
          occurrenceId={registrationsTarget.occurrenceId}
          eventTitle={registrationsTarget.title}
          onClose={() => setRegistrationsTarget(null)}
          cal={cal}
        />
      )}
    </div>
  )
}

export default EventTab