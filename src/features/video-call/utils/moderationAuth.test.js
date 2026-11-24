import { describe, expect, it } from "vitest"
import { CO_HOST_PERMISSIONS } from "@/features/co-host/constants"
import { isAuthorizedModerationSender } from "./moderationAuth"

describe("isAuthorizedModerationSender", () => {
  const roomData = { creatorId: 101 }
  const liveCoHost = {
    coHostAccountId: 202,
    permissions: [CO_HOST_PERMISSIONS.MIC_TOGGLE],
  }

  it("rejects spoofed senderId when LiveKit participant metadata belongs to a regular student", () => {
    const studentParticipant = {
      identity: "user_999",
      metadata: JSON.stringify({ accountId: 999 }),
    }
    const spoofedPayload = {
      action: "MUTE_ALL",
      senderId: 101,
    }

    expect(
      isAuthorizedModerationSender({
        participant: studentParticipant,
        data: spoofedPayload,
        roomData,
        liveCoHost,
      }),
    ).toBe(false)
  })

  it("allows authenticated room host", () => {
    const hostParticipant = {
      identity: "user_101",
      metadata: JSON.stringify({ accountId: 101 }),
    }

    expect(
      isAuthorizedModerationSender({
        participant: hostParticipant,
        data: { action: "HIGH_QUALITY_POLICY" },
        roomData,
        liveCoHost,
      }),
    ).toBe(true)
  })

  it("allows co-host only for actions matching granted permissions", () => {
    const coHostParticipant = {
      identity: "user_202",
      metadata: JSON.stringify({ accountId: 202 }),
    }

    expect(
      isAuthorizedModerationSender({
        participant: coHostParticipant,
        data: { action: "MUTE_PARTICIPANT", trackKind: "audio" },
        roomData,
        liveCoHost,
      }),
    ).toBe(true)

    expect(
      isAuthorizedModerationSender({
        participant: coHostParticipant,
        data: { action: "MUTE_ALL" },
        roomData,
        liveCoHost,
      }),
    ).toBe(false)
  })
})
