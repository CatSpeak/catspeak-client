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
 * @param {string|null} deviceId - Target hardware camera ID
 * @returns {boolean|object} Video constraint
 */
export const buildVideoConstraint = (deviceId) => {
  if (!deviceId || deviceId === "default") {
    return true
  }
  return { deviceId: { exact: deviceId } }
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
