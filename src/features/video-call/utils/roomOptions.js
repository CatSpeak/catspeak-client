import { VideoPresets } from "livekit-client"

/**
 * Maps an egress call policy to LiveKit RoomOptions.
 *
 * Shared by the initial connect (GlobalVideoCallProvider) and the live
 * high-quality effect (GlobalCallContent) so both paths apply exactly the
 * same capture, simulcast and screen-share caps.
 */
export function buildRoomOptions(callPolicy, { simulcast = true } = {}) {
  const publishDefaults = { simulcast }

  if (callPolicy.publish.simulcastPresets) {
    publishDefaults.videoSimulcastLayers =
      callPolicy.publish.simulcastPresets.map((preset) => VideoPresets[preset])
  }

  if (callPolicy.publish.screenShareEncoding) {
    publishDefaults.screenShareEncoding = callPolicy.publish.screenShareEncoding
  }

  return {
    adaptiveStream: callPolicy.adaptiveStream,
    dynacast: callPolicy.dynacast,
    videoCaptureDefaults: {
      resolution: VideoPresets[callPolicy.publish.cameraPreset].resolution,
    },
    publishDefaults,
  }
}
