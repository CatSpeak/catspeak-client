import React, { useMemo, useState } from "react"
import {
  AppWindow,
  Loader2,
  Monitor,
  RefreshCw,
  ShieldAlert,
} from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import {
  findScreenSource,
  groupScreenSources,
  isMacScreenPermissionRequired,
} from "@/features/video-call/utils/desktopScreenShare"

const TAB_SCREENS = "screens"
const TAB_WINDOWS = "windows"

const DesktopScreenPickerModal = ({
  open,
  onClose,
  onConfirm,
  sources = [],
  permission = null,
  loading = false,
  error = null,
  isPending = false,
  onRefresh,
  onOpenPermissionSettings,
  t,
}) => {
  const pickerT = t?.rooms?.videoCall?.screenShare?.picker || {}
  const { screens, windows } = useMemo(
    () => groupScreenSources(sources),
    [sources],
  )
  const [activeTab, setActiveTab] = useState(TAB_SCREENS)
  const [tabTouched, setTabTouched] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [prevOpen, setPrevOpen] = useState(open)

  // Reset the picker when it opens again (render-time adjustment; an effect
  // would trigger a cascading render).
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSelectedId(null)
      setActiveTab(TAB_SCREENS)
      setTabTouched(false)
    }
  }

  const defaultTab =
    screens.length > 0 || windows.length === 0 ? TAB_SCREENS : TAB_WINDOWS
  const resolvedTab = tabTouched ? activeTab : defaultTab

  const selectTab = (tabId) => {
    setActiveTab(tabId)
    setTabTouched(true)
  }

  const visibleSources = resolvedTab === TAB_SCREENS ? screens : windows
  const selectedSource = findScreenSource(sources, selectedId)
  const hasSources = screens.length + windows.length > 0
  const needsPermission = isMacScreenPermissionRequired(permission)
  const canConfirm = Boolean(selectedSource) && !isPending && !loading
  const showLoadError = Boolean(error) && !loading && !hasSources

  const tabs = [
    { id: TAB_SCREENS, label: pickerT.screens || "Screens", icon: Monitor, count: screens.length },
    { id: TAB_WINDOWS, label: pickerT.windows || "Windows", icon: AppWindow, count: windows.length },
  ]

  const sourceLabel = (source) => {
    if (source.name) return source.name
    if (source.type === "screen") {
      return (pickerT.screenFallback || "Screen {{id}}").replace(
        "{{id}}",
        source.displayId || "?",
      )
    }
    return pickerT.windowFallback || "Window"
  }

  return (
    <Modal
      open={open}
      onClose={isPending ? undefined : onClose}
      showCloseButton={!isPending}
      title={pickerT.title || "Choose what to share"}
      description={pickerT.description || "Pick a screen or a single window."}
      className="w-full md:max-w-[720px]"
      bodyClassName="px-4 pb-1"
      footerClassName="p-4"
      footer={
        <div className="flex justify-end gap-2">
          <PillButton
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            {pickerT.cancel || "Cancel"}
          </PillButton>
          <PillButton
            variant="primary"
            onClick={() => selectedSource && onConfirm?.(selectedSource)}
            disabled={!canConfirm}
            loading={isPending}
            loadingText={pickerT.sharing || "Starting…"}
          >
            {pickerT.share || "Share"}
          </PillButton>
        </div>
      }
    >
      {needsPermission && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {pickerT.permissionTitle || "Screen Recording permission needed"}
              </p>
              <p className="mt-1 text-sm">
                {pickerT.permissionDescription ||
                  "Allow Catspeak Desktop to record your screen in System Settings, then come back and press Retry. No restart is needed."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <PillButton
                  variant="outline"
                  onClick={onOpenPermissionSettings}
                  disabled={isPending}
                >
                  {pickerT.openSettings || "Open System Settings"}
                </PillButton>
                <PillButton
                  variant="secondary"
                  onClick={onRefresh}
                  disabled={loading || isPending}
                  startIcon={<RefreshCw className="h-4 w-4" />}
                >
                  {pickerT.retry || "Retry"}
                </PillButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = resolvedTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              disabled={isPending}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-cath-red-600 bg-red-50 text-cath-red-700 dark:border-[#FF6B6B] dark:bg-red-950/30 dark:text-[#FF9999]"
                  : "border-border bg-white text-gray-700 hover:bg-gray-50 dark:border-[#3F3F3F] dark:bg-[#272727] dark:text-gray-200 dark:hover:bg-[#333333]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className="text-xs opacity-70">{tab.count}</span>
            </button>
          )
        })}
      </div>

      {error && hasSources && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-[#FF9999]"
        >
          {pickerT.selectFailed ||
            "Could not start sharing this source. Please try again."}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#606060] dark:text-[#AAAAAA]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{pickerT.loading || "Loading screens and windows…"}</span>
        </div>
      ) : showLoadError ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-[#606060] dark:text-[#AAAAAA]">
            {pickerT.loadFailed || "Could not load screens and windows."}
          </p>
          {onRefresh && (
            <PillButton
              variant="secondary"
              onClick={onRefresh}
              startIcon={<RefreshCw className="h-4 w-4" />}
            >
              {pickerT.retry || "Retry"}
            </PillButton>
          )}
        </div>
      ) : visibleSources.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-[#606060] dark:text-[#AAAAAA]">
            {pickerT.empty || "No screens or windows found."}
          </p>
          {onRefresh && (
            <PillButton
              variant="secondary"
              onClick={onRefresh}
              startIcon={<RefreshCw className="h-4 w-4" />}
            >
              {pickerT.retry || "Retry"}
            </PillButton>
          )}
        </div>
      ) : (
        <div className="grid max-h-[46vh] grid-cols-1 gap-3 overflow-y-auto pb-1 sm:grid-cols-2">
          {visibleSources.map((source) => {
            const selected = selectedId === source.id
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => setSelectedId(source.id)}
                disabled={isPending}
                aria-pressed={selected}
                className={`group overflow-hidden rounded-2xl border text-left transition-colors ${
                  selected
                    ? "border-cath-red-600 ring-2 ring-cath-red-600/30 dark:border-[#FF6B6B] dark:ring-[#FF6B6B]/30"
                    : "border-border hover:border-cath-red-300 dark:border-[#3F3F3F] dark:hover:border-[#FF6B6B]/60"
                }`}
              >
                <div className="flex aspect-video items-center justify-center overflow-hidden bg-gray-100 dark:bg-[#272727]">
                  {source.thumbnailDataUrl ? (
                    <img
                      src={source.thumbnailDataUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : source.type === "screen" ? (
                    <Monitor className="h-8 w-8 text-gray-400 dark:text-[#777777]" />
                  ) : (
                    <AppWindow className="h-8 w-8 text-gray-400 dark:text-[#777777]" />
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 py-2">
                  {source.appIconDataUrl && (
                    <img
                      src={source.appIconDataUrl}
                      alt=""
                      className="h-4 w-4 shrink-0 rounded"
                    />
                  )}
                  <span className="truncate text-sm text-gray-900 dark:text-gray-100">
                    {sourceLabel(source)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedSource && (
        <p className="mt-3 text-xs text-[#606060] dark:text-[#AAAAAA]">
          {selectedSource.isFullDisplay
            ? pickerT.fullDisplayHint ||
              "Sharing a full display allows full-screen annotation."
            : pickerT.windowHint ||
              "Sharing a window does not show the full-screen overlay."}
        </p>
      )}
    </Modal>
  )
}

export default DesktopScreenPickerModal
