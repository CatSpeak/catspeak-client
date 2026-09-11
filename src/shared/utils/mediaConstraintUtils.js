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
 *
 * Always requests LANDSCAPE ideal (1280×720) — even on mobile portrait.
 * Rationale (measured on iPhone, ?iphonedbg overlay): requesting portrait
 * ideal makes Safari return frames with portrait METADATA (720×1280,
 * rotation:0) whose pixels are still landscape — an undetectable lie that
 * no canvas code can correct (dims say portrait, content is sideways).
 * Requesting landscape yields honest landscape frames, and
 * CombinedVideoTransformer (forcePortrait → bake 90) converts them to true
 * portrait deterministically — the same path that already works in-room. The mobile 3/4 container then fills correctly.
 *
 * @param {string|null} deviceId - Target hardware camera ID
 * @returns {boolean|object} Video constraint
 */
export const buildVideoConstraint = (deviceId) => {
  const isMobile = (() => {
    try {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
      return window.innerWidth < 768
    } catch {
      return false
    }
  })()

  const landscapeIdeal = { width: { ideal: 1280 }, height: { ideal: 720 }, aspectRatio: { ideal: 1.77778 } }

  if (!deviceId || deviceId === "default") {
    // Use ideal (not exact) so iOS Safari never fails on unsupported
    // constraints. On phones add facingMode user (front camera).
    return isMobile ? { ...landscapeIdeal, facingMode: { ideal: "user" } } : true
  }
  return { deviceId: { exact: deviceId }, ...landscapeIdeal }
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
