/* global process */
import { AccessToken } from "livekit-server-sdk"

/**
 * Vite plugin that intercepts POST /api/livekit/token in development
 * and generates a real LiveKit token locally, bypassing the backend.
 *
 * Requires LIVEKIT_API_KEY and LIVEKIT_API_SECRET in .env.development.local
 */
export default function livekitDevToken() {
  return {
    name: "livekit-dev-token",
    configureServer(server) {
      server.middlewares.use("/api/livekit/token", async (req, res, next) => {
        if (req.method !== "POST") return next()

        const apiKey = process.env.LIVEKIT_API_KEY
        const apiSecret = process.env.LIVEKIT_API_SECRET

        if (!apiKey || !apiSecret) {
          console.warn(
            "[livekit-dev-token] LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set, falling through to proxy",
          )
          return next()
        }

        // Parse the request body
        let body = ""
        for await (const chunk of req) body += chunk
        const { roomId, roomName, participantIdentity, participantName } =
          JSON.parse(body)

        // Generate token
        const identity = participantIdentity || participantName
        const token = new AccessToken(apiKey, apiSecret, {
          identity,
          name: participantName,
        })
        const effectiveRoomName =
          roomName || (roomId ? `room-${roomId}` : "dev-room")
        token.addGrant({
          room: effectiveRoomName,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
        })

        const jwt = await token.toJwt()

        res.setHeader("Content-Type", "application/json")
        res.end(
          JSON.stringify({
            server_url: "wss://livekit.catspeak.com.vn",
            participant_token: jwt,
            cathspeak: {
              account_id: null,
              room_id: null,
              session_id: null,
              room_name: effectiveRoomName,
            },
          }),
        )
      })
    },
  }
}
