/**
 * Media Constraint & Device Option Utilities
 * Provides clean, safe helper functions for WebRTC device constraints and dropdown mapping.
 */

/**
 * Builds safe audio constraints for getUserMedia, avoiding invalid exact device ID matching on iOS WebKit.
 *
 * @param {string|null} deviceId - Target hardware microphone ID
 * @returns {boolean|object} Audio constraint
 */
export const buildAudioConstraint = (deviceId) => {
  if (!deviceId || deviceId === "default") {
    return true
  }
  return { deviceId: { exact: deviceId } }
}

/**
 * Builds safe video constraints for getUserMedia, avoiding invalid exact device ID matching on iOS WebKit.
 * For mobile portrait (iPhone held vertical), requests portrait ideal resolution
 * (720×1280) so the camera delivers upright frames and the preview container
 * (aspect-[3/4] on mobile) fills without sideways cropping. Desktop keeps 16:9.
 *
 * @param {string|null} deviceId - Target hardware camera ID
 * @returns {boolean|object} Video constraint
 */
export const buildVideoConstraint = (deviceId) => {
  const isMobilePortrait = (() => {
    try {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
      return window.matchMedia("(orientation: portrait)").matches && window.innerWidth < 768
    } catch {
      return false
    }
  })()

  const portraitIdeal = isMobilePortrait
    ? { width: { ideal: 720 }, height: { ideal: 1280 }, aspectRatio: { ideal: 0.5625 } }
    : { width: { ideal: 1280 }, height: { ideal: 720 }, aspectRatio: { ideal: 1.77778 } }

  if (!deviceId || deviceId === "default") {
    // Use ideal (not exact) so iOS Safari never fails on unsupported constraints,
    // but hint the browser toward portrait on phones.
    return isMobilePortrait ? { ...portraitIdeal, facingMode: { ideal: "user" } } : true
  }
  return { deviceId: { exact: deviceId }, ...portraitIdeal }
}

/**
 * Transforms an array of MediaDeviceInfo into Dropdown options with a System Default item at index 0.
 *
 * @param {Array} deviceList - List of MediaDeviceInfo objects
 * @param {React.ReactNode} icon - Icon element to display next to device name
 * @param {boolean} isAudio - Whether to prepend a System Default option
 * @param {string} defaultLabel - Localized label for system default
 * @param {string} unknownLabel - Localized label for unnamed devices
 * @returns {Array} Array of dropdown option objects
 */
export const mapDevicesToOptions = (
  deviceList = [],
  icon,
  isAudio = false,
  defaultLabel = "System Default",
  unknownLabel = "Unknown Device"
) => {
  const options = deviceList.map((d) => ({
    value: d.deviceId,
    label: d.label || unknownLabel,
    icon: icon,
  }))

  if (isAudio) {
    options.unshift({
      value: "",
      label: defaultLabel,
      icon: icon,
    })
  }

  return options
}
