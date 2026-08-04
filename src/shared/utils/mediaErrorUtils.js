import toast from "react-hot-toast"
import { detectWebView, isIOS } from "@/shared/utils/isWebView"

/**
 * Centrally handle media capture errors (camera/mic).
 * Maps browser error names to localized UI messages and shows a toast.
 *
 * @param {Error} err - The error object from getUserMedia or VideoSDK
 * @param {'mic'|'camera'} device - The type of device being accessed
 * @param {Object} t - Translation object (from useLanguage)
 * @param {Object} [options]
 * @param {boolean} [options.isToggle=false] - If true, uses toggle-specific fallback message
 * @returns {string} The localized error message
 */
export const handleMediaError = (err, device, t, { isToggle = false } = {}) => {
  console.error(`Media error (${device}):`, err)

  const webview = detectWebView()
  if (webview.isWebView) {
    const wvMsg = t?.rooms?.waitingScreen?.webViewWarning ??
      "You are in an in-app browser. Please open in Safari for microphone and camera access."
    toast.error(wvMsg, { duration: 8000 })
    return wvMsg
  }

  let type = "unknown"
  switch (err?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      type = "permission"
      break
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
    case "OperationError":
    case "InvalidStateError":
      type = "notReadable"
      break
    case "NotFoundError":
    case "DevicesNotFoundError":
      type = "notFound"
      break
    default:
      type = "unknown"
  }

  const isMic = device === "mic"
  let message

  switch (type) {
    case "permission":
      if (isIOS()) {
        message = t?.rooms?.waitingScreen?.iosPermissionTip ??
          (isMic
            ? t.rooms.waitingScreen.micPermissionDenied
            : t.rooms.waitingScreen.cameraPermissionDenied)
      } else {
        message = isMic
          ? t.rooms.waitingScreen.micPermissionDenied
          : t.rooms.waitingScreen.cameraPermissionDenied
      }
      break
    case "notReadable":
      message = isMic
        ? t.rooms.waitingScreen.micInUse
        : t.rooms.waitingScreen.cameraInUse
      break
    case "notFound":
      message = isMic
        ? t.rooms.waitingScreen.micNotFound
        : t.rooms.waitingScreen.cameraNotFound
      break
    default:
      if (isToggle) {
        message = isMic
          ? t.rooms.videoCall.error.toggleMic
          : t.rooms.videoCall.error.toggleCam
      } else {
        message = isMic
          ? t.rooms.waitingScreen.micAccessError
          : t.rooms.waitingScreen.cameraAccessError
      }
  }

  toast.error(message, { duration: 6000 })
  return message
}
