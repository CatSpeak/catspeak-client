import React from "react"
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  TriangleAlert,
  Loader2,
} from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"

/**
 * Custom Toast Card Component following exact Figma specifications:
 * - Uses Sonner's built-in ::after hover bridge so mouse movements between stacked cards stay 100% smooth without hover jitter
 * - Row Layout: [ Left Section (Icon + 2-Line Text) ] -> [ Right Section (Action Button + Close Button) ]
 * - Dimensions: 344px width x 48px min-height
 * - Reuses IconButton & PillButton
 */
const CustomToastCard = ({
  id,
  message,
  description,
  type,
  action,
  closeButton = true,
}) => {
  return (
    <div className="w-[344px] max-w-[calc(100vw-32px)] min-h-[48px] bg-[#212121] text-[#F4F0F4] border border-white/10 rounded-[12px] shadow-2xl flex items-center justify-between font-sans box-border pointer-events-auto select-none overflow-hidden">
      {/* LEFT SECTION: Icon + 2-Line Text Content (Title & Description) */}
      <div
        className={`flex items-center gap-4 min-w-0 pl-4 ${
          closeButton ? "pr-1" : "pr-4"
        } flex-1 overflow-hidden`}
      >
        {type === "success" && (
          <CheckCircle2
            className="w-6 h-6 text-[#81C784] shrink-0"
            aria-hidden="true"
          />
        )}
        {type === "error" && (
          <AlertCircle
            className="w-6 h-6 text-[#FF5252] shrink-0"
            aria-hidden="true"
          />
        )}
        {type === "warning" && (
          <TriangleAlert
            className="w-6 h-6 text-[#FFB74D] shrink-0"
            aria-hidden="true"
          />
        )}
        {type === "info" && (
          <Info
            className="w-6 h-6 text-[#64B5F6] shrink-0"
            aria-hidden="true"
          />
        )}
        {type === "loading" && (
          <Loader2
            className="w-6 h-6 text-[#64B5F6] animate-spin shrink-0"
            aria-hidden="true"
          />
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
          {/* Title (Line 1) */}
          <div className="text-sm font-semibold leading-5 text-[#F4F0F4] line-clamp-1">
            {message}
          </div>
          {/* Text / Description (Line 2) */}
          {description && (
            <div className="text-xs text-neutral-400 leading-4 line-clamp-1">
              {description}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Action & Close Buttons */}
      {(action || closeButton) && (
        <div className="flex items-center shrink-0 ml-auto">
          {action && (
            <PillButton
              variant="snackbar"
              onClick={() => {
                action.onClick?.()
                sonnerToast.dismiss(id)
              }}
              className="shrink-0"
            >
              {action.label}
            </PillButton>
          )}

          {closeButton && (
            <IconButton
              variant="iconOnly"
              onClick={() => sonnerToast.dismiss(id)}
              title="Close"
            >
              <X />
            </IconButton>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Toast Helper Bridge
 * Destructures `description`, `action`, and `cancel` so they render INSIDE CustomToastCard without Sonner rendering duplicate nodes outside.
 */
const customToast = (message, opts = {}) => {
  const { description, action, cancel, ...restOpts } = opts
  return sonnerToast.custom(
    (id) => (
      <CustomToastCard
        id={id}
        message={message}
        description={description}
        type={opts.type || "info"}
        action={action}
        closeButton={opts.closeButton !== false}
      />
    ),
    restOpts,
  )
}

/** Show a success toast notification. See docs/TOAST_GUIDELINES.md for usage details. */
customToast.success = (message, opts) => {
  const options = typeof opts === "object" ? opts : { description: opts }
  return customToast(message, { ...options, type: "success" })
}

/** Show an error toast notification. See docs/TOAST_GUIDELINES.md for usage details. */
customToast.error = (message, opts) => {
  const options = typeof opts === "object" ? opts : { description: opts }
  return customToast(message, { ...options, type: "error" })
}

/** Show an info toast notification. See docs/TOAST_GUIDELINES.md for usage details. */
customToast.info = (message, opts) => {
  const options = typeof opts === "object" ? opts : { description: opts }
  return customToast(message, { ...options, type: "info" })
}

/** Show a warning toast notification. See docs/TOAST_GUIDELINES.md for usage details. */
customToast.warning = (message, opts) => {
  const options = typeof opts === "object" ? opts : { description: opts }
  return customToast(message, { ...options, type: "warning" })
}

/** Show a loading toast notification. See docs/TOAST_GUIDELINES.md for usage details. */
customToast.loading = (message, opts) => {
  const options = typeof opts === "object" ? opts : { description: opts }
  return customToast(message, { ...options, type: "loading" })
}

customToast.dismiss = sonnerToast.dismiss

/** Show an async promise toast notification (loading -> success/error). See docs/TOAST_GUIDELINES.md for usage details. */
customToast.promise = (promise, msgs = {}, opts = {}) => {
  const loadingMsg =
    typeof msgs.loading === "string" ? msgs.loading : "Loading..."
  const toastId = customToast.loading(loadingMsg, opts)

  const p = typeof promise === "function" ? promise() : promise

  p.then((data) => {
    const successMsg =
      typeof msgs.success === "function"
        ? msgs.success(data)
        : msgs.success || "Success!"
    customToast.success(successMsg, { id: toastId, ...opts })
  }).catch((err) => {
    const errorMsg =
      typeof msgs.error === "function"
        ? msgs.error(err)
        : msgs.error || "Error occurred"
    customToast.error(errorMsg, { id: toastId, ...opts })
  })

  return toastId
}

export const toast = customToast
export const Toaster = SonnerToaster
export default customToast
