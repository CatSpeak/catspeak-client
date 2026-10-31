import { describe, expect, it } from "vitest"
import { isPlanForbiddenError } from "./planAccess"

const detail = (extra) => ({ status: 403, data: { detail: extra } })

describe("isPlanForbiddenError", () => {
  it("recognises the placement 403 payload", () => {
    expect(
      isPlanForbiddenError(
        detail({
          code: "FEATURE_NOT_IN_PLAN",
          errorCode: "AI_PLACEMENT_TEST_FORBIDDEN",
          message: "Tính năng không khả dụng trong gói hiện tại.",
        }),
      ),
    ).toBe(true)
  })

  it("does not swallow cooldown 403s", () => {
    expect(
      isPlanForbiddenError(
        detail({ code: "COOLDOWN_ACTIVE", days_remaining: 3 }),
      ),
    ).toBe(false)
  })

  it("ignores non-403 failures", () => {
    expect(
      isPlanForbiddenError({
        status: 500,
        data: { detail: { errorCode: "AI_PLACEMENT_TEST_FORBIDDEN" } },
      }),
    ).toBe(false)
  })
})
