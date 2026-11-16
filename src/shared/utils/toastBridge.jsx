import React from "react"
import { toast as sonnerToast } from "sonner"
import CatSpeakToast from "@/shared/components/ui/toast/CatSpeakToast"

/**
 * Toast Bridge for CatSpeak Client
 *
 * ARCHITECTURAL NOTE FOR FUTURE DEVELOPERS & AI AGENTS:
 * -----------------------------------------------------
 * Do NOT replace this bridge with PrimeReact Toast or legacy react-hot-toast.
 * Vite aliases 'react-hot-toast' to this file (`src/shared/utils/toastBridge.jsx`).
 *
 * All toast calls (standard, promises, custom render functions) are rendered via
 * our custom `CatSpeakToast` component (`src/shared/components/ui/toast/CatSpeakToast.jsx`).
 * Sonner is used strictly as the headless engine for positioning, stacking, and animations.
 */

const normalizeOpts = (opts) => {
  if (!opts || typeof opts !== "object") return {}
  return { ...opts }
}

const parseMessageAndOptions = (messageOrFn, opts = {}, defaultType = "default") => {
  const options = normalizeOpts(opts)

  // Custom function render: toast((t) => <JSX />)
  if (typeof messageOrFn === "function") {
    return {
      isFunction: true,
      renderFn: messageOrFn,
      options,
      type: options.type || defaultType,
    }
  }

  // Custom React element passed directly: toast(<Component />)
  if (React.isValidElement(messageOrFn)) {
    return {
      isElement: true,
      element: messageOrFn,
      options,
      type: options.type || defaultType,
    }
  }

  // Object payload: toast({ summary, detail, action, ... })
  if (typeof messageOrFn === "object" && messageOrFn !== null) {
    const {
      summary,
      detail,
      message,
      description,
      title,
      action,
      cancel,
      icon,
      type,
      ...rest
    } = messageOrFn

    return {
      title: title || summary || message || description || detail || "",
      description: description || detail || options.description,
      action: action || options.action,
      cancel: cancel || options.cancel,
      icon: icon !== undefined ? icon : options.icon,
      type: type || options.type || defaultType,
      options: { ...options, ...rest },
    }
  }

  // Plain string or number
  return {
    title: String(messageOrFn ?? ""),
    description: options.description,
    action: options.action,
    cancel: options.cancel,
    icon: options.icon,
    type: options.type || defaultType,
    options,
  }
}

const dispatchCatSpeakToast = (parsed) => {
  const { options, type, icon } = parsed

  return sonnerToast.custom(
    (id) => {
      const dismiss = () => sonnerToast.dismiss(id)

      if (parsed.isFunction) {
        return (
          <CatSpeakToast
            id={id}
            type={type}
            icon={icon}
            onDismiss={dismiss}
            {...options}
          >
            {parsed.renderFn({ id, dismiss })}
          </CatSpeakToast>
        )
      }

      if (parsed.isElement) {
        return (
          <CatSpeakToast
            id={id}
            type={type}
            icon={icon}
            onDismiss={dismiss}
            {...options}
          >
            {parsed.element}
          </CatSpeakToast>
        )
      }

      return (
        <CatSpeakToast
          id={id}
          type={type}
          title={parsed.title}
          description={parsed.description}
          action={parsed.action}
          cancel={parsed.cancel}
          icon={icon}
          onDismiss={dismiss}
          {...options}
        />
      )
    },
    options,
  )
}

export const customToast = (messageOrFn, opts = {}) => {
  const parsed = parseMessageAndOptions(messageOrFn, opts, "default")
  return dispatchCatSpeakToast(parsed)
}

customToast.success = (msg, opts = {}) => {
  const parsed = parseMessageAndOptions(msg, opts, "success")
  return dispatchCatSpeakToast(parsed)
}

customToast.error = (msg, opts = {}) => {
  const parsed = parseMessageAndOptions(msg, opts, "error")
  return dispatchCatSpeakToast(parsed)
}

customToast.info = (msg, opts = {}) => {
  const parsed = parseMessageAndOptions(msg, opts, "info")
  return dispatchCatSpeakToast(parsed)
}

customToast.warning = (msg, opts = {}) => {
  const parsed = parseMessageAndOptions(msg, opts, "warning")
  return dispatchCatSpeakToast(parsed)
}

customToast.warn = (msg, opts = {}) => {
  const parsed = parseMessageAndOptions(msg, opts, "warning")
  return dispatchCatSpeakToast(parsed)
}

customToast.loading = (msg, opts = {}) => {
  const parsed = parseMessageAndOptions(msg, opts, "loading")
  return dispatchCatSpeakToast(parsed)
}

customToast.promise = (promise, msgs = {}, opts = {}) => {
  const options = normalizeOpts(opts)
  const id = sonnerToast.custom(
    (toastId) => (
      <CatSpeakToast
        id={toastId}
        type="loading"
        title={typeof msgs.loading === "string" ? msgs.loading : "Loading..."}
        onDismiss={() => sonnerToast.dismiss(toastId)}
        showCloseButton={false}
      />
    ),
    { ...options, duration: Infinity },
  )

  promise
    .then((result) => {
      const successTitle =
        typeof msgs.success === "function"
          ? msgs.success(result)
          : msgs.success || "Success"

      sonnerToast.custom(
        () => (
          <CatSpeakToast
            id={id}
            type="success"
            title={successTitle}
            onDismiss={() => sonnerToast.dismiss(id)}
          />
        ),
        { ...options, id, duration: options.duration || 4000 },
      )
      return result
    })
    .catch((error) => {
      const errorTitle =
        typeof msgs.error === "function"
          ? msgs.error(error)
          : msgs.error || error?.message || "Error occurred"

      sonnerToast.custom(
        () => (
          <CatSpeakToast
            id={id}
            type="error"
            title={errorTitle}
            onDismiss={() => sonnerToast.dismiss(id)}
          />
        ),
        { ...options, id, duration: options.duration || 5000 },
      )
    })

  return id
}

// 100% unstyled escape hatch if someone strictly wants no CatSpeakToast card
customToast.custom = (jsxOrFn, opts) => {
  const options = normalizeOpts(opts)
  if (typeof jsxOrFn === "function") {
    return sonnerToast.custom(
      (id) => jsxOrFn({ id, dismiss: () => sonnerToast.dismiss(id) }),
      options,
    )
  }
  return sonnerToast.custom(() => jsxOrFn, options)
}

customToast.dismiss = (id) => sonnerToast.dismiss(id)
customToast.clear = () => sonnerToast.dismiss()

// Backward-compat refs for legacy PrimeReact calls
export const setGlobalToastRef = () => {}
export const getGlobalToastRef = () => null

export const toast = customToast
export default customToast
