import { beforeEach, describe, expect, it } from "vitest"
import {
  clearRegistrationCorrectionToken,
  extractRegistrationCorrectionToken,
  getRegistrationCorrectionToken,
  setRegistrationCorrectionToken,
} from "@/features/auth/utils/registrationCorrectionToken"
import { buildEmailCorrectionPayload } from "@/features/auth/utils/emailCorrection"

describe("CS-10 registration correction token (R6-2)", () => {
  beforeEach(() => {
    clearRegistrationCorrectionToken()
  })

  it("extracts the token from an RTK Query rejected action shape", () => {
    // Track 1 nests the token at `response.data.registrationCorrectionToken`;
    // RTK Query rejects with `{ error: FetchBaseQueryError }`.
    const rejected = {
      error: {
        status: 401,
        data: {
          success: false,
          data: { registrationCorrectionToken: "rtk-token" },
        },
      },
    }

    const body = rejected?.error?.data ?? rejected?.data
    expect(extractRegistrationCorrectionToken(body)).toBe("rtk-token")
  })

  it("extracts the token from direct and double-wrapped payloads", () => {
    expect(
      extractRegistrationCorrectionToken({
        registrationCorrectionToken: "flat-token",
      }),
    ).toBe("flat-token")
    expect(
      extractRegistrationCorrectionToken({
        data: { registrationCorrectionToken: "wrapped-token" },
      }),
    ).toBe("wrapped-token")
    expect(extractRegistrationCorrectionToken({ success: true })).toBeNull()
  })

  it("uses the password instead of a stale token when in fallback mode", () => {
    setRegistrationCorrectionToken("expired-token")

    const payload = buildEmailCorrectionPayload({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      correctionToken: getRegistrationCorrectionToken(),
      requiresPassword: true,
      password: "MyPassword123",
    })

    expect(payload).toEqual({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      password: "MyPassword123",
    })
    expect(payload).not.toHaveProperty("registrationCorrectionToken")
  })

  it("clears the rejected token so the next attempt cannot loop", () => {
    setRegistrationCorrectionToken("expired-token")
    clearRegistrationCorrectionToken()

    const payload = buildEmailCorrectionPayload({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      correctionToken: getRegistrationCorrectionToken(),
      requiresPassword: true,
      password: "MyPassword123",
    })

    expect(getRegistrationCorrectionToken()).toBeNull()
    expect(payload.password).toBe("MyPassword123")
    expect(payload.registrationCorrectionToken).toBeUndefined()
  })

  it("sends the correction token when no password fallback is required", () => {
    setRegistrationCorrectionToken("valid-token")

    const payload = buildEmailCorrectionPayload({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      correctionToken: getRegistrationCorrectionToken(),
      requiresPassword: false,
      password: "",
    })

    expect(payload).toEqual({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      registrationCorrectionToken: "valid-token",
    })
  })
})
