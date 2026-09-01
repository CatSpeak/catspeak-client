let globalToastRef = null
const pendingToastQueue = []

/**
 * Binds PrimeReact Toast instance reference from AppToaster container
 */
export const setGlobalToastRef = (ref) => {
  globalToastRef = ref
  if (globalToastRef && pendingToastQueue.length > 0) {
    while (pendingToastQueue.length > 0) {
      const item = pendingToastQueue.shift()
      globalToastRef.show(item)
    }
  }
}

export const getGlobalToastRef = () => globalToastRef

/**
 * Normalizes message & options into PrimeReact / PrimeNG Basic Toast message structure
 */
const showToast = (severity, messageOrObj, opts = {}) => {
  let payload

  if (typeof messageOrObj === "object" && messageOrObj !== null) {
    payload = {
      severity: messageOrObj.severity || severity || "info",
      summary:
        messageOrObj.summary ||
        (severity
          ? severity.charAt(0).toUpperCase() + severity.slice(1)
          : "Info"),
      detail:
        messageOrObj.detail || messageOrObj.description || messageOrObj.message,
      life: messageOrObj.life || messageOrObj.duration || 3000,
      sticky: messageOrObj.sticky || false,
      closable: messageOrObj.closable !== false,
      ...messageOrObj,
    }
  } else {
    const options = typeof opts === "object" ? opts : { detail: opts }
    const detail = options.detail || options.description
    const summary = options.summary || messageOrObj

    payload = {
      severity: severity || "info",
      summary: summary,
      detail: detail,
      life:
        options.duration ||
        options.life ||
        (severity === "error" ? 4000 : 3000),
      sticky: options.sticky || false,
      closable: options.closeButton !== false && options.closable !== false,
      ...options,
    }
  }

  if (globalToastRef?.show) {
    globalToastRef.show(payload)
  } else {
    pendingToastQueue.push(payload)
  }

  return payload
}

const customToast = (message, opts = {}) => {
  return showToast(opts.type || opts.severity || "info", message, opts)
}

/** PrimeNG/PrimeReact standard show() method */
customToast.show = (messageOrObj) => {
  if (typeof messageOrObj === "object" && messageOrObj !== null) {
    return showToast(messageOrObj.severity || "info", messageOrObj)
  }
  return showToast("info", messageOrObj)
}

/** Basic Success Toast */
customToast.success = (message, opts) => showToast("success", message, opts)

/** Basic Error Toast */
customToast.error = (message, opts) => showToast("error", message, opts)

/** Basic Info Toast */
customToast.info = (message, opts) => showToast("info", message, opts)

/** Basic Warning / Warn Toast */
customToast.warning = (message, opts) => showToast("warn", message, opts)
customToast.warn = (message, opts) => showToast("warn", message, opts)

/** Basic Loading Toast (sticky) */
customToast.loading = (message, opts) => {
  return showToast("info", message, { ...opts, sticky: true })
}

/** Clear / Dismiss active toasts */
customToast.dismiss = () => {
  globalToastRef?.clear?.()
}
customToast.clear = () => {
  globalToastRef?.clear?.()
}

/** Async promise toast */
customToast.promise = (promise, msgs = {}, opts = {}) => {
  const loadingMsg =
    typeof msgs.loading === "string" ? msgs.loading : "Đang xử lý..."
  customToast.loading(loadingMsg, opts)

  const p = typeof promise === "function" ? promise() : promise

  return p
    .then((data) => {
      customToast.clear()
      const successMsg =
        typeof msgs.success === "function"
          ? msgs.success(data)
          : msgs.success || "Thành công!"
      customToast.success(successMsg, opts)
      return data
    })
    .catch((err) => {
      customToast.clear()
      const errorMsg =
        typeof msgs.error === "function"
          ? msgs.error(err)
          : msgs.error || "Có lỗi xảy ra"
      customToast.error(errorMsg, opts)
      throw err
    })
}

export const toast = customToast
export default customToast
