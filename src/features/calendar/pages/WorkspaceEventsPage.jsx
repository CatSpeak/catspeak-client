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

import StatCard from "../components/workspace-events/StatCard"
import RegistrationsModal from "../components/workspace-events/RegistrationsModal"
import EventFetcher from "../components/workspace-events/EventFetcher"
import WorkspaceEventCard from "../components/workspace-events/WorkspaceEventCard"

const WorkspaceEventsContent = ({ userId }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const cal = useMemo(() => t.calendar || {}, [t])

  const currentLang = localStorage.getItem("communityLanguage") || "en"

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [registrationsTarget, setRegistrationsTarget] = useState(null) // { occurrenceId, title }

  // editFetch = { eventId, title } — triggers EventFetcher overlay
  const [editFetch, setEditFetch] = useState(null)

  const { data, isLoading, error } = useGetMyEventsQuery(undefined, {
    skip: !userId,
  })
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation()

  const events = useMemo(() => data?.occurrences || [], [data])

  // Stats
  const stats = useMemo(() => {
    const now = new Date()
    return {
      total: events.length,
      upcoming: events.filter(
        (e) => e.startTime && new Date(e.startTime) >= now
      ).length,
      past: events.filter(
        (e) => e.startTime && new Date(e.startTime) < now
      ).length,
    }
  }, [events])

  // ── handlers ──

  const handleEditClick = useCallback((eventId, title) => {
    setEditFetch({ eventId, title })
  }, [])

  const handleFetchReady = useCallback(
    (fullEvent) => {
      setEditFetch(null)
      const basePath = currentLang
        ? `/${currentLang}/cat-speak/calendar`
        : "/cat-speak/calendar"
      navigate(`${basePath}/create`, {
        state: { editEvent: fullEvent, from: window.location.pathname },
      })
    },
    [navigate, currentLang]
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

      const idToDelete = deleteTarget.recurringEventId ?? deleteTarget.id
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
    const basePath = currentLang
      ? `/${currentLang}/cat-speak/calendar`
      : "/cat-speak/calendar"
    navigate(`${basePath}/create`, {
      state: { from: window.location.pathname }
    })
  }, [navigate, currentLang])

  return (
    <div className="flex flex-col gap-5 text-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl font-bold text-red-900">
          {cal.workspaceEventsTitle || "My Events"}
        </h1>
        <button
          onClick={handleCreateEvent}
          id="create-event-btn"
          className="bg-[#990011] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#80000e] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 text-sm"
        >
          <Plus size={16} />
          <span>{cal.createEvent || "Create Event"}</span>
        </button>
      </div>

      {/* Stats */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            label={cal.workspaceTotalEvents || "Total Events"}
            value={events.length}
          />
          <StatCard
            label={cal.workspaceUpcoming || "Upcoming"}
            value={stats.upcoming}
          />
          <StatCard
            label={cal.workspacePast || "Past"}
            value={stats.past}
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        /* Loading skeletons */
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map((item) => (
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
              <div className="flex gap-2 mt-4">
                <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
                <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
                <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
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
            {cal.workspaceNoEvents || "No events created yet"}
          </h3>
          <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">
            {cal.workspaceNoEventsDesc ||
              "Create your first event to manage it here."}
          </p>
          <button
            onClick={handleCreateEvent}
            className="bg-[#990011] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#80000e] transition-colors flex items-center gap-1.5 text-sm shadow"
          >
            <Plus size={16} />
            <span>{cal.workspaceCreateFirst || "Create First Event"}</span>
          </button>
        </div>
      ) : (
        /* Event grid — 2 columns on sm+ */
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#606060]">
            {events.length === 1
              ? `1 ${cal.event || "event"}`
              : `${events.length} ${cal.event || "event"}s`}
          </p>
          <div className="grid grid-cols-1 gap-4">
            {events.map((event, idx) => (
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
        </div>
      )}

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

const WorkspaceEventsPage = () => {
  const { user } = useAuth()
  const userId = user?.accountId

  return (
    <WorkspaceEventsContent key={userId || "anonymous"} userId={userId} />
  )
}

export default WorkspaceEventsPage

